let listCurrentSeasonArtwork: (event: any) => Promise<any>;

import { createTestTable, createTestSeason, createTestUser, createTestArtwork, createTestArtPointer, cleanupTestData, TEST_PREFIXES } from '../shared/test-infrastructure';
import { TestDataGenerator } from '../shared/test-utils';

describe('listCurrentSeasonArtwork (user)', () => {
    const testPrefix = TEST_PREFIXES.ARTWORK;
    let testCounter = 0;
    let createdSeasons: string[] = [];

    const getUniqueSeason = (type: 'active' | 'inactive') => {
        testCounter++;
        const season = `SEASON#${type.toUpperCase()}_${testCounter}_${Date.now()}`;
        createdSeasons.push(season);
        return season;
    };

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';
        process.env.TABLE_NAME = process.env.TABLE_NAME || 'icaf-test-table';
        // Defer require until env vars are set
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        listCurrentSeasonArtwork = require('../../functions/user/listCurrentSeasonArtwork').handler;
        await createTestTable();
    });

    afterEach(async () => {
        await cleanupTestData(testPrefix);

        // Clean up seasons manually since they have PK: 'SEASON' and won't be caught by prefix cleanup
        const { docClient } = require('../shared/test-infrastructure');
        const { DeleteCommand } = require('@aws-sdk/lib-dynamodb');

        for (const season of createdSeasons) {
            const isActive = season.includes('ACTIVE') ? 'true' : 'false';
            const sk = `#ACTIVE#${isActive}#SEASON#${season}`;

            try {
                await docClient.send(new DeleteCommand({
                    TableName: process.env.TABLE_NAME || 'icaf-test-table',
                    Key: { PK: 'SEASON', SK: sk }
                }));
            } catch (error) {
                // Ignore errors if season doesn't exist - this is expected for cleanup
                console.debug('Season cleanup error (ignored):', error);
            }
        }
        createdSeasons = [];
    });

    test('returns the user\'s artwork submission for the current active season', async () => {
        const activeSeason = getUniqueSeason('active');
        const inactiveSeason = getUniqueSeason('inactive');
        // Arrange active and inactive seasons
        await createTestSeason(activeSeason, { is_active: true });
        await createTestSeason(inactiveSeason, { is_active: false });

        // Create user and artwork in active season
        const userId = TestDataGenerator.generateUserId(testPrefix);
        await createTestUser(userId, { role: 'user' });
        const artId = TestDataGenerator.generateArtworkId(testPrefix);
        const knownTs = '2025-02-03T10:00:00.000Z';
        await createTestArtwork(artId, userId, {
            season: activeSeason,
            title: 'My Active Art',
            timestamp: knownTs,
            is_approved: true,
            votes: 3
        });
        await createTestArtPointer(userId, activeSeason, artId);

        // Act
        const res = await listCurrentSeasonArtwork({
            requestContext: { authorizer: { claims: { sub: userId } } }
        } as any);

        // Assert
        expect(res.statusCode).toBe(201);
        const body = JSON.parse(res.body);
        expect(body).toMatchObject({
            art_id: artId,
            title: 'My Active Art',
            timestamp: knownTs,
            is_approved: true,
            votes: 3,
            season: activeSeason
        });
    });

    test('400 when unauthenticated', async () => {
        const res = await listCurrentSeasonArtwork({} as any);
        expect(res.statusCode).toBe(400);
        const body = JSON.parse(res.body);
        expect(body.message).toBe('Bad Request');
    });

    test('400 when user has no submission in any active season', async () => {
        // Note: Other tests may have left active seasons in DB, which is realistic
        // This test verifies behavior when user has no artwork in any active season

        const userId = TestDataGenerator.generateUserId(testPrefix);
        await createTestUser(userId, { role: 'user' });

        const res = await listCurrentSeasonArtwork({
            requestContext: { authorizer: { claims: { sub: userId } } }
        } as any);

        expect(res.statusCode).toBe(400);
        const body = JSON.parse(res.body);
        expect(body.message).toBe('No submission for active season');
    });

    test('400 when user has no submission for the active season', async () => {
        const activeSeason = getUniqueSeason('active');
        await createTestSeason(activeSeason, { is_active: true });
        const userId = TestDataGenerator.generateUserId(testPrefix);
        await createTestUser(userId, { role: 'user' });

        const res = await listCurrentSeasonArtwork({
            requestContext: { authorizer: { claims: { sub: userId } } }
        } as any);

        expect(res.statusCode).toBe(400);
        const body = JSON.parse(res.body);
        expect(body.message).toBe('No submission for active season');
    });

    test('400 when submission artwork entity does not exist', async () => {
        const activeSeason = getUniqueSeason('active');
        await createTestSeason(activeSeason, { is_active: true });

        const userId = TestDataGenerator.generateUserId(testPrefix);
        await createTestUser(userId, { role: 'user' });
        const artId = TestDataGenerator.generateArtworkId(testPrefix);

        // Create pointer but no artwork entity
        await createTestArtPointer(userId, activeSeason, artId);

        const res = await listCurrentSeasonArtwork({
            requestContext: { authorizer: { claims: { sub: userId } } }
        } as any);

        expect(res.statusCode).toBe(400);
        const body = JSON.parse(res.body);
        expect(body.message).toBe('Submission not found');
    });

    test('500 when internal error occurs', async () => {
        const userId = TestDataGenerator.generateUserId(testPrefix);
        // Mock DDB to throw once
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const awsClients = require('../../config/aws-clients');
        const spy = jest.spyOn(awsClients.dynamodb, 'send').mockRejectedValueOnce(new Error('boom'));

        const res = await listCurrentSeasonArtwork({
            requestContext: { authorizer: { claims: { sub: userId } } }
        } as any);

        spy.mockRestore();
        expect(res.statusCode).toBe(500);
        const body = JSON.parse(res.body);
        expect(body.message).toBe('Internal server error');
    });

    test('returns correct data structure with all required fields', async () => {
        const activeSeason = getUniqueSeason('active');
        await createTestSeason(activeSeason, { is_active: true });

        const userId = TestDataGenerator.generateUserId(testPrefix);
        await createTestUser(userId, { role: 'user' });
        const artId = TestDataGenerator.generateArtworkId(testPrefix);
        const knownTs = '2025-01-15T14:30:00.000Z';

        await createTestArtwork(artId, userId, {
            season: activeSeason,
            title: 'Test Structure Art',
            timestamp: knownTs,
            is_approved: false,
            votes: 0
        });
        await createTestArtPointer(userId, activeSeason, artId);

        const res = await listCurrentSeasonArtwork({
            requestContext: { authorizer: { claims: { sub: userId } } }
        } as any);

        expect(res.statusCode).toBe(201);
        expect(res.headers).toEqual({ 'Content-Type': 'application/json' });

        const body = JSON.parse(res.body);

        // Validate response structure
        expect(body).toHaveProperty('art_id', artId);
        expect(body).toHaveProperty('title', 'Test Structure Art');
        expect(body).toHaveProperty('timestamp', knownTs);
        expect(body).toHaveProperty('is_approved', false);
        expect(body).toHaveProperty('votes', 0);
        expect(body).toHaveProperty('season', activeSeason);

        // Validate data types
        expect(typeof body.art_id).toBe('string');
        expect(typeof body.title).toBe('string');
        expect(typeof body.timestamp).toBe('string');
        expect(typeof body.is_approved).toBe('boolean');
        expect(typeof body.votes).toBe('number');
        expect(typeof body.season).toBe('string');
    });
});
