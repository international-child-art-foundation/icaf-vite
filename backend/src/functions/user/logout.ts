import { GlobalSignOutCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from '../../config/aws-clients';
import { ApiGatewayEvent, ApiGatewayResponse, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';

/**
 * User Logout Handler
 *
 * Logs out user by:
 * 1. Calling Cognito GlobalSignOut to invalidate all tokens
 * 2. Clearing all HTTPOnly cookies (accessToken, idToken, refreshToken)
 *
 * AccessToken is read from Cookie header
 */

// Helper function to parse cookies from Cookie header
function parseCookies(cookieHeader: string | undefined): Record<string, string> {
    if (!cookieHeader) {
        return {};
    }

    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
        const [name, ...rest] = cookie.split('=');
        if (name && rest.length > 0) {
            cookies[name.trim()] = rest.join('=').trim();
        }
    });
    return cookies;
}

// Helper function to create cookie deletion string
function deleteCookie(name: string): string {
    return `${name}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
    try {
        // 1) Extract accessToken from Cookie header
        const cookieHeader = event.headers?.['Cookie'] || event.headers?.['cookie'];
        const cookies = parseCookies(cookieHeader);
        const accessToken = cookies['accessToken'];

        // 2) If accessToken exists, call Cognito GlobalSignOut
        if (accessToken) {
            try {
                await cognitoClient.send(new GlobalSignOutCommand({
                    AccessToken: accessToken
                }));
            } catch (error: any) {
                console.error('Cognito GlobalSignOut error:', error);

                // Handle specific Cognito errors
                if (error.name === 'NotAuthorizedException') {
                    // Token is already invalid, continue with cookie deletion
                    console.log('Token already invalid, proceeding with cookie deletion');
                } else if (error.name === 'TooManyRequestsException') {
                    return CommonErrors.tooManyRequests('Too many logout requests. Please try again later.');
                } else {
                    // For other errors, still delete cookies but log the error
                    console.error('Unexpected error during global sign out:', error);
                }
            }
        }

        // 3) Return success response with deleted cookies
        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify({
                message: 'Logged out successfully'
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'POST,OPTIONS',
                'Access-Control-Allow-Credentials': 'true'
            },
            multiValueHeaders: {
                'Set-Cookie': [
                    deleteCookie('accessToken'),
                    deleteCookie('idToken'),
                    deleteCookie('refreshToken')
                ]
            }
        };

    } catch (error: any) {
        console.error('Error during logout:', error);
        return CommonErrors.internalServerError('Failed to logout');
    }
};
