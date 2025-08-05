import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

// Test-specific AWS client configuration for LocalStack
const createTestAWSClientConfig = () => ({
    endpoint: 'http://localhost:4566',
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test'
    }
});

// Create AWS clients for testing
export const cognitoClient = new CognitoIdentityProviderClient(createTestAWSClientConfig());
export const dynamoClient = new DynamoDBClient(createTestAWSClientConfig());
export const dynamodb = DynamoDBDocumentClient.from(dynamoClient);
export const s3Client = new S3Client({
    ...createTestAWSClientConfig(),
    forcePathStyle: true // Required for LocalStack S3
});

// Test environment variables
export const USER_POOL_ID = 'test-user-pool-id';
export const USER_POOL_CLIENT_ID = 'test-client-id';
export const TABLE_NAME = 'icaf-main-table';
export const S3_BUCKET_NAME = 'icaf-artwork-bucket'; 