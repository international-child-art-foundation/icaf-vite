import { GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { GetCommand, QueryCommand, TransactWriteCommand, BatchGetCommand } from '@aws-sdk/lib-dynamodb';
import { cognitoClient, dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { SubmitArtworkRequest, validateSubmissionData } from '../../../shared/src/api-types/artworkTypes';
import { ApiGatewayEvent, ApiGatewayResponse, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';
import { canUserSubmitArtwork, isSeasonActive } from '../../../shared/src/api-types/businessLogic';

/**
 * Submit Artwork for Constituent Handler
 *
 * Allows guardians to submit artwork on behalf of virtual users (constituents).
 *
 * Key differences from regular submitArtwork:
 * 1. Only guardian+ roles allowed
 * 2. Enforces is_virtual = true
 * 3. Uses guardian's max_constituents_per_season limit
 * 4. Authenticates via Cookie accessToken
 */

// Helper function to parse cookies from Cookie header
function parseCookies(cookieHeader: string | undefined): Record<string, string> {
    if (!cookieHeader) {
        return {};
    }

    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
        const [name, ...rest] = cookie.split('=');
        if (name && rest.length > 0) {
            cookies[name.trim()] = rest.join('=').trim();
        }
    });
    return cookies;
}

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
    try {
        // 1) Extract accessToken from Cookie header
        const cookieHeader = event.headers?.['Cookie'] || event.headers?.['cookie'];
        const cookies = parseCookies(cookieHeader);
        const accessToken = cookies['accessToken'];

        if (!accessToken) {
            return {
                statusCode: HTTP_STATUS.UNAUTHORIZED,
                body: JSON.stringify({ message: 'Authentication required' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 2) Get user info from Cognito
        let guardianUserId: string;
        let userRole: string;

        try {
            const result = await cognitoClient.send(new GetUserCommand({
                AccessToken: accessToken
            }));

            guardianUserId = result.Username!;
            const attributes = result.UserAttributes || [];
            userRole = attributes.find(attr => attr.Name === 'custom:role')?.Value || 'user';
        } catch (error: any) {
            console.error('Cognito GetUser error:', error);
            return {
                statusCode: HTTP_STATUS.UNAUTHORIZED,
                body: JSON.stringify({ message: 'Invalid or expired token' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 3) Verify role >= guardian
        const roleHierarchy = ['user', 'guardian', 'contributor', 'admin'];
        const userRoleLevel = roleHierarchy.indexOf(userRole);
        const requiredRoleLevel = roleHierarchy.indexOf('guardian');

        if (userRoleLevel < requiredRoleLevel) {
            return CommonErrors.forbidden('Only guardians and above can submit artwork for constituents');
        }

        // 4) Parse request body
        if (!event.body) {
            return CommonErrors.badRequest('Request body is required');
        }

        let submissionData: SubmitArtworkRequest;
        try {
            submissionData = JSON.parse(event.body);
        } catch (error) {
            return CommonErrors.badRequest('Invalid JSON in request body');
        }

        // 5) Force is_virtual to true (this is a constituent submission)
        submissionData.is_virtual = true;

        // 6) Validate submission data
        const validationErrors = validateSubmissionData(submissionData);
        if (validationErrors.length > 0) {
            return CommonErrors.badRequest('Validation failed', validationErrors);
        }

        // 7) Check if requested season is active and get its configuration
        const seasonResult = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: 'SEASON',
                SK: `#ACTIVE#true#SEASON#${submissionData.season}`
            }
        }));

        const season = seasonResult.Item;
        if (!isSeasonActive(season)) {
            return CommonErrors.badRequest('Requested season is not active');
        }

        // 8) Check user eligibility and payment status
        const userResult = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${guardianUserId}`,
                SK: 'PROFILE'
            }
        }));

        const user = userResult.Item;

        // Check if user can submit using business logic function
        const submissionValidation = canUserSubmitArtwork(user, season);
        if (!submissionValidation.canSubmit) {
            return CommonErrors.forbidden(submissionValidation.reason || 'User is not authorized to submit artwork');
        }

        // Check payment requirement
        if (season && season.payment_required && user && !user.has_paid) {
            return CommonErrors.paymentRequired();
        }

        // 9) Check submission limits based on guardian's max_constituents_per_season
        const existingSubmissionsResult = await dynamodb.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': `USER#${guardianUserId}`,
                ':sk': `ART#${submissionData.season}#`
            }
        }));

        const existingSubmissions = existingSubmissionsResult.Items || [];

        // Extract art_ids from Art_Ptr entities
        const artIds = existingSubmissions.map((ptr: any) => ptr.art_id).filter(Boolean);

        // If no existing submissions, skip the batch get
        let constituentSubmissionCount = 0;
        if (artIds.length > 0) {
            // Batch get Art entities to check is_virtual flag
            // Art entity has PK: ART#<art_id> and SK: 'N/A'
            const batchGetResult = await dynamodb.send(new BatchGetCommand({
                RequestItems: {
                    [TABLE_NAME]: {
                        Keys: artIds.map((artId: string) => ({
                            PK: `ART#${artId}`,
                            SK: 'N/A'
                        }))
                    }
                }
            }));

            const artworks = batchGetResult.Responses?.[TABLE_NAME] || [];

            // Filter for is_virtual = true submissions only
            const constituentArtworks = artworks.filter((art: any) => art.is_virtual === true);
            constituentSubmissionCount = constituentArtworks.length;
        }

        const submissionCount = constituentSubmissionCount;

        // Get max submissions for guardian
        let maxSubmissions: number;
        if (userRole === 'admin') {
            maxSubmissions = -1; // Unlimited for admins
        } else if (user && user.max_constituents_per_season !== undefined) {
            maxSubmissions = user.max_constituents_per_season;
        } else {
            maxSubmissions = season?.max_user_submissions || 1;
        }

        // Check if guardian has reached submission limit
        if (maxSubmissions !== -1 && submissionCount >= maxSubmissions) {
            return CommonErrors.tooManyRequests(
                `Maximum constituent submissions reached for this season (${maxSubmissions})`,
                submissionCount,
                maxSubmissions
            );
        }

        // 10) Generate unique artwork ID and timestamp
        const timestamp = new Date().toISOString();
        const artworkId = `ART_${guardianUserId}_${submissionData.season}_${Date.now()}`;

        // 11) Generate S3 key for the artwork
        const s3Key = `artworks/${submissionData.season}/${guardianUserId}/${artworkId}.${submissionData.file_type}`;

        // 12) Prepare transaction data
        const artworkEntity = {
            PK: `ART#${artworkId}`,
            SK: 'N/A',
            art_id: artworkId,
            artwork_id: artworkId, // backward compatibility
            user_id: guardianUserId, // Guardian's user_id
            season: submissionData.season,
            title: submissionData.title,
            description: submissionData.description || '',
            f_name: submissionData.f_name, // Constituent's first name
            age: submissionData.age, // Constituent's age
            location: submissionData.location,
            is_virtual: true, // Forced to true
            is_ai_gen: submissionData.is_ai_generated,
            model: submissionData.ai_model || undefined,
            file_type: submissionData.file_type.toUpperCase(),
            is_approved: false,
            votes: 0,
            timestamp: timestamp,
            type: 'ART'
        };

        const artPtrEntity = {
            PK: `USER#${guardianUserId}`,
            SK: `ART#${submissionData.season}#ID#${artworkId}`,
            artwork_id: artworkId,
            art_id: artworkId,
            season: submissionData.season,
            timestamp: timestamp,
            type: 'ART_PTR'
        };

        // 13) Execute transactional write to DynamoDB
        try {
            await dynamodb.send(new TransactWriteCommand({
                TransactItems: [
                    {
                        Put: {
                            TableName: TABLE_NAME,
                            Item: artworkEntity,
                            ConditionExpression: 'attribute_not_exists(PK)' // Ensure no duplicate artwork ID
                        }
                    },
                    {
                        Put: {
                            TableName: TABLE_NAME,
                            Item: artPtrEntity,
                            ConditionExpression: 'attribute_not_exists(PK) OR attribute_not_exists(SK)' // Ensure no duplicate pointer
                        }
                    }
                ]
            }));
        } catch (transactionError: any) {
            console.error('Transaction failed:', transactionError);
            if (transactionError.name === 'ConditionalCheckFailedException') {
                return CommonErrors.conflict('Artwork submission already exists');
            }
            throw transactionError; // Re-throw unexpected errors
        }

        // 14) Return success response
        return {
            statusCode: HTTP_STATUS.CREATED,
            body: JSON.stringify({
                success: true,
                artwork_id: artworkId,
                message: 'Constituent artwork submission created successfully. You can now upload the image.',
                timestamp: Date.now(),
                s3_key: s3Key,
                submission_count: submissionCount + 1,
                max_submissions: maxSubmissions === -1 ? 'unlimited' : maxSubmissions,
                season: submissionData.season,
                title: submissionData.title,
                constituent_name: submissionData.f_name
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            }
        };

    } catch (error: any) {
        console.error('Error submitting constituent artwork:', error);
        return CommonErrors.internalServerError('Failed to submit constituent artwork');
    }
};
