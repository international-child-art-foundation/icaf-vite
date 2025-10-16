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

// Mock business logic functions
jest.mock('../../../shared/src/api-types/businessLogic', () => ({
    canUserSubmitArtwork: jest.fn((_user, _season) => ({ canSubmit: true })),
    isSeasonActive: jest.fn((_season) => !!_season)
}));

import { handler } from '../../functions/user/submitArtworkForConstituent';
import { canUserSubmitArtwork, isSeasonActive } from '../../../shared/src/api-types/businessLogic';

describe('submitArtworkForConstituent (User)', () => {
    beforeEach(() => {
        mockCognitoClient.send.mockReset();
        mockDynamoDB.send.mockReset();
        (canUserSubmitArtwork as jest.Mock).mockReturnValue({ canSubmit: true });
        (isSeasonActive as jest.Mock).mockReturnValue(true);
    });

    describe('Authentication', () => {
        it('should return 401 when no accessToken', async () => {
            const event = {
                httpMethod: 'POST',
                headers: {},
                body: JSON.stringify({})
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
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=invalid-token'
                },
                body: JSON.stringify({})
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(401);
            expect(response.body).toContain('Invalid or expired token');
        });
    });

    describe('Authorization', () => {
        it('should return 403 when user role is user (not guardian)', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'user-123',
                UserAttributes: [
                    { Name: 'email', Value: 'user@example.com' },
                    { Name: 'custom:role', Value: 'user' }
                ]
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({
                    season: '2024-spring',
                    title: 'Test Art',
                    f_name: 'Child',
                    age: 8,
                    location: 'USA',
                    file_type: 'png',
                    is_ai_generated: false,
                    is_virtual: false // Will be forced to true
                })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Only guardians and above can submit artwork for constituents');
        });

        it('should allow guardian role', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            // Mock season check
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'SEASON',
                    SK: '#ACTIVE#true#SEASON#2024-spring',
                    season: '2024-spring',
                    payment_required: false,
                    max_user_submissions: 5
                }
            });

            // Mock user check
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#guardian-123',
                    SK: 'PROFILE',
                    can_submit: true,
                    has_paid: true,
                    max_constituents_per_season: 10
                }
            });

            // Mock existing submissions query
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: []
            });

            // Mock transaction write
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({
                    season: '2024-spring',
                    title: 'Test Art',
                    f_name: 'Child',
                    age: 8,
                    location: 'USA',
                    file_type: 'png',
                    is_ai_generated: false,
                    is_virtual: false // Will be forced to true
                })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(201);
        });

        it('should allow admin role with unlimited submissions', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    season: '2024-spring',
                    payment_required: false,
                    max_user_submissions: 5
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    can_submit: true,
                    has_paid: true
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: Array(100).fill({}) // Already has 100 submissions
            });

            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({
                    season: '2024-spring',
                    title: 'Test Art',
                    f_name: 'Child',
                    age: 8,
                    location: 'USA',
                    file_type: 'png',
                    is_ai_generated: false,
                    is_virtual: true
                })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(201); // Admin has unlimited
            const body = JSON.parse(response.body);
            expect(body.max_submissions).toBe('unlimited');
        });
    });

    describe('Request Body Validation', () => {
        it('should return 400 when body is missing', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                }
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Request body is required');
        });

        it('should return 400 when body is invalid JSON', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: 'invalid json{'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid JSON');
        });

        it('should return 400 when required fields are missing', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({
                    season: '2024-spring'
                    // Missing required fields
                })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Validation failed');
        });

        it('should force is_virtual to true even if request has false', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: { season: '2024-spring', payment_required: false, max_user_submissions: 5 }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: { can_submit: true, has_paid: true, max_constituents_per_season: 10 }
            });

            mockDynamoDB.send.mockResolvedValueOnce({ Items: [] });

            let capturedArtworkEntity: any;
            mockDynamoDB.send.mockImplementationOnce((command: any) => {
                capturedArtworkEntity = command.input.TransactItems[0].Put.Item;
                return Promise.resolve({});
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({
                    season: '2024-spring',
                    title: 'Test Art',
                    f_name: 'Child',
                    age: 8,
                    location: 'USA',
                    file_type: 'png',
                    is_ai_generated: false,
                    is_virtual: false // Should be forced to true
                })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(201);
            expect(capturedArtworkEntity.is_virtual).toBe(true);
        });
    });

    describe('Season Validation', () => {
        it('should return 400 when season is not active', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            // Season not found (not active)
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: undefined
            });

            (isSeasonActive as jest.Mock).mockReturnValueOnce(false);

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({
                    season: '2024-inactive',
                    title: 'Test Art',
                    f_name: 'Child',
                    age: 8,
                    location: 'USA',
                    file_type: 'png',
                    is_ai_generated: false,
                    is_virtual: true
                })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('not active');
        });
    });

    describe('User Eligibility', () => {
        it('should return 403 when user cannot submit', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: { season: '2024-spring', payment_required: false }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: { can_submit: false }
            });

            (canUserSubmitArtwork as jest.Mock).mockReturnValueOnce({
                canSubmit: false,
                reason: 'User is banned'
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({
                    season: '2024-spring',
                    title: 'Test Art',
                    f_name: 'Child',
                    age: 8,
                    location: 'USA',
                    file_type: 'png',
                    is_ai_generated: false,
                    is_virtual: true
                })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('User is banned');
        });

        it('should return 402 when payment is required but not paid', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: { season: '2024-spring', payment_required: true }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: { can_submit: true, has_paid: false }
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({
                    season: '2024-spring',
                    title: 'Test Art',
                    f_name: 'Child',
                    age: 8,
                    location: 'USA',
                    file_type: 'png',
                    is_ai_generated: false,
                    is_virtual: true
                })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(402);
        });
    });

    describe('Submission Limits', () => {
        it('should return 429 when guardian reaches max_constituents_per_season', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: { season: '2024-spring', payment_required: false, max_user_submissions: 5 }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: { can_submit: true, has_paid: true, max_constituents_per_season: 3 }
            });

            // Query returns 3 Art_Ptr entries
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [{ art_id: '1' }, { art_id: '2' }, { art_id: '3' }]
            });

            // BatchGet returns 3 Art entities, all is_virtual=true
            mockDynamoDB.send.mockResolvedValueOnce({
                Responses: {
                    'test-table': [
                        { PK: 'ART#1', is_virtual: true },
                        { PK: 'ART#2', is_virtual: true },
                        { PK: 'ART#3', is_virtual: true }
                    ]
                }
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({
                    season: '2024-spring',
                    title: 'Test Art',
                    f_name: 'Child',
                    age: 8,
                    location: 'USA',
                    file_type: 'png',
                    is_ai_generated: false,
                    is_virtual: true
                })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(429);
            expect(response.body).toContain('Maximum constituent submissions reached');
        });

        it('should allow submission when under limit', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: { season: '2024-spring', payment_required: false, max_user_submissions: 5 }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: { can_submit: true, has_paid: true, max_constituents_per_season: 10 }
            });

            // Query returns 1 Art_Ptr entry
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [{ art_id: '1' }]
            });

            // BatchGet returns 1 Art entity with is_virtual=true
            mockDynamoDB.send.mockResolvedValueOnce({
                Responses: {
                    'test-table': [
                        { PK: 'ART#1', is_virtual: true }
                    ]
                }
            });

            // TransactWrite mock
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({
                    season: '2024-spring',
                    title: 'Test Art',
                    f_name: 'Child',
                    age: 8,
                    location: 'USA',
                    file_type: 'png',
                    is_ai_generated: false,
                    is_virtual: true
                })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(201);
            const body = JSON.parse(response.body);
            expect(body.submission_count).toBe(2);
            expect(body.max_submissions).toBe(10);
        });
    });

    describe('Successful Submission', () => {
        it('should create artwork and art_ptr entities', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: { season: '2024-spring', payment_required: false, max_user_submissions: 5 }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: { can_submit: true, has_paid: true, max_constituents_per_season: 10 }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: []
            });

            let transactItems: any;
            mockDynamoDB.send.mockImplementationOnce((command: any) => {
                transactItems = command.input.TransactItems;
                return Promise.resolve({});
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({
                    season: '2024-spring',
                    title: 'Beautiful Drawing',
                    f_name: 'Tommy',
                    age: 8,
                    location: 'USA',
                    file_type: 'png',
                    is_ai_generated: false,
                    is_virtual: false
                })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(201);

            // Verify transaction items
            expect(transactItems).toHaveLength(2);

            // Check Art entity
            const artEntity = transactItems[0].Put.Item;
            expect(artEntity.PK).toContain('ART#');
            expect(artEntity.is_virtual).toBe(true);
            expect(artEntity.user_id).toBe('guardian-123');
            expect(artEntity.f_name).toBe('Tommy');
            expect(artEntity.season).toBe('2024-spring');

            // Check Art_Ptr entity
            const artPtrEntity = transactItems[1].Put.Item;
            expect(artPtrEntity.PK).toBe('USER#guardian-123');
            expect(artPtrEntity.SK).toContain('ART#2024-spring#ID#');
            expect(artPtrEntity.type).toBe('ART_PTR');

            // Check response body
            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
            expect(body.artwork_id).toBeDefined();
            expect(body.constituent_name).toBe('Tommy');
            expect(body.season).toBe('2024-spring');
        });

        it('should include AI model when is_ai_generated is true', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: { season: '2024-spring', payment_required: false }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: { can_submit: true, has_paid: true, max_constituents_per_season: 10 }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: []
            });

            let artEntity: any;
            mockDynamoDB.send.mockImplementationOnce((command: any) => {
                artEntity = command.input.TransactItems[0].Put.Item;
                return Promise.resolve({});
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({
                    season: '2024-spring',
                    title: 'AI Art',
                    f_name: 'Child',
                    age: 10,
                    location: 'Canada',
                    file_type: 'jpg',
                    is_ai_generated: true,
                    ai_model: 'DALL-E 3',
                    is_virtual: true
                })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(201);
            expect(artEntity.is_ai_gen).toBe(true);
            expect(artEntity.model).toBe('DALL-E 3');
        });
    });

    describe('Error Handling', () => {
        it('should return 409 when artwork already exists (transaction conflict)', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: { season: '2024-spring', payment_required: false }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: { can_submit: true, has_paid: true }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Items: []
            });

            mockDynamoDB.send.mockRejectedValueOnce(
                Object.assign(new Error('Conflict'), { name: 'ConditionalCheckFailedException' })
            );

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({
                    season: '2024-spring',
                    title: 'Test Art',
                    f_name: 'Child',
                    age: 8,
                    location: 'USA',
                    file_type: 'png',
                    is_ai_generated: false,
                    is_virtual: true
                })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(409);
            expect(response.body).toContain('already exists');
        });

        it('should return 500 when DynamoDB throws unexpected error', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            mockDynamoDB.send.mockRejectedValueOnce(new Error('Unexpected DynamoDB error'));

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({
                    season: '2024-spring',
                    title: 'Test Art',
                    f_name: 'Child',
                    age: 8,
                    location: 'USA',
                    file_type: 'png',
                    is_ai_generated: false,
                    is_virtual: true
                })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to submit constituent artwork');
        });
    });
});
