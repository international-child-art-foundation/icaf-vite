// Mock DynamoDB and Cognito
const mockDynamoDB = {
    send: jest.fn()
};

const mockCognitoClient = {
    send: jest.fn()
};

jest.mock('../../config/aws-clients', () => ({
    dynamodb: mockDynamoDB,
    cognitoClient: mockCognitoClient,
    TABLE_NAME: 'test-table',
    USER_POOL_ID: 'test-pool-id'
}));

import { handler } from '../../functions/admin/getUserCognitoInfo';
import { PresetEvents } from '../shared/simple-preset-db';
import { GetUserCognitoInfoResponse } from '../../../shared/src/api-types/userTypes';

describe('getUserCognitoInfo', () => {
    beforeEach(() => {
        mockDynamoDB.send.mockReset();
        mockCognitoClient.send.mockReset();
    });

    describe('Authentication and Authorization', () => {
        it('should return 401 when no user ID in context', async () => {
            const event = {
                ...PresetEvents.createGetEvent('ADMIN_USER'),
                requestContext: { authorizer: { claims: {} } },
                pathParameters: { user_id: 'test-user' }
            };
            const response = await handler(event);

            expect(response.statusCode).toBe(401);
            expect(response.body).toContain('Unauthorized');
        });

        it('should return 403 when user is not admin', async () => {
            // Mock non-admin user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User'
                }
            });

            const event = PresetEvents.createGetEvent('ADULT_USER');
            event.pathParameters = { user_id: 'test-user' };
            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Admin access required');
        });
    });

    describe('Request Validation', () => {
        beforeEach(() => {
            // Mock admin user for validation tests
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'admin',
                    f_name: 'Admin',
                    l_name: 'User'
                }
            });
        });

        it('should return 400 when user_id is missing from path', async () => {
            const event = {
                ...PresetEvents.createGetEvent('ADMIN_USER'),
                pathParameters: null
            };
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('User ID is required in path');
        });
    });

    describe('User Lookup', () => {
        beforeEach(() => {
            // Mock admin user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'admin',
                    f_name: 'Admin',
                    l_name: 'User'
                }
            });
        });

        it('should return 404 when user not found in Cognito', async () => {
            // Mock Cognito UserNotFoundException
            mockCognitoClient.send.mockRejectedValueOnce({
                name: 'UserNotFoundException'
            });

            const event = PresetEvents.createGetEvent('ADMIN_USER');
            event.pathParameters = { user_id: 'non-existent-user' };
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('User \'non-existent-user\' not found in Cognito');
        });
    });

    describe('Successful User Info Retrieval', () => {
        beforeEach(() => {
            // Mock admin user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'admin',
                    f_name: 'Admin',
                    l_name: 'User'
                }
            });
        });

        it('should successfully return user Cognito information', async () => {
            const mockCognitoResponse = {
                Username: 'test-user',
                UserAttributes: [
                    { Name: 'email', Value: 'test@example.com' },
                    { Name: 'email_verified', Value: 'true' }
                ],
                UserStatus: 'CONFIRMED',
                Enabled: true,
                UserCreateDate: new Date('2024-01-01T00:00:00.000Z'),
                UserLastModifiedDate: new Date('2024-01-15T00:00:00.000Z')
            };

            mockCognitoClient.send.mockResolvedValueOnce(mockCognitoResponse);

            const event = PresetEvents.createGetEvent('ADMIN_USER');
            event.pathParameters = { user_id: 'test-user' };
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetUserCognitoInfoResponse = JSON.parse(response.body);
            expect(responseBody.user_id).toBe('test-user');
            expect(responseBody.email).toBe('test@example.com');
            expect(responseBody.email_verified).toBe(true);
            expect(responseBody.username).toBe('test-user');
            expect(responseBody.user_status).toBe('CONFIRMED');
            expect(responseBody.enabled).toBe(true);
            expect(responseBody.user_create_date).toBe('2024-01-01T00:00:00.000Z');
            expect(responseBody.user_last_modified_date).toBe('2024-01-15T00:00:00.000Z');

            // Verify Cognito call
            expect(mockCognitoClient.send).toHaveBeenCalledTimes(1);
        });

        it('should handle missing email attribute', async () => {
            const mockCognitoResponse = {
                Username: 'test-user',
                UserAttributes: [
                    { Name: 'email_verified', Value: 'false' }
                ],
                UserStatus: 'FORCE_CHANGE_PASSWORD',
                Enabled: true,
                UserCreateDate: new Date('2024-01-01T00:00:00.000Z'),
                UserLastModifiedDate: new Date('2024-01-01T00:00:00.000Z')
            };

            mockCognitoClient.send.mockResolvedValueOnce(mockCognitoResponse);

            const event = PresetEvents.createGetEvent('ADMIN_USER');
            event.pathParameters = { user_id: 'test-user' };
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetUserCognitoInfoResponse = JSON.parse(response.body);
            expect(responseBody.email).toBe('');
            expect(responseBody.email_verified).toBe(false);
            expect(responseBody.user_status).toBe('FORCE_CHANGE_PASSWORD');
        });

        it('should handle disabled user', async () => {
            const mockCognitoResponse = {
                Username: 'disabled-user',
                UserAttributes: [
                    { Name: 'email', Value: 'disabled@example.com' },
                    { Name: 'email_verified', Value: 'true' }
                ],
                UserStatus: 'CONFIRMED',
                Enabled: false,
                UserCreateDate: new Date('2024-01-01T00:00:00.000Z'),
                UserLastModifiedDate: new Date('2024-02-01T00:00:00.000Z')
            };

            mockCognitoClient.send.mockResolvedValueOnce(mockCognitoResponse);

            const event = PresetEvents.createGetEvent('ADMIN_USER');
            event.pathParameters = { user_id: 'disabled-user' };
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetUserCognitoInfoResponse = JSON.parse(response.body);
            expect(responseBody.enabled).toBe(false);
            expect(responseBody.user_id).toBe('disabled-user');
        });

        it('should handle minimal Cognito response', async () => {
            const mockCognitoResponse = {
                Username: 'minimal-user',
                UserAttributes: [],
                UserStatus: 'CONFIRMED',
                Enabled: true
            };

            mockCognitoClient.send.mockResolvedValueOnce(mockCognitoResponse);

            const event = PresetEvents.createGetEvent('ADMIN_USER');
            event.pathParameters = { user_id: 'minimal-user' };
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetUserCognitoInfoResponse = JSON.parse(response.body);
            expect(responseBody.user_id).toBe('minimal-user');
            expect(responseBody.username).toBe('minimal-user');
            expect(responseBody.email).toBe('');
            expect(responseBody.email_verified).toBe(false);
            expect(responseBody.user_status).toBe('CONFIRMED');
            expect(responseBody.enabled).toBe(true);
            expect(responseBody.user_create_date).toBeUndefined();
            expect(responseBody.user_last_modified_date).toBeUndefined();
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            // Mock admin user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'admin',
                    f_name: 'Admin',
                    l_name: 'User'
                }
            });
        });

        it('should return 500 when Cognito service fails', async () => {
            // Mock Cognito error
            mockCognitoClient.send.mockRejectedValueOnce(new Error('Cognito service error'));

            const event = PresetEvents.createGetEvent('ADMIN_USER');
            event.pathParameters = { user_id: 'test-user' };
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to get user Cognito information');
        });
    });
});
