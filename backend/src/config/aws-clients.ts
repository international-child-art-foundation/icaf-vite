import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SESClient } from '@aws-sdk/client-ses';

const region = process.env.AWS_REGION;

// Create AWS clients
export const cognitoClient = new CognitoIdentityProviderClient({ region });
export const dynamoClient = new DynamoDBClient({ region });
export const dynamodb = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  }}
)
export const s3Client = new S3Client({ region });
export const lambdaClient = new LambdaClient({ region });
export const sqsClient = new SQSClient({ region });
export const sesClient = new SESClient({ region });

// Environment variables
export const USER_POOL_ID = process.env.USER_POOL_ID!;
export const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID!;
export const TABLE_NAME = process.env.TABLE_NAME!;
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
export const CLEANUP_QUEUE_URL = process.env.CLEANUP_QUEUE_URL!;
export const APP_URL = process.env.APP_URL!;
export const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL!;
export const MAGAZINES_BUCKET_NAME = process.env.MAGAZINES_BUCKET_NAME!;
export const MAGAZINES_CLOUDFRONT_DOMAIN = process.env.MAGAZINES_CLOUDFRONT_DOMAIN!;