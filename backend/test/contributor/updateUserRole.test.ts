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

import { handler } from '../../functions/contributor/updateUserRole';

describe('updateUserRole (Admin)', () => {
    beforeEach(() => {
        mockCognitoClient.send.mockReset();
        mockDynamoDB.send.mockReset();
    });

    describe('Authentication', () => {
        it('should return 401 when no accessToken', async () => {
            const event = {
                httpMethod: 'POST',
                headers: {},
                body: JSON.stringify({ user_id: 'user-123', new_role: 'guardian' })
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
                body: JSON.stringify({ user_id: 'user-123', new_role: 'guardian' })
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
                body: JSON.stringify({ user_id: 'target-user-123', new_role: 'guardian' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Only admins can update user roles');
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
                body: JSON.stringify({ user_id: 'target-user-123', new_role: 'guardian' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Only admins can update user roles');
        });

        it('should allow contibutor role', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            // Mock GetCommand for user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#target-user-123',
                    SK: 'PROFILE',
                    role: 'user'
                }
            });

            // Mock TransactWriteCommand
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'target-user-123', new_role: 'guardian' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.message).toBe('User role updated successfully');
        });

        it('should allow admin role', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            // Mock GetCommand for user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#target-user-123',
                    SK: 'PROFILE',
                    role: 'user'
                }
            });

            // Mock TransactWriteCommand
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'target-user-123', new_role: 'guardian' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
        });
    });

    describe('Request Body Validation', () => {
        it('should return 400 when body is missing', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
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
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
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
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ new_role: 'guardian' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('user_id is required');
        });

        it('should return 400 when user_id is empty string', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: '', new_role: 'guardian' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('user_id is required');
        });

        it('should return 400 when new_role is missing', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'user-123' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.body);
            expect(body.message).toContain('new_role must be either "user" or "guardian"');
        });

        it('should return 400 when new_role is invalid', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'user-123', new_role: 'admin' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.body);
            expect(body.message).toContain('new_role must be either "user" or "guardian"');
        });
    });

    describe('User Validation', () => {
        it('should return 404 when user does not exist', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            // Mock GetCommand returning no user
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'nonexistent-user', new_role: 'guardian' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('User not found');
        });

        it('should return 400 when user is already the target role', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            // Mock GetCommand returning guardian user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#user-123',
                    SK: 'PROFILE',
                    role: 'guardian'
                }
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'user-123', new_role: 'guardian' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('User is already a guardian');
        });

        it('should return 400 when trying to change admin role', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            // Mock GetCommand returning admin user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#admin-456',
                    SK: 'PROFILE',
                    role: 'admin'
                }
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'admin-456', new_role: 'user' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Cannot change role for admin/contributor users');
        });

        it('should return 400 when trying to change contributor role', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            // Mock GetCommand returning contributor user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#contributor-456',
                    SK: 'PROFILE',
                    role: 'contributor'
                }
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'contributor-456', new_role: 'guardian' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Cannot change role for admin/contributor users');
        });
    });

    describe('Successful Role Updates', () => {
        it('should successfully change user to guardian with default max_constituents', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            // Mock GetCommand
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#user-456',
                    SK: 'PROFILE',
                    role: 'user'
                }
            });

            // Mock TransactWriteCommand
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'user-456', new_role: 'guardian' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
            expect(body.message).toBe('User role updated successfully');
            expect(body.user_id).toBe('user-456');
            expect(body.old_role).toBe('user');
            expect(body.new_role).toBe('guardian');
            expect(body.max_constituents_per_season).toBe(50);

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
                                        PK: 'USER#user-456',
                                        SK: 'PROFILE'
                                    },
                                    UpdateExpression: 'SET #role = :new_role, max_constituents_per_season = :max',
                                    ExpressionAttributeNames: {
                                        '#role': 'role'
                                    },
                                    ExpressionAttributeValues: {
                                        ':new_role': 'guardian',
                                        ':max': 50
                                    }
                                })
                            }),
                            // Create ADMIN_ACTION
                            expect.objectContaining({
                                Put: expect.objectContaining({
                                    TableName: 'test-table',
                                    Item: expect.objectContaining({
                                        PK: 'USER#user-456',
                                        target_user_id: 'user-456',
                                        done_by: 'admin-123',
                                        action: 'update_user_role',
                                        old_role: 'user',
                                        new_role: 'guardian',
                                        max_constituents_per_season: 50,
                                        type: 'ADMIN_ACTION'
                                    })
                                })
                            })
                        ])
                    })
                })
            );
        });

        it('should successfully change guardian to user with default max_constituents', async () => {
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
                    role: 'guardian'
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'guardian-456', new_role: 'user' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const body = JSON.parse(response.body);
            expect(body.old_role).toBe('guardian');
            expect(body.new_role).toBe('user');
            expect(body.max_constituents_per_season).toBe(0);
        });

        it('should use custom max_constituents_per_season when provided', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#user-789',
                    SK: 'PROFILE',
                    role: 'user'
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({
                    user_id: 'user-789',
                    new_role: 'guardian',
                    max_constituents_per_season: 100
                })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const body = JSON.parse(response.body);
            expect(body.max_constituents_per_season).toBe(100);

            // Verify custom value was used in transaction
            expect(mockDynamoDB.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    input: expect.objectContaining({
                        TransactItems: expect.arrayContaining([
                            expect.objectContaining({
                                Update: expect.objectContaining({
                                    ExpressionAttributeValues: expect.objectContaining({
                                        ':max': 100
                                    })
                                })
                            })
                        ])
                    })
                })
            );
        });

        it('should handle CORS headers correctly', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#user-123',
                    SK: 'PROFILE',
                    role: 'user'
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'user-123', new_role: 'guardian' })
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
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#user-123',
                    SK: 'PROFILE',
                    role: 'user'
                }
            });

            // Mock TransactWriteCommand failure
            mockDynamoDB.send.mockRejectedValueOnce(
                Object.assign(new Error('Transaction cancelled'), { name: 'TransactionCanceledException' })
            );

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'user-123', new_role: 'guardian' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('User not found or has been modified');
        });

        it('should return 500 when DynamoDB throws unexpected error', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#user-123',
                    SK: 'PROFILE',
                    role: 'user'
                }
            });

            mockDynamoDB.send.mockRejectedValueOnce(new Error('Unexpected DynamoDB error'));

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'user-123', new_role: 'guardian' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to update user role');
        });

        it('should return 500 when GetCommand throws error', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            mockDynamoDB.send.mockRejectedValueOnce(new Error('DynamoDB get error'));

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'user-123', new_role: 'guardian' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to update user role');
        });
    });
});
