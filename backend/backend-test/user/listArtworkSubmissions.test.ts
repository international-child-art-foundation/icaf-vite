let listArtworkSubmissions: (event: any) => Promise<any>;
import { createTestTable, createTestArtwork, createTestArtPointer, createTestSeason } from '../shared/test-infrastructure';
import { TestDataGenerator, SEASON_TEMPLATES } from '../shared/test-utils';

describe('listArtworkSubmissions (user)', () => {
    const activeSeason = '2024FIFA';
    const inactiveSeason = '2023FIFA';

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';
        process.env.TABLE_NAME = process.env.TABLE_NAME || 'icaf-test-table';
        // Defer requiring the handler until env vars are set so TABLE_NAME is defined
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        listArtworkSubmissions = require('../../functions/user/listArtworkSubmissions').handler;
        await createTestTable();
    });

    test('returns most recent artworks sorted by submission_date desc', async () => {
        // Arrange test data
        const userId = TestDataGenerator.generateUserId('TEST_USER');

        // Ensure seasons exist with correct active flags
        await createTestSeason(activeSeason, { ...SEASON_TEMPLATES.current, is_active: true });
        await createTestSeason(inactiveSeason, { ...SEASON_TEMPLATES.past, is_active: false });

        // Create two artworks and pointers (different seasons, timestamps)
        const artId1 = TestDataGenerator.generateArtworkId('TEST_USER');
        await createTestArtwork(artId1, userId, {
            season: activeSeason,
            title: 'Active Season Artwork',
            timestamp: '2025-01-02T00:00:00.000Z'
        });
        await createTestArtPointer(userId, activeSeason, artId1);

        const artId2 = TestDataGenerator.generateArtworkId('TEST_USER');
        await createTestArtwork(artId2, userId, {
            season: inactiveSeason,
            title: 'Inactive Season Artwork',
            timestamp: '2025-01-01T00:00:00.000Z'
        });
        await createTestArtPointer(userId, inactiveSeason, artId2);

        // Act
        const event = {
            requestContext: { authorizer: { claims: { sub: userId } } },
            queryStringParameters: { limit: '20' }
        } as any;
        const res = await listArtworkSubmissions(event);

        // Assert
        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(Array.isArray(body.artworks)).toBe(true);
        expect(body.artworks.length).toBeGreaterThanOrEqual(2);

        // Sorted by submission_date desc
        expect(body.artworks[0].submission_date >= body.artworks[1].submission_date).toBe(true);

        // Contains expected fields aligned with API schema (must include season from DB schema)
        const a = body.artworks.find((s: any) => s.season === activeSeason);
        const b = body.artworks.find((s: any) => s.season === inactiveSeason);
        expect(a).toBeTruthy();
        expect(b).toBeTruthy();
        expect(a.season).toBe(activeSeason);
        expect(b.season).toBe(inactiveSeason);
    }, 30000);

    test('401 when unauthenticated', async () => {
        const res = await listArtworkSubmissions({} as any);
        expect(res.statusCode).toBe(401);
    });

    test('200 with empty artworks when user has no submissions', async () => {
        const userId = TestDataGenerator.generateUserId('TEST_USER');
        const res = await listArtworkSubmissions({
            requestContext: { authorizer: { claims: { sub: userId } } },
            queryStringParameters: { limit: '20' }
        } as any);
        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(Array.isArray(body.artworks)).toBe(true);
        expect(body.artworks.length).toBe(0);
        expect(body.last_evaluated_key).toBeUndefined();
    });

    test('200 with pagination (returns last_evaluated_key)', async () => {
        const userId = TestDataGenerator.generateUserId('TEST_USER');

        // Create two artworks and pointers
        const artIdA = TestDataGenerator.generateArtworkId('TEST_USER');
        await createTestArtwork(artIdA, userId, { season: activeSeason, title: 'A', timestamp: '2025-01-01T00:00:00.000Z' });
        await createTestArtPointer(userId, activeSeason, artIdA);

        const artIdB = TestDataGenerator.generateArtworkId('TEST_USER');
        await createTestArtwork(artIdB, userId, { season: inactiveSeason, title: 'B', timestamp: '2025-01-02T00:00:00.000Z' });
        await createTestArtPointer(userId, inactiveSeason, artIdB);

        // First page limit=1
        const res1 = await listArtworkSubmissions({
            requestContext: { authorizer: { claims: { sub: userId } } },
            queryStringParameters: { limit: '1' }
        } as any);
        expect(res1.statusCode).toBe(200);
        const body1 = JSON.parse(res1.body);
        expect(body1.artworks.length).toBe(1);
        expect(body1.pagination.has_more).toBe(true);
        expect(typeof body1.pagination.last_evaluated_key === 'string' && body1.pagination.last_evaluated_key.length > 0).toBe(true);

        // Second page with cursor
        const res2 = await listArtworkSubmissions({
            requestContext: { authorizer: { claims: { sub: userId } } },
            queryStringParameters: { limit: '1', last_evaluated_key: body1.pagination.last_evaluated_key }
        } as any);
        expect(res2.statusCode).toBe(200);
        const body2 = JSON.parse(res2.body);
        expect(body2.artworks.length).toBeGreaterThanOrEqual(1);
    }, 30000);

    test('500 when internal error occurs', async () => {
        const userId = TestDataGenerator.generateUserId('TEST_USER');
        // Mock DDB to throw on the second call (the critical user query)
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const awsClients = require('../../config/aws-clients');
        const spy = jest.spyOn(awsClients.dynamodb, 'send')
            .mockResolvedValueOnce({ Items: [] }) // First call (seasons) succeeds
            .mockRejectedValueOnce(new Error('boom')); // Second call (user pointers) fails
        const res = await listArtworkSubmissions({
            requestContext: { authorizer: { claims: { sub: userId } } },
            queryStringParameters: { limit: '20' }
        } as any);
        spy.mockRestore();
        expect(res.statusCode).toBe(500);
    }, 30000);
});


