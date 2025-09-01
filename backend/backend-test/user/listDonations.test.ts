let listDonations: (event: any) => Promise<any>;

import { createTestTable, createTestUser, createTestDonation, cleanupTestData, TEST_PREFIXES } from '../shared/test-infrastructure';
import { TestDataGenerator } from '../shared/test-utils';

describe('listDonations (user)', () => {
    const testPrefix = TEST_PREFIXES.USER;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';
        process.env.TABLE_NAME = process.env.TABLE_NAME || 'icaf-test-table';
        // Defer import until env vars are set
        const { handler } = await import('../../functions/user/listDonations');
        listDonations = handler;
        await createTestTable();
    });

    afterEach(async () => {
        await cleanupTestData(testPrefix);
    });

    test('returns user donations sorted by timestamp desc', async () => {
        // Arrange
        const userId = TestDataGenerator.generateUserId(testPrefix);
        await createTestUser(userId, { role: 'user' });

        // Create two donations with different timestamps
        const donationId1 = TestDataGenerator.generateDonationId(testPrefix);
        await createTestDonation(userId, donationId1, {
            amount_cents: 2500, // $25.00
            currency: 'USD',
            timestamp: '2025-01-01T10:00:00.000Z'
        });

        const donationId2 = TestDataGenerator.generateDonationId(testPrefix);
        await createTestDonation(userId, donationId2, {
            amount_cents: 5000, // $50.00
            currency: 'USD',
            timestamp: '2025-01-02T10:00:00.000Z'
        });

        // Act
        const event = {
            requestContext: { authorizer: { claims: { sub: userId } } },
            queryStringParameters: { limit: '20' }
        } as any;
        const res = await listDonations(event);

        // Assert
        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(Array.isArray(body.donations)).toBe(true);
        expect(body.donations.length).toBe(2);

        // Should be sorted by timestamp desc (most recent first)
        expect(body.donations[0].timestamp >= body.donations[1].timestamp).toBe(true);
        expect(body.donations[0].donation_id).toBe(donationId2);
        expect(body.donations[1].donation_id).toBe(donationId1);

        // Check response structure
        expect(body.donations[0]).toMatchObject({
            donation_id: expect.any(String),
            amount_cent: 5000,
            timestamp: '2025-01-02T10:00:00.000Z',
            currency: 'USD'
        });

        expect(body.total_amount_cent).toBe(7500); // $25 + $50 = $75
        expect(body.last_evaluated_key).toBeUndefined(); // No pagination needed
    });

    test('401 when unauthenticated', async () => {
        const res = await listDonations({} as any);
        expect(res.statusCode).toBe(401);
        const body = JSON.parse(res.body);
        expect(body.message).toBe('Unauthorized');
    });

    test('200 with empty donations when user has no donations', async () => {
        const userId = TestDataGenerator.generateUserId(testPrefix);
        await createTestUser(userId, { role: 'user' });

        const res = await listDonations({
            requestContext: { authorizer: { claims: { sub: userId } } },
            queryStringParameters: { limit: '20' }
        } as any);

        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(Array.isArray(body.donations)).toBe(true);
        expect(body.donations.length).toBe(0);
        expect(body.total_amount_cent).toBe(0);
        expect(body.last_evaluated_key).toBeUndefined();
    });

    test('200 with pagination support', async () => {
        const userId = TestDataGenerator.generateUserId(testPrefix);
        await createTestUser(userId, { role: 'user' });

        // Create 3 donations
        const donationId1 = TestDataGenerator.generateDonationId(testPrefix);
        await createTestDonation(userId, donationId1, {
            amount_cents: 1000,
            currency: 'USD',
            timestamp: '2025-01-01T10:00:00.000Z'
        });

        const donationId2 = TestDataGenerator.generateDonationId(testPrefix);
        await createTestDonation(userId, donationId2, {
            amount_cents: 2000,
            currency: 'USD',
            timestamp: '2025-01-02T10:00:00.000Z'
        });

        const donationId3 = TestDataGenerator.generateDonationId(testPrefix);
        await createTestDonation(userId, donationId3, {
            amount_cents: 3000,
            currency: 'USD',
            timestamp: '2025-01-03T10:00:00.000Z'
        });

        // First page with limit=2
        const res1 = await listDonations({
            requestContext: { authorizer: { claims: { sub: userId } } },
            queryStringParameters: { limit: '2' }
        } as any);

        expect(res1.statusCode).toBe(200);
        const body1 = JSON.parse(res1.body);
        expect(body1.donations.length).toBe(2);
        expect(body1.total_amount_cent).toBe(5000); // Most recent 2: $30 + $20 = $50
        expect(body1.last_evaluated_key).toBeDefined();

        // Second page
        const res2 = await listDonations({
            requestContext: { authorizer: { claims: { sub: userId } } },
            queryStringParameters: {
                limit: '2',
                last_evaluated_key: body1.last_evaluated_key
            }
        } as any);

        expect(res2.statusCode).toBe(200);
        const body2 = JSON.parse(res2.body);
        expect(body2.donations.length).toBe(1);
        expect(body2.total_amount_cent).toBe(1000); // Remaining: $10
        expect(body2.last_evaluated_key).toBeUndefined(); // No more pages
    });

    test('handles different currencies correctly', async () => {
        const userId = TestDataGenerator.generateUserId(testPrefix);
        await createTestUser(userId, { role: 'user' });

        const donationId = TestDataGenerator.generateDonationId(testPrefix);
        await createTestDonation(userId, donationId, {
            amount_cents: 1500,
            currency: 'EUR', // Different currency
            timestamp: '2025-01-01T10:00:00.000Z'
        });

        const res = await listDonations({
            requestContext: { authorizer: { claims: { sub: userId } } },
            queryStringParameters: { limit: '20' }
        } as any);

        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(body.donations[0].currency).toBe('EUR');
        expect(body.donations[0].amount_cent).toBe(1500);
    });

    test('500 when internal error occurs', async () => {
        const userId = TestDataGenerator.generateUserId(testPrefix);
        // Mock DDB to throw
        const awsClients = await import('../../config/aws-clients');
        const spy = jest.spyOn(awsClients.dynamodb, 'send') as jest.MockedFunction<any>;
        spy.mockRejectedValueOnce(new Error('boom'));

        const res = await listDonations({
            requestContext: { authorizer: { claims: { sub: userId } } },
            queryStringParameters: { limit: '20' }
        } as any);

        spy.mockRestore();
        expect(res.statusCode).toBe(500);
        const body = JSON.parse(res.body);
        expect(body.message).toBe('Internal server error');
    });

    test('returns correct data structure with all required fields', async () => {
        const userId = TestDataGenerator.generateUserId(testPrefix);
        await createTestUser(userId, { role: 'user' });

        const donationId = TestDataGenerator.generateDonationId(testPrefix);
        await createTestDonation(userId, donationId, {
            amount_cents: 9999,
            currency: 'USD',
            timestamp: '2025-01-15T14:30:00.000Z'
        });

        const res = await listDonations({
            requestContext: { authorizer: { claims: { sub: userId } } },
            queryStringParameters: { limit: '20' }
        } as any);

        expect(res.statusCode).toBe(200);
        expect(res.headers).toEqual({ 'Content-Type': 'application/json' });

        const body = JSON.parse(res.body);

        // Validate response structure
        expect(body).toHaveProperty('donations');
        expect(body).toHaveProperty('total_amount_cent', 9999);
        expect(body.donations).toHaveLength(1);

        const donation = body.donations[0];
        expect(donation).toHaveProperty('donation_id', expect.any(String));
        expect(donation).toHaveProperty('amount_cent', 9999);
        expect(donation).toHaveProperty('timestamp', '2025-01-15T14:30:00.000Z');
        expect(donation).toHaveProperty('currency', 'USD');

        // Type checks
        expect(typeof donation.donation_id).toBe('string');
        expect(typeof donation.amount_cent).toBe('number');
        expect(typeof donation.timestamp).toBe('string');
        expect(typeof donation.currency).toBe('string');
    });
});
