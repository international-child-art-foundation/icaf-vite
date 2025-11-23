import { GetCommand, QueryCommand, DeleteCommand, PutCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { dynamodb, s3Client, TABLE_NAME, S3_BUCKET_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';
import {
    RemoveAllUserArtworkRequest,
    RemoveAllUserArtworkResponse,
    validateRemoveAllUserArtworkRequest
} from '../../../shared/src/api-types/userTypes';

export const handler = async (event: ApiGatewayEvent) => {
    try {
        // 1) Admin Authentication Check
        const adminUserId = event.requestContext?.authorizer?.claims?.sub;
        if (!adminUserId) {
            return CommonErrors.unauthorized();
        }

        // Check if user has admin role
        const adminResult = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${adminUserId}`,
                SK: 'PROFILE'
            }
        }));

        const adminUser = adminResult.Item;
        if (!adminUser || adminUser.role !== 'admin') {
            return CommonErrors.forbidden('Admin access required');
        }

        // 2) Get user ID from path parameters
        const targetUserId = event.pathParameters?.user_id;
        if (!targetUserId) {
            return CommonErrors.badRequest('User ID is required in path');
        }

        // 3) Parse and validate request body
        if (!event.body) {
            return CommonErrors.badRequest('Request body is required');
        }

        let requestData: RemoveAllUserArtworkRequest;
        try {
            requestData = JSON.parse(event.body);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return CommonErrors.badRequest('Invalid JSON in request body');
        }

        // Validate request data
        const validationErrors = validateRemoveAllUserArtworkRequest(requestData);
        if (validationErrors.length > 0) {
            return CommonErrors.badRequest(`Validation failed: ${validationErrors.join(', ')}`);
        }

        // 4) Check if target user exists
        const targetUserResult = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${targetUserId}`,
                SK: 'PROFILE'
            }
        }));

        const targetUser = targetUserResult.Item;
        if (!targetUser) {
            return CommonErrors.notFound(`User '${targetUserId}' not found`);
        }

        // 5) Query all Art_Ptr records for this user
        const artPtrResult = await dynamodb.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': `USER#${targetUserId}`,
                ':sk': 'ART#'
            }
        }));

        const artPointers = artPtrResult.Items || [];

        if (artPointers.length === 0) {
            return CommonErrors.notFound('No artwork found for this user');
        }

        // Extract unique art IDs
        const artIds = Array.from(new Set(
            artPointers
                .map(ptr => ptr.art_id || ptr.artwork_id)
                .filter(Boolean)
        )) as string[];

        const timestamp = new Date().toISOString();
        const deletedArtworks: string[] = [];
        const failedDeletions: { art_id: string; reason: string }[] = [];

        // 6) Delete artwork records and S3 files
        for (const artId of artIds) {
            try {
                // Get the Art entity to access metadata (season, file_type)
                const artResult = await dynamodb.send(new GetCommand({
                    TableName: TABLE_NAME,
                    Key: {
                        PK: `ART#${artId}`,
                        SK: 'N/A'
                    }
                }));

                const artwork = artResult.Item;

                // Delete Art entity
                if (artwork) {
                    await dynamodb.send(new DeleteCommand({
                        TableName: TABLE_NAME,
                        Key: {
                            PK: `ART#${artId}`,
                            SK: 'N/A'
                        }
                    }));

                    // Delete S3 file if exists
                    if (S3_BUCKET_NAME && artwork.season && artwork.file_type) {
                        try {
                            // List and delete objects with this prefix (in case of multiple versions)
                            const listResult = await s3Client.send(new ListObjectsV2Command({
                                Bucket: S3_BUCKET_NAME,
                                Prefix: `artworks/${artwork.season}/${targetUserId}/${artId}`
                            }));

                            const objects = listResult.Contents || [];
                            if (objects.length > 0) {
                                await s3Client.send(new DeleteObjectsCommand({
                                    Bucket: S3_BUCKET_NAME,
                                    Delete: {
                                        Objects: objects.map(obj => ({ Key: obj.Key! }))
                                    }
                                }));
                            }
                        } catch (s3Error: any) {
                            console.error(`Failed to delete S3 files for artwork ${artId}:`, s3Error);
                            // Continue with deletion even if S3 fails
                        }
                    }

                    deletedArtworks.push(artId);
                }
            } catch (error: any) {
                console.error(`Failed to delete artwork ${artId}:`, error);
                failedDeletions.push({
                    art_id: artId,
                    reason: error.message || 'Unknown error'
                });
            }
        }

        // 7) Delete all Art_Ptr records
        const batchSize = 25; // DynamoDB BatchWrite limit
        for (let i = 0; i < artPointers.length; i += batchSize) {
            const batch = artPointers.slice(i, i + batchSize);

            try {
                await dynamodb.send(new BatchWriteCommand({
                    RequestItems: {
                        [TABLE_NAME]: batch.map(ptr => ({
                            DeleteRequest: {
                                Key: {
                                    PK: ptr.PK,
                                    SK: ptr.SK
                                }
                            }
                        }))
                    }
                }));
            } catch (batchError: any) {
                console.error('Failed to delete Art_Ptr batch:', batchError);
                // Continue with next batch
            }
        }

        // 8) Create admin action record
        const adminActionId = `${timestamp}_${adminUserId}`;

        await dynamodb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                PK: `USER#${targetUserId}`,
                SK: `ADMIN_ACTION#${timestamp}`,
                admin_action_id: adminActionId,
                action_type: 'remove_all_artwork',
                admin_user_id: adminUserId,
                reason: requestData.reason.trim(),
                artwork_count: deletedArtworks.length,
                failed_count: failedDeletions.length,
                timestamp: timestamp,
                created_at: timestamp
            }
        }));

        // 9) Return success response
        const response: RemoveAllUserArtworkResponse = {
            message: 'User artwork removed successfully',
            user_id: targetUserId,
            artworks_removed: deletedArtworks.length,
            total_artworks: artIds.length,
            deleted_artwork_ids: deletedArtworks,
            failed_deletions: failedDeletions,
            admin_action_id: adminActionId,
            timestamp: timestamp
        };

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify(response),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
            }
        };

    } catch (error: any) {
        console.error('Error in removeAllUserArtwork handler:', error);

        // Handle DynamoDB conditional check failed
        if (error.name === 'ConditionalCheckFailedException') {
            return CommonErrors.notFound('User not found or already modified');
        }

        return CommonErrors.internalServerError('Failed to remove user artwork');
    }
};
