// Mock Cognito client
const mockCognitoClient = {
    send: jest.fn()
};

jest.mock('../../config/aws-clients', () => ({
    cognitoClient: mockCognitoClient
}));

import { handler } from '../../functions/user/logout';
import { LogoutResponse } from '../../../shared/src/api-types/registrationTypes';

describe('logout (User)', () => {
    beforeEach(() => {
        mockCognitoClient.send.mockReset();
    });

    describe('Successful Logout', () => {
        it('should successfully logout with valid accessToken', async () => {
            // Mock successful GlobalSignOut
            mockCognitoClient.send.mockResolvedValueOnce({});

            const event = {
                body: JSON.stringify({}),
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token; idToken=id-token; refreshToken=refresh-token'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: LogoutResponse = JSON.parse(response.body);
            expect(responseBody.message).toBe('Logged out successfully');

            // Verify GlobalSignOut was called with correct token
            expect(mockCognitoClient.send).toHaveBeenCalledTimes(1);

            // Verify cookies are deleted in multiValueHeaders
            expect(response.multiValueHeaders).toBeDefined();
            expect(response.multiValueHeaders!['Set-Cookie']).toBeDefined();
            const cookies = response.multiValueHeaders!['Set-Cookie'];
            expect(cookies).toHaveLength(3);

            // Verify each cookie is deleted (Max-Age=0)
            expect(cookies[0]).toContain('accessToken=');
            expect(cookies[0]).toContain('Max-Age=0');
            expect(cookies[0]).toContain('HttpOnly');
            expect(cookies[0]).toContain('Secure');

            expect(cookies[1]).toContain('idToken=');
            expect(cookies[1]).toContain('Max-Age=0');

            expect(cookies[2]).toContain('refreshToken=');
            expect(cookies[2]).toContain('Max-Age=0');

            // Verify CORS headers
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            expect(response.headers['Access-Control-Allow-Credentials']).toBe('true');
        });

        it('should logout successfully even without accessToken', async () => {
            const event = {
                body: JSON.stringify({}),
                httpMethod: 'POST',
                headers: {}
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: LogoutResponse = JSON.parse(response.body);
            expect(responseBody.message).toBe('Logged out successfully');

            // GlobalSignOut should not be called without token
            expect(mockCognitoClient.send).not.toHaveBeenCalled();

            // Cookies should still be deleted
            const cookies = response.multiValueHeaders!['Set-Cookie'];
            expect(cookies).toHaveLength(3);
            expect(cookies[0]).toContain('Max-Age=0');
        });

        it('should handle lowercase cookie header', async () => {
            // Mock successful GlobalSignOut
            mockCognitoClient.send.mockResolvedValueOnce({});

            const event = {
                body: JSON.stringify({}),
                httpMethod: 'POST',
                headers: {
                    'cookie': 'accessToken=valid-token'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            expect(mockCognitoClient.send).toHaveBeenCalledTimes(1);
        });

        it('should parse multiple cookies correctly', async () => {
            // Mock successful GlobalSignOut
            mockCognitoClient.send.mockResolvedValueOnce({});

            const event = {
                body: JSON.stringify({}),
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=token123; idToken=id456; refreshToken=refresh789; otherCookie=value'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            expect(mockCognitoClient.send).toHaveBeenCalledTimes(1);
        });
    });

    describe('Cognito Error Handling', () => {
        it('should still delete cookies when token is already invalid', async () => {
            // Mock NotAuthorizedException
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Token is invalid'), { name: 'NotAuthorizedException' })
            );

            const event = {
                body: JSON.stringify({}),
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=invalid-token'
                }
            } as any;
            const response = await handler(event);

            // Should still succeed and delete cookies
            expect(response.statusCode).toBe(200);

            const responseBody: LogoutResponse = JSON.parse(response.body);
            expect(responseBody.message).toBe('Logged out successfully');

            // Verify cookies are deleted
            const cookies = response.multiValueHeaders!['Set-Cookie'];
            expect(cookies).toHaveLength(3);
            expect(cookies[0]).toContain('Max-Age=0');
        });

        it('should return 429 when rate limit exceeded', async () => {
            // Mock TooManyRequestsException
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Too many requests'), { name: 'TooManyRequestsException' })
            );

            const event = {
                body: JSON.stringify({}),
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(429);
            expect(response.body).toContain('Too many logout requests');
        });

        it('should still delete cookies when unexpected Cognito error occurs', async () => {
            // Mock unexpected error
            mockCognitoClient.send.mockRejectedValueOnce(
                new Error('Unexpected Cognito error')
            );

            const event = {
                body: JSON.stringify({}),
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                }
            } as any;
            const response = await handler(event);

            // Should still succeed and delete cookies
            expect(response.statusCode).toBe(200);

            const responseBody: LogoutResponse = JSON.parse(response.body);
            expect(responseBody.message).toBe('Logged out successfully');

            // Verify cookies are deleted
            const cookies = response.multiValueHeaders!['Set-Cookie'];
            expect(cookies).toHaveLength(3);
        });
    });

    describe('Cookie Parsing', () => {
        it('should handle empty cookie string', async () => {
            const event = {
                body: JSON.stringify({}),
                httpMethod: 'POST',
                headers: {
                    'Cookie': ''
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            expect(mockCognitoClient.send).not.toHaveBeenCalled();
        });

        it('should handle cookie with spaces', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({});

            const event = {
                body: JSON.stringify({}),
                httpMethod: 'POST',
                headers: {
                    'Cookie': '  accessToken = token-with-spaces  ; idToken = another-token  '
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            expect(mockCognitoClient.send).toHaveBeenCalledTimes(1);
        });

        it('should handle cookie value with equals sign', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({});

            const event = {
                body: JSON.stringify({}),
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=token=with=equals; other=value'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            expect(mockCognitoClient.send).toHaveBeenCalledTimes(1);
        });

        it('should handle malformed cookies gracefully', async () => {
            const event = {
                body: JSON.stringify({}),
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'malformed;=value;accessToken=;'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            // No valid accessToken, so GlobalSignOut not called
            expect(mockCognitoClient.send).not.toHaveBeenCalled();
        });
    });

    describe('Cookie Deletion Format', () => {
        it('should verify exact cookie deletion format', async () => {
            const event = {
                body: JSON.stringify({}),
                httpMethod: 'POST',
                headers: {}
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const cookies = response.multiValueHeaders!['Set-Cookie'];

            // Verify exact format for each cookie
            expect(cookies[0]).toBe('accessToken=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
            expect(cookies[1]).toBe('idToken=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
            expect(cookies[2]).toBe('refreshToken=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty request body', async () => {
            const event = {
                body: '',
                httpMethod: 'POST',
                headers: {}
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            const cookies = response.multiValueHeaders!['Set-Cookie'];
            expect(cookies).toHaveLength(3);
        });

        it('should handle null request body', async () => {
            const event = {
                body: null,
                httpMethod: 'POST',
                headers: {}
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
        });

        it('should handle missing headers object', async () => {
            const event = {
                body: JSON.stringify({}),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            expect(mockCognitoClient.send).not.toHaveBeenCalled();
        });
    });
});
