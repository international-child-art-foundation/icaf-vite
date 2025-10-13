// Mock DynamoDB and S3
const mockDynamoDB = {
    send: jest.fn()
};

const mockS3Client = {
    send: jest.fn()
};

jest.mock('../../config/aws-clients', () => ({
    dynamodb: mockDynamoDB,
    s3Client: mockS3Client,
    TABLE_NAME: 'test-table',
    S3_BUCKET_NAME: 'test-bucket'
}));

import { handler } from '../../functions/admin/removeAllUserArtwork';
import { PresetEvents, PRESET_TEST_DATA } from '../shared/simple-preset-db';
import { RemoveAllUserArtworkResponse } from '../../../shared/src/api-types/userTypes';

describe('removeAllUserArtwork', () => {
    beforeEach(() => {
        mockDynamoDB.send.mockReset();
        mockS3Client.send.mockReset();
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

            const event = PresetEvents.createDeleteEvent('ADULT_USER', { user_id: 'test-user' });
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
            event.body = JSON.stringify({ reason: 'Test reason' });
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
            event.body = JSON.stringify({ reason: 'Test reason' });
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('User \'non-existent-user\' not found');
        });

        it('should return 404 when user has no artwork', async () => {
            // Mock target user exists
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User',
                    can_submit: true
                }
            });

            // Mock empty artwork query result
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: []
            });

            const event = PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'test-user' });
            event.body = JSON.stringify({ reason: 'Test reason' });
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('No artwork found for this user');
        });
    });

    describe('Successful Removal', () => {
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

        it('should successfully remove all user artwork', async () => {
            const artworkId1 = 'ART_001';
            const artworkId2 = 'ART_002';

            // Mock target user exists
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User',
                    can_submit: true
                }
            });

            // Mock artwork pointers query
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    {
                        PK: 'USER#test-user',
                        SK: `ART#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}#${artworkId1}`,
                        art_id: artworkId1
                    },
                    {
                        PK: 'USER#test-user',
                        SK: `ART#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}#${artworkId2}`,
                        art_id: artworkId2
                    }
                ]
            });

            // Mock artwork entities get commands
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: `ART#${artworkId1}`,
                    SK: 'N/A',
                    art_id: artworkId1,
                    season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
                    file_type: 'PNG',
                    title: 'Test Art 1'
                }
            });

            // Mock artwork deletion
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock S3 list objects
            mockS3Client.send.mockResolvedValueOnce({
                Contents: [
                    { Key: `artworks/${PRESET_TEST_DATA.seasons.CURRENT_SEASON}/test-user/${artworkId1}.png` }
                ]
            });

            // Mock S3 delete objects
            mockS3Client.send.mockResolvedValueOnce({});

            // Mock second artwork get
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: `ART#${artworkId2}`,
                    SK: 'N/A',
                    art_id: artworkId2,
                    season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
                    file_type: 'JPEG',
                    title: 'Test Art 2'
                }
            });

            // Mock second artwork deletion
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock S3 list objects for second artwork
            mockS3Client.send.mockResolvedValueOnce({
                Contents: [
                    { Key: `artworks/${PRESET_TEST_DATA.seasons.CURRENT_SEASON}/test-user/${artworkId2}.jpeg` }
                ]
            });

            // Mock S3 delete objects for second artwork
            mockS3Client.send.mockResolvedValueOnce({});

            // Mock batch delete of Art_Ptr records
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock admin action creation
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'test-user' });
            event.body = JSON.stringify({ reason: 'Inappropriate content' });
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: RemoveAllUserArtworkResponse = JSON.parse(response.body);
            expect(responseBody.message).toBe('User artwork removed successfully');
            expect(responseBody.user_id).toBe('test-user');
            expect(responseBody.artworks_removed).toBe(2);
            expect(responseBody.total_artworks).toBe(2);
            expect(responseBody.deleted_artwork_ids).toEqual([artworkId1, artworkId2]);
            expect(responseBody.failed_deletions).toEqual([]);
            expect(responseBody.admin_action_id).toMatch(/^\d{4}-\d{2}-\d{2}T.*_PRESET_ADMIN_001$/);
            expect(responseBody.timestamp).toBeTruthy();

            // Verify admin action creation
            const adminActionCall = mockDynamoDB.send.mock.calls[mockDynamoDB.send.mock.calls.length - 1][0];
            expect(adminActionCall.input.Item.PK).toBe('USER#test-user');
            expect(adminActionCall.input.Item.SK).toMatch(/^ADMIN_ACTION#\d{4}-\d{2}-\d{2}T/);
            expect(adminActionCall.input.Item.action_type).toBe('remove_all_artwork');
            expect(adminActionCall.input.Item.admin_user_id).toBe('PRESET_ADMIN_001');
            expect(adminActionCall.input.Item.reason).toBe('Inappropriate content');
        });

        it('should handle partial failures gracefully', async () => {
            const artworkId1 = 'ART_001';
            const artworkId2 = 'ART_002';

            // Mock target user exists
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User'
                }
            });

            // Mock artwork pointers query
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    {
                        PK: 'USER#test-user',
                        SK: `ART#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}#${artworkId1}`,
                        art_id: artworkId1
                    },
                    {
                        PK: 'USER#test-user',
                        SK: `ART#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}#${artworkId2}`,
                        art_id: artworkId2
                    }
                ]
            });

            // First artwork succeeds
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: `ART#${artworkId1}`,
                    SK: 'N/A',
                    art_id: artworkId1,
                    season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
                    file_type: 'PNG'
                }
            });
            mockDynamoDB.send.mockResolvedValueOnce({});
            mockS3Client.send.mockResolvedValueOnce({ Contents: [] });

            // Second artwork fails
            mockDynamoDB.send.mockRejectedValueOnce(new Error('DynamoDB error'));

            // Mock batch delete of Art_Ptr records
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock admin action creation
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'test-user' });
            event.body = JSON.stringify({ reason: 'Test reason' });
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: RemoveAllUserArtworkResponse = JSON.parse(response.body);
            expect(responseBody.artworks_removed).toBe(1);
            expect(responseBody.total_artworks).toBe(2);
            expect(responseBody.deleted_artwork_ids).toEqual([artworkId1]);
            expect(responseBody.failed_deletions).toHaveLength(1);
            expect(responseBody.failed_deletions[0].art_id).toBe(artworkId2);
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
            // Mock target user exists
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User'
                }
            });

            // Mock DynamoDB error
            mockDynamoDB.send.mockRejectedValueOnce(new Error('DynamoDB error'));

            const event = PresetEvents.createDeleteEvent('ADMIN_USER', { user_id: 'test-user' });
            event.body = JSON.stringify({ reason: 'Test reason' });
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to remove user artwork');
        });
    });
});
