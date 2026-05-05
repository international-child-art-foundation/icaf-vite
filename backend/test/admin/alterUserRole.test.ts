// Mock DynamoDB
const mockDynamoDB = {
    send: jest.fn()
};

jest.mock('../../config/aws-clients', () => ({
    dynamodb: mockDynamoDB,
    TABLE_NAME: 'test-table'
}));

import { handler } from '../../functions/admin/alterUserRole';
import { PresetEvents } from '../shared/simple-preset-db';
import { AlterUserRoleResponse } from '../../../shared/src/api-types/userTypes';

describe('alterUserRole', () => {
    beforeEach(() => {
        mockDynamoDB.send.mockReset();
    });

    describe('Authentication and Authorization', () => {
        it('should return 401 when no user ID in context', async () => {
            const event = {
                ...PresetEvents.createPatchEvent('ADMIN_USER', { new_role: 'guardian' }, { user_id: 'test-user' }),
                requestContext: { authorizer: { claims: {} } }
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

            const event = PresetEvents.createPatchEvent('ADULT_USER', { new_role: 'guardian' }, { user_id: 'test-user' });
            const response = await handler(event);
            
            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Admin access required');
        });

        it('should return 403 when user not found in database', async () => {
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: null
            });

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { new_role: 'guardian' }, { user_id: 'test-user' });
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
                ...PresetEvents.createPatchEvent('ADMIN_USER', { new_role: 'guardian' }),
                pathParameters: null
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('User ID is required in path');
        });

        it('should return 400 when request body is missing', async () => {
            const event = {
                ...PresetEvents.createPatchEvent('ADMIN_USER', {}, { user_id: 'test-user' }),
                body: null
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Request body is required');
        });

        it('should return 400 when request body is invalid JSON', async () => {
            const event = {
                ...PresetEvents.createPatchEvent('ADMIN_USER', {}, { user_id: 'test-user' }),
                body: 'invalid json'
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid JSON in request body');
        });

        it('should return 400 when new_role is missing', async () => {
            const event = PresetEvents.createPatchEvent('ADMIN_USER', {}, { user_id: 'test-user' });
            const response = await handler(event);
            
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('new_role is required');
        });

        it('should return 400 when new_role is invalid', async () => {
            const event = PresetEvents.createPatchEvent('ADMIN_USER', { new_role: 'invalid_role' }, { user_id: 'test-user' });
            const response = await handler(event);
            
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('new_role must be one of: admin, contributor, guardian, user');
        });
    });

    describe('User Management', () => {
        beforeEach(() => {
            // Mock admin user for user management tests
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

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { new_role: 'guardian' }, { user_id: 'non-existent-user' });
            const response = await handler(event);
            
            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('User \'non-existent-user\' not found');
        });

        it('should return 400 when admin tries to change their own role', async () => {
            // Mock target user (admin user)
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'admin',
                    f_name: 'Admin',
                    l_name: 'User',
                    max_constituents_per_season: -1
                }
            });

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { new_role: 'guardian' }, { user_id: 'PRESET_ADMIN_001' });
            const response = await handler(event);
            
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Cannot change your own role');
        });

        it('should return 403 when trying to change to admin role', async () => {
            // Mock target user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User',
                    max_constituents_per_season: 0
                }
            });

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { new_role: 'admin' }, { user_id: 'test-user' });
            const response = await handler(event);
            
            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Cannot modify admin roles');
        });

        it('should return 403 when trying to change from admin role', async () => {
            // Mock target user with admin role
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'admin',
                    f_name: 'Admin',
                    l_name: 'User',
                    max_constituents_per_season: -1
                }
            });

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { new_role: 'guardian' }, { user_id: 'admin-user' });
            const response = await handler(event);
            
            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Cannot modify admin roles');
        });
    });

    describe('Successful Role Changes', () => {
        beforeEach(() => {
            // Mock admin user for successful tests
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'admin',
                    f_name: 'Admin',
                    l_name: 'User'
                }
            });
        });

        it('should successfully change user role from user to guardian', async () => {
            // Mock target user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User',
                    max_constituents_per_season: 0
                }
            });

            // Mock successful update
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { new_role: 'guardian' }, { user_id: 'test-user' });
            const response = await handler(event);
            
            expect(response.statusCode).toBe(200);
            
            const responseBody: AlterUserRoleResponse = JSON.parse(response.body);
            expect(responseBody.message).toBe('User role updated successfully');
            expect(responseBody.user_id).toBe('test-user');
            expect(responseBody.old_role).toBe('user');
            expect(responseBody.new_role).toBe('guardian');
            expect(responseBody.max_constituents_per_season).toBe(50);
            expect(responseBody.updated_fields).toContain('role');
            expect(responseBody.updated_fields).toContain('max_constituents_per_season');
            expect(responseBody.updated_fields).toContain('updated_at');

            // Verify DynamoDB update was called with correct parameters
            expect(mockDynamoDB.send).toHaveBeenCalledTimes(3); // Admin check, user lookup, update
            const updateCall = mockDynamoDB.send.mock.calls[2][0];
            expect(updateCall.input.Key.PK).toBe('USER#test-user');
            expect(updateCall.input.Key.SK).toBe('PROFILE');
            expect(updateCall.input.ExpressionAttributeValues[':new_role']).toBe('guardian');
            expect(updateCall.input.ExpressionAttributeValues[':new_max_constituents']).toBe(50);
        });

        it('should successfully change user role from guardian to contributor', async () => {
            // Mock target user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'guardian',
                    f_name: 'Test',
                    l_name: 'Guardian',
                    max_constituents_per_season: 50
                }
            });

            // Mock successful update
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { new_role: 'contributor' }, { user_id: 'guardian-user' });
            const response = await handler(event);
            
            expect(response.statusCode).toBe(200);
            
            const responseBody: AlterUserRoleResponse = JSON.parse(response.body);
            expect(responseBody.old_role).toBe('guardian');
            expect(responseBody.new_role).toBe('contributor');
            expect(responseBody.max_constituents_per_season).toBe(-1);
            expect(responseBody.updated_fields).toContain('role');
            expect(responseBody.updated_fields).toContain('max_constituents_per_season');

            // Verify max_constituents_per_season was updated to -1 (unlimited)
            const updateCall = mockDynamoDB.send.mock.calls[2][0];
            expect(updateCall.input.ExpressionAttributeValues[':new_max_constituents']).toBe(-1);
        });

        it('should successfully change user role from contributor to user', async () => {
            // Mock target user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'contributor',
                    f_name: 'Test',
                    l_name: 'Contributor',
                    max_constituents_per_season: -1
                }
            });

            // Mock successful update
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { new_role: 'user' }, { user_id: 'contributor-user' });
            const response = await handler(event);
            
            expect(response.statusCode).toBe(200);
            
            const responseBody: AlterUserRoleResponse = JSON.parse(response.body);
            expect(responseBody.old_role).toBe('contributor');
            expect(responseBody.new_role).toBe('user');
            expect(responseBody.max_constituents_per_season).toBe(0);
            expect(responseBody.updated_fields).toContain('role');
            expect(responseBody.updated_fields).toContain('max_constituents_per_season');

            // Verify max_constituents_per_season was updated to 0
            const updateCall = mockDynamoDB.send.mock.calls[2][0];
            expect(updateCall.input.ExpressionAttributeValues[':new_max_constituents']).toBe(0);
        });

        it('should return 400 when no changes are needed', async () => {
            // Mock target user with same role
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'guardian',
                    f_name: 'Test',
                    l_name: 'Guardian',
                    max_constituents_per_season: 50
                }
            });

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { new_role: 'guardian' }, { user_id: 'guardian-user' });
            const response = await handler(event);
            
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('No changes to apply');
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            // Mock admin user for error handling tests
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'admin',
                    f_name: 'Admin',
                    l_name: 'User'
                }
            });
        });

        it('should return 404 when user is deleted during update', async () => {
            // Mock target user exists
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User',
                    max_constituents_per_season: 0
                }
            });

            // Mock conditional check failed (user deleted)
            mockDynamoDB.send.mockRejectedValueOnce({
                name: 'ConditionalCheckFailedException'
            });

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { new_role: 'guardian' }, { user_id: 'test-user' });
            const response = await handler(event);
            
            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('User not found or already modified');
        });

        it('should return 500 when DynamoDB update fails', async () => {
            // Mock target user exists
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User',
                    max_constituents_per_season: 0
                }
            });

            // Mock DynamoDB error
            mockDynamoDB.send.mockRejectedValueOnce(new Error('DynamoDB error'));

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { new_role: 'guardian' }, { user_id: 'test-user' });
            const response = await handler(event);
            
            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to update user role');
        });
    });
});
