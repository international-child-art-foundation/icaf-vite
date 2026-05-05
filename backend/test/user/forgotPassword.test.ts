// Mock Cognito client
const mockCognitoClient = {
    send: jest.fn()
};

jest.mock('../../config/aws-clients', () => ({
    cognitoClient: mockCognitoClient,
    USER_POOL_CLIENT_ID: 'test-pool-client-id'
}));

import { handler } from '../../functions/user/forgotPassword';
import { ForgotPasswordResponse } from '../../../shared/src/api-types/registrationTypes';

describe('forgotPassword (User)', () => {
    beforeEach(() => {
        mockCognitoClient.send.mockReset();
    });

    describe('Request Validation', () => {
        it('should return 400 when email is missing', async () => {
            const event = {
                body: JSON.stringify({}),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Email is required');
        });

        it('should return 400 when email format is invalid', async () => {
            const event = {
                body: JSON.stringify({ email: 'invalid-email' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid email format');
        });

        it('should return 400 when email is missing @ symbol', async () => {
            const event = {
                body: JSON.stringify({ email: 'invalidemail.com' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid email format');
        });

        it('should return 400 when email is missing domain', async () => {
            const event = {
                body: JSON.stringify({ email: 'user@' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid email format');
        });

        it('should trim whitespace from email', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                CodeDeliveryDetails: {
                    DeliveryMedium: 'EMAIL',
                    Destination: 't***@e***'
                }
            });

            const event = {
                body: JSON.stringify({ email: '  test@example.com  ' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            expect(mockCognitoClient.send).toHaveBeenCalled();
        });
    });

    describe('Cognito Error Handling', () => {
        it('should return 404 when user not found', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('User not found'), { name: 'UserNotFoundException' })
            );

            const event = {
                body: JSON.stringify({ email: 'nonexistent@example.com' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('User not found. Please register first.');
        });

        it('should return 400 when user is not verified', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('User not verified'), { name: 'InvalidParameterException' })
            );

            const event = {
                body: JSON.stringify({ email: 'unverified@example.com' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('User account is not verified or invalid parameter');
        });

        it('should return 429 when rate limit exceeded', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Too many requests'), { name: 'LimitExceededException' })
            );

            const event = {
                body: JSON.stringify({ email: 'test@example.com' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(429);
            expect(response.body).toContain('Too many requests. Please try again later.');
        });

        it('should return 500 when code delivery fails', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Code delivery failed'), { name: 'CodeDeliveryFailureException' })
            );

            const event = {
                body: JSON.stringify({ email: 'test@example.com' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to deliver reset code. Please try again later.');
        });

        it('should return 500 when Cognito throws unexpected error', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                new Error('Unexpected Cognito error')
            );

            const event = {
                body: JSON.stringify({ email: 'test@example.com' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to initiate password reset');
        });
    });

    describe('Successful Password Reset Initiation', () => {
        it('should successfully send reset code', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                CodeDeliveryDetails: {
                    DeliveryMedium: 'EMAIL',
                    Destination: 't***@e***.com'
                }
            });

            const event = {
                body: JSON.stringify({ email: 'test@example.com' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: ForgotPasswordResponse = JSON.parse(response.body);
            expect(responseBody.message).toBe('Password reset code sent successfully');
            expect(responseBody.delivery_medium).toBe('EMAIL');
            expect(responseBody.destination).toBe('t***@e***.com');

            // Verify CORS headers
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            expect(response.headers['Content-Type']).toBe('application/json');
        });

        it('should use default values when delivery details are missing', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({});

            const event = {
                body: JSON.stringify({ email: 'test@example.com' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: ForgotPasswordResponse = JSON.parse(response.body);
            expect(responseBody.delivery_medium).toBe('EMAIL'); // Default
            expect(responseBody.destination).toBe('test@example.com'); // Falls back to provided email
        });

        it('should handle email with different casing', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                CodeDeliveryDetails: {
                    DeliveryMedium: 'EMAIL',
                    Destination: 'T***@E***.COM'
                }
            });

            const event = {
                body: JSON.stringify({ email: 'Test@Example.COM' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: ForgotPasswordResponse = JSON.parse(response.body);
            expect(responseBody.message).toBe('Password reset code sent successfully');
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
            expect(response.body).toContain('Failed to initiate password reset');
        });
    });
});
