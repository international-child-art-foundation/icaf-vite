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

import { handler } from '../../functions/contributor/linkAnonymousDonation';

describe('linkAnonymousDonation (Contributor)', () => {
    beforeEach(() => {
        mockCognitoClient.send.mockReset();
        mockDynamoDB.send.mockReset();
    });

    describe('Authentication', () => {
        it('should return 401 when no accessToken', async () => {
            const event = {
                httpMethod: 'POST',
                headers: {},
                body: JSON.stringify({ donation_id: 'donation-123', user_id: 'user-456' })
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
                body: JSON.stringify({ donation_id: 'donation-123', user_id: 'user-456' })
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
                body: JSON.stringify({ donation_id: 'donation-123', user_id: 'user-456' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Only contributors and above can link anonymous donations');
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
                body: JSON.stringify({ donation_id: 'donation-123', user_id: 'user-456' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Only contributors and above can link anonymous donations');
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
                    PK: 'USER#ANON',
                    SK: 'DONATION#donation-123',
                    amount_cents: 5000,
                    currency: 'USD',
                    timestamp: '2024-01-15T10:30:00Z',
                    type: 'DONATION',
                    user_id: 'USER#ANON',
                    stripe_id: 'DONATION#donation-123'
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#user-456',
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
                body: JSON.stringify({ donation_id: 'donation-123', user_id: 'user-456' })
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
                    PK: 'USER#ANON',
                    SK: 'DONATION#donation-123',
                    amount_cents: 5000,
                    currency: 'USD',
                    timestamp: '2024-01-15T10:30:00Z',
                    type: 'DONATION',
                    user_id: 'USER#ANON',
                    stripe_id: 'DONATION#donation-123'
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#user-456',
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
                body: JSON.stringify({ donation_id: 'donation-123', user_id: 'user-456' })
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

        it('should return 400 when donation_id is missing', async () => {
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
                body: JSON.stringify({ user_id: 'user-456' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.body);
            expect(body.message).toContain('donation_id is required');
        });

        it('should return 400 when donation_id is empty string', async () => {
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
                body: JSON.stringify({ donation_id: '', user_id: 'user-456' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.body);
            expect(body.message).toContain('donation_id is required');
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
                body: JSON.stringify({ donation_id: 'donation-123' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.body);
            expect(body.message).toContain('user_id is required');
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
                body: JSON.stringify({ donation_id: 'donation-123', user_id: '' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.body);
            expect(body.message).toContain('user_id is required');
        });
    });

    describe('Donation Validation', () => {
        it('should return 404 when anonymous donation does not exist', async () => {
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
                body: JSON.stringify({ donation_id: 'nonexistent-donation', user_id: 'user-456' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('Anonymous donation not found');
        });

        it('should return 400 when donation is already linked to a user', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#existing-user-789',
                    SK: 'DONATION#donation-123',
                    amount_cents: 5000,
                    currency: 'USD',
                    timestamp: '2024-01-15T10:30:00Z',
                    type: 'DONATION',
                    user_id: 'USER#existing-user-789',
                    stripe_id: 'DONATION#donation-123'
                }
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ donation_id: 'donation-123', user_id: 'user-456' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Donation is already linked to a user');
        });

        it('should automatically add DONATION# prefix if not present', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#ANON',
                    SK: 'DONATION#donation-123',
                    amount_cents: 5000,
                    currency: 'USD',
                    timestamp: '2024-01-15T10:30:00Z',
                    type: 'DONATION',
                    user_id: 'USER#ANON',
                    stripe_id: 'DONATION#donation-123'
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#user-456',
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
                body: JSON.stringify({ donation_id: 'donation-123', user_id: 'user-456' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            // Verify GetCommand was called with normalized donation_id
            expect(mockDynamoDB.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    input: expect.objectContaining({
                        Key: {
                            PK: 'USER#ANON',
                            SK: 'DONATION#donation-123'
                        }
                    })
                })
            );
        });

        it('should handle donation_id that already has DONATION# prefix', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#ANON',
                    SK: 'DONATION#donation-456',
                    amount_cents: 10000,
                    currency: 'USD',
                    timestamp: '2024-01-15T10:30:00Z',
                    type: 'DONATION',
                    user_id: 'USER#ANON',
                    stripe_id: 'DONATION#donation-456'
                }
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
                body: JSON.stringify({ donation_id: 'DONATION#donation-456', user_id: 'user-789' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const body = JSON.parse(response.body);
            expect(body.donation_id).toBe('DONATION#donation-456');
        });
    });

    describe('User Validation', () => {
        it('should return 404 when target user does not exist', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#ANON',
                    SK: 'DONATION#donation-123',
                    amount_cents: 5000,
                    currency: 'USD',
                    timestamp: '2024-01-15T10:30:00Z',
                    type: 'DONATION',
                    user_id: 'USER#ANON',
                    stripe_id: 'DONATION#donation-123'
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ donation_id: 'donation-123', user_id: 'nonexistent-user' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('User not found');
        });
    });

    describe('Successful Linking', () => {
        it('should successfully link anonymous donation to user account', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#ANON',
                    SK: 'DONATION#donation-123',
                    amount_cents: 5000,
                    currency: 'USD',
                    timestamp: '2024-01-15T10:30:00Z',
                    type: 'DONATION',
                    user_id: 'USER#ANON',
                    stripe_id: 'DONATION#donation-123'
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#user-456',
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
                body: JSON.stringify({ donation_id: 'donation-123', user_id: 'user-456' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
            expect(body.message).toBe('Anonymous donation linked successfully');
            expect(body.donation_id).toBe('DONATION#donation-123');
            expect(body.user_id).toBe('user-456');
            expect(body.amount_cents).toBe(5000);
            expect(body.currency).toBe('USD');

            // Verify TransactWriteCommand was called correctly
            expect(mockDynamoDB.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    input: expect.objectContaining({
                        TransactItems: expect.arrayContaining([
                            // Delete old anonymous donation
                            expect.objectContaining({
                                Delete: expect.objectContaining({
                                    TableName: 'test-table',
                                    Key: {
                                        PK: 'USER#ANON',
                                        SK: 'DONATION#donation-123'
                                    },
                                    ConditionExpression: 'attribute_exists(PK)'
                                })
                            }),
                            // Create new donation linked to user
                            expect.objectContaining({
                                Put: expect.objectContaining({
                                    TableName: 'test-table',
                                    Item: expect.objectContaining({
                                        PK: 'USER#user-456',
                                        SK: 'DONATION#donation-123',
                                        amount_cents: 5000,
                                        currency: 'USD',
                                        timestamp: '2024-01-15T10:30:00Z',
                                        type: 'DONATION',
                                        user_id: 'USER#user-456',
                                        stripe_id: 'DONATION#donation-123'
                                    })
                                })
                            }),
                            // Create ADMIN_ACTION
                            expect.objectContaining({
                                Put: expect.objectContaining({
                                    TableName: 'test-table',
                                    Item: expect.objectContaining({
                                        PK: 'USER#user-456',
                                        target_user_id: 'user-456',
                                        done_by: 'contributor-123',
                                        action: 'link_anonymous_donation',
                                        donation_id: 'DONATION#donation-123',
                                        old_pk: 'USER#ANON',
                                        new_pk: 'USER#user-456',
                                        amount_cents: 5000,
                                        type: 'ADMIN_ACTION'
                                    })
                                })
                            })
                        ])
                    })
                })
            );
        });

        it('should handle large donation amounts', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'admin-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'admin' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#ANON',
                    SK: 'DONATION#donation-999',
                    amount_cents: 1000000,
                    currency: 'EUR',
                    timestamp: '2024-02-20T15:45:00Z',
                    type: 'DONATION',
                    user_id: 'USER#ANON',
                    stripe_id: 'DONATION#donation-999'
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#user-999',
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
                body: JSON.stringify({ donation_id: 'donation-999', user_id: 'user-999' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const body = JSON.parse(response.body);
            expect(body.amount_cents).toBe(1000000);
            expect(body.currency).toBe('EUR');
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
                    PK: 'USER#ANON',
                    SK: 'DONATION#donation-123',
                    amount_cents: 5000,
                    currency: 'USD',
                    timestamp: '2024-01-15T10:30:00Z',
                    type: 'DONATION',
                    user_id: 'USER#ANON',
                    stripe_id: 'DONATION#donation-123'
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#user-456',
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
                body: JSON.stringify({ donation_id: 'donation-123', user_id: 'user-456' })
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
        it('should return 400 when transaction fails due to donation being modified', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#ANON',
                    SK: 'DONATION#donation-123',
                    amount_cents: 5000,
                    currency: 'USD',
                    timestamp: '2024-01-15T10:30:00Z',
                    type: 'DONATION',
                    user_id: 'USER#ANON',
                    stripe_id: 'DONATION#donation-123'
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#user-456',
                    SK: 'PROFILE',
                    role: 'user'
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
                body: JSON.stringify({ donation_id: 'donation-123', user_id: 'user-456' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Donation has been modified or deleted');
        });

        it('should return 500 when DynamoDB throws unexpected error on get donation', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockRejectedValueOnce(new Error('Unexpected DynamoDB error'));

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ donation_id: 'donation-123', user_id: 'user-456' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to link anonymous donation');
        });

        it('should return 500 when DynamoDB throws unexpected error on get user', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#ANON',
                    SK: 'DONATION#donation-123',
                    amount_cents: 5000,
                    currency: 'USD',
                    timestamp: '2024-01-15T10:30:00Z',
                    type: 'DONATION',
                    user_id: 'USER#ANON',
                    stripe_id: 'DONATION#donation-123'
                }
            });

            mockDynamoDB.send.mockRejectedValueOnce(new Error('DynamoDB get user error'));

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ donation_id: 'donation-123', user_id: 'user-456' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to link anonymous donation');
        });

        it('should return 500 when TransactWriteCommand throws unexpected error', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#ANON',
                    SK: 'DONATION#donation-123',
                    amount_cents: 5000,
                    currency: 'USD',
                    timestamp: '2024-01-15T10:30:00Z',
                    type: 'DONATION',
                    user_id: 'USER#ANON',
                    stripe_id: 'DONATION#donation-123'
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#user-456',
                    SK: 'PROFILE',
                    role: 'user'
                }
            });

            mockDynamoDB.send.mockRejectedValueOnce(new Error('Unexpected transaction error'));

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ donation_id: 'donation-123', user_id: 'user-456' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to link anonymous donation');
        });
    });
});
