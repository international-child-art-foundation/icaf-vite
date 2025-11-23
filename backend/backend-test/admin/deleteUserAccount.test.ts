// Mock DynamoDB, Cognito, and S3
const mockDynamoDB = {
    send: jest.fn()
};

const mockCognitoClient = {
    send: jest.fn()
};

const mockS3Client = {
    send: jest.fn()
};

jest.mock('../../config/aws-clients', () => ({
    dynamodb: mockDynamoDB,
    cognitoClient: mockCognitoClient,
    s3Client: mockS3Client,
    TABLE_NAME: 'test-table',
    USER_POOL_ID: 'test-pool-id',
    S3_BUCKET_NAME: 'test-bucket'
}));

import { handler } from '../../functions/admin/deleteUserAccount';
import { PresetEvents } from '../shared/simple-preset-db';
import { DeleteUserAccountResponse } from '../../../shared/src/api-types/userTypes';

describe('deleteUserAccount (Admin)', () => {
    beforeEach(() => {
        mockDynamoDB.send.mockReset();
        mockCognitoClient.send.mockReset();
        mockS3Client.send.mockReset();
    });

    describe('Authentication and Authorization', () => {
        it('should return 401 when no user ID in context', async () => {
            const event = {
                ...PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'test-user' }),
                requestContext: { authorizer: { claims: {} } }
            };
            event.body = JSON.stringify({ reason: 'Test deletion' });
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

            const event = PresetEvents.createDeleteEvent('ADULT_USER', { user_id: 'test-user' });
            event.body = JSON.stringify({ reason: 'Test deletion' });
            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Admin access required');
        });
    });

    describe('Request Validation', () => {
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

        it('should return 400 when user_id is missing from path', async () => {
            const event = {
                ...PresetEvents.createDeleteEvent('ADMIN_USER', {}),
                pathParameters: null
            };
            event.body = JSON.stringify({ reason: 'Test' });
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('User ID is required in path');
        });

        it('should return 400 when request body is missing', async () => {
            const event = PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'test-user' });
            event.body = null;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Request body is required');
        });

        it('should return 400 when request body is invalid JSON', async () => {
            const event = PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'test-user' });
            event.body = 'invalid json';
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid JSON in request body');
        });

        it('should return 400 when reason is missing', async () => {
            const event = PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'test-user' });
            event.body = JSON.stringify({});
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('reason is required');
        });

        it('should return 400 when reason is empty', async () => {
            const event = PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'test-user' });
            event.body = JSON.stringify({ reason: '   ' });
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('reason cannot be empty');
        });

        it('should return 400 when delete_from_cognito is not boolean', async () => {
            const event = PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'test-user' });
            event.body = JSON.stringify({ reason: 'Test', delete_from_cognito: 'yes' });
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('delete_from_cognito must be a boolean');
        });
    });

    describe('User Validation', () => {
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

        it('should return 404 when target user does not exist', async () => {
            // Mock target user not found
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: null
            });

            const event = PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'non-existent-user' });
            event.body = JSON.stringify({ reason: 'Test deletion' });
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('User \'non-existent-user\' not found');
        });

        it('should return 400 when admin tries to delete themselves', async () => {
            // Mock target user is admin themselves
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'admin',
                    f_name: 'Admin',
                    l_name: 'User'
                }
            });

            const event = PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'PRESET_ADMIN_001' });
            event.body = JSON.stringify({ reason: 'Self deletion' });
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Cannot delete your own account');
        });
    });

    describe('Successful Account Deletion', () => {
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

        it('should successfully delete user account with artworks (disable Cognito)', async () => {
            // Mock target user exists
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User'
                }
            });

            // Mock delete profile
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock query Art_Ptr
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    {
                        PK: 'USER#test-user',
                        SK: 'ART#2024_SPRING#ART_001',
                        art_id: 'ART_001'
                    },
                    {
                        PK: 'USER#test-user',
                        SK: 'ART#2024_SPRING#ART_002',
                        art_id: 'ART_002'
                    }
                ]
            });

            // Mock delete ART entities
            mockDynamoDB.send.mockResolvedValueOnce({}); // ART_001
            mockDynamoDB.send.mockResolvedValueOnce({}); // ART_002

            // Mock query USER# entries
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    { PK: 'USER#test-user', SK: 'DONATION#001' },
                    { PK: 'USER#test-user', SK: 'VOTE#001' }
                ]
            });

            // Mock delete USER# entries (2 deletes)
            mockDynamoDB.send.mockResolvedValueOnce({});
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock S3 list
            mockS3Client.send.mockResolvedValueOnce({
                Contents: [
                    { Key: 'artwork/test-user/art1.png' }
                ]
            });

            // Mock S3 delete
            mockS3Client.send.mockResolvedValueOnce({});

            // Mock Cognito disable
            mockCognitoClient.send.mockResolvedValueOnce({});

            // Mock admin action creation
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'test-user' });
            event.body = JSON.stringify({
                reason: 'Violates terms of service',
                delete_from_cognito: false
            });
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: DeleteUserAccountResponse = JSON.parse(response.body);
            expect(responseBody.message).toBe('User account deleted successfully');
            expect(responseBody.user_id).toBe('test-user');
            expect(responseBody.artworks_deleted).toBe(2);
            expect(responseBody.entries_deleted).toBe(3); // 1 profile + 2 other entries
            expect(responseBody.cognito_deleted).toBe(false);
            expect(responseBody.admin_action_id).toMatch(/^\d{4}-\d{2}-\d{2}T.*_PRESET_ADMIN_001$/);
            expect(responseBody.timestamp).toBeTruthy();

            // Verify DynamoDB calls order
            expect(mockDynamoDB.send).toHaveBeenCalled();

            // Verify Cognito disable was called
            expect(mockCognitoClient.send).toHaveBeenCalledTimes(1);
        });

        it('should successfully delete user account and delete from Cognito', async () => {
            // Mock target user exists
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Banned',
                    l_name: 'User'
                }
            });

            // Mock delete profile
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock query Art_Ptr (no artworks)
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: []
            });

            // Mock query USER# entries
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: []
            });

            // Mock S3 list (no files)
            mockS3Client.send.mockResolvedValueOnce({
                Contents: []
            });

            // Mock Cognito delete (complete removal)
            mockCognitoClient.send.mockResolvedValueOnce({});

            // Mock admin action creation
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'banned-user' });
            event.body = JSON.stringify({
                reason: 'Permanent ban - spam account',
                delete_from_cognito: true
            });
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: DeleteUserAccountResponse = JSON.parse(response.body);
            expect(responseBody.cognito_deleted).toBe(true);
            expect(responseBody.artworks_deleted).toBe(0);

            // Verify Cognito delete (not disable) was called
            expect(mockCognitoClient.send).toHaveBeenCalledTimes(1);
        });

        it('should handle user with no artworks', async () => {
            // Mock target user exists
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'NoArt',
                    l_name: 'User'
                }
            });

            // Mock delete profile
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock query Art_Ptr (empty)
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: []
            });

            // Mock query USER# entries
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    { PK: 'USER#no-art-user', SK: 'DONATION#001' }
                ]
            });

            // Mock delete USER# entry
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock S3 list
            mockS3Client.send.mockResolvedValueOnce({
                Contents: []
            });

            // Mock Cognito disable
            mockCognitoClient.send.mockResolvedValueOnce({});

            // Mock admin action creation
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'no-art-user' });
            event.body = JSON.stringify({ reason: 'Cleanup inactive account' });
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: DeleteUserAccountResponse = JSON.parse(response.body);
            expect(responseBody.artworks_deleted).toBe(0);
            expect(responseBody.entries_deleted).toBe(2); // 1 profile + 1 donation
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

        it('should return 500 when profile deletion fails', async () => {
            // Mock target user exists
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User'
                }
            });

            // Mock delete profile fails
            mockDynamoDB.send.mockRejectedValueOnce(new Error('DynamoDB error'));

            const event = PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'test-user' });
            event.body = JSON.stringify({ reason: 'Test deletion' });
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to delete user account');
        });

        it('should return 500 when artwork deletion fails', async () => {
            // Mock target user exists
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User'
                }
            });

            // Mock delete profile succeeds
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock query Art_Ptr fails
            mockDynamoDB.send.mockRejectedValueOnce(new Error('Query failed'));

            const event = PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'test-user' });
            event.body = JSON.stringify({ reason: 'Test deletion' });
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to delete user account');
        });

        it('should continue even if S3 deletion fails', async () => {
            // Mock successful DynamoDB operations
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: { role: 'user', f_name: 'Test', l_name: 'User' }
            });
            mockDynamoDB.send.mockResolvedValueOnce({}); // delete profile
            mockDynamoDB.send.mockResolvedValueOnce({ Items: [] }); // query Art_Ptr
            mockDynamoDB.send.mockResolvedValueOnce({ Items: [] }); // query USER#

            // Mock S3 error
            mockS3Client.send.mockRejectedValueOnce(new Error('S3 error'));

            // Mock Cognito success
            mockCognitoClient.send.mockResolvedValueOnce({});

            // Mock admin action creation
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'test-user' });
            event.body = JSON.stringify({ reason: 'Test deletion' });
            const response = await handler(event);

            // Should still succeed despite S3 error
            expect(response.statusCode).toBe(200);
        });

        it('should continue even if Cognito operation fails', async () => {
            // Mock successful DynamoDB operations
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: { role: 'user', f_name: 'Test', l_name: 'User' }
            });
            mockDynamoDB.send.mockResolvedValueOnce({}); // delete profile
            mockDynamoDB.send.mockResolvedValueOnce({ Items: [] }); // query Art_Ptr
            mockDynamoDB.send.mockResolvedValueOnce({ Items: [] }); // query USER#

            // Mock S3 success
            mockS3Client.send.mockResolvedValueOnce({ Contents: [] });

            // Mock Cognito error
            mockCognitoClient.send.mockRejectedValueOnce(new Error('Cognito error'));

            // Mock admin action creation
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'test-user' });
            event.body = JSON.stringify({ reason: 'Test deletion' });
            const response = await handler(event);

            // Should still succeed despite Cognito error
            expect(response.statusCode).toBe(200);
        });
    });
});
