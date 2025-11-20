import { InitiateAuthCommand, AuthFlowType } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient, USER_POOL_CLIENT_ID } from '../../config/aws-clients';
import { ApiGatewayEvent, ApiGatewayResponse, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';

/**
 * User Login Handler
 *
 * Authenticates user with Cognito and returns secure HTTPOnly cookies
 * - Uses Cognito USER_PASSWORD_AUTH flow
 * - Returns accessToken, idToken, and refreshToken as HTTPOnly, Secure cookies
 * - Extracts user information from IdToken payload
 */

// Helper function to decode JWT payload
function decodeJwtPayload(token: string): any {
    try {
        const base64Payload = token.split('.')[1];
        const payload = Buffer.from(base64Payload, 'base64').toString('utf-8');
        return JSON.parse(payload);
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
}

// Helper function to create cookie string
function createCookie(name: string, value: string, maxAge: number): string {
    return `${name}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
    try {
        const body = JSON.parse(event.body || '{}');

        // 1) Validate required fields
        if (!body.email) {
            return CommonErrors.badRequest('Email is required');
        }

        if (!body.password) {
            return CommonErrors.badRequest('Password is required');
        }

        const email = body.email.trim();
        const password = body.password;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return CommonErrors.badRequest('Invalid email format');
        }

        // Basic password validation
        if (password.length < 8) {
            return CommonErrors.badRequest('Password must be at least 8 characters long');
        }

        // 2) Authenticate with Cognito
        try {
            const authResult = await cognitoClient.send(new InitiateAuthCommand({
                AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
                ClientId: USER_POOL_CLIENT_ID,
                AuthParameters: {
                    USERNAME: email,
                    PASSWORD: password
                }
            }));

            // 3) Extract tokens
            const accessToken = authResult.AuthenticationResult?.AccessToken;
            const idToken = authResult.AuthenticationResult?.IdToken;
            const refreshToken = authResult.AuthenticationResult?.RefreshToken;

            if (!accessToken || !idToken || !refreshToken) {
                return CommonErrors.internalServerError('Authentication failed: Missing tokens');
            }

            // 4) Decode IdToken to get user information
            const idTokenPayload = decodeJwtPayload(idToken);
            if (!idTokenPayload) {
                return CommonErrors.internalServerError('Failed to decode user information');
            }

            const userId = idTokenPayload.sub;
            const userEmail = idTokenPayload.email;
            const userRole = idTokenPayload['custom:role'] || 'user';

            // 5) Return success response with HTTPOnly Secure cookies
            return {
                statusCode: HTTP_STATUS.OK,
                body: JSON.stringify({
                    message: 'Login successful',
                    user_id: userId,
                    email: userEmail,
                    role: userRole
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
                        createCookie('accessToken', accessToken, 3600), // 1 hour
                        createCookie('idToken', idToken, 3600), // 1 hour
                        createCookie('refreshToken', refreshToken, 2592000) // 30 days
                    ]
                }
            };

        } catch (error: any) {
            console.error('Cognito authentication error:', error);

            // Handle specific Cognito errors
            if (error.name === 'NotAuthorizedException') {
                return {
                    statusCode: 401,
                    body: JSON.stringify({ message: 'Incorrect email or password' }),
                    headers: { 'Content-Type': 'application/json' }
                };
            }

            if (error.name === 'UserNotConfirmedException') {
                return CommonErrors.forbidden('Please verify your email before logging in');
            }

            if (error.name === 'UserNotFoundException') {
                return CommonErrors.notFound('User not found. Please register first.');
            }

            if (error.name === 'TooManyRequestsException') {
                return CommonErrors.tooManyRequests('Too many login attempts. Please try again later.');
            }

            if (error.name === 'PasswordResetRequiredException') {
                return CommonErrors.forbidden('Password reset required. Please reset your password.');
            }

            if (error.name === 'InvalidParameterException') {
                return CommonErrors.badRequest('Invalid login parameters');
            }

            // Generic error
            throw error;
        }

    } catch (error: any) {
        console.error('Error during login:', error);
        return CommonErrors.internalServerError('Failed to login');
    }
};
