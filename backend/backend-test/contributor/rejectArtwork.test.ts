// Mock Cognito, DynamoDB, and SQS clients
const mockCognitoClient = {
    send: jest.fn()
};

const mockDynamoDB = {
    send: jest.fn()
};

const mockSQSClient = {
    send: jest.fn()
};

jest.mock('../../config/aws-clients', () => ({
    cognitoClient: mockCognitoClient,
    dynamodb: mockDynamoDB,
    sqsClient: mockSQSClient,
    TABLE_NAME: 'test-table',
    CLEANUP_QUEUE_URL: 'https://sqs.us-east-1.amazonaws.com/123456789/test-cleanup-queue'
}));

import { handler } from '../../functions/contributor/rejectArtwork';

describe('rejectArtwork (Contributor)', () => {
    beforeEach(() => {
        mockCognitoClient.send.mockReset();
        mockDynamoDB.send.mockReset();
        mockSQSClient.send.mockReset();
    });

    describe('Authentication', () => {
        it('should return 401 when no accessToken', async () => {
            const event = {
                httpMethod: 'POST',
                headers: {},
                body: JSON.stringify({ art_id: 'art-123', reason: 'Inappropriate content' })
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
                body: JSON.stringify({ art_id: 'art-123', reason: 'Inappropriate content' })
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
                body: JSON.stringify({ art_id: 'art-123', reason: 'Inappropriate content' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Only contributors and above can reject artworks');
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
                body: JSON.stringify({ art_id: 'art-123', reason: 'Inappropriate content' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Only contributors and above can reject artworks');
        });

        it('should allow contributor role', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            // Mock GetCommand for artwork
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'ART#art-123',
                    SK: 'N/A',
                    art_id: 'art-123',
                    user_id: 'user-456',
                    season: 'SEASON#2024-spring',
                    email: 'user@example.com',
                    is_deleted: false
                }
            });

            // Mock TransactWriteCommand
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock SQS SendMessageCommand
            mockSQSClient.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ art_id: 'art-123', reason: 'Inappropriate content' })
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
                    PK: 'ART#art-123',
                    SK: 'N/A',
                    art_id: 'art-123',
                    user_id: 'user-456',
                    season: 'SEASON#2024-spring',
                    email: 'user@example.com',
                    is_deleted: false
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({});
            mockSQSClient.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ art_id: 'art-123', reason: 'Inappropriate content' })
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

        it('should return 400 when art_id is missing', async () => {
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
                body: JSON.stringify({ reason: 'Test reason' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('art_id is required');
        });

        it('should return 400 when art_id is empty string', async () => {
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
                body: JSON.stringify({ art_id: '', reason: 'Test reason' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('art_id is required');
        });

        it('should return 400 when art_id is not a string', async () => {
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
                body: JSON.stringify({ art_id: 123, reason: 'Test reason' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('art_id is required');
        });

        it('should return 400 when reason is missing', async () => {
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
                body: JSON.stringify({ art_id: 'art-123' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('reason is required');
        });

        it('should return 400 when reason is empty string', async () => {
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
                body: JSON.stringify({ art_id: 'art-123', reason: '' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('reason is required');
        });

        it('should return 400 when reason is not a string', async () => {
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
                body: JSON.stringify({ art_id: 'art-123', reason: 123 })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('reason is required');
        });
    });

    describe('Artwork Validation', () => {
        it('should return 404 when artwork does not exist', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            // Mock GetCommand returning no item
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ art_id: 'nonexistent-art', reason: 'Test reason' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('Artwork not found');
        });

        it('should return 400 when artwork is already deleted', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            // Mock GetCommand returning already deleted artwork
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'ART#art-123',
                    SK: 'N/A',
                    art_id: 'art-123',
                    user_id: 'user-456',
                    season: 'SEASON#2024-spring',
                    is_deleted: true
                }
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ art_id: 'art-123', reason: 'Test reason' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Artwork is already deleted');
        });

        it('should return 500 when artwork data is incomplete (missing user_id)', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            // Mock GetCommand returning artwork without user_id
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'ART#art-123',
                    SK: 'N/A',
                    art_id: 'art-123',
                    season: 'SEASON#2024-spring'
                    // user_id missing
                }
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ art_id: 'art-123', reason: 'Test reason' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Artwork data is incomplete');
        });

        it('should return 500 when artwork data is incomplete (missing season)', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            // Mock GetCommand returning artwork without season
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'ART#art-123',
                    SK: 'N/A',
                    art_id: 'art-123',
                    user_id: 'user-456'
                    // season missing
                }
            });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ art_id: 'art-123', reason: 'Test reason' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Artwork data is incomplete');
        });
    });

    describe('Successful Rejection', () => {
        it('should reject artwork successfully with soft delete and ADMIN_ACTION', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            // Mock GetCommand for artwork
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'ART#art-456',
                    SK: 'N/A',
                    art_id: 'art-456',
                    user_id: 'user-789',
                    season: 'SEASON#2024-spring',
                    email: 'user@example.com',
                    is_deleted: false
                }
            });

            // Mock TransactWriteCommand
            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock SQS SendMessageCommand
            mockSQSClient.send.mockResolvedValueOnce({ MessageId: 'msg-123' });

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ art_id: 'art-456', reason: 'Inappropriate content' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
            expect(body.message).toBe('Artwork rejected successfully');
            expect(body.art_id).toBe('art-456');
            expect(body.user_id).toBe('user-789');
            expect(body.is_deleted).toBe(true);
            expect(body.cleanup_queued).toBe(true);

            // Verify TransactWriteCommand was called with correct parameters
            expect(mockDynamoDB.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    input: expect.objectContaining({
                        TransactItems: expect.arrayContaining([
                            // Update ART entity
                            expect.objectContaining({
                                Update: expect.objectContaining({
                                    TableName: 'test-table',
                                    Key: {
                                        PK: 'ART#art-456',
                                        SK: 'N/A'
                                    },
                                    UpdateExpression: 'SET is_deleted = :true, deleted_at = :timestamp, deleted_by = :contributor_id, deletion_reason = :reason',
                                    ConditionExpression: 'attribute_exists(PK) AND (attribute_not_exists(is_deleted) OR is_deleted = :false)',
                                    ExpressionAttributeValues: expect.objectContaining({
                                        ':true': true,
                                        ':contributor_id': 'contributor-123',
                                        ':reason': 'Inappropriate content',
                                        ':false': false
                                    })
                                })
                            }),
                            // Create ADMIN_ACTION
                            expect.objectContaining({
                                Put: expect.objectContaining({
                                    TableName: 'test-table',
                                    Item: expect.objectContaining({
                                        PK: 'USER#user-789',
                                        target_user_id: 'user-789',
                                        done_by: 'contributor-123',
                                        action: 'reject',
                                        reason: 'Inappropriate content',
                                        art_id: 'art-456',
                                        type: 'ADMIN_ACTION'
                                    })
                                })
                            })
                        ])
                    })
                })
            );

            // Verify SQS message was sent
            expect(mockSQSClient.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    input: expect.objectContaining({
                        QueueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789/test-cleanup-queue',
                        MessageBody: expect.stringContaining('art-456'),
                        MessageAttributes: {
                            action: {
                                DataType: 'String',
                                StringValue: 'cleanup_rejected_artwork'
                            }
                        }
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

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'ART#art-123',
                    SK: 'N/A',
                    art_id: 'art-123',
                    user_id: 'user-456',
                    season: 'SEASON#2024-spring',
                    email: 'user@example.com',
                    is_deleted: false
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({});
            mockSQSClient.send.mockResolvedValueOnce({});

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ art_id: 'art-123', reason: 'Test reason' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            expect(response.headers).toBeDefined();
            expect(response.headers!['Access-Control-Allow-Origin']).toBe('*');
            expect(response.headers!['Content-Type']).toBe('application/json');
            expect(response.headers!['Access-Control-Allow-Methods']).toBe('POST,OPTIONS');
        });

        it('should succeed even if SQS send fails (non-fatal error)', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'ART#art-123',
                    SK: 'N/A',
                    art_id: 'art-123',
                    user_id: 'user-456',
                    season: 'SEASON#2024-spring',
                    email: 'user@example.com',
                    is_deleted: false
                }
            });

            mockDynamoDB.send.mockResolvedValueOnce({});

            // Mock SQS failure
            mockSQSClient.send.mockRejectedValueOnce(new Error('SQS temporarily unavailable'));

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ art_id: 'art-123', reason: 'Test reason' })
            } as any;
            const response = await handler(event);

            // Should still succeed because SQS error is non-fatal
            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
        });
    });

    describe('Error Handling', () => {
        it('should return 400 when transaction fails due to already deleted artwork', async () => {
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'contributor-123',
                UserAttributes: [
                    { Name: 'custom:role', Value: 'contributor' }
                ]
            });

            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'ART#art-123',
                    SK: 'N/A',
                    art_id: 'art-123',
                    user_id: 'user-456',
                    season: 'SEASON#2024-spring',
                    is_deleted: false
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
                body: JSON.stringify({ art_id: 'art-123', reason: 'Test reason' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Artwork is already deleted or does not exist');
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
                    PK: 'ART#art-123',
                    SK: 'N/A',
                    art_id: 'art-123',
                    user_id: 'user-456',
                    season: 'SEASON#2024-spring',
                    is_deleted: false
                }
            });

            mockDynamoDB.send.mockRejectedValueOnce(new Error('Unexpected DynamoDB error'));

            const event = {
                httpMethod: 'POST',
                headers: {
                    'Cookie': 'accessToken=valid-token'
                },
                body: JSON.stringify({ art_id: 'art-123', reason: 'Test reason' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to reject artwork');
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
                body: JSON.stringify({ art_id: 'art-123', reason: 'Test reason' })
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to reject artwork');
        });
    });
});
