// Mock Cognito
const mockCognitoClient = {
    send: jest.fn()
};

jest.mock('../../config/aws-clients', () => ({
    cognitoClient: mockCognitoClient
}));

import { handler } from '../../functions/user/changePassword';
import { ChangePasswordResponse } from '../../../shared/src/api-types/registrationTypes';

describe('changePassword (User)', () => {
    beforeEach(() => {
        mockCognitoClient.send.mockReset();
    });

    describe('Request Validation', () => {
        it('should return 400 when access_token is missing', async () => {
            const event = {
                body: JSON.stringify({
                    old_password: 'OldPass123',
                    new_password: 'NewPass123'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Access token is required');
        });

        it('should return 400 when old_password is missing', async () => {
            const event = {
                body: JSON.stringify({
                    access_token: 'valid-token',
                    new_password: 'NewPass123'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Current password is required');
        });

        it('should return 400 when new_password is missing', async () => {
            const event = {
                body: JSON.stringify({
                    access_token: 'valid-token',
                    old_password: 'OldPass123'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('New password is required');
        });

        it('should return 400 when new password is too short', async () => {
            const event = {
                body: JSON.stringify({
                    access_token: 'valid-token',
                    old_password: 'OldPass123',
                    new_password: 'short'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('New password must be at least 8 characters long');
        });

        it('should return 400 when new password is same as old password', async () => {
            const event = {
                body: JSON.stringify({
                    access_token: 'valid-token',
                    old_password: 'SamePass123',
                    new_password: 'SamePass123'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('New password must be different from current password');
        });
    });

    describe('Cognito Errors', () => {
        it('should return 401 when access token is invalid', async () => {
            // Mock Cognito NotAuthorizedException
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Invalid token'), { name: 'NotAuthorizedException' })
            );

            const event = {
                body: JSON.stringify({
                    access_token: 'invalid-token',
                    old_password: 'OldPass123',
                    new_password: 'NewPass123'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(401);
            expect(response.body).toContain('Unauthorized');
        });

        it('should return 401 when old password is incorrect', async () => {
            // Mock Cognito NotAuthorizedException
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Incorrect password'), { name: 'NotAuthorizedException' })
            );

            const event = {
                body: JSON.stringify({
                    access_token: 'valid-token',
                    old_password: 'WrongPass123',
                    new_password: 'NewPass123'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(401);
            expect(response.body).toContain('Unauthorized');
        });

        it('should return 400 when new password does not meet policy', async () => {
            // Mock Cognito InvalidPasswordException
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Password policy not met'), { name: 'InvalidPasswordException' })
            );

            const event = {
                body: JSON.stringify({
                    access_token: 'valid-token',
                    old_password: 'OldPass123',
                    new_password: 'weakpass'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('New password does not meet password policy requirements');
        });

        it('should return 400 when too many attempts', async () => {
            // Mock Cognito LimitExceededException
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Too many attempts'), { name: 'LimitExceededException' })
            );

            const event = {
                body: JSON.stringify({
                    access_token: 'valid-token',
                    old_password: 'OldPass123',
                    new_password: 'NewPass123'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Too many password change attempts');
        });
    });

    describe('Successful Password Change', () => {
        it('should successfully change password', async () => {
            // Mock Cognito success
            mockCognitoClient.send.mockResolvedValueOnce({});

            const event = {
                body: JSON.stringify({
                    access_token: 'valid-access-token',
                    old_password: 'OldPassword123',
                    new_password: 'NewPassword456'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: ChangePasswordResponse = JSON.parse(response.body);
            expect(responseBody.message).toBe('Password changed successfully');

            // Verify Cognito was called with correct parameters
            expect(mockCognitoClient.send).toHaveBeenCalledTimes(1);
        });

        it('should handle password with special characters', async () => {
            // Mock Cognito success
            mockCognitoClient.send.mockResolvedValueOnce({});

            const event = {
                body: JSON.stringify({
                    access_token: 'valid-access-token',
                    old_password: 'OldP@ss!123',
                    new_password: 'N3wP@ssw0rd!#$'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: ChangePasswordResponse = JSON.parse(response.body);
            expect(responseBody.message).toBe('Password changed successfully');
        });
    });

    describe('Error Handling', () => {
        it('should return 500 when Cognito throws unexpected error', async () => {
            // Mock unexpected Cognito error
            mockCognitoClient.send.mockRejectedValueOnce(new Error('Cognito service error'));

            const event = {
                body: JSON.stringify({
                    access_token: 'valid-token',
                    old_password: 'OldPass123',
                    new_password: 'NewPass123'
                }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to change password');
        });
    });
});
