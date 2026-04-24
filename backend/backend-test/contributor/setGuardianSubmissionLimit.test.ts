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

import { handler } from '../../functions/contributor/setGuardianSubmissionLimit';

describe('setGuardianSubmissionLimit (Contributor)', () => {
    beforeEach(() => {
        mockCognitoClient.send.mockReset();
        mockDynamoDB.send.mockReset();
    });

    describe('Authentication', () => {
        it('should return 401 when no accessToken', async () => {
            const event = {
                httpMethod: 'POST',
                headers: {},
                body: JSON.stringify({ user_id: 'guardian-123', max_constituents_per_season: 100 })
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
                body: JSON.stringify({ user_id: 'guardian-123', max_constituents_per_season: 100 })
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
                    { Name: 'custom:role', Value: 'user' }
                ]
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'guardian-123', max_constituents_per_season: 100 })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Only contributors and above can set guardian submission limits');
        });

        it('should return 403 when user role is guardian', async () => {
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
                body: JSON.stringify({ user_id: 'another-guardian-456', max_constituents_per_season: 100 })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Only contributors and above can set guardian submission limits');
        });

        it('should allow contributor role', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#guardian-456',
                    SK: 'PROFILE',
                    role: 'guardian',
                    max_constituents_per_season: 50
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'guardian-456', max_constituents_per_season: 100 })
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
                Item: {
                    PK: 'USER#guardian-456',
                    SK: 'PROFILE',
                    role: 'guardian',
                    max_constituents_per_season: 50
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'guardian-456', max_constituents_per_season: 100 })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
        });
    });

    describe('Request Body Validation', () => {
        it('should return 400 when body is missing', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
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
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
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

        it('should return 400 when user_id is missing', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ max_constituents_per_season: 100 })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('user_id is required');
        });

        it('should return 400 when user_id is empty string', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: '', max_constituents_per_season: 100 })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('user_id is required');
        });

        it('should return 400 when max_constituents_per_season is missing', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'guardian-123' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.body);
            expect(body.message).toContain('max_constituents_per_season is required');
        });

        it('should return 400 when max_constituents_per_season is not an integer', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'guardian-123', max_constituents_per_season: 50.5 })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.body);
            expect(body.message).toContain('max_constituents_per_season must be a non-negative integer');
        });

        it('should return 400 when max_constituents_per_season is negative', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'guardian-123', max_constituents_per_season: -10 })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.body);
            expect(body.message).toContain('max_constituents_per_season must be a non-negative integer');
        });
    });

    describe('User Validation', () => {
        it('should return 404 when user does not exist', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'nonexistent-user', max_constituents_per_season: 100 })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('User not found');
        });

        it('should return 400 when user is not a guardian', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#user-456',
                    SK: 'PROFILE',
                    role: 'user'
                }
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'user-456', max_constituents_per_season: 100 })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('User must be a guardian');
        });

        it('should return 400 when limit is already set to this value', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#guardian-456',
                    SK: 'PROFILE',
                    role: 'guardian',
                    max_constituents_per_season: 100
                }
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'guardian-456', max_constituents_per_season: 100 })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Submission limit is already set to this value');
        });
    });

    describe('Successful Updates', () => {
        it('should successfully update guardian submission limit', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#guardian-456',
                    SK: 'PROFILE',
                    role: 'guardian',
                    max_constituents_per_season: 50
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'guardian-456', max_constituents_per_season: 100 })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
            expect(body.message).toBe('Guardian submission limit updated successfully');
            expect(body.user_id).toBe('guardian-456');
            expect(body.old_value).toBe(50);
            expect(body.new_value).toBe(100);

            // Verify TransactWriteCommand was called correctly
            expect(mockDynamoDB.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    input: expect.objectContaining({
                        TransactItems: expect.arrayContaining([
                            // Update USER entity
                            expect.objectContaining({
                                Update: expect.objectContaining({
                                    TableName: 'test-table',
                                    Key: {
                                        PK: 'USER#guardian-456',
                                        SK: 'PROFILE'
                                    },
                                    UpdateExpression: 'SET max_constituents_per_season = :new_limit',
                                    ExpressionAttributeValues: {
                                        ':new_limit': 100
                                    }
                                })
                            }),
                            // Create ADMIN_ACTION
                            expect.objectContaining({
                                Put: expect.objectContaining({
                                    TableName: 'test-table',
                                    Item: expect.objectContaining({
                                        PK: 'USER#guardian-456',
                                        target_user_id: 'guardian-456',
                                        done_by: 'contributor-123',
                                        action: 'set_guardian_submission_limit',
                                        old_value: 50,
                                        new_value: 100,
                                        type: 'ADMIN_ACTION'
                                    })
                                })
                            })
                        ])
                    })
                })
            );
        });

        it('should allow setting limit to 0', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#guardian-456',
                    SK: 'PROFILE',
                    role: 'guardian',
                    max_constituents_per_season: 50
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'guardian-456', max_constituents_per_season: 0 })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const body = JSON.parse(response.body);
            expect(body.old_value).toBe(50);
            expect(body.new_value).toBe(0);
        });

        it('should allow setting large values', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#guardian-789',
                    SK: 'PROFILE',
                    role: 'guardian',
                    max_constituents_per_season: 50
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'guardian-789', max_constituents_per_season: 9999 })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const body = JSON.parse(response.body);
            expect(body.new_value).toBe(9999);
        });

        it('should handle CORS headers correctly', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#guardian-123',
                    SK: 'PROFILE',
                    role: 'guardian',
                    max_constituents_per_season: 50
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'guardian-123', max_constituents_per_season: 100 })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            expect(response.headers).toBeDefined();
            expect(response.headers!['Access-Control-Allow-Origin']).toBe('*');
            expect(response.headers!['Content-Type']).toBe('application/json');
            expect(response.headers!['Access-Control-Allow-Methods']).toBe('POST,OPTIONS');
        });
    });

    describe('Error Handling', () => {
        it('should return 404 when transaction fails due to user not found', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#guardian-456',
                    SK: 'PROFILE',
                    role: 'guardian',
                    max_constituents_per_season: 50
                }
            });

            mockDynamoDB.send.mockRejectedValueOnce(
                Object.assign(new Error('Transaction cancelled'), { name: 'TransactionCanceledException' })
            );

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'guardian-456', max_constituents_per_season: 100 })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('User not found or has been modified');
        });

        it('should return 500 when DynamoDB throws unexpected error', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#guardian-456',
                    SK: 'PROFILE',
                    role: 'guardian',
                    max_constituents_per_season: 50
                }
            });

            mockDynamoDB.send.mockRejectedValueOnce(new Error('Unexpected DynamoDB error'));

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'guardian-456', max_constituents_per_season: 100 })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to set guardian submission limit');
        });

        it('should return 500 when GetCommand throws error', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockRejectedValueOnce(new Error('DynamoDB get error'));

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'guardian-456', max_constituents_per_season: 100 })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to set guardian submission limit');
        });
    });
});
