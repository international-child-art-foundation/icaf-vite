/**
 * Error Response Types
 * 
 * Defines standardized error response formats
 * used across all API endpoints.
 */

import { COMMON_HEADERS, HTTP_STATUS } from './commonTypes';

// Base error response interface
export interface ErrorResponse {
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
        'Unauthorized'
    ),

    badRequest: (message: string, errors?: string[]) => createErrorResponse(
        HTTP_STATUS.BAD_REQUEST,
        message,
        errors
    ),

    forbidden: (message: string) => createErrorResponse(
        HTTP_STATUS.FORBIDDEN,
        message
    ),

    notFound: (message: string) => createErrorResponse(
        HTTP_STATUS.NOT_FOUND,
        message
    ),

    methodNotAllowed: () => createErrorResponse(
        HTTP_STATUS.METHOD_NOT_ALLOWED,
        'Method not allowed'
    ),

    internalServerError: (message?: string) => createErrorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message || 'Internal server error'
    ),

    paymentRequired: (message?: string) => createErrorResponse(
        402, // Payment Required
        message || 'Payment required'
    ),

    tooManyRequests: (message: string, currentCount?: number, maxAllowed?: number) => createErrorResponse(
        429, // Too Many Requests
        message,
        undefined,
        { current_count: currentCount, max_allowed: maxAllowed }
    ),

    conflict: (message: string) => createErrorResponse(
        409, // Conflict
        message
    )
};
