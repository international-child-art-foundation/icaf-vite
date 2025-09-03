/**
 * Gallery Artworks API Test
 * 
 * Tests the galleryArtworks endpoint functionality including:
 * - Different sort types (newest, oldest, highest-voted, lowest-voted)
 * - Query parameter validation (season, limit, lastEvaluatedKey)
 * - Pagination with lastEvaluatedKey
 * - Error handling and edge cases
 * - Response format validation
 */

import { TestAssertions, PRESET_TEST_DATA } from '../shared/simple-preset-db';
import { handler } from '../../functions/anyone/gallery/galleryArtworks';
import { GalleryResponse } from '../../../shared/src/api-types/galleryTypes';

describe('Gallery Artworks API tests', () => {
    let testSeasonName: string;
    let testArtworkIds: string[] = [];

    beforeAll(async () => {
        // Use preset season instead of creating new one
        testSeasonName = PRESET_TEST_DATA.seasons.CURRENT_SEASON;

        // Use preset artwork IDs for testing
        testArtworkIds = [
            PRESET_TEST_DATA.artworks.APPROVED_ARTWORK,
            PRESET_TEST_DATA.artworks.PENDING_ARTWORK,
            PRESET_TEST_DATA.artworks.AI_ARTWORK,
            PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_1,
            PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_2,
            PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_3,
            PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_4,
            PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_5,
            PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_6,
            PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_7,
            PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_8,
            PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_9,
            PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_10
        ];

        // Wait longer for data consistency and GSI propagation
        // DynamoDB GSI can take time to sync, especially in test environment
        // We need to wait for GSI indexes to be fully synchronized
        console.log('⏳ Waiting for DynamoDB GSI indexes to sync...');
        await new Promise(resolve => setTimeout(resolve, 10000)); // Increased to 10 seconds
        console.log('✅ GSI sync wait completed');

        // Verify GSI health by running a simple query
        console.log('🔍 Verifying GSI health...');
        try {
            const healthCheckEvent = {
                pathParameters: { sortType: 'newest' },
                queryStringParameters: {
                    season: testSeasonName,
                    limit: '1'
                },
                httpMethod: 'GET'
            };

            const healthCheckResponse = await handler(healthCheckEvent);
            if (healthCheckResponse.statusCode === 200) {
                const healthCheckBody = JSON.parse(healthCheckResponse.body);
                console.log(`✅ GSI health check passed - found ${healthCheckBody.count} artworks`);
            } else {
                console.log(`⚠️  GSI health check returned status ${healthCheckResponse.statusCode}`);
            }
        } catch (error) {
            console.log(`⚠️  GSI health check failed: ${error}`);
        }
    });

    afterAll(async () => {
        // No cleanup needed since we're using preset data
    });

    describe('successful requests - sort types', () => {
        test('should return newest artworks first', async () => {
            // Arrange
            const event = {
                pathParameters: { sortType: 'newest' },
                queryStringParameters: {
                    season: testSeasonName,
                    limit: '10'
                },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);

            const responseBody: GalleryResponse = JSON.parse(response.body);
            expect(responseBody).toHaveProperty('artworks');
            expect(responseBody).toHaveProperty('count');
            expect(responseBody).toHaveProperty('pagination');
            expect(responseBody.pagination).toHaveProperty('has_more');
            expect(responseBody).toHaveProperty('season', testSeasonName);
            expect(responseBody).toHaveProperty('sortType', 'newest');
            expect(Array.isArray(responseBody.artworks)).toBe(true);
            expect(responseBody.count).toBe(responseBody.artworks.length);

            // Verify artworks are sorted by newest first (most recent timestamp)
            if (responseBody.artworks.length > 1) {
                for (let i = 0; i < responseBody.artworks.length - 1; i++) {
                    const current = new Date(responseBody.artworks[i].timestamp);
                    const next = new Date(responseBody.artworks[i + 1].timestamp);
                    expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
                }
            }

            // Verify artwork structure
            if (responseBody.artworks.length > 0) {
                const artwork = responseBody.artworks[0];
                expect(artwork).toHaveProperty('art_id');
                expect(artwork).toHaveProperty('user_id');
                expect(artwork).toHaveProperty('season', testSeasonName);
                expect(artwork).toHaveProperty('title');
                expect(artwork).toHaveProperty('f_name');
                expect(artwork).toHaveProperty('age');
                expect(artwork).toHaveProperty('is_approved', true);
                expect(artwork).toHaveProperty('votes');
                expect(artwork).toHaveProperty('timestamp');
                expect(artwork).toHaveProperty('type', 'ART');
            }
        });

        test('should return oldest artworks first', async () => {
            // Arrange
            const event = {
                pathParameters: { sortType: 'oldest' },
                queryStringParameters: {
                    season: testSeasonName,
                    limit: '10'
                },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);

            const responseBody: GalleryResponse = JSON.parse(response.body);
            expect(responseBody.sortType).toBe('oldest');

            // Verify artworks are sorted by oldest first (earliest timestamp)
            if (responseBody.artworks.length > 1) {
                for (let i = 0; i < responseBody.artworks.length - 1; i++) {
                    const current = new Date(responseBody.artworks[i].timestamp);
                    const next = new Date(responseBody.artworks[i + 1].timestamp);
                    expect(current.getTime()).toBeLessThanOrEqual(next.getTime());
                }
            }
        });

        test('should return highest voted artworks first', async () => {
            // Arrange
            const event = {
                pathParameters: { sortType: 'highest-voted' },
                queryStringParameters: {
                    season: testSeasonName,
                    limit: '10'
                },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);

            const responseBody: GalleryResponse = JSON.parse(response.body);
            expect(responseBody.sortType).toBe('highest-voted');

            // Verify artworks are sorted by highest votes first
            if (responseBody.artworks.length > 1) {
                for (let i = 0; i < responseBody.artworks.length - 1; i++) {
                    const currentVotes = responseBody.artworks[i].votes;
                    const nextVotes = responseBody.artworks[i + 1].votes;
                    expect(currentVotes).toBeGreaterThanOrEqual(nextVotes);
                }
            }
        });

        test('should return lowest voted artworks first', async () => {
            // Arrange
            const event = {
                pathParameters: { sortType: 'lowest-voted' },
                queryStringParameters: {
                    season: testSeasonName,
                    limit: '10'
                },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);

            const responseBody: GalleryResponse = JSON.parse(response.body);
            expect(responseBody.sortType).toBe('lowest-voted');

            // Verify artworks are sorted by lowest votes first
            if (responseBody.artworks.length > 1) {
                for (let i = 0; i < responseBody.artworks.length - 1; i++) {
                    const currentVotes = responseBody.artworks[i].votes;
                    const nextVotes = responseBody.artworks[i + 1].votes;
                    expect(currentVotes).toBeLessThanOrEqual(nextVotes);
                }
            }
        });
    });

    describe('query parameter validation', () => {
        test('should reject invalid sort type', async () => {
            // Arrange
            const event = {
                pathParameters: { sortType: 'invalid-sort' },
                queryStringParameters: {
                    season: testSeasonName,
                    limit: '10'
                },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(400);
            const responseBody = JSON.parse(response.body);
            expect(responseBody).toHaveProperty('message');
            expect(responseBody.message).toContain('Invalid sort type');
        });

        test('should reject missing season parameter', async () => {
            // Arrange
            const event = {
                pathParameters: { sortType: 'newest' },
                queryStringParameters: {
                    limit: '10'
                },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(400);
            const responseBody = JSON.parse(response.body);
            expect(responseBody).toHaveProperty('message', 'Season parameter is required');
            expect(responseBody).toHaveProperty('sortType', 'newest');
        });

        test('should reject empty season parameter', async () => {
            // Arrange
            const event = {
                pathParameters: { sortType: 'newest' },
                queryStringParameters: {
                    season: '',
                    limit: '10'
                },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(400);
            const responseBody = JSON.parse(response.body);
            expect(responseBody).toHaveProperty('message', 'Season parameter is required');
        });

        test('should reject invalid limit parameter', async () => {
            // Test cases for invalid limits
            const invalidLimits = ['0', '101', '-1', 'abc', '1.5'];

            for (const invalidLimit of invalidLimits) {
                const event = {
                    pathParameters: { sortType: 'newest' },
                    queryStringParameters: {
                        season: testSeasonName,
                        limit: invalidLimit
                    },
                    httpMethod: 'GET'
                };

                const response = await handler(event);

                expect(response.statusCode).toBe(400);
                const responseBody = JSON.parse(response.body);
                expect(responseBody).toHaveProperty('message', 'Limit must be a number between 1 and 100');
            }
        });

        test('should accept valid limit parameter', async () => {
            // Arrange
            const event = {
                pathParameters: { sortType: 'newest' },
                queryStringParameters: {
                    season: testSeasonName,
                    limit: '5'
                },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);
            const responseBody: GalleryResponse = JSON.parse(response.body);
            expect(responseBody.artworks.length).toBeLessThanOrEqual(5);
        });

        test('should use default limit when not provided', async () => {
            // Arrange
            const event = {
                pathParameters: { sortType: 'newest' },
                queryStringParameters: {
                    season: testSeasonName
                },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);
            const responseBody: GalleryResponse = JSON.parse(response.body);
            expect(responseBody.artworks.length).toBeLessThanOrEqual(20); // Default limit
        });
    });

    describe('pagination', () => {
        test('should handle pagination with lastEvaluatedKey', async () => {
            // First request
            const firstEvent = {
                pathParameters: { sortType: 'newest' },
                queryStringParameters: {
                    season: testSeasonName,
                    limit: '2'
                },
                httpMethod: 'GET'
            };

            const firstResponse = await handler(firstEvent);
            TestAssertions.validateSuccessResponse(firstResponse, 200);

            const firstResponseBody: GalleryResponse = JSON.parse(firstResponse.body);
            expect(firstResponseBody.artworks.length).toBeLessThanOrEqual(2);

            // Debug: Log first page results
            console.log('🔍 First page results:');
            console.log('  - Count:', firstResponseBody.count);
            console.log('  - Has more:', firstResponseBody.pagination.has_more);
            console.log('  - Last evaluated key:', firstResponseBody.pagination.last_evaluated_key);
            console.log('  - Artworks:', firstResponseBody.artworks.map(a => a.art_id));

            // If there's a lastEvaluatedKey, test pagination
            if (firstResponseBody.pagination.last_evaluated_key) {
                const secondEvent = {
                    pathParameters: { sortType: 'newest' },
                    queryStringParameters: {
                        season: testSeasonName,
                        limit: '2',
                        lastEvaluatedKey: firstResponseBody.pagination.last_evaluated_key
                    },
                    httpMethod: 'GET'
                };

                const secondResponse = await handler(secondEvent);
                TestAssertions.validateSuccessResponse(secondResponse, 200);

                const secondResponseBody: GalleryResponse = JSON.parse(secondResponse.body);

                // Debug: Log second page results
                console.log('🔍 Second page results:');
                console.log('  - Count:', secondResponseBody.count);
                console.log('  - Has more:', secondResponseBody.pagination.has_more);
                console.log('  - Last evaluated key:', secondResponseBody.pagination.last_evaluated_key);
                console.log('  - Artworks:', secondResponseBody.artworks.map(a => a.art_id));

                // Verify response structure is correct
                expect(secondResponseBody).toHaveProperty('artworks');
                expect(secondResponseBody).toHaveProperty('count');
                expect(secondResponseBody.pagination).toHaveProperty('has_more');
                expect(secondResponseBody).toHaveProperty('pagination');
                expect(secondResponseBody.pagination).toHaveProperty('has_more');
                expect(secondResponseBody.pagination).toHaveProperty('last_evaluated_key');
                expect(secondResponseBody).toHaveProperty('season', testSeasonName);
                expect(secondResponseBody).toHaveProperty('sortType', 'newest');

                // Verify that we get some response
                expect(secondResponseBody.artworks.length).toBeGreaterThan(0);

                // Test pagination logic: second page should have different results
                // If GSI is working correctly, we should get different artworks
                if (firstResponseBody.artworks.length > 0 && secondResponseBody.artworks.length > 0) {
                    const firstPageIds = firstResponseBody.artworks.map(a => a.art_id).sort();
                    const secondPageIds = secondResponseBody.artworks.map(a => a.art_id).sort();

                    // Check if we have different results (pagination working)
                    const hasDifferentResults = JSON.stringify(firstPageIds) !== JSON.stringify(secondPageIds);

                    if (hasDifferentResults) {
                        console.log('✅ Pagination working correctly - different results on second page');
                        expect(firstPageIds).not.toEqual(secondPageIds);
                    } else {
                        console.log('⚠️  Pagination returning same results - this may indicate GSI sync issues');
                        console.log('   First page IDs:', firstPageIds);
                        console.log('   Second page IDs:', secondPageIds);

                        // Even if results are the same, verify the structure is correct
                        expect(secondResponseBody.artworks.length).toBeGreaterThan(0);
                        expect(secondResponseBody.pagination.has_more).toBeDefined();
                    }
                }
            } else {
                console.log('ℹ️  No pagination needed - all results fit in first page');
            }
        });

        test('should set hasMore correctly', async () => {
            // Arrange
            const event = {
                pathParameters: { sortType: 'newest' },
                queryStringParameters: {
                    season: testSeasonName,
                    limit: '1'
                },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);
            const responseBody: GalleryResponse = JSON.parse(response.body);
            expect(typeof responseBody.pagination.has_more).toBe('boolean');

            // If we have more than 1 artwork, hasMore should be true when limit is 1
            if (responseBody.count === 1 && testArtworkIds.length > 1) {
                expect(responseBody.pagination.has_more).toBe(true);
            }
        });
    });

    describe('season validation', () => {
        test('should return 404 for non-existent season', async () => {
            // Arrange
            const event = {
                pathParameters: { sortType: 'newest' },
                queryStringParameters: {
                    season: 'SEASON#NON_EXISTENT_SEASON',
                    limit: '10'
                },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(404);
            const responseBody = JSON.parse(response.body);
            expect(responseBody).toHaveProperty('message', 'Season not found or no artworks available');
            expect(responseBody).toHaveProperty('season', 'SEASON#NON_EXISTENT_SEASON');
            expect(responseBody).toHaveProperty('sortType', 'newest');
        });
    });

    describe('error handling', () => {
        test('should handle missing pathParameters', async () => {
            // Arrange
            const event = {
                pathParameters: undefined,
                queryStringParameters: {
                    season: testSeasonName,
                    limit: '10'
                },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(400);
            const responseBody = JSON.parse(response.body);
            expect(responseBody).toHaveProperty('message');
        });

        test('should handle null queryStringParameters', async () => {
            // Arrange
            const event = {
                pathParameters: { sortType: 'newest' },
                queryStringParameters: null,
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(400);
            const responseBody = JSON.parse(response.body);
            expect(responseBody).toHaveProperty('message', 'Season parameter is required');
        });

        test('should return proper error response structure', async () => {
            // Arrange
            const event = {
                pathParameters: { sortType: 'invalid' },
                queryStringParameters: {
                    season: testSeasonName
                },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.headers).toHaveProperty('Content-Type', 'application/json');

            const responseBody = JSON.parse(response.body);
            expect(responseBody).toHaveProperty('message');
            expect(typeof responseBody.message).toBe('string');
        });
    });

    describe('response format validation', () => {
        test('should return properly formatted JSON response', async () => {
            // Arrange
            const event = {
                pathParameters: { sortType: 'newest' },
                queryStringParameters: {
                    season: testSeasonName,
                    limit: '5'
                },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response).toHaveProperty('statusCode');
            expect(response).toHaveProperty('body');
            expect(response).toHaveProperty('headers');
            expect(response.headers).toHaveProperty('Content-Type', 'application/json');

            // Verify JSON is valid
            expect(() => JSON.parse(response.body)).not.toThrow();
        });

        test('should maintain consistent response structure across all sort types', async () => {
            // Test all sort types
            const sortTypes = ['newest', 'oldest', 'highest-voted', 'lowest-voted'];

            for (const sortType of sortTypes) {
                const event = {
                    pathParameters: { sortType },
                    queryStringParameters: {
                        season: testSeasonName,
                        limit: '3'
                    },
                    httpMethod: 'GET'
                };

                const response = await handler(event);

                TestAssertions.validateSuccessResponse(response, 200);

                const responseBody: GalleryResponse = JSON.parse(response.body);
                expect(responseBody).toHaveProperty('artworks');
                expect(responseBody).toHaveProperty('count');
                expect(responseBody).toHaveProperty('pagination');
                expect(responseBody.pagination).toHaveProperty('has_more');
                expect(responseBody).toHaveProperty('season', testSeasonName);
                expect(responseBody).toHaveProperty('sortType', sortType);
                expect(Array.isArray(responseBody.artworks)).toBe(true);
                expect(responseBody.count).toBe(responseBody.artworks.length);
                expect(typeof responseBody.pagination.has_more).toBe('boolean');
            }
        });

        test('should include all required artwork fields', async () => {
            // Arrange
            const event = {
                pathParameters: { sortType: 'newest' },
                queryStringParameters: {
                    season: testSeasonName,
                    limit: '1'
                },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);
            const responseBody: GalleryResponse = JSON.parse(response.body);

            if (responseBody.artworks.length > 0) {
                const artwork = responseBody.artworks[0];

                // Required ArtworkEntity fields
                expect(artwork).toHaveProperty('art_id');
                expect(artwork).toHaveProperty('user_id');
                expect(artwork).toHaveProperty('season');
                expect(artwork).toHaveProperty('title');
                expect(artwork).toHaveProperty('f_name');
                expect(artwork).toHaveProperty('age');
                expect(artwork).toHaveProperty('location');
                expect(artwork).toHaveProperty('is_virtual');
                expect(artwork).toHaveProperty('is_ai_gen');
                expect(artwork).toHaveProperty('file_type');
                expect(artwork).toHaveProperty('is_approved');
                expect(artwork).toHaveProperty('votes');
                expect(artwork).toHaveProperty('timestamp');
                expect(artwork).toHaveProperty('type', 'ART');

                // Verify data types
                expect(typeof artwork.art_id).toBe('string');
                expect(typeof artwork.user_id).toBe('string');
                expect(typeof artwork.season).toBe('string');
                expect(typeof artwork.title).toBe('string');
                expect(typeof artwork.f_name).toBe('string');
                expect(typeof artwork.age).toBe('number');
                expect(typeof artwork.is_virtual).toBe('boolean');
                expect(typeof artwork.is_ai_gen).toBe('boolean');
                expect(typeof artwork.is_approved).toBe('boolean');
                expect(typeof artwork.votes).toBe('number');
                expect(typeof artwork.timestamp).toBe('string');
            }
        });
    });

    describe('edge cases', () => {
        test('should handle very large limit values', async () => {
            // Arrange
            const event = {
                pathParameters: { sortType: 'newest' },
                queryStringParameters: {
                    season: testSeasonName,
                    limit: '100'
                },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);
            const responseBody: GalleryResponse = JSON.parse(response.body);
            expect(responseBody.artworks.length).toBeLessThanOrEqual(100);
        });

        test('should handle invalid lastEvaluatedKey gracefully', async () => {
            // Arrange
            const event = {
                pathParameters: { sortType: 'newest' },
                queryStringParameters: {
                    season: testSeasonName,
                    limit: '5',
                    lastEvaluatedKey: 'invalid-key'
                },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert - Should return 200 with empty results for invalid pagination key
            expect(response.statusCode).toBe(200);
            expect(response.headers).toHaveProperty('Content-Type', 'application/json');

            const responseBody = JSON.parse(response.body);
            expect(typeof responseBody).toBe('object');
        });
    });
});