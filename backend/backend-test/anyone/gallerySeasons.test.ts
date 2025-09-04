/**
 * Gallery Seasons API Tests
 * 
 * Tests for the new gallery seasons endpoints:
 * - /api/gallery/seasons/{season}/artworks?sort=newest
 * - /api/gallery/seasons/{season}/artworks?sort=oldest
 * - /api/gallery/seasons/{season}/artworks?sort=highest_votes
 * - /api/gallery/seasons/{season}/artworks?sort=lowest_votes
 */

import { TempTestData } from '../shared/simple-preset-db';
import { handler } from '../../functions/anyone/gallery/gallerySeasons';

describe('Gallery Seasons API tests', () => {
    const testPrefix = 'GALLERY_SEASONS_TEST';
    let testUserIds: string[] = []; // Used for cleanup
    let testSeasonName: string;

    beforeAll(async () => {
        // Create test season
        testSeasonName = '2024FIFA';

        // Create test users and artworks with different timestamps and votes
        const user1 = await TempTestData.createTempUser(`${testPrefix}_user_1`);
        const user2 = await TempTestData.createTempUser(`${testPrefix}_user_2`);
        const user3 = await TempTestData.createTempUser(`${testPrefix}_user_3`);
        testUserIds = [user1, user2, user3];

        // Create artworks with different timestamps and votes
        await TempTestData.createTempArtwork(`${testPrefix}_artwork_1`, user1, {
            season: testSeasonName,
            timestamp: '2024-01-01T10:00:00Z',
            votes: 5,
            is_approved: true
        });

        await TempTestData.createTempArtwork(`${testPrefix}_artwork_2`, user2, {
            season: testSeasonName,
            timestamp: '2024-01-02T10:00:00Z',
            votes: 10,
            is_approved: true
        });

        await TempTestData.createTempArtwork(`${testPrefix}_artwork_3`, user3, {
            season: testSeasonName,
            timestamp: '2024-01-03T10:00:00Z',
            votes: 3,
            is_approved: true
        });
    });

    afterAll(async () => {
        // Clean up test data
        await TempTestData.cleanup(testPrefix);
        // Also clean up individual users if needed
        for (const userId of testUserIds) {
            await TempTestData.cleanup(userId);
        }
    });

    describe('successful requests', () => {
        test('should return newest artworks when sort=newest', async () => {
            const event = {
                pathParameters: { season: testSeasonName },
                queryStringParameters: { sort: 'newest', limit: '20' },
                httpMethod: 'GET'
            };

            const response = await handler(event);
            const responseBody = JSON.parse(response.body);

            expect(response.statusCode).toBe(200);
            expect(responseBody).toHaveProperty('artworks');
            expect(responseBody).toHaveProperty('pagination');
            expect(responseBody.pagination).toHaveProperty('has_more');
            expect(responseBody.pagination).toHaveProperty('last_evaluated_key');
            expect(Array.isArray(responseBody.artworks)).toBe(true);
            expect(responseBody.artworks.length).toBeGreaterThan(0);

            // Verify artwork structure
            const artwork = responseBody.artworks[0];
            expect(artwork).toHaveProperty('art_id');
            expect(artwork).toHaveProperty('title');
            expect(artwork).toHaveProperty('artist_name');
            expect(artwork).toHaveProperty('votes');
            expect(artwork).toHaveProperty('timestamp');
        });

        test('should return oldest artworks when sort=oldest', async () => {
            const event = {
                pathParameters: { season: testSeasonName },
                queryStringParameters: { sort: 'oldest', limit: '20' },
                httpMethod: 'GET'
            };

            const response = await handler(event);
            const responseBody = JSON.parse(response.body);

            expect(response.statusCode).toBe(200);
            expect(responseBody).toHaveProperty('artworks');
            expect(Array.isArray(responseBody.artworks)).toBe(true);
        });

        test('should return highest voted artworks when sort=highest_votes', async () => {
            const event = {
                pathParameters: { season: testSeasonName },
                queryStringParameters: { sort: 'highest_votes', limit: '20' },
                httpMethod: 'GET'
            };

            const response = await handler(event);
            const responseBody = JSON.parse(response.body);

            expect(response.statusCode).toBe(200);
            expect(responseBody).toHaveProperty('artworks');
            expect(Array.isArray(responseBody.artworks)).toBe(true);
        });

        test('should return lowest voted artworks when sort=lowest_votes', async () => {
            const event = {
                pathParameters: { season: testSeasonName },
                queryStringParameters: { sort: 'lowest_votes', limit: '20' },
                httpMethod: 'GET'
            };

            const response = await handler(event);
            const responseBody = JSON.parse(response.body);

            expect(response.statusCode).toBe(200);
            expect(responseBody).toHaveProperty('artworks');
            expect(Array.isArray(responseBody.artworks)).toBe(true);
        });
    });

    describe('parameter validation', () => {
        test('should reject request without season parameter', async () => {
            const event = {
                pathParameters: {},
                queryStringParameters: { sort: 'newest' },
                httpMethod: 'GET'
            };

            const response = await handler(event);
            const responseBody = JSON.parse(response.body);

            expect(response.statusCode).toBe(400);
            expect(responseBody.message).toContain('Season parameter is required');
        });

        test('should reject request without sort parameter', async () => {
            const event = {
                pathParameters: { season: testSeasonName },
                queryStringParameters: {},
                httpMethod: 'GET'
            };

            const response = await handler(event);
            const responseBody = JSON.parse(response.body);

            expect(response.statusCode).toBe(400);
            expect(responseBody.message).toContain('Sort parameter is required');
        });

        test('should reject invalid sort parameter', async () => {
            const event = {
                pathParameters: { season: testSeasonName },
                queryStringParameters: { sort: 'invalid_sort' },
                httpMethod: 'GET'
            };

            const response = await handler(event);
            const responseBody = JSON.parse(response.body);

            expect(response.statusCode).toBe(400);
            expect(responseBody.message).toContain('Invalid sort parameter');
        });

        test('should reject invalid limit parameter', async () => {
            const event = {
                pathParameters: { season: testSeasonName },
                queryStringParameters: { sort: 'newest', limit: 'invalid' },
                httpMethod: 'GET'
            };

            const response = await handler(event);
            const responseBody = JSON.parse(response.body);

            expect(response.statusCode).toBe(400);
            expect(responseBody.message).toContain('Limit must be a number');
        });

        test('should reject limit less than 1', async () => {
            const event = {
                pathParameters: { season: testSeasonName },
                queryStringParameters: { sort: 'newest', limit: '0' },
                httpMethod: 'GET'
            };

            const response = await handler(event);
            const responseBody = JSON.parse(response.body);

            expect(response.statusCode).toBe(400);
            expect(responseBody.message).toContain('Limit must be a number between 1 and 100');
        });

        test('should reject limit greater than 100', async () => {
            const event = {
                pathParameters: { season: testSeasonName },
                queryStringParameters: { sort: 'newest', limit: '101' },
                httpMethod: 'GET'
            };

            const response = await handler(event);
            const responseBody = JSON.parse(response.body);

            expect(response.statusCode).toBe(400);
            expect(responseBody.message).toContain('Limit must be a number between 1 and 100');
        });
    });

    describe('error handling', () => {
        test('should return 404 for non-existent season', async () => {
            const event = {
                pathParameters: { season: 'NON_EXISTENT_SEASON' },
                queryStringParameters: { sort: 'newest' },
                httpMethod: 'GET'
            };

            const response = await handler(event);
            const responseBody = JSON.parse(response.body);

            expect(response.statusCode).toBe(404);
            expect(responseBody.message).toContain('Season not found');
        });

        test('should reject non-GET methods', async () => {
            const event = {
                pathParameters: { season: testSeasonName },
                queryStringParameters: { sort: 'newest' },
                httpMethod: 'POST'
            };

            const response = await handler(event);
            const responseBody = JSON.parse(response.body);

            expect(response.statusCode).toBe(405);
            expect(responseBody.message).toContain('Method not allowed');
        });
    });

    describe('pagination', () => {
        test('should handle last_evaluated_key parameter', async () => {
            const event = {
                pathParameters: { season: testSeasonName },
                queryStringParameters: {
                    sort: 'newest',
                    limit: '1',
                    last_evaluated_key: 'eyJhcnRfaWQiOiJBUlQjMTIzIn0%3D'
                },
                httpMethod: 'GET'
            };

            const response = await handler(event);
            const responseBody = JSON.parse(response.body);

            expect(response.statusCode).toBe(200);
            expect(responseBody).toHaveProperty('artworks');
        });

        test('should handle invalid last_evaluated_key gracefully', async () => {
            const event = {
                pathParameters: { season: testSeasonName },
                queryStringParameters: {
                    sort: 'newest',
                    limit: '20',
                    last_evaluated_key: 'invalid_key'
                },
                httpMethod: 'GET'
            };

            const response = await handler(event);
            const responseBody = JSON.parse(response.body);

            expect(response.statusCode).toBe(200);
            expect(responseBody).toHaveProperty('artworks');
        });
    });

    describe('response format validation', () => {
        test('should return properly formatted JSON response', async () => {
            const event = {
                pathParameters: { season: testSeasonName },
                queryStringParameters: { sort: 'newest' },
                httpMethod: 'GET'
            };

            const response = await handler(event);
            const responseBody = JSON.parse(response.body);

            expect(response.statusCode).toBe(200);
            expect(response.headers['Content-Type']).toBe('application/json');

            // Verify response structure
            expect(responseBody).toHaveProperty('artworks');
            expect(Array.isArray(responseBody.artworks)).toBe(true);

            if (responseBody.artworks.length > 0) {
                const artwork = responseBody.artworks[0];
                expect(typeof artwork.art_id).toBe('string');
                expect(typeof artwork.title).toBe('string');
                expect(typeof artwork.artist_name).toBe('string');
                expect(typeof artwork.votes).toBe('number');
                expect(typeof artwork.timestamp).toBe('string');
            }
        });
    });
});
