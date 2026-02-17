// Mock Cognito client
const mockCognitoClient = {
    send: jest.fn()
};

jest.mock('../../config/aws-clients', () => ({
    cognitoClient: mockCognitoClient,
    USER_POOL_CLIENT_ID: 'test-pool-client-id'
}));

import { handler } from '../../functions/user/confirmForgotPassword';
import { ConfirmForgotPasswordResponse } from '../../../shared/src/api-types/registrationTypes';

describe('confirmForgotPassword (User)', () => {
    beforeEach(() => {
        mockCognitoClient.send.mockReset();
    });

    describe('Request Validation', () => {
        it('should return 400 when email is missing', async () => {
            const event = {
                body: JSON.stringify({ code: '123456', new_password: 'NewPass123!' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Email is required');
        });

        it('should return 400 when code is missing', async () => {
            const event = {
                body: JSON.stringify({ email: 'test@example.com', new_password: 'NewPass123!' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Verification code is required');
        });

        it('should return 400 when new_password is missing', async () => {
            const event = {
                body: JSON.stringify({ email: 'test@example.com', code: '123456' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('New password is required');
        });

        it('should return 400 when email format is invalid', async () => {
            const event = {
                body: JSON.stringify({ email: 'invalid-email', code: '123456', new_password: 'NewPass123!' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid email format');
        });

        it('should return 400 when password is too short', async () => {
            const event = {
                body: JSON.stringify({ email: 'test@example.com', code: '123456', new_password: 'short' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Password must be at least 8 characters long');
        });

        it('should return 400 when code format is invalid (not 6 digits)', async () => {
            const event = {
                body: JSON.stringify({ email: 'test@example.com', code: '12345', new_password: 'NewPass123!' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Verification code must be 6 digits');
        });

        it('should return 400 when code contains non-digits', async () => {
            const event = {
                body: JSON.stringify({ email: 'test@example.com', code: '12345a', new_password: 'NewPass123!' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Verification code must be 6 digits');
        });

        it('should trim whitespace from email and code', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({});

            const event = {
                body: JSON.stringify({
                    email: '  test@example.com  ',
                    code: '  123456  ',
                    new_password: 'NewPass123!'
                }),
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
                body: JSON.stringify({
                    email: 'nonexistent@example.com',
                    code: '123456',
                    new_password: 'NewPass123!'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('User not found. Please register first.');
        });

        it('should return 400 when verification code is incorrect', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Code mismatch'), { name: 'CodeMismatchException' })
            );

            const event = {
                body: JSON.stringify({
                    email: 'test@example.com',
                    code: '999999',
                    new_password: 'NewPass123!'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid verification code. Please check and try again.');
        });

        it('should return 400 when verification code has expired', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Code expired'), { name: 'ExpiredCodeException' })
            );

            const event = {
                body: JSON.stringify({
                    email: 'test@example.com',
                    code: '123456',
                    new_password: 'NewPass123!'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Verification code has expired. Please request a new one.');
        });

        it('should return 400 when password does not meet requirements', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Invalid password'), { name: 'InvalidPasswordException' })
            );

            const event = {
                body: JSON.stringify({
                    email: 'test@example.com',
                    code: '123456',
                    new_password: 'weakpass'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Password does not meet requirements');
        });

        it('should return 400 when invalid parameter provided', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Invalid parameter'), { name: 'InvalidParameterException' })
            );

            const event = {
                body: JSON.stringify({
                    email: 'test@example.com',
                    code: '123456',
                    new_password: 'NewPass123!'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid parameter provided');
        });

        it('should return 429 when rate limit exceeded', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Too many requests'), { name: 'LimitExceededException' })
            );

            const event = {
                body: JSON.stringify({
                    email: 'test@example.com',
                    code: '123456',
                    new_password: 'NewPass123!'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(429);
            expect(response.body).toContain('Too many attempts. Please try again later.');
        });

        it('should return 429 when too many failed attempts', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Too many failed attempts'), { name: 'TooManyFailedAttemptsException' })
            );

            const event = {
                body: JSON.stringify({
                    email: 'test@example.com',
                    code: '123456',
                    new_password: 'NewPass123!'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(429);
            expect(response.body).toContain('Too many failed attempts. Please try again later.');
        });

        it('should return 500 when Cognito throws unexpected error', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                new Error('Unexpected Cognito error')
            );

            const event = {
                body: JSON.stringify({
                    email: 'test@example.com',
                    code: '123456',
                    new_password: 'NewPass123!'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to reset password');
        });
    });

    describe('Successful Password Reset', () => {
        it('should successfully reset password', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({});

            const event = {
                body: JSON.stringify({
                    email: 'test@example.com',
                    code: '123456',
                    new_password: 'NewSecurePass123!'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: ConfirmForgotPasswordResponse = JSON.parse(response.body);
            expect(responseBody.message).toBe('Password reset successfully');

            // Verify CORS headers
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            expect(response.headers['Content-Type']).toBe('application/json');
        });

        it('should accept password with exactly 8 characters', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({});

            const event = {
                body: JSON.stringify({
                    email: 'test@example.com',
                    code: '123456',
                    new_password: 'Pass123!'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
        });

        it('should handle email with different casing', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({});

            const event = {
                body: JSON.stringify({
                    email: 'Test@Example.COM',
                    code: '123456',
                    new_password: 'NewPass123!'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: ConfirmForgotPasswordResponse = JSON.parse(response.body);
            expect(responseBody.message).toBe('Password reset successfully');
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
            expect(response.body).toContain('Failed to reset password');
        });

        it('should accept code with leading zeros', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({});

            const event = {
                body: JSON.stringify({
                    email: 'test@example.com',
                    code: '000123',
                    new_password: 'NewPass123!'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
        });
    });
});
