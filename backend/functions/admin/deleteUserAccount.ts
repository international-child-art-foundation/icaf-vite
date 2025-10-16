import { AdminDeleteUserCommand, AdminDisableUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { GetCommand, QueryCommand, DeleteCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { cognitoClient, dynamodb, s3Client, USER_POOL_ID, TABLE_NAME, S3_BUCKET_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';
import {
    DeleteUserAccountRequest,
    DeleteUserAccountResponse,
    validateDeleteUserAccountRequest
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

        // 2) Get target user ID from path parameters
        const targetUserId = event.pathParameters?.user_id;
        if (!targetUserId) {
            return CommonErrors.badRequest('User ID is required in path');
        }

        // 3) Parse and validate request body
        if (!event.body) {
            return CommonErrors.badRequest('Request body is required');
        }

        let requestData: DeleteUserAccountRequest;
        try {
            requestData = JSON.parse(event.body);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return CommonErrors.badRequest('Invalid JSON in request body');
        }

        // Validate request data
        const validationErrors = validateDeleteUserAccountRequest(requestData);
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

        // 5) Prevent admin from deleting themselves
        if (adminUserId === targetUserId) {
            return CommonErrors.badRequest('Cannot delete your own account');
        }

        const timestamp = new Date().toISOString();
        let artworksDeleted = 0;
        let entriesDeleted = 0;

        // 6. Delete user profile from DynamoDB (critical - must succeed)
        try {
            await dynamodb.send(new DeleteCommand({
                TableName: TABLE_NAME,
                Key: {
                    PK: `USER#${targetUserId}`,
                    SK: 'PROFILE'
                }
            }));
            entriesDeleted++;
        } catch (error: any) {
            console.error('Failed to delete user profile:', error);
            return CommonErrors.internalServerError('Failed to delete user account. Please try again.');
        }

        // 7. Delete user artworks - ART entities (critical - must succeed)
        try {
            // Query Art_Ptr to get all artwork IDs
            const artPtrResult = await dynamodb.send(new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                ExpressionAttributeValues: {
                    ':pk': `USER#${targetUserId}`,
                    ':sk': 'ART#'
                }
            }));

            const artPointers = artPtrResult.Items || [];

            // Extract unique art IDs
            const artIds = Array.from(new Set(
                artPointers
                    .map(ptr => ptr.art_id || ptr.artwork_id)
                    .filter(Boolean)
            )) as string[];

            // Delete all ART entities
            for (const artId of artIds) {
                await dynamodb.send(new DeleteCommand({
                    TableName: TABLE_NAME,
                    Key: {
                        PK: `ART#${artId}`,
                        SK: 'N/A'
                    }
                }));
                artworksDeleted++;
            }

            console.log(`Deleted ${artIds.length} artwork entities for user ${targetUserId}`);
        } catch (error: any) {
            console.error('Failed to delete user artworks:', error);
            return CommonErrors.internalServerError('Failed to delete user account. Please try again.');
        }

        // 8. Query and delete all USER#<uid> prefixed entries (non-critical)
        try {
            const queryParams = {
                TableName: TABLE_NAME,
                KeyConditionExpression: 'PK = :pk',
                ExpressionAttributeValues: {
                    ':pk': `USER#${targetUserId}`
                }
            };

            const queryResult = await dynamodb.send(new QueryCommand(queryParams));
            const userRecords = queryResult.Items || [];

            // Delete all found entries
            const deletePromises = userRecords.map(record => {
                entriesDeleted++;
                return dynamodb.send(new DeleteCommand({
                    TableName: TABLE_NAME,
                    Key: {
                        PK: record.PK,
                        SK: record.SK
                    }
                }));
            });

            await Promise.all(deletePromises);
            console.log(`Deleted ${userRecords.length} USER# prefixed entries`);
        } catch (error: any) {
            console.error('Failed to delete user records:', error);
            // Non-critical, continue
        }

        // 9. Delete user artwork from S3 (non-critical)
        if (S3_BUCKET_NAME) {
            try {
                // List all objects with user_id prefix
                const listParams = {
                    Bucket: S3_BUCKET_NAME,
                    Prefix: `artwork/${targetUserId}/`
                };

                const listResult = await s3Client.send(new ListObjectsV2Command(listParams));
                const objects = listResult.Contents || [];

                if (objects.length > 0) {
                    await s3Client.send(new DeleteObjectsCommand({
                        Bucket: S3_BUCKET_NAME,
                        Delete: {
                            Objects: objects.map(obj => ({ Key: obj.Key! }))
                        }
                    }));
                    console.log(`Deleted ${objects.length} S3 objects`);
                }
            } catch (error: any) {
                console.error('Failed to delete S3 objects:', error);
                // Non-critical, continue
            }
        }

        // 10. Handle Cognito deletion/disabling
        let cognitoDeleted = false;
        try {
            if (requestData.delete_from_cognito) {
                // Completely delete from Cognito
                await cognitoClient.send(new AdminDeleteUserCommand({
                    UserPoolId: USER_POOL_ID,
                    Username: targetUserId
                }));
                cognitoDeleted = true;
                console.log(`Deleted user ${targetUserId} from Cognito`);
            } else {
                // Just disable
                await cognitoClient.send(new AdminDisableUserCommand({
                    UserPoolId: USER_POOL_ID,
                    Username: targetUserId
                }));
                console.log(`Disabled user ${targetUserId} in Cognito`);
            }
        } catch (error: any) {
            console.error('Failed to handle Cognito user:', error);
            // Non-critical, continue
        }

        // 11. Create admin action record
        const adminActionId = `${timestamp}_${adminUserId}`;

        try {
            await dynamodb.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    PK: `USER#${targetUserId}`,
                    SK: `ADMIN_ACTION#${timestamp}`,
                    admin_action_id: adminActionId,
                    action_type: 'delete_account',
                    admin_user_id: adminUserId,
                    reason: requestData.reason.trim(),
                    artworks_deleted: artworksDeleted,
                    entries_deleted: entriesDeleted,
                    deleted_from_cognito: cognitoDeleted,
                    timestamp: timestamp,
                    created_at: timestamp,
                    type: 'ADMIN_ACTION'
                }
            }));
        } catch (error: any) {
            console.error('Failed to create admin action record:', error);
            // Non-critical, continue
        }

        // 12. Return success response
        const response: DeleteUserAccountResponse = {
            message: 'User account deleted successfully',
            user_id: targetUserId,
            artworks_deleted: artworksDeleted,
            entries_deleted: entriesDeleted,
            cognito_deleted: cognitoDeleted,
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
        console.error('Error in deleteUserAccount handler:', error);

        return CommonErrors.internalServerError('Failed to delete user account');
    }
};
