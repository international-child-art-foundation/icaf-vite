import { QueryCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { AdminDisableUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient, dynamodb, s3Client, USER_POOL_ID, TABLE_NAME, S3_BUCKET_NAME } from '../config/aws-clients';
import { CleanupTask, QueueItem, MAX_RETRY_COUNT } from '../../shared/src/api-types/internalTypes';

export const handler = async (event: any) => {
    try {
        console.log('Starting cleanup queue processor...');

        // Query pending cleanup tasks
        const queryParams = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk',
            FilterExpression: 'status = :status',
            ExpressionAttributeValues: {
                ':pk': 'CLEANUP_QUEUE',
                ':status': 'PENDING'
            }
        };

        const queryResult = await dynamodb.send(new QueryCommand(queryParams));
        const pendingTasks = queryResult.Items || [];

        console.log(`Found ${pendingTasks.length} pending cleanup tasks`);

        // Process each pending task
        for (const queueItem of pendingTasks) {
            await processCleanupTask(queueItem as QueueItem);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Processed ${pendingTasks.length} cleanup tasks`
            }),
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error: any) {
        console.error('Error in cleanup queue processor:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};

async function processCleanupTask(queueItem: QueueItem): Promise<void> {
    const { task, retryCount } = queueItem;

    try {
        // Mark task as processing
        await updateTaskStatus(queueItem.SK, 'PROCESSING');

        // Process based on task type
        switch (task.type) {
            case 'S3_CLEANUP':
                await processS3Cleanup(task);
                break;
            case 'DYNAMODB_CLEANUP':
                await processDynamoDBCleanup(task);
                break;
            case 'COGNITO_DISABLE':
                await processCognitoDisable(task);
                break;
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }

        // Mark task as completed
        await updateTaskStatus(queueItem.SK, 'COMPLETED');
        console.log(`✅ Completed cleanup task: ${task.type} for user ${task.userId}`);

    } catch (error: any) {
        console.error(`❌ Failed to process cleanup task: ${task.type} for user ${task.userId}:`, error);

        // Check if we should retry
        if (retryCount < MAX_RETRY_COUNT) {
            // Increment retry count and keep as PENDING for next run
            await incrementRetryCount(queueItem.SK, retryCount + 1);
            console.log(`🔄 Queued for retry (${retryCount + 1}/${MAX_RETRY_COUNT}): ${task.type} for user ${task.userId}`);
        } else {
            // Mark as failed after max retries
            await updateTaskStatus(queueItem.SK, 'FAILED');
            console.log(`💀 Max retries exceeded for: ${task.type} for user ${task.userId}`);
        }
    }
}

async function processS3Cleanup(task: CleanupTask): Promise<void> {
    if (!S3_BUCKET_NAME || !task.data?.bucketName || !task.data?.prefix) {
        throw new Error('Missing S3 configuration for cleanup');
    }

    // List objects with the user prefix
    const listParams = {
        Bucket: S3_BUCKET_NAME,
        Prefix: task.data.prefix
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
        console.log(`Deleted ${objects.length} S3 objects for user ${task.userId}`);
    }
}

async function processDynamoDBCleanup(task: CleanupTask): Promise<void> {
    // Query all USER#<uid> prefixed entries
    const queryParams = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
            ':pk': `USER#${task.userId}`
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
    console.log(`Deleted ${userRecords.length} DynamoDB records for user ${task.userId}`);
}

async function processCognitoDisable(task: CleanupTask): Promise<void> {
    await cognitoClient.send(new AdminDisableUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: task.userId
    }));
    console.log(`Disabled Cognito user: ${task.userId}`);
}

async function updateTaskStatus(sk: string, status: string): Promise<void> {
    await dynamodb.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
            PK: 'CLEANUP_QUEUE',
            SK: sk
        },
        UpdateExpression: 'SET status = :status, lastAttempt = :lastAttempt',
        ExpressionAttributeValues: {
            ':status': status,
            ':lastAttempt': new Date().toISOString()
        }
    }));
}

async function incrementRetryCount(sk: string, newRetryCount: number): Promise<void> {
    await dynamodb.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
            PK: 'CLEANUP_QUEUE',
            SK: sk
        },
        UpdateExpression: 'SET retryCount = :retryCount, lastAttempt = :lastAttempt',
        ExpressionAttributeValues: {
            ':retryCount': newRetryCount,
            ':lastAttempt': new Date().toISOString()
        }
    }));
} 