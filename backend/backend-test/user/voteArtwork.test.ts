/**
 * Vote Artwork Test
 * 
 * Tests the essential functionality for users voting on artwork
 * Uses real Lambda handler for integration testing
 */

let voteArtwork: (event: any) => Promise<any>;

import { PRESET_TEST_DATA, PresetEvents, TempTestData } from '../shared/simple-test-helpers';
import { createTestTable, createTestSeason, createTestUser, createTestArtwork, cleanupTestData, TEST_PREFIXES } from '../shared/test-infrastructure';
import { TestDataGenerator } from '../shared/test-utils';

describe('voteArtwork (user)', () => {
    const testPrefix = TEST_PREFIXES.ARTWORK;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';
        process.env.TABLE_NAME = process.env.TABLE_NAME || 'icaf-test-table';
        // Defer require until env vars are set
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        voteArtwork = require('../../functions/user/voteArtwork').handler;
        await createTestTable();
    });

    afterEach(async () => {
        await cleanupTestData(testPrefix);
        await TempTestData.cleanup('VOTE_TEST');
    });

    describe('Authentication Tests', () => {
        test('✅ should successfully vote for artwork when authenticated', async () => {
            // Create test data
            const activeSeason = TestDataGenerator.generateSeason('TEST_SEASON');
            const userId = TestDataGenerator.generateUserId(testPrefix);
            const artId = TestDataGenerator.generateArtworkId(testPrefix);
            const otherUserId = TestDataGenerator.generateUserId(testPrefix);

            await createTestSeason(activeSeason, { is_active: true });
            await createTestUser(userId);
            await createTestUser(otherUserId);
            await createTestArtwork(artId, otherUserId, {
                season: activeSeason,
                is_approved: true,
                votes: 5
            });

            const event = {
                requestContext: {
                    authorizer: {
                        claims: { sub: userId }
                    }
                },
                pathParameters: { art_id: artId },
                httpMethod: 'POST'
            };

            const response = await voteArtwork(event);

            expect(response.statusCode).toBe(201);
            expect(response.headers['Content-Type']).toBe('application/json');

            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
            expect(body.vote_id).toBeDefined();
            expect(body.art_id).toBe(artId);
            expect(body.new_vote_count).toBe(6);
            expect(body.message).toContain('successfully');
            expect(body.timestamp).toBeDefined();
        });

        test('❌ should reject unauthenticated request', async () => {
            const event = {
                requestContext: {},
                pathParameters: { art_id: 'test_art' },
                httpMethod: 'POST'
            };

            const response = await voteArtwork(event);

            expect(response.statusCode).toBe(401);
            expect(response.headers['Content-Type']).toBe('application/json');

            const body = JSON.parse(response.body);
            expect(body.message).toBe('Unauthorized');
        });
    });

    describe('Validation Tests', () => {
        test('❌ should reject vote for non-existent artwork', async () => {
            const userId = TestDataGenerator.generateUserId(testPrefix);
            await createTestUser(userId);

            const event = {
                requestContext: {
                    authorizer: {
                        claims: { sub: userId }
                    }
                },
                pathParameters: { art_id: 'NON_EXISTENT_ART' },
                httpMethod: 'POST'
            };

            const response = await voteArtwork(event);

            expect(response.statusCode).toBe(400);
            expect(response.headers['Content-Type']).toBe('application/json');

            const body = JSON.parse(response.body);
            expect(body.message).toBe('Artwork not found');
        });

        test('❌ should reject duplicate vote', async () => {
            // Create test data
            const activeSeason = TestDataGenerator.generateSeason('TEST_SEASON');
            const userId = TestDataGenerator.generateUserId(testPrefix);
            const artId = TestDataGenerator.generateArtworkId(testPrefix);
            const otherUserId = TestDataGenerator.generateUserId(testPrefix);

            await createTestSeason(activeSeason, { is_active: true });
            await createTestUser(userId);
            await createTestUser(otherUserId);
            await createTestArtwork(artId, otherUserId, {
                season: activeSeason,
                is_approved: true,
                votes: 1
            });

            const event = {
                requestContext: {
                    authorizer: {
                        claims: { sub: userId }
                    }
                },
                pathParameters: { art_id: artId },
                httpMethod: 'POST'
            };

            // First vote should succeed
            const firstResponse = await voteArtwork(event);
            expect(firstResponse.statusCode).toBe(201);

            // Second vote should fail
            const secondResponse = await voteArtwork(event);
            expect(secondResponse.statusCode).toBe(400);

            const body = JSON.parse(secondResponse.body);
            expect(body.message).toBe('Already voted for this artwork');
        });

        test('❌ should reject vote for own artwork', async () => {
            // Create test data
            const activeSeason = TestDataGenerator.generateSeason('TEST_SEASON');
            const userId = TestDataGenerator.generateUserId(testPrefix);
            const artId = TestDataGenerator.generateArtworkId(testPrefix);

            await createTestSeason(activeSeason, { is_active: true });
            await createTestUser(userId);
            await createTestArtwork(artId, userId, {
                season: activeSeason,
                is_approved: true,
                votes: 0
            });

            const event = {
                requestContext: {
                    authorizer: {
                        claims: { sub: userId }
                    }
                },
                pathParameters: { art_id: artId },
                httpMethod: 'POST'
            };

            const response = await voteArtwork(event);

            expect(response.statusCode).toBe(403);
            expect(response.headers['Content-Type']).toBe('application/json');

            const body = JSON.parse(response.body);
            expect(body.message).toBe('Cannot vote for your own artwork');
        });

        test('❌ should reject request without artwork ID', async () => {
            const userId = TestDataGenerator.generateUserId(testPrefix);
            await createTestUser(userId);

            const event = {
                requestContext: {
                    authorizer: {
                        claims: { sub: userId }
                    }
                },
                pathParameters: {},
                httpMethod: 'POST'
            };

            const response = await voteArtwork(event);

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.body);
            expect(body.message).toBe('Artwork ID is required');
        });
    });

    describe('Business Logic Tests', () => {
        test('❌ should reject vote for unapproved artwork', async () => {
            // Create test data
            const activeSeason = TestDataGenerator.generateSeason('TEST_SEASON');
            const userId = TestDataGenerator.generateUserId(testPrefix);
            const artId = TestDataGenerator.generateArtworkId(testPrefix);
            const otherUserId = TestDataGenerator.generateUserId(testPrefix);

            await createTestSeason(activeSeason, { is_active: true });
            await createTestUser(userId);
            await createTestUser(otherUserId);
            await createTestArtwork(artId, otherUserId, {
                season: activeSeason,
                is_approved: false, // Not approved
                votes: 0
            });

            const event = {
                requestContext: {
                    authorizer: {
                        claims: { sub: userId }
                    }
                },
                pathParameters: { art_id: artId },
                httpMethod: 'POST'
            };

            const response = await voteArtwork(event);

            expect(response.statusCode).toBe(403);
            expect(response.headers['Content-Type']).toBe('application/json');

            const body = JSON.parse(response.body);
            expect(body.message).toBe('Cannot vote for unapproved artwork');
        });

        test('❌ should reject vote for artwork not in active season', async () => {
            // Create test data
            const inactiveSeason = TestDataGenerator.generateSeason('TEST_SEASON');
            const userId = TestDataGenerator.generateUserId(testPrefix);
            const artId = TestDataGenerator.generateArtworkId(testPrefix);
            const otherUserId = TestDataGenerator.generateUserId(testPrefix);

            await createTestSeason(inactiveSeason, { is_active: false }); // Inactive season
            await createTestUser(userId);
            await createTestUser(otherUserId);
            await createTestArtwork(artId, otherUserId, {
                season: inactiveSeason,
                is_approved: true,
                votes: 0
            });

            const event = {
                requestContext: {
                    authorizer: {
                        claims: { sub: userId }
                    }
                },
                pathParameters: { art_id: artId },
                httpMethod: 'POST'
            };

            const response = await voteArtwork(event);

            expect(response.statusCode).toBe(403);
            expect(response.headers['Content-Type']).toBe('application/json');

            const body = JSON.parse(response.body);
            expect(body.message).toBe('Voting not allowed for this season');
        });

        test('✅ should correctly increment vote count', async () => {
            // Create test data
            const activeSeason = TestDataGenerator.generateSeason('TEST_SEASON');
            const userId = TestDataGenerator.generateUserId(testPrefix);
            const artId = TestDataGenerator.generateArtworkId(testPrefix);
            const otherUserId = TestDataGenerator.generateUserId(testPrefix);

            await createTestSeason(activeSeason, { is_active: true });
            await createTestUser(userId);
            await createTestUser(otherUserId);
            await createTestArtwork(artId, otherUserId, {
                season: activeSeason,
                is_approved: true,
                votes: 10 // Starting vote count
            });

            const event = {
                requestContext: {
                    authorizer: {
                        claims: { sub: userId }
                    }
                },
                pathParameters: { art_id: artId },
                httpMethod: 'POST'
            };

            const response = await voteArtwork(event);

            expect(response.statusCode).toBe(201);
            expect(response.headers['Content-Type']).toBe('application/json');

            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
            expect(body.new_vote_count).toBe(11); // Should be incremented
            expect(typeof body.new_vote_count).toBe('number');
        });
    });

    describe('Integration Tests with Preset Data', () => {
        test('should work with preset artwork data', () => {
            // Verify preset data exists and is properly formatted
            expect(PRESET_TEST_DATA.artworks.APPROVED_ARTWORK).toBeDefined();
            expect(PRESET_TEST_DATA.artworks.PENDING_ARTWORK).toBeDefined();
            expect(PRESET_TEST_DATA.users.ADULT_USER).toBeDefined();
            expect(PRESET_TEST_DATA.users.CHILD_USER).toBeDefined();
            expect(PRESET_TEST_DATA.seasons.CURRENT_SEASON).toBeDefined();
        });

        test('should generate valid events for different user types', () => {
            const childEvent = PresetEvents.childUser();
            const adultEvent = PresetEvents.adultUser();
            const guardianEvent = PresetEvents.guardianUser();

            expect(childEvent.requestContext.authorizer.claims.sub).toBe(PRESET_TEST_DATA.users.CHILD_USER);
            expect(adultEvent.requestContext.authorizer.claims.sub).toBe(PRESET_TEST_DATA.users.ADULT_USER);
            expect(guardianEvent.requestContext.authorizer.claims.sub).toBe(PRESET_TEST_DATA.users.GUARDIAN_USER);
        });
    });
});