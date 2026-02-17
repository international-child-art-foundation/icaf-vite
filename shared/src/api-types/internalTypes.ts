/**
 * Internal Processing Types
 * 
 * Defines types for internal backend processing,
 * such as cleanup tasks and queue management.
 */

// Cleanup task types for background processing
export type CleanupTaskType = 'S3_CLEANUP' | 'DYNAMODB_CLEANUP' | 'COGNITO_DISABLE';

// Cleanup task interface
export interface CleanupTask {
    type: CleanupTaskType;
    userId: string;
    error?: string;
    timestamp: string;
    retryCount?: number;
    data?: any;
}

// Queue item status
export type QueueItemStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

// Queue item interface
export interface QueueItem {
    PK: string;
    SK: string;
    task: CleanupTask;
    status: QueueItemStatus;
    createdAt: string;
    retryCount: number;
    lastAttempt?: string;
}

// Cleanup task data interfaces
export interface S3CleanupData {
    bucketName: string;
    prefix: string;
}

export interface DynamoDBCleanupData {
    tableName: string;
}

export interface CognitoDisableData {
    userPoolId: string;
}

// Configuration constants
export const MAX_RETRY_COUNT = 3;
export const RETRY_DELAY_MS = 5000; // 5 seconds 