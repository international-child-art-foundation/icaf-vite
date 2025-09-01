import { GetCommand, QueryCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME, S3_BUCKET_NAME } from '../../config/aws-clients';
import { SubmitArtworkRequest, validateSubmissionData } from '../../../shared/src/api-types/artworkTypes';

type ApiEvent = {
    requestContext?: { authorizer?: { claims?: { sub?: string } } };
    body?: string;
};

export const handler = async (event: ApiEvent) => {
    try {
        // 1) Auth
        const userId = event.requestContext?.authorizer?.claims?.sub;
        if (!userId) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Unauthorized' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 2) Parse request body
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Request body is required' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        let submissionData: SubmitArtworkRequest;
        try {
            submissionData = JSON.parse(event.body);
        } catch (error) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid JSON in request body' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 3) Validate submission data
        const validationErrors = validateSubmissionData(submissionData);
        if (validationErrors.length > 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Validation failed',
                    errors: validationErrors
                }),
                headers: { 'Content-Type': 'application/json' }
            };
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
        if (!season || !season.is_active) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Requested season is not active' }),
                headers: { 'Content-Type': 'application/json' }
            };
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
        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User profile not found' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Check if user can submit
        if (!user.can_submit) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'User is not authorized to submit artwork' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Check payment requirement
        if (season.payment_required && !user.has_paid) {
            return {
                statusCode: 402,
                body: JSON.stringify({ message: 'Payment required for this season' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 6) Check submission limits based on user role and season configuration
        const existingSubmissionsResult = await dynamodb.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':sk': `ART#${submissionData.season}`
            }
        }));

        const existingSubmissions = existingSubmissionsResult.Items || [];
        const submissionCount = existingSubmissions.length;

        // Get max submissions for this user/season
        let maxSubmissions = season.max_user_submissions || 1;
        if (user.role === 'guardian' && user.max_constituents_per_season) {
            maxSubmissions = user.max_constituents_per_season;
        } else if (user.role === 'admin') {
            maxSubmissions = -1; // Unlimited for admins
        }

        // Check if user has reached submission limit
        if (maxSubmissions !== -1 && submissionCount >= maxSubmissions) {
            return {
                statusCode: 429,
                body: JSON.stringify({
                    message: `Maximum submissions reached for this season (${maxSubmissions})`,
                    current_count: submissionCount,
                    max_allowed: maxSubmissions
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Check for duplicate submission (prevent same user submitting multiple times to same season)
        if (user.role === 'user' && submissionCount > 0) {
            return {
                statusCode: 409,
                body: JSON.stringify({ message: 'You have already submitted artwork for this season' }),
                headers: { 'Content-Type': 'application/json' }
            };
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
            image_url: '', // Will be updated after image upload
            timestamp: timestamp,
            type: 'ART'
        };

        const artPtrEntity = {
            PK: `USER#${userId}`,
            SK: `ART#${submissionData.season}#${artworkId}`,
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
                return {
                    statusCode: 409,
                    body: JSON.stringify({ message: 'Artwork submission already exists' }),
                    headers: { 'Content-Type': 'application/json' }
                };
            }
            throw transactionError; // Re-throw unexpected errors
        }

        // 11) Image processing will be handled by a separate upload endpoint

        // 12) Return success response
        return {
            statusCode: 201,
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
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};
