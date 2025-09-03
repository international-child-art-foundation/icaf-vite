/**
 * Make Donation API Tests
 * 
 * Tests the makeDonation endpoint that processes Every.org webhook events
 * - /api/donations
 */

import { handler } from '../../functions/anyone/makeDonation';
import { TestAssertions, PRESET_TEST_DATA } from '../shared/simple-preset-db';
import { DonationResponse } from '../../../shared/src/api-types/donationTypes';

describe('Make Donation API tests', () => {
    const testUserId = PRESET_TEST_DATA.users.ADULT_USER;
    const testDonationId = 'test-donation-001';

    describe('successful requests', () => {
        test('should process completed donation for authenticated user', async () => {
            // Arrange
            const event = {
                httpMethod: 'POST',
                body: JSON.stringify({
                    donation_id: testDonationId,
                    amount_cents: 2500, // $25.00
                    currency: 'USD',
                    status: 'completed',
                    donor_id: testUserId,
                    donor_email: 'test@example.com',
                    message: 'Test donation',
                    anonymous: false,
                    timestamp: new Date().toISOString(),
                    campaign_id: 'test-campaign',
                    transaction_id: 'tx-123'
                })
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);
            const responseBody: DonationResponse = JSON.parse(response.body);

            expect(responseBody).toHaveProperty('message', 'Donation processed successfully');
            expect(responseBody).toHaveProperty('donation_id', testDonationId);
            expect(responseBody).toHaveProperty('amount_cents', 2500);
            expect(responseBody).toHaveProperty('user_id', testUserId);
            expect(responseBody).toHaveProperty('anonymous', false);
        });

        test('should process completed donation for anonymous user', async () => {
            // Arrange
            const event = {
                httpMethod: 'POST',
                body: JSON.stringify({
                    donation_id: 'anon-donation-001',
                    amount_cents: 1000, // $10.00
                    currency: 'USD',
                    status: 'completed',
                    donor_email: 'anonymous@example.com',
                    message: 'Anonymous donation',
                    anonymous: true,
                    timestamp: new Date().toISOString()
                })
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);
            const responseBody: DonationResponse = JSON.parse(response.body);

            expect(responseBody).toHaveProperty('message', 'Donation processed successfully');
            expect(responseBody).toHaveProperty('user_id', 'ANON');
            expect(responseBody).toHaveProperty('anonymous', true);
        });

        test('should skip non-completed donations', async () => {
            // Arrange
            const event = {
                httpMethod: 'POST',
                body: JSON.stringify({
                    donation_id: 'pending-donation-001',
                    amount_cents: 1500,
                    currency: 'USD',
                    status: 'pending',
                    donor_id: testUserId,
                    anonymous: false,
                    timestamp: new Date().toISOString()
                })
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);
            const responseBody = JSON.parse(response.body);

            expect(responseBody).toHaveProperty('message', 'Donation not completed, skipping processing');
            expect(responseBody).toHaveProperty('status', 'pending');
        });
    });

    describe('error handling', () => {
        test('should reject invalid HTTP method', async () => {
            // Arrange
            const event = {
                httpMethod: 'GET',
                body: JSON.stringify({
                    donation_id: testDonationId,
                    amount_cents: 1000,
                    status: 'completed'
                })
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(405);
            expect(response.body).toContain('Method not allowed');
        });

        test('should reject missing request body', async () => {
            // Arrange
            const event = {
                httpMethod: 'POST'
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Request body is required');
        });

        test('should reject invalid JSON in request body', async () => {
            // Arrange
            const event = {
                httpMethod: 'POST',
                body: 'invalid json {'
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid JSON in request body');
        });

        test('should reject missing required fields', async () => {
            // Arrange
            const event = {
                httpMethod: 'POST',
                body: JSON.stringify({
                    // Missing donation_id, amount_cents, status
                    currency: 'USD',
                    anonymous: false
                })
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid donation event structure');
        });

        test('should reject missing donation_id', async () => {
            // Arrange
            const event = {
                httpMethod: 'POST',
                body: JSON.stringify({
                    amount_cents: 1000,
                    status: 'completed',
                    anonymous: false,
                    timestamp: new Date().toISOString()
                })
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid donation event structure');
        });

        test('should reject missing amount_cents', async () => {
            // Arrange
            const event = {
                httpMethod: 'POST',
                body: JSON.stringify({
                    donation_id: testDonationId,
                    status: 'completed',
                    anonymous: false,
                    timestamp: new Date().toISOString()
                })
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid donation event structure');
        });

        test('should reject missing status', async () => {
            // Arrange
            const event = {
                httpMethod: 'POST',
                body: JSON.stringify({
                    donation_id: testDonationId,
                    amount_cents: 1000,
                    anonymous: false,
                    timestamp: new Date().toISOString()
                })
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('Invalid donation event structure');
        });
    });

    describe('response format validation', () => {
        test('should return properly formatted JSON response', async () => {
            // Arrange
            const event = {
                httpMethod: 'POST',
                body: JSON.stringify({
                    donation_id: testDonationId,
                    amount_cents: 2000,
                    status: 'completed',
                    donor_id: testUserId,
                    anonymous: false,
                    timestamp: new Date().toISOString()
                })
            };

            // Act
            const response = await handler(event);

            // Assert
            expect(response.headers['Content-Type']).toBe('application/json');

            // Verify response body is valid JSON
            const responseBody = JSON.parse(response.body);
            expect(responseBody).toHaveProperty('message');
            expect(responseBody).toHaveProperty('donation_id');
            expect(responseBody).toHaveProperty('amount_cents');
            expect(responseBody).toHaveProperty('user_id');
            expect(responseBody).toHaveProperty('anonymous');
        });

        test('should maintain consistent response structure', async () => {
            // Arrange
            const event = {
                httpMethod: 'POST',
                body: JSON.stringify({
                    donation_id: testDonationId,
                    amount_cents: 3000,
                    status: 'completed',
                    donor_id: testUserId,
                    anonymous: false,
                    timestamp: new Date().toISOString()
                })
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);
            const responseBody = JSON.parse(response.body);

            // Verify response structure
            expect(responseBody).toHaveProperty('message');
            expect(responseBody).toHaveProperty('donation_id');
            expect(responseBody).toHaveProperty('amount_cents');
            expect(responseBody).toHaveProperty('user_id');
            expect(responseBody).toHaveProperty('anonymous');

            // Verify data types
            expect(typeof responseBody.message).toBe('string');
            expect(typeof responseBody.donation_id).toBe('string');
            expect(typeof responseBody.amount_cents).toBe('number');
            expect(typeof responseBody.user_id).toBe('string');
            expect(typeof responseBody.anonymous).toBe('boolean');
        });
    });

    describe('edge cases', () => {
        test('should handle zero amount donation', async () => {
            // Arrange
            const event = {
                httpMethod: 'POST',
                body: JSON.stringify({
                    donation_id: 'zero-donation-001',
                    amount_cents: 0,
                    status: 'completed',
                    anonymous: true,
                    timestamp: new Date().toISOString()
                })
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);
            const responseBody = JSON.parse(response.body);
            expect(responseBody.amount_cents).toBe(0);
        });

        test('should handle very large donation amounts', async () => {
            // Arrange
            const event = {
                httpMethod: 'POST',
                body: JSON.stringify({
                    donation_id: 'large-donation-001',
                    amount_cents: 99999999, // $999,999.99
                    status: 'completed',
                    donor_id: testUserId,
                    anonymous: false,
                    timestamp: new Date().toISOString()
                })
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);
            const responseBody = JSON.parse(response.body);
            expect(responseBody.amount_cents).toBe(99999999);
        });

        test('should handle donation with minimal required fields', async () => {
            // Arrange
            const event = {
                httpMethod: 'POST',
                body: JSON.stringify({
                    donation_id: 'minimal-donation-001',
                    amount_cents: 100,
                    status: 'completed',
                    anonymous: true,
                    timestamp: new Date().toISOString()
                })
            };

            // Act
            const response = await handler(event);

            // Assert
            TestAssertions.validateSuccessResponse(response, 200);
            const responseBody: DonationResponse = JSON.parse(response.body);
            expect(responseBody.user_id).toBe('ANON');
            expect(responseBody.anonymous).toBe(true);
        });
    });
});
