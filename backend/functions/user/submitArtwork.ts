import { GetCommand, QueryCommand, TransactWriteCommand, BatchGetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { SubmitArtworkRequest, validateSubmissionData } from '../../../shared/src/api-types/artworkTypes';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';
import { canUserSubmitArtwork, isSeasonActive } from '../../../shared/src/api-types/businessLogic';

export const handler = async (event: ApiGatewayEvent) => {
    try {
        // 1) Auth
        const userId = event.requestContext?.authorizer?.claims?.sub;
        if (!userId) {
            return CommonErrors.unauthorized();
        }

        // 2) Parse request body
        if (!event.body) {
            return CommonErrors.badRequest('Request body is required');
        }

        let submissionData: SubmitArtworkRequest;
        try {
            submissionData = JSON.parse(event.body);
        } catch (error) {
            return CommonErrors.badRequest('Invalid JSON in request body');
        }

        // 3) Validate submission data
        const validationErrors = validateSubmissionData(submissionData);
        if (validationErrors.length > 0) {
            return CommonErrors.badRequest('Validation failed', validationErrors);
        }

        // 4) Check if requested season is active and get its configuration
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

        // 5) Check user eligibility and payment status
        const userResult = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${userId}`,
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

        // 6) Check submission limits based on user role and season configuration
        // Note: This endpoint is for submitting user's own artwork (is_virtual = false)
        // Guardian submissions for constituents (is_virtual = true) use submitArtworkForConstituent endpoint
        const existingSubmissionsResult = await dynamodb.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':sk': `ART#${submissionData.season}#`
            }
        }));

        const existingSubmissions = existingSubmissionsResult.Items || [];

        // Extract art_ids from Art_Ptr entities
        const artIds = existingSubmissions.map((ptr: any) => ptr.art_id).filter(Boolean);

        // Count only non-virtual (user's own) submissions
        let ownSubmissionCount = 0;
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

            // Filter for is_virtual = false (user's own submissions only)
            const ownArtworks = artworks.filter((art: any) => art.is_virtual === false);
            ownSubmissionCount = ownArtworks.length;
        }

        const submissionCount = ownSubmissionCount;

        // Get max submissions for this user/season
        // All users (including guardians) use season's max_user_submissions for their own artwork
        let maxSubmissions = season?.max_user_submissions || 1;
        if (user && user.role === 'admin') {
            maxSubmissions = -1; // Unlimited for admins
        }

        // Check if user has reached submission limit
        if (maxSubmissions !== -1 && submissionCount >= maxSubmissions) {
            return CommonErrors.tooManyRequests(`Maximum submissions reached for this season (${maxSubmissions})`, submissionCount, maxSubmissions);
        }

        // Check for duplicate submission (prevent same user submitting multiple times to same season)
        if (user && user.role === 'user' && submissionCount > 0) {
            return CommonErrors.conflict('You have already submitted artwork for this season');
        }

        // 7) Generate unique artwork ID and timestamp
        const timestamp = new Date().toISOString();
        const artworkId = `ART_${userId}_${submissionData.season}_${Date.now()}`;

        // 8) Generate S3 key for the artwork (presigned URL generation will be handled separately)
        const s3Key = `artworks/${submissionData.season}/${userId}/${artworkId}.${submissionData.file_type}`;

        // 9) Prepare transaction data
        const artworkEntity = {
            PK: `ART#${artworkId}`,
            SK: 'N/A',
            art_id: artworkId,
            artwork_id: artworkId, // backward compatibility
            user_id: userId,
            season: submissionData.season,
            title: submissionData.title,
            description: submissionData.description || '',
            f_name: submissionData.f_name,
            age: submissionData.age,
            location: submissionData.location,
            is_virtual: submissionData.is_virtual,
            is_ai_gen: submissionData.is_ai_generated,
            model: submissionData.ai_model || undefined,
            file_type: submissionData.file_type.toUpperCase(),
            is_approved: false,
            votes: 0,
            timestamp: timestamp,
            type: 'ART'
        };

        const artPtrEntity = {
            PK: `USER#${userId}`,
            SK: `ART#${submissionData.season}#ID#${artworkId}`,
            artwork_id: artworkId,
            art_id: artworkId,
            season: submissionData.season,
            timestamp: timestamp,
            type: 'ART_PTR'
        };

        // 10) Execute transactional write to DynamoDB
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

        // 11) Image processing will be handled by a separate upload endpoint

        // 12) Return success response
        return {
            statusCode: HTTP_STATUS.CREATED,
            body: JSON.stringify({
                success: true,
                artwork_id: artworkId,
                message: 'Artwork submission created successfully. You can now upload your image.',
                timestamp: Date.now(),
                s3_key: s3Key,
                submission_count: submissionCount + 1,
                max_submissions: maxSubmissions === -1 ? 'unlimited' : maxSubmissions,
                season: submissionData.season,
                title: submissionData.title
            }),
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error: any) {
        console.error('Error submitting artwork:', error);
        return CommonErrors.internalServerError();
    }
};
