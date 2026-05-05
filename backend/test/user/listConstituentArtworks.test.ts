// Mock Cognito and DynamoDB clients
const mockCognitoClient = {
    send: jest.fn()
};

const mockDynamoDB = {
    send: jest.fn()
};

jest.mock('../../config/aws-clients', () => ({
    cognitoClient: mockCognitoClient,
    dynamodb: mockDynamoDB,
    TABLE_NAME: 'test-table'
}));

import { handler } from '../../functions/user/listConstituentArtworks';
import { ListConstituentArtworksResponse } from '../../../shared/src/api-types/artworkTypes';

describe('listConstituentArtworks (User)', () => {
    beforeEach(() => {
        mockCognitoClient.send.mockReset();
        mockDynamoDB.send.mockReset();
    });

    describe('Authentication', () => {
        it('should return 401 when no accessToken', async () => {
            const event = {
                httpMethod: 'GET',
                headers: {},
                queryStringParameters: {}
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(401);
            expect(response.body).toContain('Authentication required');
        });

        it('should return 401 when token is invalid', async () => {
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('Invalid token'), { name: 'NotAuthorizedException' })
            );

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=invalid-token'
                },
                queryStringParameters: {}
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(401);
            expect(response.body).toContain('Invalid or expired token');
        });
    });

    describe('Authorization', () => {
        it('should return 403 when user role is user (not guardian)', async () => {
            // Mock Cognito GetUser - user role
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'user-123',
                UserAttributes: [
                    { Name: 'email', Value: 'user@example.com' },
                    { Name: 'custom:role', Value: 'user' }
                ]
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {}
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Only guardians and above can access this endpoint');
        });

        it('should allow guardian role', async () => {
            // Mock Cognito GetUser - guardian role
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'email', Value: 'guardian@example.com' },
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            // Mock DynamoDB Query - no artworks
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: []
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {}
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
        });

        it('should allow contributor role', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: []
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {}
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
        });

        it('should allow admin role', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: []
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {}
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
        });
    });

    describe('Query Parameter Validation', () => {
        it('should return 400 when limit is less than 1', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {
                    limit: '0'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Limit must be between 1 and 100');
        });

        it('should return 400 when limit is greater than 100', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {
                    limit: '101'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Limit must be between 1 and 100');
        });
    });

    describe('Successful Listing', () => {
        it('should return empty list when no artworks', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: []
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {}
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: ListConstituentArtworksResponse = JSON.parse(response.body);
            expect(responseBody.artworks).toEqual([]);
            expect(responseBody.has_more).toBe(false);
        });

        it('should return constituent artworks (is_virtual = true)', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            // Mock Query - Art_Ptr entities
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    {
                        PK: 'USER#guardian-123',
                        SK: 'ART#2024-spring#ID#art-001',
                        art_id: 'art-001',
                        type: 'Art_Ptr'
                    },
                    {
                        PK: 'USER#guardian-123',
                        SK: 'ART#2024-spring#ID#art-002',
                        art_id: 'art-002',
                        type: 'Art_Ptr'
                    }
                ]
            });

            // Mock BatchGet - Art entities
            mockDynamoDB.send.mockResolvedValueOnce({
                Responses: {
                    'test-table': [
                        {
                            PK: 'ART#art-001',
                            art_id: 'ART#art-001',
                            user_id: 'guardian-123',
                            season: 'SEASON#2024-spring',
                            f_name: 'Tommy',
                            age: 8,
                            title: 'My Drawing',
                            location: 'USA',
                            is_virtual: true,
                            is_ai_gen: false,
                            is_approved: true,
                            votes: 15,
                            file_type: 'png',
                            timestamp: '2024-03-01T10:00:00Z'
                        },
                        {
                            PK: 'ART#art-002',
                            art_id: 'ART#art-002',
                            user_id: 'guardian-123',
                            season: 'SEASON#2024-spring',
                            f_name: 'Lisa',
                            age: 10,
                            title: 'Rainbow',
                            location: 'Canada',
                            is_virtual: true,
                            is_ai_gen: false,
                            is_approved: true,
                            votes: 20,
                            file_type: 'jpg',
                            timestamp: '2024-03-02T10:00:00Z'
                        }
                    ]
                }
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {}
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: ListConstituentArtworksResponse = JSON.parse(response.body);
            expect(responseBody.artworks).toHaveLength(2);
            expect(responseBody.artworks[0].f_name).toBe('Tommy');
            expect(responseBody.artworks[0].art_id).toBe('art-001');
            expect(responseBody.artworks[1].f_name).toBe('Lisa');
            expect(responseBody.has_more).toBe(false);
        });

        it('should filter out non-virtual artworks (guardian own artworks)', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    { art_id: 'art-001' },
                    { art_id: 'art-002' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Responses: {
                    'test-table': [
                        {
                            art_id: 'ART#art-001',
                            f_name: 'Jane Smith',
                            is_virtual: false, // Guardian's own artwork
                            season: 'SEASON#2024-spring',
                            title: 'My Art',
                            age: 35,
                            location: 'USA',
                            is_ai_gen: false,
                            is_approved: true,
                            votes: 10,
                            file_type: 'png',
                            timestamp: '2024-03-01T10:00:00Z'
                        },
                        {
                            art_id: 'ART#art-002',
                            f_name: 'Tommy',
                            is_virtual: true, // Constituent artwork
                            season: 'SEASON#2024-spring',
                            title: 'Child Art',
                            age: 8,
                            location: 'USA',
                            is_ai_gen: false,
                            is_approved: true,
                            votes: 15,
                            file_type: 'jpg',
                            timestamp: '2024-03-02T10:00:00Z'
                        }
                    ]
                }
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {}
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: ListConstituentArtworksResponse = JSON.parse(response.body);
            expect(responseBody.artworks).toHaveLength(1);
            expect(responseBody.artworks[0].f_name).toBe('Tommy');
            expect(responseBody.artworks[0].is_ai_gen).toBe(false);
        });

        it('should filter by season when provided', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            // Verify Query command was called with season filter
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    { art_id: 'art-001' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Responses: {
                    'test-table': [
                        {
                            art_id: 'ART#art-001',
                            season: 'SEASON#2024-spring',
                            f_name: 'Tommy',
                            is_virtual: true,
                            title: 'Spring Art',
                            age: 8,
                            location: 'USA',
                            is_ai_gen: false,
                            is_approved: true,
                            votes: 10,
                            file_type: 'png',
                            timestamp: '2024-03-01T10:00:00Z'
                        }
                    ]
                }
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {
                    season: '2024-spring'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: ListConstituentArtworksResponse = JSON.parse(response.body);
            expect(responseBody.artworks).toHaveLength(1);
            expect(responseBody.artworks[0].season).toBe('2024-spring');
        });

        it('should respect limit parameter', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: Array.from({ length: 10 }, (_, i) => ({
                    art_id: `art-00${i}`
                }))
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Responses: {
                    'test-table': Array.from({ length: 10 }, (_, i) => ({
                        art_id: `ART#art-00${i}`,
                        season: 'SEASON#2024-spring',
                        f_name: `Child ${i}`,
                        is_virtual: true,
                        title: `Art ${i}`,
                        age: 8,
                        location: 'USA',
                        is_ai_gen: false,
                        is_approved: true,
                        votes: 10,
                        file_type: 'png',
                        timestamp: '2024-03-01T10:00:00Z'
                    }))
                }
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {
                    limit: '5'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: ListConstituentArtworksResponse = JSON.parse(response.body);
            expect(responseBody.artworks.length).toBeLessThanOrEqual(5);
        });
    });

    describe('Error Handling', () => {
        it('should return 500 when DynamoDB query fails', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            mockDynamoDB.send.mockRejectedValueOnce(new Error('DynamoDB error'));

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {}
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to list constituent artworks');
        });
    });
});
