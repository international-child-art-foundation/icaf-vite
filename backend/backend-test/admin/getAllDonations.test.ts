// Mock DynamoDB
const mockDynamoDB = {
    send: jest.fn()
};

jest.mock('../../config/aws-clients', () => ({
    dynamodb: mockDynamoDB,
    TABLE_NAME: 'test-table'
}));

import { handler } from '../../functions/admin/getAllDonations';
import { PresetEvents } from '../shared/simple-preset-db';
import { AdminGetAllDonationsResponse } from '../../../shared/src/api-types/donationTypes';

describe('getAllDonations (Admin)', () => {
    beforeEach(() => {
        mockDynamoDB.send.mockReset();
    });

    describe('Authentication and Authorization', () => {
        it('should return 401 when no user ID in context', async () => {
            const event = {
                ...PresetEvents.createGetEvent('ADMIN_USER'),
                requestContext: { authorizer: { claims: {} } }
            };
            const response = await handler(event);

            expect(response.statusCode).toBe(401);
            expect(response.body).toContain('Unauthorized');
        });

        it('should return 403 when user is not admin', async () => {
            // Mock non-admin user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'user',
                    f_name: 'Test',
                    l_name: 'User'
                }
            });

            const event = PresetEvents.createGetEvent('ADULT_USER');
            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Admin access required');
        });
    });

    describe('Successful Retrieval', () => {
        beforeEach(() => {
            // Mock admin user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'admin',
                    f_name: 'Admin',
                    l_name: 'User'
                }
            });
        });

        it('should return all donations with summary', async () => {
            // Mock scan result with donations
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    {
                        PK: 'USER#user1',
                        SK: 'DONATION#donation1',
                        donation_id: 'donation1',
                        user_id: 'user1',
                        amount_cents: 5000,
                        currency: 'USD',
                        status: 'succeeded',
                        timestamp: '2024-01-15T10:00:00.000Z',
                        stripe_id: 'stripe_1',
                        anonymous: false,
                        type: 'DONATION'
                    },
                    {
                        PK: 'USER#user2',
                        SK: 'DONATION#donation2',
                        donation_id: 'donation2',
                        user_id: 'user2',
                        amount_cents: 10000,
                        currency: 'USD',
                        status: 'succeeded',
                        timestamp: '2024-01-20T12:00:00.000Z',
                        stripe_id: 'stripe_2',
                        message: 'Great cause!',
                        anonymous: true,
                        type: 'DONATION'
                    },
                    {
                        PK: 'USER#user3',
                        SK: 'DONATION#donation3',
                        donation_id: 'donation3',
                        user_id: 'user3',
                        amount_cents: 2500,
                        currency: 'USD',
                        status: 'pending',
                        timestamp: '2024-01-25T14:00:00.000Z',
                        anonymous: false,
                        type: 'DONATION'
                    }
                ],
                LastEvaluatedKey: undefined
            });

            // Mock batch get for user profiles
            mockDynamoDB.send.mockResolvedValueOnce({
                Responses: {
                    'test-table': [
                        {
                            PK: 'USER#user1',
                            SK: 'PROFILE',
                            user_id: 'user1',
                            f_name: 'John',
                            l_name: 'Doe'
                        },
                        {
                            PK: 'USER#user3',
                            SK: 'PROFILE',
                            user_id: 'user3',
                            f_name: 'Jane',
                            l_name: 'Smith'
                        }
                    ]
                }
            });

            const event = PresetEvents.createGetEvent('ADMIN_USER');
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: AdminGetAllDonationsResponse = JSON.parse(response.body);
            expect(responseBody.donations).toHaveLength(3);
            expect(responseBody.donations[0].donation_id).toBe('donation1');
            expect(responseBody.donations[0].donor_name).toBe('John Doe'); // Not anonymous
            expect(responseBody.donations[1].donor_name).toBeUndefined(); // Anonymous
            expect(responseBody.donations[2].donor_name).toBe('Jane Smith'); // Not anonymous

            // Check summary
            expect(responseBody.summary.total_donations).toBe(3);
            expect(responseBody.summary.total_amount_cents).toBe(17500);
            expect(responseBody.summary.succeeded_count).toBe(2);
            expect(responseBody.summary.succeeded_amount_cents).toBe(15000);
            expect(responseBody.summary.pending_count).toBe(1);
            expect(responseBody.summary.failed_count).toBe(0);

            // Check pagination
            expect(responseBody.pagination.has_more).toBe(false);
        });

        it('should handle empty donation list', async () => {
            // Mock empty scan result
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [],
                LastEvaluatedKey: undefined
            });

            const event = PresetEvents.createGetEvent('ADMIN_USER');
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: AdminGetAllDonationsResponse = JSON.parse(response.body);
            expect(responseBody.donations).toHaveLength(0);
            expect(responseBody.summary.total_donations).toBe(0);
            expect(responseBody.summary.total_amount_cents).toBe(0);
        });

        it('should support pagination', async () => {
            const lastKey = { PK: 'USER#user1', SK: 'DONATION#donation1' };

            // Mock scan result with pagination
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    {
                        donation_id: 'donation2',
                        user_id: 'user2',
                        amount_cents: 5000,
                        currency: 'USD',
                        status: 'succeeded',
                        timestamp: '2024-01-20T12:00:00.000Z',
                        anonymous: true,
                        type: 'DONATION'
                    }
                ],
                LastEvaluatedKey: { PK: 'USER#user2', SK: 'DONATION#donation2' }
            });

            const event = PresetEvents.createGetEvent('ADMIN_USER', {
                last_evaluated_key: encodeURIComponent(JSON.stringify(lastKey))
            });
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: AdminGetAllDonationsResponse = JSON.parse(response.body);
            expect(responseBody.pagination.has_more).toBe(true);
            expect(responseBody.pagination.last_evaluated_key).toBeTruthy();
        });

        it('should filter by status', async () => {
            // Mock scan result filtered by status
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    {
                        donation_id: 'donation1',
                        user_id: 'user1',
                        amount_cents: 5000,
                        currency: 'USD',
                        status: 'succeeded',
                        timestamp: '2024-01-15T10:00:00.000Z',
                        anonymous: false,
                        type: 'DONATION'
                    }
                ],
                LastEvaluatedKey: undefined
            });

            // Mock batch get for user profiles
            mockDynamoDB.send.mockResolvedValueOnce({
                Responses: {
                    'test-table': [
                        {
                            user_id: 'user1',
                            f_name: 'John',
                            l_name: 'Doe'
                        }
                    ]
                }
            });

            const event = PresetEvents.createGetEvent('ADMIN_USER', { status: 'succeeded' });
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: AdminGetAllDonationsResponse = JSON.parse(response.body);
            expect(responseBody.donations).toHaveLength(1);
            expect(responseBody.donations[0].status).toBe('succeeded');
        });

        it('should filter by amount range', async () => {
            // Mock scan result filtered by amount
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    {
                        donation_id: 'donation1',
                        user_id: 'user1',
                        amount_cents: 7500,
                        currency: 'USD',
                        status: 'succeeded',
                        timestamp: '2024-01-15T10:00:00.000Z',
                        anonymous: true,
                        type: 'DONATION'
                    }
                ],
                LastEvaluatedKey: undefined
            });

            const event = PresetEvents.createGetEvent('ADMIN_USER', {
                min_amount: '5000',
                max_amount: '10000'
            });
            const response = await handler(event);

            expect(response.statusCode).toBe(200);

            const responseBody: AdminGetAllDonationsResponse = JSON.parse(response.body);
            expect(responseBody.donations).toHaveLength(1);
            expect(responseBody.donations[0].amount_cents).toBe(7500);
        });

        it('should handle batch get user profiles failure gracefully', async () => {
            // Mock scan result with donations
            mockDynamoDB.send.mockResolvedValueOnce({
                Items: [
                    {
                        donation_id: 'donation1',
                        user_id: 'user1',
                        amount_cents: 5000,
                        currency: 'USD',
                        status: 'succeeded',
                        timestamp: '2024-01-15T10:00:00.000Z',
                        anonymous: false,
                        type: 'DONATION'
                    }
                ],
                LastEvaluatedKey: undefined
            });

            // Mock batch get failure
            mockDynamoDB.send.mockRejectedValueOnce(new Error('BatchGet error'));

            const event = PresetEvents.createGetEvent('ADMIN_USER');
            const response = await handler(event);

            // Should still succeed without donor names
            expect(response.statusCode).toBe(200);

            const responseBody: AdminGetAllDonationsResponse = JSON.parse(response.body);
            expect(responseBody.donations).toHaveLength(1);
            expect(responseBody.donations[0].donor_name).toBeUndefined();
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            // Mock admin user
            mockDynamoDB.send.mockResolvedValueOnce({
                Item: {
                    role: 'admin',
                    f_name: 'Admin',
                    l_name: 'User'
                }
            });
        });

        it('should return 500 when scan fails', async () => {
            // Mock scan failure
            mockDynamoDB.send.mockRejectedValueOnce(new Error('DynamoDB error'));

            const event = PresetEvents.createGetEvent('ADMIN_USER');
            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to retrieve donations');
        });
    });
});
