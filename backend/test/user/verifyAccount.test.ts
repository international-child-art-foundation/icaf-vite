// Mock Cognito and DynamoDB
const mockCognitoClient = {
    send: jest.fn()
};

const mockDynamoDB = {
    send: jest.fn()
};

jest.mock('../../config/aws-clients', () => ({
    cognitoClient: mockCognitoClient,
    dynamodb: mockDynamoDB,
    USER_POOL_ID: 'test-pool-id',
    TABLE_NAME: 'test-table'
}));

import { handler } from '../../functions/user/verifyAccount';
import { VerifyAccountResponse } from '../../../shared/src/api-types/registrationTypes';

describe('verifyAccount (User)', () => {
    beforeEach(() => {
        mockCognitoClient.send.mockReset();
        mockDynamoDB.send.mockReset();
    });

    describe('Request Validation', () => {
        it('should return 400 when email is missing', async () => {
            const event = {
                body: JSON.stringify({}),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Email is required');
        });
    });

    describe('Cognito Validation', () => {
        it('should return 404 when user not found in Cognito', async () => {
            // Mock Cognito user not found
            mockCognitoClient.send.mockRejectedValueOnce(
                Object.assign(new Error('User not found'), { name: 'UserNotFoundException' })
            );

            const event = {
                body: JSON.stringify({ email: 'nonexistent@example.com' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('User not found in Cognito');
        });

        it('should return 400 when Cognito user missing required attributes', async () => {
            // Mock Cognito user with missing attributes
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'user-123',
                UserAttributes: [
                    { Name: 'email', Value: 'test@example.com' },
                    { Name: 'given_name', Value: 'John' }
                    // Missing family_name and birthdate
                ]
            });

            const event = {
                body: JSON.stringify({ email: 'test@example.com' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Missing required user attributes');
        });
    });

    describe('DynamoDB Validation', () => {
        it('should return 400 when user already exists in DynamoDB', async () => {
            // Mock Cognito user found
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'user-123',
                UserAttributes: [
                    { Name: 'email', Value: 'test@example.com' },
                    { Name: 'given_name', Value: 'John' },
                    { Name: 'family_name', Value: 'Doe' },
                    { Name: 'birthdate', Value: '1990-01-01' },
                    { Name: 'custom:role', Value: 'user' }
                ]
            });

            // Mock DynamoDB user already exists
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    PK: 'USER#user-123',
                    SK: 'PROFILE',
                    user_id: 'user-123'
                }
            });

            const event = {
                body: JSON.stringify({ email: 'test@example.com' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('User already verified');
        });
    });

    describe('Successful Verification', () => {
        it('should successfully verify account and create DynamoDB record', async () => {
            // Mock Cognito user found
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'user-123',
                UserAttributes: [
                    { Name: 'email', Value: 'john.doe@example.com' },
                    { Name: 'given_name', Value: 'John' },
                    { Name: 'family_name', Value: 'Doe' },
                    { Name: 'birthdate', Value: '1990-05-15' },
                    { Name: 'custom:role', Value: 'user' }
                ]
            });

            // Mock DynamoDB user does not exist
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: null
            });

            // Mock DynamoDB put success
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                body: JSON.stringify({ email: 'john.doe@example.com' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(201);

            const responseBody: VerifyAccountResponse = JSON.parse(response.body);
            expect(responseBody.message).toBe('Account verified successfully');
            expect(responseBody.user_id).toBe('user-123');
            expect(responseBody.f_name).toBe('John');
            expect(responseBody.l_name).toBe('Doe');
            expect(responseBody.role).toBe('user');

            // Verify DynamoDB put was called
            expect(mockDynamoDB.send).toHaveBeenCalledTimes(2); // Get + Put
        });

        it('should verify guardian account with correct attributes', async () => {
            // Mock Cognito guardian user
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'guardian-456',
                UserAttributes: [
                    { Name: 'email', Value: 'guardian@example.com' },
                    { Name: 'given_name', Value: 'Jane' },
                    { Name: 'family_name', Value: 'Smith' },
                    { Name: 'birthdate', Value: '1985-03-20' },
                    { Name: 'custom:role', Value: 'guardian' }
                ]
            });

            // Mock DynamoDB user does not exist
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: null
            });

            // Mock DynamoDB put success
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                body: JSON.stringify({ email: 'guardian@example.com' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(201);

            const responseBody: VerifyAccountResponse = JSON.parse(response.body);
            expect(responseBody.role).toBe('guardian');
            expect(responseBody.f_name).toBe('Jane');
        });

        it('should default to user role when role not specified in Cognito', async () => {
            // Mock Cognito user without custom:role
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'user-789',
                UserAttributes: [
                    { Name: 'email', Value: 'notrole@example.com' },
                    { Name: 'given_name', Value: 'Bob' },
                    { Name: 'family_name', Value: 'Johnson' },
                    { Name: 'birthdate', Value: '1995-12-10' }
                    // No custom:role
                ]
            });

            // Mock DynamoDB user does not exist
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: null
            });

            // Mock DynamoDB put success
            mockDynamoDB.send.mockResolvedValueOnce({});

            const event = {
                body: JSON.stringify({ email: 'notrole@example.com' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(201);

            const responseBody: VerifyAccountResponse = JSON.parse(response.body);
            expect(responseBody.role).toBe('user'); // Default role
        });
    });

    describe('Error Handling', () => {
        it('should return 500 when Cognito throws unexpected error', async () => {
            // Mock Cognito unexpected error
            mockCognitoClient.send.mockRejectedValueOnce(new Error('Cognito service error'));

            const event = {
                body: JSON.stringify({ email: 'test@example.com' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to verify account');
        });

        it('should return 500 when DynamoDB put fails', async () => {
            // Mock Cognito user found
            mockCognitoClient.send.mockResolvedValueOnce({
                Username: 'user-123',
                UserAttributes: [
                    { Name: 'email', Value: 'test@example.com' },
                    { Name: 'given_name', Value: 'John' },
                    { Name: 'family_name', Value: 'Doe' },
                    { Name: 'birthdate', Value: '1990-01-01' },
                    { Name: 'custom:role', Value: 'user' }
                ]
            });

            // Mock DynamoDB user does not exist
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: null
            });

            // Mock DynamoDB put failure
            mockDynamoDB.send.mockRejectedValueOnce(new Error('DynamoDB error'));

            const event = {
                body: JSON.stringify({ email: 'test@example.com' }),
                httpMethod: 'POST'
            } as any;
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to verify account');
        });
    });
});
