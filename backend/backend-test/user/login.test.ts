// Mock Cognito client
const mockCognitoClient = {
    send: jest.fn()
};

jest.mock('../../config/aws-clients', () => ({
    cognitoClient: mockCognitoClient,
    USER_POOL_CLIENT_ID: 'test-pool-client-id'
}));

import { handler } from '../../functions/user/login';
import { LoginResponse } from '../../../shared/src/api-types/registrationTypes';

describe('login (User)', () => {
    beforeEach(() => {
        mockCognitoClient.send.mockReset();
    });

    describe('Request Validation', () => {
        it('should return 400 when email is missing', async () => {
            const event = {
                body: JSON.stringify({ password: 'password123' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Email is required');
        });

        it('should return 400 when password is missing', async () => {
            const event = {
                body: JSON.stringify({ email: 'test@example.com' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Password is required');
        });

        it('should return 400 when email format is invalid', async () => {
            const event = {
                body: JSON.stringify({ email: 'invalid-email', password: 'password123' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid email format');
        });

        it('should return 400 when email is missing @ symbol', async () => {
            const event = {
                body: JSON.stringify({ email: 'invalidemail.com', password: 'password123' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid email format');
        });

        it('should return 400 when password is too short', async () => {
            const event = {
                body: JSON.stringify({ email: 'test@example.com', password: 'short' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Password must be at least 8 characters long');
        });

        it('should trim whitespace from email', async () => {
            // Mock successful authentication
            mockCognitoClient.send.mockResolvedValueOnce({
                AuthenticationResult: {
                    AccessToken: 'mock-access-token',
                    IdToken: createMockIdToken('user-123', 'test@example.com', 'user'),
                    RefreshToken: 'mock-refresh-token'
                }
            });

            const event = {
                body: JSON.stringify({ email: '  test@example.com  ', password: 'password123' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            // Verify send was called
            expect(mockCognitoClient.send).toHaveBeenCalled();
        });
    });

    describe('Cognito Authentication Errors', () => {
        it('should return 401 when credentials are incorrect', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Incorrect username or password'), { name: 'NotAuthorizedException' })
            );

            const event = {
                body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(401);
            expect(response.body).toContain('Incorrect email or password');
        });

        it('should return 403 when user email is not confirmed', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('User is not confirmed'), { name: 'UserNotConfirmedException' })
            );

            const event = {
                body: JSON.stringify({ email: 'unconfirmed@example.com', password: 'password123' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Please verify your email before logging in');
        });

        it('should return 404 when user not found', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('User does not exist'), { name: 'UserNotFoundException' })
            );

            const event = {
                body: JSON.stringify({ email: 'nonexistent@example.com', password: 'password123' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('User not found. Please register first.');
        });

        it('should return 429 when too many requests', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Too many requests'), { name: 'TooManyRequestsException' })
            );

            const event = {
                body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(429);
            expect(response.body).toContain('Too many login attempts. Please try again later.');
        });

        it('should return 403 when password reset is required', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Password reset required'), { name: 'PasswordResetRequiredException' })
            );

            const event = {
                body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Password reset required. Please reset your password.');
        });

        it('should return 400 when invalid parameters provided', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Invalid parameter'), { name: 'InvalidParameterException' })
            );

            const event = {
                body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid login parameters');
        });

        it('should return 500 when Cognito throws unexpected error', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                new Error('Unexpected Cognito error')
            );

            const event = {
                body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to login');
        });
    });

    describe('Successful Login', () => {
        it('should successfully login and return user info with cookies', async () => {
            // Mock successful authentication
            mockCognitoClient.send.mockResolvedValueOnce({
                AuthenticationResult: {
                    AccessToken: 'mock-access-token',
                    IdToken: createMockIdToken('user-123', 'john.doe@example.com', 'user'),
                    RefreshToken: 'mock-refresh-token'
                }
            });

            const event = {
                body: JSON.stringify({ email: 'john.doe@example.com', password: 'password123' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: LoginResponse = JSON.parse(response.body);
            expect(responseBody.message).toBe('Login successful');
            expect(responseBody.user_id).toBe('user-123');
            expect(responseBody.email).toBe('john.doe@example.com');
            expect(responseBody.role).toBe('user');

            // Verify cookies are set in multiValueHeaders
            expect(response.multiValueHeaders).toBeDefined();
            expect(response.multiValueHeaders!['Set-Cookie']).toBeDefined();
            const cookies = response.multiValueHeaders!['Set-Cookie'];
            expect(cookies).toHaveLength(3);

            const cookiesString = cookies.join(' ');
            expect(cookiesString).toContain('accessToken=mock-access-token');
            expect(cookiesString).toContain('idToken=');
            expect(cookiesString).toContain('refreshToken=mock-refresh-token');
            expect(cookiesString).toContain('HttpOnly');
            expect(cookiesString).toContain('Secure');
            expect(cookiesString).toContain('SameSite=Lax');
            expect(cookiesString).toContain('Path=/');

            // Verify CORS headers
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            expect(response.headers['Access-Control-Allow-Credentials']).toBe('true');
            expect(response.headers['Content-Type']).toBe('application/json');
        });

        it('should login guardian user and return correct role', async () => {
            // Mock successful authentication for guardian
            mockCognitoClient.send.mockResolvedValueOnce({
                AuthenticationResult: {
                    AccessToken: 'mock-access-token',
                    IdToken: createMockIdToken('guardian-456', 'guardian@example.com', 'guardian'),
                    RefreshToken: 'mock-refresh-token'
                }
            });

            const event = {
                body: JSON.stringify({ email: 'guardian@example.com', password: 'password123' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: LoginResponse = JSON.parse(response.body);
            expect(responseBody.role).toBe('guardian');
            expect(responseBody.user_id).toBe('guardian-456');
        });

        it('should login admin user and return correct role', async () => {
            // Mock successful authentication for admin
            mockCognitoClient.send.mockResolvedValueOnce({
                AuthenticationResult: {
                    AccessToken: 'mock-access-token',
                    IdToken: createMockIdToken('admin-789', 'admin@example.com', 'admin'),
                    RefreshToken: 'mock-refresh-token'
                }
            });

            const event = {
                body: JSON.stringify({ email: 'admin@example.com', password: 'adminPass123' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: LoginResponse = JSON.parse(response.body);
            expect(responseBody.role).toBe('admin');
        });

        it('should default to user role when custom:role is not in token', async () => {
            // Mock successful authentication without custom:role
            mockCognitoClient.send.mockResolvedValueOnce({
                AuthenticationResult: {
                    AccessToken: 'mock-access-token',
                    IdToken: createMockIdToken('user-999', 'norole@example.com'), // No role
                    RefreshToken: 'mock-refresh-token'
                }
            });

            const event = {
                body: JSON.stringify({ email: 'norole@example.com', password: 'password123' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: LoginResponse = JSON.parse(response.body);
            expect(responseBody.role).toBe('user'); // Default role
        });

        it('should verify cookie Max-Age values', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                AuthenticationResult: {
                    AccessToken: 'mock-access-token',
                    IdToken: createMockIdToken('user-123', 'test@example.com', 'user'),
                    RefreshToken: 'mock-refresh-token'
                }
            });

            const event = {
                body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const cookies = response.multiValueHeaders!['Set-Cookie'];
            // accessToken and idToken: 1 hour = 3600 seconds
            expect(cookies[0]).toBe('accessToken=mock-access-token; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600');
            // refreshToken: 30 days = 2592000 seconds
            expect(cookies[2]).toBe('refreshToken=mock-refresh-token; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty request body', async () => {
            const event = {
                body: '',
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Email is required');
        });

        it('should handle null request body', async () => {
            const event = {
                body: null,
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Email is required');
        });

        it('should handle malformed JSON', async () => {
            const event = {
                body: '{invalid json}',
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to login');
        });

        it('should return 500 when tokens are missing from authentication result', async () => {
            // Mock authentication with missing tokens
            mockCognitoClient.send.mockResolvedValueOnce({
                AuthenticationResult: {
                    AccessToken: 'mock-access-token'
                    // Missing IdToken and RefreshToken
                }
            });

            const event = {
                body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Authentication failed: Missing tokens');
        });

        it('should return 500 when IdToken cannot be decoded', async () => {
            // Mock authentication with invalid IdToken
            mockCognitoClient.send.mockResolvedValueOnce({
                AuthenticationResult: {
                    AccessToken: 'mock-access-token',
                    IdToken: 'invalid-token', // Cannot be decoded
                    RefreshToken: 'mock-refresh-token'
                }
            });

            const event = {
                body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to decode user information');
        });
    });
});

// Helper function to create mock JWT IdToken
function createMockIdToken(userId: string, email: string, role?: string): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = {
        sub: userId,
        email: email,
        'custom:role': role
    };
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = 'mock-signature';

    return `${header}.${payloadBase64}.${signature}`;
}
