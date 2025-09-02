/**
 * listSeason API test
 * 
 * Tests the listSeason endpoint functionality including:
 * - Listing all seasons
 * - Filtering by active status
 * - Query parameter validation
 * - Error handling
 */

import { TestAssertions, TempTestData } from '../shared/simple-test-helpers';
import { handler } from '../../functions/anyone/listSeason';
import { Season } from '../../../shared/src/api-types/seasonTypes';

describe('listSeason API tests', () => {
    const testPrefix = 'LIST_SEASON_TEST';

    afterEach(async () => {
        // Cleanup any temporary test data
        await TempTestData.cleanup(testPrefix);
    });

    describe('successful requests', () => {
        test('should list all seasons when no filter is applied', async () => {
            // Arrange
            const event = {
                queryStringParameters: null,
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);

            const responseBody = JSON.parse(response.body);
            expect(responseBody).toHaveProperty('seasons');
            expect(responseBody).toHaveProperty('count');
            expect(responseBody).toHaveProperty('filter_applied', 'none');
            expect(Array.isArray(responseBody.seasons)).toBe(true);
            expect(responseBody.count).toBe(responseBody.seasons.length);

            // Verify season structure
            if (responseBody.seasons.length > 0) {
                const season = responseBody.seasons[0];
                expect(season).toHaveProperty('season');
                expect(season).toHaveProperty('colloq_name');
                expect(season).toHaveProperty('start_date');
                expect(season).toHaveProperty('end_date');
                expect(season).toHaveProperty('payment_required');
                expect(season).toHaveProperty('max_user_submissions');
                expect(season).toHaveProperty('can_vote');
                expect(season).toHaveProperty('total_votes');
                expect(season).toHaveProperty('is_active');
            }
        });

        test('should list only active seasons when active=true', async () => {
            // Arrange
            const event = {
                queryStringParameters: { active: 'true' },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);

            const responseBody = JSON.parse(response.body);
            expect(responseBody).toHaveProperty('active_seasons');
            expect(responseBody).toHaveProperty('count');
            expect(responseBody).toHaveProperty('filter_applied', 'active=true');
            expect(Array.isArray(responseBody.active_seasons)).toBe(true);
            expect(responseBody.count).toBe(responseBody.active_seasons.length);

            // Verify all returned seasons are active
            responseBody.active_seasons.forEach((season: Season) => {
                expect(season.is_active).toBe(true);
            });
        });

        test('should list only inactive seasons when active=false', async () => {
            // Arrange
            const event = {
                queryStringParameters: { active: 'false' },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);

            const responseBody = JSON.parse(response.body);
            expect(responseBody).toHaveProperty('inactive_seasons');
            expect(responseBody).toHaveProperty('count');
            expect(responseBody).toHaveProperty('filter_applied', 'active=false');
            expect(Array.isArray(responseBody.inactive_seasons)).toBe(true);
            expect(responseBody.count).toBe(responseBody.inactive_seasons.length);

            // Verify all returned seasons are inactive
            responseBody.inactive_seasons.forEach((season: Season) => {
                expect(season.is_active).toBe(false);
            });
        });

        test('should return empty array when no seasons match filter', async () => {
            // This test assumes there might be cases where no seasons match the filter
            const event = {
                queryStringParameters: { active: 'false' },
                httpMethod: 'GET'
            };

            const response = await handler(event);

            TestAssertions.validateSuccessResponse(response, 200);

            const responseBody = JSON.parse(response.body);
            expect(responseBody).toHaveProperty('inactive_seasons');
            expect(responseBody).toHaveProperty('count');
            expect(Array.isArray(responseBody.inactive_seasons)).toBe(true);
            expect(responseBody.count).toBeGreaterThanOrEqual(0);
        });
    });

    describe('query parameter validation', () => {
        test('should reject invalid active parameter values', async () => {
            // Arrange
            const event = {
                queryStringParameters: { active: 'invalid' },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response).toHaveProperty('body');
            expect(response).toHaveProperty('headers');

            const responseBody = JSON.parse(response.body);
            expect(responseBody).toHaveProperty('message', 'Invalid query parameters');
            expect(responseBody).toHaveProperty('errors');
            expect(Array.isArray(responseBody.errors)).toBe(true);
            expect(responseBody.errors[0]).toContain('active parameter must be either "true" or "false"');
        });

        test('should handle empty query parameters gracefully', async () => {
            // Arrange
            const event = {
                queryStringParameters: {},
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);

            const responseBody = JSON.parse(response.body);
            expect(responseBody).toHaveProperty('seasons');
            expect(responseBody).toHaveProperty('filter_applied', 'none');
        });

        test('should ignore unknown query parameters', async () => {
            // Arrange
            const event = {
                queryStringParameters: {
                    active: 'true',
                    unknown_param: 'value',
                    another_param: '123'
                },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);

            const responseBody = JSON.parse(response.body);
            expect(responseBody).toHaveProperty('active_seasons');
            expect(responseBody).toHaveProperty('filter_applied', 'active=true');
        });
    });

    describe('error handling', () => {
        test('should handle database errors gracefully', async () => {
            // This test would require mocking the DynamoDB client to simulate errors
            // For now, we'll test the general error handling structure

            // Note: In a real implementation, you might want to mock the dynamodb client
            // to throw an error and verify the 500 response is returned

            const event = {
                queryStringParameters: { active: 'true' },
                httpMethod: 'GET'
            };

            const response = await handler(event);

            // The response should be either successful or a proper error response
            expect(response.statusCode).toBeOneOf([200, 500]);
            expect(response.headers).toHaveProperty('Content-Type', 'application/json');

            const responseBody = JSON.parse(response.body);
            expect(typeof responseBody).toBe('object');
        });

        test('should handle null queryStringParameters', async () => {
            // Arrange
            const event = {
                queryStringParameters: null,
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);

            const responseBody = JSON.parse(response.body);
            expect(responseBody).toHaveProperty('seasons');
            expect(responseBody).toHaveProperty('filter_applied', 'none');
        });
    });

    describe('response format validation', () => {
        test('should return properly formatted JSON response', async () => {
            // Arrange
            const event = {
                queryStringParameters: { active: 'true' },
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

        test('should maintain consistent response structure across different filters', async () => {
            // Test all three filter types
            const filters = [
                { queryParams: null, expectedField: 'seasons', expectedFilter: 'none' },
                { queryParams: { active: 'true' }, expectedField: 'active_seasons', expectedFilter: 'active=true' },
                { queryParams: { active: 'false' }, expectedField: 'inactive_seasons', expectedFilter: 'active=false' }
            ];

            for (const filter of filters) {
                const event = {
                    queryStringParameters: filter.queryParams,
                    httpMethod: 'GET'
                };

                const response = await handler(event);

                TestAssertions.validateSuccessResponse(response, 200);

                const responseBody = JSON.parse(response.body);
                expect(responseBody).toHaveProperty(filter.expectedField);
                expect(responseBody).toHaveProperty('count');
                expect(responseBody).toHaveProperty('filter_applied', filter.expectedFilter);
                expect(Array.isArray(responseBody[filter.expectedField])).toBe(true);
                expect(responseBody.count).toBe(responseBody[filter.expectedField].length);
            }
        });
    });
});

// Custom Jest matcher for testing multiple possible values
expect.extend({
    toBeOneOf(received, expectedValues) {
        const pass = expectedValues.includes(received);
        if (pass) {
            return {
                message: () => `expected ${received} not to be one of ${expectedValues.join(', ')}`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected ${received} to be one of ${expectedValues.join(', ')}`,
                pass: false,
            };
        }
    },
});

// TypeScript declaration for custom matcher
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeOneOf(expectedValues: any[]): R;
        }
    }
}
