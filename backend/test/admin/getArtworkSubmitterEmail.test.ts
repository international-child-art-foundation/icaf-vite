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

import { handler } from '../../functions/admin/getArtworkSubmitterEmail';
import { PresetEvents, PRESET_TEST_DATA } from '../shared/simple-preset-db';
import { GetArtworkSubmitterEmailResponse } from '../../../shared/src/api-types/userTypes';

describe('getArtworkSubmitterEmail', () => {
    beforeEach(() => {
        mockDynamoDB.send.mockReset();
        mockCognitoClient.send.mockReset();
    });

    describe('Authentication and Authorization', () => {
        it('should return 401 when no user ID in context', async () => {
            const event = {
                ...PresetEvents.createGetEvent('ADMIN_USER'),
                requestContext: { authorizer: { claims: {} } },
                pathParameters: { art_id: 'test-art' }
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
            event.pathParameters = { art_id: 'test-art' };
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

        it('should return 400 when art_id is missing from path', async () => {
            const event = {
                ...PresetEvents.createGetEvent('ADMIN_USER'),
                pathParameters: null
            };
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Artwork ID is required in path');
        });
    });

    describe('Artwork Lookup', () => {
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

        it('should return 404 when artwork not found', async () => {
            // Mock artwork not found
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: null
            });

            const event = PresetEvents.createGetEvent('ADMIN_USER');
            event.pathParameters = { art_id: 'non-existent-art' };
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('Artwork \'non-existent-art\' not found');
        });

        it('should return 500 when artwork has no user_id', async () => {
            // Mock artwork without user_id
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'ART#test-art',
                    SK: 'N/A',
                    title: 'Test Art'
                    // Missing user_id
                }
            });

            const event = PresetEvents.createGetEvent('ADMIN_USER');
            event.pathParameters = { art_id: 'test-art' };
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Artwork record missing user_id field');
        });
    });

    describe('Submitter Lookup', () => {
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

        it('should return 404 when submitter not found in Cognito', async () => {
            // Mock artwork found
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'ART#test-art',
                    SK: 'N/A',
                    art_id: 'test-art',
                    title: 'Test Art',
                    user_id: 'deleted-user'
                }
            });

            // Mock Cognito UserNotFoundException
            mockCognitoClient.send.mockRejectedValueOnce({
                name: 'UserNotFoundException'
            });

            const event = PresetEvents.createGetEvent('ADMIN_USER');
            event.pathParameters = { art_id: 'test-art' };
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('Submitter \'deleted-user\' not found in Cognito');
        });
    });

    describe('Successful Submitter Email Retrieval', () => {
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

        it('should successfully return artwork submitter email', async () => {
            // Mock artwork found
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'ART#test-art-001',
                    SK: 'N/A',
                    art_id: 'test-art-001',
                    title: 'Beautiful Sunset',
                    user_id: 'test-user-123',
                    season: PRESET_TEST_DATA.seasons.CURRENT_SEASON
                }
            });

            // Mock Cognito response
            const mockCognitoResponse = {
                Username: 'test-user-123',
                UserAttributes: [
                    { Name: 'email', Value: 'artist@example.com' },
                    { Name: 'email_verified', Value: 'true' }
                ],
                UserStatus: 'CONFIRMED',
                Enabled: true
            };

            mockCognitoClient.send.mockResolvedValueOnce(mockCognitoResponse);

            const event = PresetEvents.createGetEvent('ADMIN_USER');
            event.pathParameters = { art_id: 'test-art-001' };
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetArtworkSubmitterEmailResponse = JSON.parse(response.body);
            expect(responseBody.art_id).toBe('test-art-001');
            expect(responseBody.artwork_title).toBe('Beautiful Sunset');
            expect(responseBody.user_id).toBe('test-user-123');
            expect(responseBody.email).toBe('artist@example.com');
            expect(responseBody.email_verified).toBe(true);
            expect(responseBody.username).toBe('test-user-123');

            // Verify DynamoDB call
            expect(mockDynamoDB.send).toHaveBeenCalledTimes(2); // Admin check + artwork lookup

            // Verify Cognito call
            expect(mockCognitoClient.send).toHaveBeenCalledTimes(1);
        });

        it('should handle artwork with missing title', async () => {
            // Mock artwork without title
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'ART#test-art-002',
                    SK: 'N/A',
                    art_id: 'test-art-002',
                    user_id: 'test-user-456'
                }
            });

            // Mock Cognito response
            const mockCognitoResponse = {
                Username: 'test-user-456',
                UserAttributes: [
                    { Name: 'email', Value: 'user@example.com' },
                    { Name: 'email_verified', Value: 'false' }
                ],
                UserStatus: 'CONFIRMED',
                Enabled: true
            };

            mockCognitoClient.send.mockResolvedValueOnce(mockCognitoResponse);

            const event = PresetEvents.createGetEvent('ADMIN_USER');
            event.pathParameters = { art_id: 'test-art-002' };
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetArtworkSubmitterEmailResponse = JSON.parse(response.body);
            expect(responseBody.art_id).toBe('test-art-002');
            expect(responseBody.artwork_title).toBe('');
            expect(responseBody.user_id).toBe('test-user-456');
            expect(responseBody.email).toBe('user@example.com');
            expect(responseBody.email_verified).toBe(false);
        });

        it('should handle submitter with missing email attribute', async () => {
            // Mock artwork found
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'ART#test-art-003',
                    SK: 'N/A',
                    art_id: 'test-art-003',
                    title: 'Test Art',
                    user_id: 'test-user-789'
                }
            });

            // Mock Cognito response without email
            const mockCognitoResponse = {
                Username: 'test-user-789',
                UserAttributes: [],
                UserStatus: 'FORCE_CHANGE_PASSWORD',
                Enabled: true
            };

            mockCognitoClient.send.mockResolvedValueOnce(mockCognitoResponse);

            const event = PresetEvents.createGetEvent('ADMIN_USER');
            event.pathParameters = { art_id: 'test-art-003' };
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetArtworkSubmitterEmailResponse = JSON.parse(response.body);
            expect(responseBody.email).toBe('');
            expect(responseBody.email_verified).toBe(false);
            expect(responseBody.user_id).toBe('test-user-789');
        });

        it('should use preset artwork data', async () => {
            // Mock artwork found (using preset data)
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: `ART#${PRESET_TEST_DATA.artworks.APPROVED_ARTWORK}`,
                    SK: 'N/A',
                    art_id: PRESET_TEST_DATA.artworks.APPROVED_ARTWORK,
                    title: 'Sunset Dreams',
                    user_id: PRESET_TEST_DATA.users.CHILD_USER,
                    season: PRESET_TEST_DATA.seasons.CURRENT_SEASON
                }
            });

            // Mock Cognito response
            const mockCognitoResponse = {
                Username: PRESET_TEST_DATA.users.CHILD_USER,
                UserAttributes: [
                    { Name: 'email', Value: 'child@example.com' },
                    { Name: 'email_verified', Value: 'true' }
                ],
                UserStatus: 'CONFIRMED',
                Enabled: true
            };

            mockCognitoClient.send.mockResolvedValueOnce(mockCognitoResponse);

            const event = PresetEvents.createGetEvent('ADMIN_USER');
            event.pathParameters = { art_id: PRESET_TEST_DATA.artworks.APPROVED_ARTWORK };
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: GetArtworkSubmitterEmailResponse = JSON.parse(response.body);
            expect(responseBody.art_id).toBe(PRESET_TEST_DATA.artworks.APPROVED_ARTWORK);
            expect(responseBody.user_id).toBe(PRESET_TEST_DATA.users.CHILD_USER);
            expect(responseBody.email).toBe('child@example.com');
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

            const event = PresetEvents.createGetEvent('ADMIN_USER');
            event.pathParameters = { art_id: 'test-art' };
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to get artwork submitter email');
        });

        it('should return 500 when Cognito service fails', async () => {
            // Mock artwork found
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'ART#test-art',
                    SK: 'N/A',
                    art_id: 'test-art',
                    title: 'Test Art',
                    user_id: 'test-user'
                }
            });

            // Mock Cognito error (non-UserNotFoundException)
            mockCognitoClient.send.mockRejectedValueOnce(new Error('Cognito service error'));

            const event = PresetEvents.createGetEvent('ADMIN_USER');
            event.pathParameters = { art_id: 'test-art' };
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to get artwork submitter email');
        });
    });
});
