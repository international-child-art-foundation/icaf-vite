/**
 * Error Response Types
 * 
 * Defines standardized error response formats
 * used across all API endpoints.
 */

import { COMMON_HEADERS, HTTP_STATUS } from './commonTypes.js';

// Base error response interface
export interface ErrorResponse {
    code: string;
    message: string;
    errors?: string[];
    [key: string]: any;
}

// Standard error response function
export function createErrorResponse(
    statusCode: number,
    message: string,
    errors?: string[],
    additionalData?: Record<string, any>
): {
    statusCode: number;
    body: string;
    headers: Record<string, string>;
} {
    const response: ErrorResponse = {
        code: additionalData?.code ?? 'ERROR',
        message,
        ...additionalData
    };

    if (errors && errors.length > 0) {
        response.errors = errors;
    }

    return {
        statusCode,
        body: JSON.stringify(response),
        headers: COMMON_HEADERS
    };
}

// Common error responses
export const CommonErrors = {
    unauthorized: () => createErrorResponse(
        HTTP_STATUS.UNAUTHORIZED,
        'Unauthorized',
        undefined,
        { code: 'UNAUTHORIZED' }
    ),

    badRequest: (message: string, errors?: string[]) => createErrorResponse(
        HTTP_STATUS.BAD_REQUEST,
        message,
        errors,
        { code: 'BAD_REQUEST' }
    ),

    forbidden: (message: string) => createErrorResponse(
        HTTP_STATUS.FORBIDDEN,
        message,
        undefined,
        { code: 'FORBIDDEN' }
    ),

    notFound: (message: string) => createErrorResponse(
        HTTP_STATUS.NOT_FOUND,
        message,
        undefined,
        { code: 'NOT_FOUND' }
    ),

    methodNotAllowed: (allowedMethods?: string[]) => createErrorResponse(
        HTTP_STATUS.METHOD_NOT_ALLOWED,
        'Method not allowed',
        undefined,
        {
            code: 'METHOD_NOT_ALLOWED',
            ...(allowedMethods && allowedMethods.length > 0 ? { allowed_methods: allowedMethods } : {})
        }
    ),

    internalServerError: (message?: string) => createErrorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message || 'Internal server error',
        undefined,
        { code: 'INTERNAL_SERVER_ERROR' }
    ),

    paymentRequired: (message?: string) => createErrorResponse(
        402,
        message || 'Payment required',
        undefined,
        { code: 'PAYMENT_REQUIRED' }
    ),

    tooManyRequests: (message: string, currentCount?: number, maxAllowed?: number) => createErrorResponse(
        429,
        message,
        undefined,
        { code: 'TOO_MANY_REQUESTS', current_count: currentCount, max_allowed: maxAllowed }
    ),

    conflict: (message: string) => createErrorResponse(
        409,
        message,
        undefined,
        { code: 'CONFLICT' }
    )
};
