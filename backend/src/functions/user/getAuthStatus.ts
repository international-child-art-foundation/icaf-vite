import { GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from '../../config/aws-clients';
import { ApiGatewayEvent, ApiGatewayResponse, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';

/**
 * Get Authentication Status Handler
 *
 * Checks if user is currently logged in by:
 * 1. Reading accessToken from Cookie header
 * 2. Calling Cognito GetUser to validate token
 * 3. Returning authentication status and user info
 *
 * Returns 200 with authenticated: false if not logged in
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

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
    try {
        // 1) Extract accessToken from Cookie header
        const cookieHeader = event.headers?.['Cookie'] || event.headers?.['cookie'];
        const cookies = parseCookies(cookieHeader);
        const accessToken = cookies['accessToken'];

        // 2) If no token, user is not authenticated
        if (!accessToken) {
            return {
                statusCode: HTTP_STATUS.OK,
                body: JSON.stringify({
                    authenticated: false
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS',
                    'Access-Control-Allow-Credentials': 'true'
                }
            };
        }

        // 3) Validate token with Cognito GetUser
        try {
            const result = await cognitoClient.send(new GetUserCommand({
                AccessToken: accessToken
            }));

            // 4) Extract user information from UserAttributes
            const attributes = result.UserAttributes || [];
            const getAttribute = (name: string): string | undefined => {
                return attributes.find(attr => attr.Name === name)?.Value;
            };

            const userId = result.Username;
            const email = getAttribute('email');
            const role = getAttribute('custom:role') || 'user';

            // 5) Return authenticated response with user info
            return {
                statusCode: HTTP_STATUS.OK,
                body: JSON.stringify({
                    authenticated: true,
                    user_id: userId,
                    email: email,
                    role: role
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS',
                    'Access-Control-Allow-Credentials': 'true'
                }
            };

        } catch (error: any) {
            console.error('Cognito GetUser error:', error);

            // If token is invalid/expired, return not authenticated
            if (error.name === 'NotAuthorizedException' ||
                error.name === 'UserNotFoundException' ||
                error.name === 'InvalidParameterException') {
                return {
                    statusCode: HTTP_STATUS.OK,
                    body: JSON.stringify({
                        authenticated: false
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                        'Access-Control-Allow-Methods': 'GET,OPTIONS',
                        'Access-Control-Allow-Credentials': 'true'
                    }
                };
            }

            // For other errors, throw to outer catch
            throw error;
        }

    } catch (error: any) {
        console.error('Error checking auth status:', error);
        return CommonErrors.internalServerError('Failed to check authentication status');
    }
};
