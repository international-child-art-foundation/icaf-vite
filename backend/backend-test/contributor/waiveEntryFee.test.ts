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

import { handler } from '../../functions/contributor/waiveEntryFee';

describe('waiveEntryFee (Contributor)', () => {
    beforeEach(() => {
        mockCognitoClient.send.mockReset();
        mockDynamoDB.send.mockReset();
    });

    describe('Authentication', () => {
        it('should return 401 when no accessToken', async () => {
            const event = {
                httpMethod: 'POST',
                headers: {},
                body: JSON.stringify({ user_id: 'user-123' })
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
                body: JSON.stringify({ user_id: 'user-123' })
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
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'target-user-123' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Only contributors and above can waive entry fees');
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
                body: JSON.stringify({ user_id: 'target-user-123' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Only contributors and above can waive entry fees');
        });

        it('should allow contributor role', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({}); // UpdateCommand success

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'target-user-123' })
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

            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'target-user-123' })
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
                body: JSON.stringify({})
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
                body: JSON.stringify({ user_id: '' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('user_id is required');
        });

        it('should return 400 when user_id is not a string', async () => {
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
                body: JSON.stringify({ user_id: 123 })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('user_id is required');
        });
    });

    describe('Successful Waive', () => {
        it('should waive entry fee for valid user', async () => {
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
                body: JSON.stringify({ user_id: 'target-user-456' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
            expect(body.message).toBe('Entry fee waived successfully');
            expect(body.user_id).toBe('target-user-456');
            expect(body.has_paid).toBe(true);

            // Verify DynamoDB UpdateCommand was called correctly
            expect(mockDynamoDB.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    input: expect.objectContaining({
                        TableName: 'test-table',
                        Key: {
                            PK: 'USER#target-user-456',
                            SK: 'PROFILE'
                        },
                        UpdateExpression: 'SET has_paid = :true',
                        ExpressionAttributeValues: {
                            ':true': true
                        },
                        ConditionExpression: 'attribute_exists(PK)'
                    })
                })
            );
        });

        it('should handle CORS headers correctly', async () => {
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
                body: JSON.stringify({ user_id: 'target-user-123' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            expect(response.headers).toBeDefined();
            expect(response.headers!['Access-Control-Allow-Origin']).toBe('*');
            expect(response.headers!['Content-Type']).toBe('application/json');
        });
    });

    describe('Error Handling', () => {
        it('should return 404 when user does not exist', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockRejectedValueOnce(
                Object.assign(new Error('User not found'), { name: 'ConditionalCheckFailedException' })
            );

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'nonexistent-user' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('User not found');
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
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ user_id: 'target-user-123' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to waive entry fee');
        });
    });
});
