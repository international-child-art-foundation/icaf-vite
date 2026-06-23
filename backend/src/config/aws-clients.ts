import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { SESClient } from '@aws-sdk/client-ses';
import { CloudFrontClient } from '@aws-sdk/client-cloudfront';

const region = process.env.AWS_REGION;

function parseEmailList(value: string | undefined): string[] {
  if (!value?.trim()) return [];

  const trimmed = value.trim();
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((email): email is string => typeof email === "string" && email.trim().length > 0);
    }
  } catch {
    // Fall back to a comma-separated list for local overrides.
  }

  return trimmed
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0);
}

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
export const sesClient = new SESClient({ region });
export const cloudFrontClient = new CloudFrontClient({ region });

// Environment variables
export const USER_POOL_ID = process.env.USER_POOL_ID!;
export const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID!;
export const TABLE_NAME = process.env.TABLE_NAME!;
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
export const APP_URL = process.env.APP_URL!;
export const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL!;
export const SES_CONFIGURATION_SET = process.env.SES_CONFIGURATION_SET;
export const TAKEDOWN_NOTIFICATION_EMAILS = parseEmailList(process.env.TAKEDOWN_NOTIFICATION_EMAILS);
export const ARTWORK_CLOUDFRONT_DISTRIBUTION_ID = process.env.ARTWORK_CLOUDFRONT_DISTRIBUTION_ID;
export const MAGAZINES_BUCKET_NAME = process.env.MAGAZINES_BUCKET_NAME!;
export const MAGAZINES_CLOUDFRONT_DOMAIN = process.env.MAGAZINES_CLOUDFRONT_DOMAIN!;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
export const EVERY_WEBHOOK_ENABLED = process.env.EVERY_WEBHOOK_ENABLED === "true";
export const EVERY_WEBHOOK_SECRET = process.env.EVERY_WEBHOOK_SECRET!;
export const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID;
export const GA4_API_SECRET = process.env.GA4_API_SECRET;
