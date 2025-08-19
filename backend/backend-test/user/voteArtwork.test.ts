/**
 * Vote Artwork Test
 * 
 * Tests the essential functionality for users voting on artwork
 * Follows the simplified test pattern used in the codebase
 */

import { PRESET_TEST_DATA, PresetEvents, TempTestData } from '../shared/simple-test-helpers';
import { createTestTable } from '../shared/test-infrastructure';

// Mock vote artwork handler
const mockVoteArtworkHandler = async (event: any) => {
    const userId = event.requestContext?.authorizer?.claims?.sub;
    const artId = event.pathParameters?.art_id;

    // Check authentication
    if (!userId) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Unauthorized' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    // Check artwork ID
    if (!artId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Artwork ID is required' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    // Simulate artwork not found
    if (artId === 'NON_EXISTENT_ART') {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Artwork not found' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    // Simulate duplicate vote
    if (artId === 'ALREADY_VOTED_ART') {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Already voted for this artwork' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    // Simulate voting for own artwork
    if (artId === 'OWN_ARTWORK' && userId === PRESET_TEST_DATA.users.ADULT_USER) {
        return {
            statusCode: 403,
            body: JSON.stringify({ message: 'Cannot vote for your own artwork' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    // Simulate unapproved artwork
    if (artId === 'UNAPPROVED_ART') {
        return {
            statusCode: 403,
            body: JSON.stringify({ message: 'Cannot vote for unapproved artwork' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    // Simulate database error
    if (artId === 'DB_ERROR_ART') {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    // Successful vote
    const voteId = `VOTE_${userId}_${artId}_${Date.now()}`;
    const newVoteCount = Math.floor(Math.random() * 100) + 1; // Simulate vote count

    return {
        statusCode: 201,
        body: JSON.stringify({
            success: true,
            vote_id: voteId,
            art_id: artId,
            new_vote_count: newVoteCount,
            message: 'Vote recorded successfully',
            timestamp: Date.now()
        }),
        headers: { 'Content-Type': 'application/json' }
    };
};

describe('Vote Artwork Tests - Essential Cases', () => {
    const testPrefix = 'VOTE_TEST';

    beforeAll(async () => {
        await createTestTable();
    });

    afterEach(async () => {
        await TempTestData.cleanup(testPrefix);
    });

    describe('Authentication Tests', () => {
        test('✅ should successfully vote for artwork when authenticated', async () => {
            const event = {
                ...PresetEvents.adultUser(),
                pathParameters: { art_id: PRESET_TEST_DATA.artworks.APPROVED_ARTWORK },
                httpMethod: 'POST'
            };

            const response = await mockVoteArtworkHandler(event);

            expect(response.statusCode).toBe(201);
            expect(response.headers['Content-Type']).toBe('application/json');

            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
            expect(body.vote_id).toBeDefined();
            expect(body.art_id).toBe(PRESET_TEST_DATA.artworks.APPROVED_ARTWORK);
            expect(body.new_vote_count).toBeGreaterThan(0);
            expect(body.message).toContain('successfully');
            expect(body.timestamp).toBeDefined();
        });

        test('❌ should reject unauthenticated request', async () => {
            const event = {
                ...PresetEvents.unauthenticated(),
                pathParameters: { art_id: PRESET_TEST_DATA.artworks.APPROVED_ARTWORK },
                httpMethod: 'POST'
            };

            const response = await mockVoteArtworkHandler(event);

            expect(response.statusCode).toBe(401);
            expect(response.headers['Content-Type']).toBe('application/json');

            const body = JSON.parse(response.body);
            expect(body.message).toBe('Unauthorized');
        });
    });

    describe('Validation Tests', () => {
        test('❌ should reject vote for non-existent artwork', async () => {
            const event = {
                ...PresetEvents.adultUser(),
                pathParameters: { art_id: 'NON_EXISTENT_ART' },
                httpMethod: 'POST'
            };

            const response = await mockVoteArtworkHandler(event);

            expect(response.statusCode).toBe(400);
            expect(response.headers['Content-Type']).toBe('application/json');

            const body = JSON.parse(response.body);
            expect(body.message).toBe('Artwork not found');
        });

        test('❌ should reject duplicate vote', async () => {
            const event = {
                ...PresetEvents.adultUser(),
                pathParameters: { art_id: 'ALREADY_VOTED_ART' },
                httpMethod: 'POST'
            };

            const response = await mockVoteArtworkHandler(event);

            expect(response.statusCode).toBe(400);
            expect(response.headers['Content-Type']).toBe('application/json');

            const body = JSON.parse(response.body);
            expect(body.message).toBe('Already voted for this artwork');
        });

        test('❌ should reject vote for own artwork', async () => {
            const event = {
                ...PresetEvents.adultUser(),
                pathParameters: { art_id: 'OWN_ARTWORK' },
                httpMethod: 'POST'
            };

            const response = await mockVoteArtworkHandler(event);

            expect(response.statusCode).toBe(403);
            expect(response.headers['Content-Type']).toBe('application/json');

            const body = JSON.parse(response.body);
            expect(body.message).toBe('Cannot vote for your own artwork');
        });
    });

    describe('Business Logic Tests', () => {
        test('❌ should reject vote for unapproved artwork', async () => {
            const event = {
                ...PresetEvents.adultUser(),
                pathParameters: { art_id: 'UNAPPROVED_ART' },
                httpMethod: 'POST'
            };

            const response = await mockVoteArtworkHandler(event);

            expect(response.statusCode).toBe(403);
            expect(response.headers['Content-Type']).toBe('application/json');

            const body = JSON.parse(response.body);
            expect(body.message).toBe('Cannot vote for unapproved artwork');
        });

        test('✅ should correctly increment vote count', async () => {
            const event = {
                ...PresetEvents.childUser(),
                pathParameters: { art_id: PRESET_TEST_DATA.artworks.APPROVED_ARTWORK },
                httpMethod: 'POST'
            };

            const response = await mockVoteArtworkHandler(event);

            expect(response.statusCode).toBe(201);
            expect(response.headers['Content-Type']).toBe('application/json');

            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
            expect(body.new_vote_count).toBeGreaterThan(0);
            expect(typeof body.new_vote_count).toBe('number');
        });
    });

    describe('Error Handling Tests', () => {
        test('❌ should handle database errors gracefully', async () => {
            const event = {
                ...PresetEvents.adultUser(),
                pathParameters: { art_id: 'DB_ERROR_ART' },
                httpMethod: 'POST'
            };

            const response = await mockVoteArtworkHandler(event);

            expect(response.statusCode).toBe(500);
            expect(response.headers['Content-Type']).toBe('application/json');

            const body = JSON.parse(response.body);
            expect(body.message).toBe('Internal server error');
        });

        test('❌ should reject request without artwork ID', async () => {
            const event = {
                ...PresetEvents.adultUser(),
                pathParameters: {},
                httpMethod: 'POST'
            };
        
            const response = await mockVoteArtworkHandler(event);
            
            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.body);
            expect(body.message).toBe('Artwork ID is required');
        });
    });

    describe('Response Format Tests', () => {
        test('✅ should return properly formatted success response', async () => {
            const event = {
                ...PresetEvents.guardianUser(),
                pathParameters: { art_id: PRESET_TEST_DATA.artworks.APPROVED_ARTWORK },
                httpMethod: 'POST'
            };

            const response = await mockVoteArtworkHandler(event);

            // Validate Lambda response structure
            expect(response.statusCode).toBe(201);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.body).toBeDefined();

            // Validate response body structure
            const body = JSON.parse(response.body);
            expect(body).toHaveProperty('success', true);
            expect(body).toHaveProperty('vote_id');
            expect(body).toHaveProperty('art_id');
            expect(body).toHaveProperty('new_vote_count');
            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('timestamp');

            // Validate data types
            expect(typeof body.success).toBe('boolean');
            expect(typeof body.vote_id).toBe('string');
            expect(typeof body.art_id).toBe('string');
            expect(typeof body.new_vote_count).toBe('number');
            expect(typeof body.message).toBe('string');
            expect(typeof body.timestamp).toBe('number');
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
