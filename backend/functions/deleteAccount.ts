import { AdminDisableUserCommand, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { QueryCommand, DeleteCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { cognitoClient, dynamodb, s3Client, USER_POOL_ID, TABLE_NAME, S3_BUCKET_NAME } from '../config/aws-clients';
import { CleanupTask } from '../../shared/src/api-types/internalTypes';

//Scenario 1: Everything works perfectly
//User requests deletion -> Delete core profile✅ -> Delete other data✅ -> Delete S3 files✅ -> Disable Cognito✅ -> Return success(204) -> User sees "Account deleted"

//Scenario 2: S3 service temporarily unavailable
//User requests deletion -> Delete core profile✅ -> Delete other data✅ -> Delete S3 files❌ -> Disable Cognito✅ -> Queue S3 cleanup task -> Return success(204) 
//-> User sees "Account deleted"-> Background job retries S3 cleanup✅

//Scenario 3: Core profile deletion fails
//User requests deletion -> Delete core profile❌ -> Return error immediately(500) -> User sees "Deletion failed, please retry" -> All data remains intact

export const handler = async (event: any) => {
    try {
        const userId = event.requestContext?.authorizer?.claims?.sub;

        if (!userId) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Unauthorized' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const { password } = body;

        if (!password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Password confirmation is required' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Verify user exists in Cognito
        try {
            await cognitoClient.send(new AdminGetUserCommand({
                UserPoolId: USER_POOL_ID,
                Username: userId
            }));
        } catch (error: any) {
            if (error.name === 'UserNotFoundException') {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: 'User not found' }),
                    headers: { 'Content-Type': 'application/json' }
                };
            }
            throw error;
        }

        // TODO: Verify password with Cognito (requires additional Cognito API call)
        // For now, we'll proceed with the deletion assuming password is verified
        // In a production environment, you should verify the password first

        // Start cleanup tasks array
        const cleanupTasks: CleanupTask[] = [];

        // 1. Delete user profile from DynamoDB (critical - must succeed)
        try {
            await dynamodb.send(new DeleteCommand({
                TableName: TABLE_NAME,
                Key: {
                    PK: `USER#${userId}`,
                    SK: 'PROFILE'
                }
            }));
        } catch (error: any) {
            // If profile deletion fails, return error immediately
            console.error('Failed to delete user profile:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Failed to delete account. Please try again.' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 2. Query and delete all USER#<uid> prefixed entries (non-critical)
        try {
            const queryParams = {
                TableName: TABLE_NAME,
                KeyConditionExpression: 'PK = :pk',
                ExpressionAttributeValues: {
                    ':pk': `USER#${userId}`
                }
            };

            const queryResult = await dynamodb.send(new QueryCommand(queryParams));
            const userRecords = queryResult.Items || [];

            // Delete all found entries
            const deletePromises = userRecords.map(record => {
                const deleteParams = {
                    TableName: TABLE_NAME,
                    Key: {
                        PK: record.PK,
                        SK: record.SK
                    }
                };
                return dynamodb.send(new DeleteCommand(deleteParams));
            });

            await Promise.all(deletePromises);
        } catch (error: any) {
            console.error('Failed to delete user records:', error);
            cleanupTasks.push({
                type: 'DYNAMODB_CLEANUP',
                userId: userId,
                error: error.message,
                timestamp: new Date().toISOString(),
                data: { tableName: TABLE_NAME }
            });
        }

        // 3. Delete user artwork from S3 (non-critical)
        if (S3_BUCKET_NAME) {
            try {
                // List all objects with user_id prefix
                const listParams = {
                    Bucket: S3_BUCKET_NAME,
                    Prefix: `artwork/${userId}/`
                };

                const listResult = await s3Client.send(new ListObjectsV2Command(listParams));
                const objects = listResult.Contents || [];

                if (objects.length > 0) {
                    // Delete all objects
                    const deleteObjectsParams = {
                        Bucket: S3_BUCKET_NAME,
                        Delete: {
                            Objects: objects.map(obj => ({ Key: obj.Key! }))
                        }
                    };

                    await s3Client.send(new DeleteObjectsCommand(deleteObjectsParams));
                }
            } catch (error: any) {
                console.error('Failed to delete S3 objects:', error);
                cleanupTasks.push({
                    type: 'S3_CLEANUP',
                    userId: userId,
                    error: error.message,
                    timestamp: new Date().toISOString(),
                    data: { bucketName: S3_BUCKET_NAME, prefix: `artwork/${userId}/` }
                });
            }
        }

        // 4. Disable user in Cognito (non-critical)
        try {
            await cognitoClient.send(new AdminDisableUserCommand({
                UserPoolId: USER_POOL_ID,
                Username: userId
            }));
        } catch (error: any) {
            console.error('Failed to disable user in Cognito:', error);
            cleanupTasks.push({
                type: 'COGNITO_DISABLE',
                userId: userId,
                error: error.message,
                timestamp: new Date().toISOString(),
                data: { userPoolId: USER_POOL_ID }
            });
        }

        // 5. Queue failed cleanup tasks for background retry
        if (cleanupTasks.length > 0) {
            try {
                await addToCleanupQueue(cleanupTasks);
                console.log(`Queued ${cleanupTasks.length} cleanup tasks for background retry`);
            } catch (queueError) {
                console.error('Failed to queue cleanup tasks:', queueError);
                // Don't fail the request if queueing fails
            }
        }

        // Return success immediately - user sees account as deleted
        return {
            statusCode: 204,
            body: '',
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error: any) {
        console.error('Error deleting user account:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};

// Function to add cleanup tasks to queue for background retry
async function addToCleanupQueue(tasks: CleanupTask[]): Promise<void> {
    try {
        // Store cleanup tasks in DynamoDB for background processing
        const queuePromises = tasks.map(task => {
            const queueItem = {
                PK: 'CLEANUP_QUEUE',
                SK: `${task.type}#${task.userId}#${Date.now()}`,
                task: task,
                status: 'PENDING',
                createdAt: new Date().toISOString(),
                retryCount: 0
            };

            return dynamodb.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: queueItem
            }));
        });

        await Promise.all(queuePromises);
    } catch (error) {
        console.error('Failed to add tasks to cleanup queue:', error);
        throw error;
    }
} 