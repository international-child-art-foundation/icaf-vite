/**
 * Common API Types
 * 
 * Defines common types used across multiple API endpoints
 * including API Gateway events and common response structures.
 */

// Common API Gateway event structure
export interface ApiGatewayEvent {
    requestContext?: {
        authorizer?: {
            claims?: {
                sub?: string;
                [key: string]: any;
            }
        }
    };
    body?: string;
    pathParameters?: Record<string, string>;
    queryStringParameters?: Record<string, string> | null;
    httpMethod: string;
    headers?: Record<string, string>;
}

// Common response headers
export const COMMON_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
} as const;

// Common HTTP status codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    INTERNAL_SERVER_ERROR: 500
} as const;

export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
