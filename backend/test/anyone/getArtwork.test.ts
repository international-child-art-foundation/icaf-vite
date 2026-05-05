/**
 * Get Artwork by ID API Tests
 * 
 * Tests the getArtwork endpoint that retrieves a single artwork by its ID:
 * - /api/artworks/{art_id}
 */

import { handler } from '../../functions/anyone/getArtwork';
import { TestAssertions, PRESET_TEST_DATA } from '../shared/simple-preset-db';

describe('Get Artwork by ID API tests', () => {
    const testArtworkId = PRESET_TEST_DATA.artworks.APPROVED_ARTWORK;

    describe('successful requests', () => {
        test('should return artwork by valid ID', async () => {
            // Arrange
            const event = {
                pathParameters: { art_id: testArtworkId },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);
            const responseBody = JSON.parse(response.body);

            expect(responseBody).toHaveProperty('artwork');
            expect(responseBody).toHaveProperty('message', 'Artwork retrieved successfully');

            const artwork = responseBody.artwork;
            expect(artwork).toHaveProperty('art_id', testArtworkId);
            expect(artwork).toHaveProperty('title');
            expect(artwork).toHaveProperty('user_id');
            expect(artwork).toHaveProperty('season');
            expect(artwork).toHaveProperty('is_approved');
            expect(artwork).toHaveProperty('votes');
            expect(artwork).toHaveProperty('timestamp');
            expect(artwork).toHaveProperty('type', 'ART');
        });

        test('should return artwork with all required fields', async () => {
            // Arrange
            const event = {
                pathParameters: { art_id: testArtworkId },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);
            const responseBody = JSON.parse(response.body);
            const artwork = responseBody.artwork;

            // Verify all required fields are present
            expect(artwork).toHaveProperty('art_id');
            expect(artwork).toHaveProperty('user_id');
            expect(artwork).toHaveProperty('season');
            expect(artwork).toHaveProperty('title');
            expect(artwork).toHaveProperty('description');
            expect(artwork).toHaveProperty('f_name');
            expect(artwork).toHaveProperty('age');
            expect(artwork).toHaveProperty('location');
            expect(artwork).toHaveProperty('is_virtual');
            expect(artwork).toHaveProperty('is_ai_gen');
            expect(artwork).toHaveProperty('model');
            expect(artwork).toHaveProperty('file_type');
            expect(artwork).toHaveProperty('is_approved');
            expect(artwork).toHaveProperty('votes');
            expect(artwork).toHaveProperty('timestamp');
            expect(artwork).toHaveProperty('type');
        });
    });

    describe('error handling', () => {
        test('should reject invalid HTTP method', async () => {
            // Arrange
            const event = {
                pathParameters: { art_id: testArtworkId },
                httpMethod: 'POST'
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(405);
            expect(response.body).toContain('Method not allowed');
        });

        test('should reject missing art_id parameter', async () => {
            // Arrange
            const event = {
                pathParameters: {},
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Artwork ID parameter is required');
        });

        test('should reject empty art_id parameter', async () => {
            // Arrange
            const event = {
                pathParameters: { art_id: '' },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Artwork ID parameter is required');
        });

        test('should reject invalid art_id format', async () => {
            // Arrange
            const event = {
                pathParameters: { art_id: 'invalid@id#' },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid artwork ID format');
        });

        test('should return 404 for non-existent artwork', async () => {
            // Arrange
            const event = {
                pathParameters: { art_id: 'NON_EXISTENT_ARTWORK' },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('Artwork not found');
        });

        test('should handle undefined pathParameters gracefully', async () => {
            // Arrange
            const event = {
                pathParameters: undefined,
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Artwork ID parameter is required');
        });
    });

    describe('response format validation', () => {
        test('should return properly formatted JSON response', async () => {
            // Arrange
            const event = {
                pathParameters: { art_id: testArtworkId },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.headers['Content-Type']).toBe('application/json');

            // Verify response body is valid JSON
            const responseBody = JSON.parse(response.body);
            expect(responseBody).toHaveProperty('artwork');
            expect(responseBody).toHaveProperty('message');
        });

        test('should maintain consistent response structure', async () => {
            // Arrange
            const event = {
                pathParameters: { art_id: testArtworkId },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);
            const responseBody = JSON.parse(response.body);

            // Verify response structure
            expect(responseBody).toHaveProperty('artwork');
            expect(responseBody).toHaveProperty('message');

            // Verify artwork structure
            const artwork = responseBody.artwork;
            expect(typeof artwork.art_id).toBe('string');
            expect(typeof artwork.user_id).toBe('string');
            expect(typeof artwork.season).toBe('string');
            expect(typeof artwork.title).toBe('string');
            expect(typeof artwork.description).toBe('string');
            expect(typeof artwork.f_name).toBe('string');
            expect(typeof artwork.age).toBe('number');
            expect(typeof artwork.location).toBe('string');
            expect(typeof artwork.is_virtual).toBe('boolean');
            expect(typeof artwork.is_ai_gen).toBe('boolean');
            expect(typeof artwork.model).toBe('string');
            expect(typeof artwork.file_type).toBe('string');
            expect(typeof artwork.is_approved).toBe('boolean');
            expect(typeof artwork.votes).toBe('number');
            expect(typeof artwork.timestamp).toBe('string');
            expect(typeof artwork.type).toBe('string');
        });
    });

    describe('edge cases', () => {
        test('should handle artwork with missing optional fields', async () => {
            // Arrange - use an artwork that might have missing fields
            const event = {
                pathParameters: { art_id: testArtworkId },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);
            const responseBody = JSON.parse(response.body);
            const artwork = responseBody.artwork;

            // Should still return the artwork even with missing fields
            expect(artwork.art_id).toBe(testArtworkId);
            expect(artwork.type).toBe('ART');
        });

        test('should handle very long artwork ID', async () => {
            // Arrange
            const longArtId = 'A'.repeat(100);
            const event = {
                pathParameters: { art_id: longArtId },
                httpMethod: 'GET'
            };

            // Act
            const response = await handler(event);

            // Assert
            // Should either return 404 (not found) or handle gracefully
            expect([400, 404]).toContain(response.statusCode);
        });
    });
});
