// Mock DynamoDB
const mockDynamoDB = {
    send: jest.fn()
};

jest.mock('../../config/aws-clients', () => ({
    dynamodb: mockDynamoDB,
    TABLE_NAME: 'test-table'
}));

import { handler } from '../../functions/admin/unbanUser';
import { PresetEvents } from '../shared/simple-preset-db';
import { BanUnbanUserResponse } from '../../../shared/src/api-types/userTypes';

describe('unbanUser', () => {
    beforeEach(() => {
        mockDynamoDB.send.mockReset();
    });

    describe('Authentication and Authorization', () => {
        it('should return 401 when no user ID in context', async () => {
            const event = {
                ...PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'test-user' }),
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
                ...PresetEvents.createDeleteEvent('ADULT_USER', { user_id: 'test-user' })
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
                ...PresetEvents.createDeleteEvent('ADMIN_USER', {}),
                pathParameters: null
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('User ID is required in path');
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

            const event = {
                ...PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'non-existent-user' })
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('User \'non-existent-user\' not found');
        });

        it('should return 400 when admin tries to unban themselves', async () => {
            // Mock target user (admin user)
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'admin',
                    f_name: 'Admin',
                    l_name: 'User',
                    can_submit: false
                }
            });

            const event = {
                ...PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'PRESET_ADMIN_001' })
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Cannot unban yourself');
        });

        it('should return 400 when user is not currently banned', async () => {
            // Mock target user not banned
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User',
                    can_submit: true
                }
            });

            const event = {
                ...PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'active-user' })
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('User is not currently banned');
        });
    });

    describe('Successful Unban', () => {
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

        it('should successfully unban a user', async () => {
            // Mock target user (banned)
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User',
                    can_submit: false
                }
            });

            // Mock successful admin action creation
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock successful user update
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                ...PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'banned-user' })
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(200);
            
            const responseBody: BanUnbanUserResponse = JSON.parse(response.body);
            expect(responseBody.message).toBe('User unbanned successfully');
            expect(responseBody.user_id).toBe('banned-user');
            expect(responseBody.is_banned).toBe(false);
            expect(responseBody.can_submit).toBe(true);
            expect(responseBody.admin_action_id).toMatch(/^\d{4}-\d{2}-\d{2}T.*_PRESET_ADMIN_001$/);
            expect(responseBody.timestamp).toBeTruthy();

            // Verify DynamoDB calls
            expect(mockDynamoDB.send).toHaveBeenCalledTimes(4); // Admin check, user lookup, admin action creation, user update

            // Verify admin action creation
            const adminActionCall = mockDynamoDB.send.mock.calls[2][0];
            expect(adminActionCall.input.Item.PK).toBe('USER#banned-user');
            expect(adminActionCall.input.Item.SK).toMatch(/^ADMIN_ACTION#\d{4}-\d{2}-\d{2}T/);
            expect(adminActionCall.input.Item.action_type).toBe('unban');
            expect(adminActionCall.input.Item.admin_user_id).toBe('PRESET_ADMIN_001');

            // Verify user update
            const userUpdateCall = mockDynamoDB.send.mock.calls[3][0];
            expect(userUpdateCall.input.Key.PK).toBe('USER#banned-user');
            expect(userUpdateCall.input.Key.SK).toBe('PROFILE');
            expect(userUpdateCall.input.ExpressionAttributeValues[':can_submit']).toBe(true);
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
            // Mock target user exists (banned)
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User',
                    can_submit: false
                }
            });

            // Mock successful admin action creation
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock conditional check failed (user deleted)
            mockDynamoDB.send.mockRejectedValueOnce({
                name: 'ConditionalCheckFailedException'
            });

            const event = {
                ...PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'banned-user' })
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('User not found or already modified');
        });

        it('should return 500 when DynamoDB update fails', async () => {
            // Mock target user exists (banned)
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User',
                    can_submit: false
                }
            });

            // Mock successful admin action creation
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock DynamoDB error
            mockDynamoDB.send.mockRejectedValueOnce(new Error('DynamoDB error'));

            const event = {
                ...PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'banned-user' })
            };
            const response = await handler(event);
            
            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to unban user');
        });
    });
});