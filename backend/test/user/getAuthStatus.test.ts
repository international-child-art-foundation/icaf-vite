// Mock Cognito client
const mockCognitoClient = {
    send: jest.fn()
};

jest.mock('../../config/aws-clients', () => ({
    cognitoClient: mockCognitoClient
}));

import { handler } from '../../functions/user/getAuthStatus';
import { GetAuthStatusResponse } from '../../../shared/src/api-types/registrationTypes';

describe('getAuthStatus (User)', () => {
    beforeEach(() => {
        mockCognitoClient.send.mockReset();
    });

    describe('Not Authenticated', () => {
        it('should return authenticated: false when no cookie', async () => {
            const event = {
                httpMethod: 'GET',
                headers: {}
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetAuthStatusResponse = JSON.parse(response.body);
            expect(responseBody.authenticated).toBe(false);
            expect(responseBody.user_id).toBeUndefined();
            expect(responseBody.email).toBeUndefined();
            expect(responseBody.role).toBeUndefined();

            // Should not call Cognito
            expect(mockCognitoClient.send).not.toHaveBeenCalled();

            // Verify CORS headers
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            expect(response.headers['Access-Control-Allow-Credentials']).toBe('true');
        });

        it('should return authenticated: false when empty cookie', async () => {
            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': ''
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetAuthStatusResponse = JSON.parse(response.body);
            expect(responseBody.authenticated).toBe(false);
        });

        it('should return authenticated: false when cookie without accessToken', async () => {
            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'otherCookie=value; anotherCookie=value2'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetAuthStatusResponse = JSON.parse(response.body);
            expect(responseBody.authenticated).toBe(false);
        });

        it('should return authenticated: false when token is invalid', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Not authorized'), { name: 'NotAuthorizedException' })
            );

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=invalid-token'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetAuthStatusResponse = JSON.parse(response.body);
            expect(responseBody.authenticated).toBe(false);
        });

        it('should return authenticated: false when user not found', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('User not found'), { name: 'UserNotFoundException' })
            );

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetAuthStatusResponse = JSON.parse(response.body);
            expect(responseBody.authenticated).toBe(false);
        });

        it('should return authenticated: false when invalid parameter', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Invalid parameter'), { name: 'InvalidParameterException' })
            );

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=malformed-token'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetAuthStatusResponse = JSON.parse(response.body);
            expect(responseBody.authenticated).toBe(false);
        });
    });

    describe('Authenticated', () => {
        it('should return authenticated: true with user info', async () => {
            // Mock Cognito GetUser response
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'user-123',
                UserAttributes: [
                    { Name: 'email', Value: 'test@example.com' },
                    { Name: 'custom:role', Value: 'user' }
                ]
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetAuthStatusResponse = JSON.parse(response.body);
            expect(responseBody.authenticated).toBe(true);
            expect(responseBody.user_id).toBe('user-123');
            expect(responseBody.email).toBe('test@example.com');
            expect(responseBody.role).toBe('user');

            // Verify GetUser was called
            expect(mockCognitoClient.send).toHaveBeenCalledTimes(1);
        });

        it('should return guardian role correctly', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-456',
                UserAttributes: [
                    { Name: 'email', Value: 'guardian@example.com' },
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetAuthStatusResponse = JSON.parse(response.body);
            expect(responseBody.authenticated).toBe(true);
            expect(responseBody.role).toBe('guardian');
        });

        it('should return admin role correctly', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'admin-789',
                UserAttributes: [
                    { Name: 'email', Value: 'admin@example.com' },
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetAuthStatusResponse = JSON.parse(response.body);
            expect(responseBody.authenticated).toBe(true);
            expect(responseBody.role).toBe('admin');
        });

        it('should default to user role when custom:role is missing', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'user-999',
                UserAttributes: [
                    { Name: 'email', Value: 'norole@example.com' }
                    // No custom:role attribute
                ]
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetAuthStatusResponse = JSON.parse(response.body);
            expect(responseBody.authenticated).toBe(true);
            expect(responseBody.role).toBe('user'); // Default role
        });

        it('should handle lowercase cookie header', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'user-123',
                UserAttributes: [
                    { Name: 'email', Value: 'test@example.com' },
                    { Name: 'custom:role', Value: 'user' }
                ]
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'cookie': 'accessToken=valid-token'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetAuthStatusResponse = JSON.parse(response.body);
            expect(responseBody.authenticated).toBe(true);
        });

        it('should handle multiple cookies', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'user-123',
                UserAttributes: [
                    { Name: 'email', Value: 'test@example.com' },
                    { Name: 'custom:role', Value: 'user' }
                ]
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token; idToken=id-token; refreshToken=refresh-token; other=value'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetAuthStatusResponse = JSON.parse(response.body);
            expect(responseBody.authenticated).toBe(true);
        });

        it('should handle empty UserAttributes array', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'user-123',
                UserAttributes: []
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetAuthStatusResponse = JSON.parse(response.body);
            expect(responseBody.authenticated).toBe(true);
            expect(responseBody.user_id).toBe('user-123');
            expect(responseBody.email).toBeUndefined();
            expect(responseBody.role).toBe('user'); // Default
        });

        it('should handle missing UserAttributes field', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'user-123'
                // No UserAttributes field
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetAuthStatusResponse = JSON.parse(response.body);
            expect(responseBody.authenticated).toBe(true);
            expect(responseBody.user_id).toBe('user-123');
            expect(responseBody.role).toBe('user'); // Default
        });
    });

    describe('Error Handling', () => {
        it('should return 500 when Cognito throws unexpected error', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                new Error('Unexpected error')
            );

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to check authentication status');
        });
    });

    describe('Cookie Parsing', () => {
        it('should handle cookie with spaces', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'user-123',
                UserAttributes: [
                    { Name: 'email', Value: 'test@example.com' },
                    { Name: 'custom:role', Value: 'user' }
                ]
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': '  accessToken = valid-token  ; other = value  '
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetAuthStatusResponse = JSON.parse(response.body);
            expect(responseBody.authenticated).toBe(true);
        });

        it('should handle cookie value with equals sign', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'user-123',
                UserAttributes: [
                    { Name: 'email', Value: 'test@example.com' },
                    { Name: 'custom:role', Value: 'user' }
                ]
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=token=with=equals; other=value'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetAuthStatusResponse = JSON.parse(response.body);
            expect(responseBody.authenticated).toBe(true);
        });
    });
});
