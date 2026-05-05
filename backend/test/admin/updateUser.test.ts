// Mock DynamoDB
const mockDynamoDB = {
    send: jest.fn()
};

jest.mock('../../config/aws-clients', () => ({
    dynamodb: mockDynamoDB,
    TABLE_NAME: 'test-table'
}));

import { handler } from '../../functions/admin/updateUser';
import { PresetEvents } from '../shared/simple-preset-db';
import { UpdateUserResponse } from '../../../shared/src/api-types/userTypes';

describe('updateUser', () => {
    beforeEach(() => {
        mockDynamoDB.send.mockReset();
    });

    describe('Authentication and Authorization', () => {
        it('should return 401 when no user ID in context', async () => {
            const event = {
                ...PresetEvents.createPatchEvent('ADMIN_USER', { can_submit: false, ban_reason: 'Test' }),
                pathParameters: { user_id: 'test-user' },
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

            const event = {
                ...PresetEvents.createPatchEvent('ADULT_USER', { can_submit: false, ban_reason: 'Test' }),
                pathParameters: { user_id: 'test-user' }
            };
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
                ...PresetEvents.createPatchEvent('ADMIN_USER', { can_submit: false, ban_reason: 'Test' }),
                pathParameters: null
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('User ID is required in path');
        });

        it('should return 400 when request body is missing', async () => {
            const event = {
                ...PresetEvents.createPatchEvent('ADMIN_USER', {}),
                pathParameters: { user_id: 'test-user' },
                body: null
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Request body is required');
        });

        it('should return 400 when no fields provided', async () => {
            const event = {
                ...PresetEvents.createPatchEvent('ADMIN_USER', {}),
                pathParameters: { user_id: 'test-user' }
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('At least one field (new_role or can_submit) must be provided');
        });

        it('should return 400 when banning without reason', async () => {
            const event = {
                ...PresetEvents.createPatchEvent('ADMIN_USER', { can_submit: false }),
                pathParameters: { user_id: 'test-user' }
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('ban_reason is required when banning a user');
        });

        it('should return 400 when providing ban_reason without banning', async () => {
            const event = {
                ...PresetEvents.createPatchEvent('ADMIN_USER', { can_submit: true, ban_reason: 'Test' }),
                pathParameters: { user_id: 'test-user' }
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('ban_reason can only be provided when can_submit is false');
        });
    });

    describe('User Management', () => {
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

            const event = {
                ...PresetEvents.createPatchEvent('ADMIN_USER', { can_submit: false, ban_reason: 'Test' }),
                pathParameters: { user_id: 'non-existent-user' }
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('User \'non-existent-user\' not found');
        });

        it('should return 400 when admin tries to modify themselves', async () => {
            // Mock target user (same as admin)
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'admin',
                    f_name: 'Admin',
                    l_name: 'User',
                    can_submit: true
                }
            });

            const event = {
                ...PresetEvents.createPatchEvent('ADMIN_USER', { can_submit: false, ban_reason: 'Test' }),
                pathParameters: { user_id: 'PRESET_ADMIN_001' }
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Cannot modify your own user account');
        });

        it('should return 403 when trying to change to admin role', async () => {
            // Mock target user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User',
                    can_submit: true
                }
            });

            const event = {
                ...PresetEvents.createPatchEvent('ADMIN_USER', { new_role: 'admin' }),
                pathParameters: { user_id: 'test-user' }
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Cannot modify admin roles');
        });

        it('should return 400 when no changes needed', async () => {
            // Mock target user with same values
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User',
                    can_submit: true
                }
            });

            const event = {
                ...PresetEvents.createPatchEvent('ADMIN_USER', { new_role: 'user' }),
                pathParameters: { user_id: 'test-user' }
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('No changes to apply');
        });
    });

    describe('Successful Operations', () => {
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

        it('should successfully ban a user', async () => {
            // Mock target user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User',
                    can_submit: true,
                    max_constituents_per_season: 0
                }
            });

            // Mock successful admin action creation
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock successful user update
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                ...PresetEvents.createPatchEvent('ADMIN_USER', { can_submit: false, ban_reason: 'Spam posting' }),
                pathParameters: { user_id: 'test-user' }
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(200);
            
            const responseBody: UpdateUserResponse = JSON.parse(response.body);
            expect(responseBody.message).toBe('User updated successfully');
            expect(responseBody.user_id).toBe('test-user');
            expect(responseBody.is_banned).toBe(true);
            expect(responseBody.can_submit).toBe(false);
            expect(responseBody.role).toBe('user');
            expect(responseBody.admin_action_id).toBeTruthy();
            expect(responseBody.updated_fields).toContain('can_submit');
            expect(responseBody.updated_fields).toContain('updated_at');
        });

        it('should successfully unban a user', async () => {
            // Mock target user (banned)
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User',
                    can_submit: false,
                    max_constituents_per_season: 0
                }
            });

            // Mock successful admin action creation
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock successful user update
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                ...PresetEvents.createPatchEvent('ADMIN_USER', { can_submit: true }),
                pathParameters: { user_id: 'banned-user' }
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(200);
            
            const responseBody: UpdateUserResponse = JSON.parse(response.body);
            expect(responseBody.message).toBe('User updated successfully');
            expect(responseBody.user_id).toBe('banned-user');
            expect(responseBody.is_banned).toBe(false);
            expect(responseBody.can_submit).toBe(true);
            expect(responseBody.admin_action_id).toBeTruthy();
        });

        it('should successfully change user role', async () => {
            // Mock target user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User',
                    can_submit: true,
                    max_constituents_per_season: 0
                }
            });

            // Mock successful admin action creation
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock successful user update
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                ...PresetEvents.createPatchEvent('ADMIN_USER', { new_role: 'guardian' }),
                pathParameters: { user_id: 'test-user' }
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(200);
            
            const responseBody: UpdateUserResponse = JSON.parse(response.body);
            expect(responseBody.role).toBe('guardian');
            expect(responseBody.max_constituents_per_season).toBe(50);
            expect(responseBody.updated_fields).toContain('role');
            expect(responseBody.updated_fields).toContain('max_constituents_per_season');
        });

        it('should successfully ban and change role simultaneously', async () => {
            // Mock target user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'guardian',
                    f_name: 'Test',
                    l_name: 'User',
                    can_submit: true,
                    max_constituents_per_season: 50
                }
            });

            // Mock successful admin action creations (2 actions)
            mockDynamoDB.send.mockResolvedValueOnce({});
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock successful user update
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                ...PresetEvents.createPatchEvent('ADMIN_USER', { 
                    new_role: 'user', 
                    can_submit: false, 
                    ban_reason: 'Demoted and banned for misconduct' 
                }),
                pathParameters: { user_id: 'test-user' }
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(200);
            
            const responseBody: UpdateUserResponse = JSON.parse(response.body);
            expect(responseBody.role).toBe('user');
            expect(responseBody.is_banned).toBe(true);
            expect(responseBody.can_submit).toBe(false);
            expect(responseBody.max_constituents_per_season).toBe(0);
            expect(responseBody.updated_fields).toContain('role');
            expect(responseBody.updated_fields).toContain('can_submit');
            expect(responseBody.updated_fields).toContain('max_constituents_per_season');

            // Verify both admin actions were created
            expect(mockDynamoDB.send).toHaveBeenCalledTimes(5); // Admin check, user lookup, 2 admin actions, user update
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

        it('should return 404 when user is deleted during update', async () => {
            // Mock target user exists
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User',
                    can_submit: true
                }
            });

            // Mock successful admin action creation
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock conditional check failed (user deleted)
            mockDynamoDB.send.mockRejectedValueOnce({
                name: 'ConditionalCheckFailedException'
            });

            const event = {
                ...PresetEvents.createPatchEvent('ADMIN_USER', { can_submit: false, ban_reason: 'Test' }),
                pathParameters: { user_id: 'test-user' }
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('User not found or already modified');
        });
    });
});