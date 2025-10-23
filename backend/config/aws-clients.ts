import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SESClient } from '@aws-sdk/client-ses';

// Common AWS client configuration
const createAWSClientConfig = () => ({
    region: process.env.AWS_REGION || 'us-east-1',
    ...(process.env.NODE_ENV === 'test' && {
        endpoint: 'http://localhost:4566', // LocalStack endpoint
        credentials: {
            accessKeyId: 'test',
            secretAccessKey: 'test'
        }
    })
});

// Create AWS clients
export const cognitoClient = new CognitoIdentityProviderClient(createAWSClientConfig());
export const dynamoClient = new DynamoDBClient(createAWSClientConfig());
export const dynamodb = DynamoDBDocumentClient.from(dynamoClient);
export const s3Client = new S3Client({
    ...createAWSClientConfig(),
    ...(process.env.NODE_ENV === 'test' && {
        forcePathStyle: true // Required for LocalStack S3
    })
});
export const lambdaClient = new LambdaClient(createAWSClientConfig());
export const sqsClient = new SQSClient(createAWSClientConfig());
export const sesClient = new SESClient(createAWSClientConfig());

// Environment variables
export const USER_POOL_ID = process.env.USER_POOL_ID!;
export const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID!;
export const TABLE_NAME = process.env.TABLE_NAME!;
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
export const CLEANUP_QUEUE_URL = process.env.CLEANUP_QUEUE_URL!; 