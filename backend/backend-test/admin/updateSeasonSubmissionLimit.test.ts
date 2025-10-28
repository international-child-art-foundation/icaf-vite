// Mock DynamoDB
const mockDynamoDB = {
    send: jest.fn()
};

jest.mock('../../config/aws-clients', () => ({
    dynamodb: mockDynamoDB,
    TABLE_NAME: 'test-table'
}));

import { handler } from '../../functions/admin/updateSeasonSubmissionLimit';
import { PresetEvents, PRESET_TEST_DATA } from '../shared/simple-preset-db';
import { UpdateSeasonSubmissionLimitResponse } from '../../../shared/src/api-types/seasonTypes';

describe('updateSeasonSubmissionLimit', () => {
    beforeEach(() => {
        mockDynamoDB.send.mockReset();
    });

    describe('Authentication and Authorization', () => {
        it('should return 401 when no user ID in context', async () => {
            const event = {
                ...PresetEvents.createPatchEvent('ADMIN_USER', { max_user_submissions: 5, reason: 'Allow more submissions' }, { season: 'test-season' }),
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

            const event = PresetEvents.createPatchEvent('ADULT_USER', { max_user_submissions: 5, reason: 'Test' }, { season: 'test-season' });
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

        it('should return 400 when season is missing from path', async () => {
            const event = {
                ...PresetEvents.createPatchEvent('ADMIN_USER', { max_user_submissions: 5, reason: 'Test' }, {}),
                pathParameters: null
            };
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Season name is required in path');
        });

        it('should return 400 when request body is missing', async () => {
            const event = PresetEvents.createPatchEvent('ADMIN_USER', {}, { season: 'test-season' });
            event.body = null;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Request body is required');
        });

        it('should return 400 when request body is invalid JSON', async () => {
            const event = PresetEvents.createPatchEvent('ADMIN_USER', {}, { season: 'test-season' });
            event.body = 'invalid json';
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid JSON in request body');
        });

        it('should return 400 when max_user_submissions is missing', async () => {
            const event = PresetEvents.createPatchEvent('ADMIN_USER', { reason: 'Test' }, { season: 'test-season' });
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('max_user_submissions is required');
        });

        it('should return 400 when max_user_submissions is not a number', async () => {
            const event = PresetEvents.createPatchEvent('ADMIN_USER', { max_user_submissions: 'five', reason: 'Test' }, { season: 'test-season' });
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('max_user_submissions must be a number');
        });

        it('should return 400 when max_user_submissions is not an integer', async () => {
            const event = PresetEvents.createPatchEvent('ADMIN_USER', { max_user_submissions: 3.5, reason: 'Test' }, { season: 'test-season' });
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('max_user_submissions must be an integer');
        });

        it('should return 400 when max_user_submissions is zero', async () => {
            const event = PresetEvents.createPatchEvent('ADMIN_USER', { max_user_submissions: 0, reason: 'Test' }, { season: 'test-season' });
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('max_user_submissions must be -1 (unlimited) or a positive integer');
        });

        it('should return 400 when max_user_submissions is negative (not -1)', async () => {
            const event = PresetEvents.createPatchEvent('ADMIN_USER', { max_user_submissions: -5, reason: 'Test' }, { season: 'test-season' });
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('max_user_submissions must be -1 (unlimited) or a positive integer');
        });

        it('should return 400 when reason is missing', async () => {
            const event = PresetEvents.createPatchEvent('ADMIN_USER', { max_user_submissions: 5 }, { season: 'test-season' });
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('reason is required');
        });

        it('should return 400 when reason is empty', async () => {
            const event = PresetEvents.createPatchEvent('ADMIN_USER', { max_user_submissions: 5, reason: '   ' }, { season: 'test-season' });
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('reason cannot be empty');
        });
    });

    describe('Season Lookup', () => {
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

        it('should return 404 when season not found', async () => {
            // Mock empty query result
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: []
            });

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { max_user_submissions: 5, reason: 'Test' }, { season: 'non-existent-season' });
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('Season \'non-existent-season\' not found');
        });

        it('should return 400 when value is the same', async () => {
            // Mock season with same max_user_submissions
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    {
                        PK: 'SEASON',
                        SK: '#ACTIVE#true#SEASON#test-season',
                        season: 'test-season',
                        colloq_name: 'Test Season',
                        max_user_submissions: 5,
                        is_active: true
                    }
                ]
            });

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { max_user_submissions: 5, reason: 'Test' }, { season: 'test-season' });
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Submission limit is already set to 5');
        });
    });

    describe('Successful Submission Limit Update', () => {
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

        it('should successfully update submission limit to positive integer', async () => {
            // Mock season query result
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    {
                        PK: 'SEASON',
                        SK: '#ACTIVE#true#SEASON#2024_SPRING',
                        season: '2024_SPRING',
                        colloq_name: 'Spring 2024 Contest',
                        max_user_submissions: 1,
                        is_active: true
                    }
                ]
            });

            // Mock successful update
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock admin action creation
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { max_user_submissions: 3, reason: 'Allow more submissions for this season' }, { season: '2024_SPRING' });
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: UpdateSeasonSubmissionLimitResponse = JSON.parse(response.body);
            expect(responseBody.message).toBe('Season submission limit updated successfully');
            expect(responseBody.season).toBe('2024_SPRING');
            expect(responseBody.season_name).toBe('Spring 2024 Contest');
            expect(responseBody.old_max_user_submissions).toBe(1);
            expect(responseBody.max_user_submissions).toBe(3);
            expect(responseBody.is_active).toBe(true);
            expect(responseBody.admin_action_id).toMatch(/^\d{4}-\d{2}-\d{2}T.*_PRESET_ADMIN_001$/);
            expect(responseBody.timestamp).toBeTruthy();

            // Verify DynamoDB calls
            expect(mockDynamoDB.send).toHaveBeenCalledTimes(4); // Admin check, query season, update season, admin action

            // Verify update call
            const updateCall = mockDynamoDB.send.mock.calls[2][0];
            expect(updateCall.input.Key.PK).toBe('SEASON');
            expect(updateCall.input.Key.SK).toBe('#ACTIVE#true#SEASON#2024_SPRING');
            expect(updateCall.input.ExpressionAttributeValues[':max_user_submissions']).toBe(3);

            // Verify admin action creation
            const adminActionCall = mockDynamoDB.send.mock.calls[3][0];
            expect(adminActionCall.input.Item.PK).toBe('SEASON');
            expect(adminActionCall.input.Item.SK).toMatch(/^ADMIN_ACTION#\d{4}-\d{2}-\d{2}T.*#2024_SPRING$/);
            expect(adminActionCall.input.Item.action_type).toBe('update_season_submission_limit');
            expect(adminActionCall.input.Item.admin_user_id).toBe('PRESET_ADMIN_001');
            expect(adminActionCall.input.Item.season).toBe('2024_SPRING');
            expect(adminActionCall.input.Item.reason).toBe('Allow more submissions for this season');
            expect(adminActionCall.input.Item.old_value).toBe(1);
            expect(adminActionCall.input.Item.new_value).toBe(3);
        });

        it('should successfully update submission limit to unlimited (-1)', async () => {
            // Mock season query result
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    {
                        PK: 'SEASON',
                        SK: '#ACTIVE#true#SEASON#2024_SUMMER',
                        season: '2024_SUMMER',
                        colloq_name: 'Summer 2024 Contest',
                        max_user_submissions: 3,
                        is_active: true
                    }
                ]
            });

            // Mock successful update
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock admin action creation
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { max_user_submissions: -1, reason: 'Unlimited submissions for special event' }, { season: '2024_SUMMER' });
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: UpdateSeasonSubmissionLimitResponse = JSON.parse(response.body);
            expect(responseBody.old_max_user_submissions).toBe(3);
            expect(responseBody.max_user_submissions).toBe(-1);

            // Verify update call
            const updateCall = mockDynamoDB.send.mock.calls[2][0];
            expect(updateCall.input.ExpressionAttributeValues[':max_user_submissions']).toBe(-1);
        });

        it('should successfully update submission limit for inactive season', async () => {
            // Mock inactive season query result
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    {
                        PK: 'SEASON',
                        SK: '#ACTIVE#false#SEASON#2023_FALL',
                        season: '2023_FALL',
                        colloq_name: 'Fall 2023 Contest',
                        max_user_submissions: 1,
                        is_active: false
                    }
                ]
            });

            // Mock successful update
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock admin action creation
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { max_user_submissions: 2, reason: 'Update past season limit' }, { season: '2023_FALL' });
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: UpdateSeasonSubmissionLimitResponse = JSON.parse(response.body);
            expect(responseBody.season).toBe('2023_FALL');
            expect(responseBody.is_active).toBe(false);
            expect(responseBody.max_user_submissions).toBe(2);

            // Verify update used correct SK for inactive season
            const updateCall = mockDynamoDB.send.mock.calls[2][0];
            expect(updateCall.input.Key.SK).toBe('#ACTIVE#false#SEASON#2023_FALL');
        });

        it('should handle season without colloq_name', async () => {
            // Mock season without colloq_name
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    {
                        PK: 'SEASON',
                        SK: '#ACTIVE#true#SEASON#TEST_SEASON',
                        season: 'TEST_SEASON',
                        max_user_submissions: 1,
                        is_active: true
                    }
                ]
            });

            // Mock successful update
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock admin action creation
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { max_user_submissions: 5, reason: 'Test update' }, { season: 'TEST_SEASON' });
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: UpdateSeasonSubmissionLimitResponse = JSON.parse(response.body);
            expect(responseBody.season_name).toBe('TEST_SEASON'); // Falls back to season name
        });

        it('should use preset season data', async () => {
            // Mock preset season query result
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    {
                        PK: 'SEASON',
                        SK: `#ACTIVE#true#SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
                        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
                        colloq_name: 'Current Test Season 2024',
                        max_user_submissions: 3,
                        is_active: true
                    }
                ]
            });

            // Mock successful update
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock admin action creation
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { max_user_submissions: 5, reason: 'Increase limit' }, { season: PRESET_TEST_DATA.seasons.CURRENT_SEASON });
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: UpdateSeasonSubmissionLimitResponse = JSON.parse(response.body);
            expect(responseBody.season).toBe(PRESET_TEST_DATA.seasons.CURRENT_SEASON);
            expect(responseBody.old_max_user_submissions).toBe(3);
            expect(responseBody.max_user_submissions).toBe(5);
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

        it('should return 500 when DynamoDB query fails', async () => {
            // Mock DynamoDB error
            mockDynamoDB.send.mockRejectedValueOnce(new Error('DynamoDB error'));

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { max_user_submissions: 5, reason: 'Test' }, { season: 'test-season' });
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to update season submission limit');
        });

        it('should return 404 when season is deleted during update', async () => {
            // Mock season found
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    {
                        PK: 'SEASON',
                        SK: '#ACTIVE#true#SEASON#test-season',
                        season: 'test-season',
                        max_user_submissions: 1,
                        is_active: true
                    }
                ]
            });

            // Mock conditional check failed
            mockDynamoDB.send.mockRejectedValueOnce({
                name: 'ConditionalCheckFailedException'
            });

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { max_user_submissions: 5, reason: 'Test' }, { season: 'test-season' });
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('Season not found or already modified');
        });

        it('should return 500 when update fails', async () => {
            // Mock season found
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    {
                        PK: 'SEASON',
                        SK: '#ACTIVE#true#SEASON#test-season',
                        season: 'test-season',
                        max_user_submissions: 1,
                        is_active: true
                    }
                ]
            });

            // Mock update error
            mockDynamoDB.send.mockRejectedValueOnce(new Error('Update failed'));

            const event = PresetEvents.createPatchEvent('ADMIN_USER', { max_user_submissions: 5, reason: 'Test' }, { season: 'test-season' });
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to update season submission limit');
        });
    });
});
