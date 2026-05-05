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

import { handler } from '../../functions/contributor/fetchUnapprovedArtworks';

describe('fetchUnapprovedArtworks (Contributor)', () => {
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
        it('should return 403 when user role is user', async () => {
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
            expect(response.body).toContain('Only contributors and above can fetch unapproved artworks');
        });

        it('should return 403 when user role is guardian', async () => {
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
                queryStringParameters: {}
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Only contributors and above can fetch unapproved artworks');
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

    describe('Query All Unapproved Artworks', () => {
        it('should fetch all unapproved artworks with default limit', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            const mockArtworks = [
                {
                    art_id: 'art-1',
                    user_id: 'user-1',
                    season: 'SEASON#2024-spring',
                    title: 'Test Art 1',
                    f_name: 'John',
                    age: 10,
                    location: 'USA',
                    is_virtual: false,
                    is_ai_gen: false,
                    file_type: 'PNG',
                    is_approved: false,
                    votes: 0,
                    timestamp: '2024-01-01T00:00:00.000Z'
                },
                {
                    art_id: 'art-2',
                    user_id: 'user-2',
                    season: 'SEASON#2024-winter',
                    title: 'Test Art 2',
                    f_name: 'Jane',
                    age: 12,
                    location: 'Canada',
                    is_virtual: true,
                    is_ai_gen: false,
                    file_type: 'JPG',
                    is_approved: false,
                    votes: 0,
                    timestamp: '2024-01-02T00:00:00.000Z'
                }
            ];

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: mockArtworks,
                LastEvaluatedKey: undefined
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
            const body = JSON.parse(response.body);
            expect(body.artworks).toHaveLength(2);
            expect(body.count).toBe(2);
            expect(body.hasMore).toBe(false);
            expect(body.pagination.has_more).toBe(false);

            // Verify DynamoDB query was called correctly
            expect(mockDynamoDB.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    input: expect.objectContaining({
                        TableName: 'test-table',
                        IndexName: 'GSI4',
                        KeyConditionExpression: 'GSI4PK = :unapproved',
                        ExpressionAttributeValues: {
                            ':unapproved': 'UNAPPROVED'
                        },
                        ScanIndexForward: false,
                        Limit: 20
                    })
                })
            );
        });

        it('should respect custom limit parameter', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [],
                LastEvaluatedKey: undefined
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {
                    limit: '50'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            // Verify limit was applied
            expect(mockDynamoDB.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    input: expect.objectContaining({
                        Limit: 50
                    })
                })
            );
        });

        it('should cap limit at 100', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [],
                LastEvaluatedKey: undefined
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {
                    limit: '500'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            // Verify limit was capped at 100
            expect(mockDynamoDB.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    input: expect.objectContaining({
                        Limit: 100
                    })
                })
            );
        });

        it('should return empty array when no unapproved artworks', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [],
                LastEvaluatedKey: undefined
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
            const body = JSON.parse(response.body);
            expect(body.artworks).toEqual([]);
            expect(body.count).toBe(0);
            expect(body.hasMore).toBe(false);
        });
    });

    describe('Season Filtering', () => {
        it('should filter by season when season parameter provided', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            const mockArtworks = [
                {
                    art_id: 'art-1',
                    user_id: 'user-1',
                    season: 'SEASON#2024-spring',
                    title: 'Spring Art',
                    f_name: 'John',
                    age: 10,
                    location: 'USA',
                    is_virtual: false,
                    is_ai_gen: false,
                    file_type: 'PNG',
                    is_approved: false,
                    votes: 0,
                    timestamp: '2024-01-01T00:00:00.000Z'
                }
            ];

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: mockArtworks,
                LastEvaluatedKey: undefined
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {
                    season: 'SEASON#2024-spring'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.artworks).toHaveLength(1);
            expect(body.season).toBe('SEASON#2024-spring');

            // Verify DynamoDB query used begins_with for season filtering
            expect(mockDynamoDB.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    input: expect.objectContaining({
                        KeyConditionExpression: 'GSI4PK = :unapproved AND begins_with(GSI4SK, :season)',
                        ExpressionAttributeValues: {
                            ':unapproved': 'UNAPPROVED',
                            ':season': 'SEASON#2024-spring#'
                        }
                    })
                })
            );
        });
    });

    describe('Pagination', () => {
        it('should handle pagination with lastEvaluatedKey', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            const mockLastKey = { PK: 'ART#art-20', SK: 'N/A' };
            const encodedKey = Buffer.from(JSON.stringify(mockLastKey)).toString('base64');

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [],
                LastEvaluatedKey: undefined
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {
                    lastEvaluatedKey: encodedKey
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            // Verify ExclusiveStartKey was set
            expect(mockDynamoDB.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    input: expect.objectContaining({
                        ExclusiveStartKey: mockLastKey
                    })
                })
            );
        });

        it('should return pagination key when more results available', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            const mockLastKey = { GSI4PK: 'UNAPPROVED', GSI4SK: 'SEASON#2024-spring#TIMESTAMP#123#ART#art-20' };

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    {
                        art_id: 'art-1',
                        user_id: 'user-1',
                        season: 'SEASON#2024-spring',
                        title: 'Test Art',
                        f_name: 'John',
                        age: 10,
                        location: 'USA',
                        is_virtual: false,
                        is_ai_gen: false,
                        file_type: 'PNG',
                        is_approved: false,
                        votes: 0,
                        timestamp: '2024-01-01T00:00:00.000Z'
                    }
                ],
                LastEvaluatedKey: mockLastKey
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
            const body = JSON.parse(response.body);
            expect(body.hasMore).toBe(true);
            expect(body.pagination.has_more).toBe(true);
            expect(body.pagination.last_evaluated_key).toBeDefined();

            // Verify the key is base64 encoded
            const decodedKey = JSON.parse(
                Buffer.from(body.pagination.last_evaluated_key, 'base64').toString()
            );
            expect(decodedKey).toEqual(mockLastKey);
        });

        it('should return 400 for invalid pagination key', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {
                    lastEvaluatedKey: 'invalid-base64!!!'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid pagination key');
        });
    });

    describe('Response Format', () => {
        it('should return properly formatted artwork entities', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            const mockArtwork = {
                art_id: 'art-123',
                user_id: 'user-456',
                season: 'SEASON#2024-spring',
                title: 'Beautiful Painting',
                description: 'A wonderful artwork',
                f_name: 'Alice',
                age: 15,
                location: 'UK',
                is_virtual: false,
                is_ai_gen: true,
                model: 'DALL-E 3',
                file_type: 'PNG',
                is_approved: false,
                votes: 0,
                timestamp: '2024-01-01T00:00:00.000Z'
            };

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [mockArtwork],
                LastEvaluatedKey: undefined
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
            const body = JSON.parse(response.body);
            const artwork = body.artworks[0];

            // Verify all fields are present
            expect(artwork.art_id).toBe('art-123');
            expect(artwork.user_id).toBe('user-456');
            expect(artwork.season).toBe('SEASON#2024-spring');
            expect(artwork.title).toBe('Beautiful Painting');
            expect(artwork.description).toBe('A wonderful artwork');
            expect(artwork.f_name).toBe('Alice');
            expect(artwork.age).toBe(15);
            expect(artwork.location).toBe('UK');
            expect(artwork.is_virtual).toBe(false);
            expect(artwork.is_ai_gen).toBe(true);
            expect(artwork.model).toBe('DALL-E 3');
            expect(artwork.file_type).toBe('PNG');
            expect(artwork.is_approved).toBe(false);
            expect(artwork.votes).toBe(0);
            expect(artwork.timestamp).toBe('2024-01-01T00:00:00.000Z');
            expect(artwork.type).toBe('ART');
        });

        it('should handle CORS headers correctly', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [],
                LastEvaluatedKey: undefined
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
            expect(response.headers).toBeDefined();
            expect(response.headers!['Access-Control-Allow-Origin']).toBe('*');
            expect(response.headers!['Content-Type']).toBe('application/json');
            expect(response.headers!['Access-Control-Allow-Methods']).toBe('GET,OPTIONS');
        });
    });

    describe('Error Handling', () => {
        it('should return 500 when GSI4 not found', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockRejectedValueOnce(
                Object.assign(new Error('GSI not found'), { name: 'ResourceNotFoundException' })
            );

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {}
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Unapproved artworks index not found');
        });

        it('should return 500 when DynamoDB throws unexpected error', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockRejectedValueOnce(new Error('Unexpected DynamoDB error'));

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {}
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to fetch unapproved artworks');
        });
    });
});
