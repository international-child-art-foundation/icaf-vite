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

import { handler } from '../../functions/contributor/getSeasons';

describe('getSeasons (Contributor)', () => {
    beforeEach(() => {
        mockCognitoClient.send.mockReset();
        mockDynamoDB.send.mockReset();
    });

    const mockSeasons = [
        {
            PK: 'SEASON',
            SK: '#ACTIVE#true#SEASON#2024-spring',
            season: '2024-spring',
            colloq_name: 'Spring 2024',
            is_active: true,
            start_date: '2024-01-01',
            end_date: '2024-05-31',
            payment_required: true,
            max_user_submissions: 1,
            can_vote: true,
            total_votes: 1500,
            type: 'SEASON'
        },
        {
            PK: 'SEASON',
            SK: '#ACTIVE#false#SEASON#2023-fall',
            season: '2023-fall',
            colloq_name: 'Fall 2023',
            is_active: false,
            start_date: '2023-09-01',
            end_date: '2023-12-31',
            payment_required: true,
            max_user_submissions: 1,
            can_vote: true,
            total_votes: 2000,
            type: 'SEASON'
        },
        {
            PK: 'SEASON',
            SK: '#ACTIVE#true#SEASON#2024-summer',
            season: '2024-summer',
            colloq_name: 'Summer 2024',
            is_active: true,
            start_date: '2024-06-01',
            end_date: '2024-08-31',
            payment_required: false,
            max_user_submissions: 3,
            can_vote: false,
            total_votes: 0,
            type: 'SEASON'
        }
    ];

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
            expect(response.body).toContain('Only contributors and above can fetch seasons');
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
            expect(response.body).toContain('Only contributors and above can fetch seasons');
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

    describe('Successful Queries', () => {
        it('should return all seasons when no filter', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: mockSeasons
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
            expect(body.seasons).toHaveLength(3);
            expect(body.count).toBe(3);
            expect(body.has_active_season).toBe(true);

            // Verify DynamoDB QueryCommand was called correctly
            expect(mockDynamoDB.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    input: expect.objectContaining({
                        TableName: 'test-table',
                        KeyConditionExpression: 'PK = :pk',
                        ExpressionAttributeValues: {
                            ':pk': 'SEASON'
                        }
                    })
                })
            );
        });

        it('should return only active seasons when active_only=true', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: mockSeasons
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {
                    active_only: 'true'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const body = JSON.parse(response.body);
            expect(body.seasons).toHaveLength(2);
            expect(body.count).toBe(2);
            expect(body.has_active_season).toBe(true);

            // All returned seasons should be active
            body.seasons.forEach((season: any) => {
                expect(season.is_active).toBe(true);
            });

            // Check seasons are Spring 2024 and Summer 2024
            const seasonIds = body.seasons.map((s: any) => s.season);
            expect(seasonIds).toContain('2024-spring');
            expect(seasonIds).toContain('2024-summer');
            expect(seasonIds).not.toContain('2023-fall');
        });

        it('should return empty array when no seasons exist', async () => {
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

            const body = JSON.parse(response.body);
            expect(body.seasons).toEqual([]);
            expect(body.count).toBe(0);
            expect(body.has_active_season).toBe(false);
        });

        it('should sort seasons with active first, then by start_date descending', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: mockSeasons
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
            const seasons = body.seasons;

            // First two should be active (Summer 2024, then Spring 2024)
            expect(seasons[0].is_active).toBe(true);
            expect(seasons[0].season).toBe('2024-summer'); // June 2024
            expect(seasons[1].is_active).toBe(true);
            expect(seasons[1].season).toBe('2024-spring'); // January 2024

            // Last should be inactive
            expect(seasons[2].is_active).toBe(false);
            expect(seasons[2].season).toBe('2023-fall');
        });

        it('should include all season fields', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [mockSeasons[0]]
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
            const season = body.seasons[0];

            expect(season).toEqual({
                season: '2024-spring',
                colloq_name: 'Spring 2024',
                is_active: true,
                start_date: '2024-01-01',
                end_date: '2024-05-31',
                payment_required: true,
                max_user_submissions: 1,
                can_vote: true,
                total_votes: 1500
            });

            // Should not include internal fields
            expect(season.PK).toBeUndefined();
            expect(season.SK).toBeUndefined();
            expect(season.type).toBeUndefined();
        });

        it('should handle CORS headers correctly', async () => {
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
            expect(response.headers).toBeDefined();
            expect(response.headers!['Access-Control-Allow-Origin']).toBe('*');
            expect(response.headers!['Content-Type']).toBe('application/json');
            expect(response.headers!['Access-Control-Allow-Methods']).toBe('GET,OPTIONS');
        });

        it('should handle seasons with default values', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            // Season with minimal fields
            const minimalSeason = {
                PK: 'SEASON',
                SK: '#ACTIVE#false#SEASON#2023-spring',
                season: '2023-spring',
                colloq_name: 'Spring 2023',
                start_date: '2023-01-01',
                end_date: '2023-05-31'
                // Missing optional fields
            };

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [minimalSeason]
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
            const season = body.seasons[0];

            // Check default values
            expect(season.is_active).toBe(false);
            expect(season.payment_required).toBe(false);
            expect(season.max_user_submissions).toBe(1);
            expect(season.can_vote).toBe(false);
            expect(season.total_votes).toBe(0);
        });
    });

    describe('Error Handling', () => {
        it('should return 500 when DynamoDB throws error', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
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
            expect(response.body).toContain('Failed to fetch seasons');
        });
    });

    describe('Edge Cases', () => {
        it('should handle active_only=false same as no parameter', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: mockSeasons
            });

            const event = {
                httpMethod: 'GET',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                queryStringParameters: {
                    active_only: 'false'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const body = JSON.parse(response.body);
            expect(body.seasons).toHaveLength(3); // All seasons returned
        });

        it('should return has_active_season=false when only inactive seasons exist', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            const inactiveSeason = {
                ...mockSeasons[1],
                is_active: false
            };

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [inactiveSeason]
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
            expect(body.has_active_season).toBe(false);
        });
    });
});
