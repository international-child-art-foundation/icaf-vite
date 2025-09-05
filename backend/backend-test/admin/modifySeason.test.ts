/**
 * modifySeason test
 * 
 * Tests for admin modifySeason functionality
 * Tests season modification with various scenarios
 */

import { PresetEvents, TempTestData } from '../shared/simple-preset-db';
import { createTestSeason } from '../shared/test-infrastructure';

// Mock AWS Lambda client before importing the handler
const mockLambdaInvoke = jest.fn();
jest.mock('../../config/aws-clients', () => {
    const originalModule = jest.requireActual('../../config/aws-clients');
    return {
        ...originalModule,
        lambdaClient: {
            send: mockLambdaInvoke
        }
    };
});

// Import the actual handler after mocking
import { handler } from '../../functions/admin/modifySeason';

describe('modifySeason test', () => {
    const testPrefix = 'MODIFY_SEASON_TEST';

    beforeEach(() => {
        // Reset mock before each test
        mockLambdaInvoke.mockReset();
    });

    afterEach(async () => {
        // cleanup any temporary test data
        await TempTestData.cleanup(testPrefix);
    });

    describe('Admin Authentication', () => {
        it('should return 401 when no user is authenticated', async () => {
            const event = {
                requestContext: {},
                body: JSON.stringify({
                    season_id: 'test_season',
                    start_date: '2024-03-01T00:00:00Z'
                }),
                httpMethod: 'PUT'
            };

            const response = await handler(event);

            expect(response.statusCode).toBe(401);
            expect(response.body).toContain('Unauthorized');
        });

        it('should return 403 when user is not admin', async () => {
            const event = PresetEvents.createPostEvent('ADULT_USER', {
                season_id: 'test_season',
                start_date: '2024-03-01T00:00:00Z'
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Admin access required');
        });

        it('should allow admin user to modify season', async () => {
            await createTestSeason('test_season', {
                season: 'test_season',
                colloq_name: 'Test Season',
                start_date: '2024-01-01T00:00:00Z',
                end_date: '2024-12-31T23:59:59Z',
                payment_required: true,
                max_user_submissions: 3,
                can_vote: true,
                is_active: true
            });

            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season_id: 'test_season',
                start_date: '2024-03-01T00:00:00Z'
            });

            const response = await handler(event);

            // Should attempt to call SeasonManager (will fail in test environment)
            // but should not fail due to authentication
            expect(response.statusCode).toBe(500); // SeasonManager not available in test
            expect(response.body).toContain('Failed to modify season');
        });
    });

    describe('Request Validation', () => {
        it('should return 400 when request body is missing', async () => {
            const event = {
                ...PresetEvents.createPostEvent('ADMIN_USER', {}),
                body: null
            };

            const response = await handler(event);

            expect(response.statusCode).toBe(400); // Request body is required
        });

        it('should return 400 when season_id is missing', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                start_date: '2024-03-01T00:00:00Z'
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('season_id is required');
        });

        it('should return 400 when season_id is empty', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season_id: '',
                start_date: '2024-03-01T00:00:00Z'
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('season_id is required');
        });

        it('should return 400 when no fields are provided for modification', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season_id: 'test_season'
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('At least one field');
        });

        it('should return 400 when start_date is invalid', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season_id: 'test_season',
                start_date: 'invalid-date'
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('start_date must be a valid date');
        });

        it('should return 400 when end_date is invalid', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season_id: 'test_season',
                end_date: 'invalid-date'
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('end_date must be a valid date');
        });

        it('should return 400 when end_date is before start_date', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season_id: 'test_season',
                start_date: '2024-03-01T00:00:00Z',
                end_date: '2024-02-01T00:00:00Z'
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('end_date must be after start_date');
        });

        it('should return 400 when startSilently is not boolean', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season_id: 'test_season',
                startSilently: 'not-boolean'
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('startSilently must be a boolean');
        });

        it('should return 400 when endSilently is not boolean', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season_id: 'test_season',
                endSilently: 'not-boolean'
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('endSilently must be a boolean');
        });
    });

    describe('Season Existence', () => {
        it('should return 404 when season does not exist', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season_id: 'nonexistent_season',
                start_date: '2024-03-01T00:00:00Z'
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(response.body).toContain('not found');
        });

        it('should find existing season and proceed with modification', async () => {
            // Create a test season
            await createTestSeason('existing_season', {
                season: 'existing_season',
                colloq_name: 'Existing Season',
                start_date: '2024-01-01T00:00:00Z',
                end_date: '2024-12-31T23:59:59Z',
                payment_required: true,
                max_user_submissions: 3,
                can_vote: true,
                is_active: true
            });

            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season_id: 'existing_season',
                start_date: '2024-03-01T00:00:00Z'
            });

            const response = await handler(event);

            // Should attempt to call SeasonManager (will fail in test environment)
            // but should not fail due to season not found
            expect(response.statusCode).toBe(500); // SeasonManager not available in test
            expect(response.body).toContain('Failed to modify season');
        });
    });

    describe('Successful Modifications', () => {
        let testSeasonId: string;

        beforeEach(async () => {
            // Create a single test season for all success tests
            testSeasonId = 'success_test_season';
            await createTestSeason(testSeasonId, {
                season: testSeasonId,
                colloq_name: 'Success Test Season',
                start_date: '2024-01-01T00:00:00Z',
                end_date: '2024-12-31T23:59:59Z',
                payment_required: true,
                max_user_submissions: 3,
                can_vote: true,
                is_active: true
            });

            // Mock successful Lambda response
            mockLambdaInvoke.mockResolvedValue({
                StatusCode: 200,
                Payload: new TextEncoder().encode(JSON.stringify({
                    success: true,
                    message: 'Season modified successfully'
                }))
            });
        });

        it('should successfully modify start_date and return 200', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season_id: testSeasonId,
                start_date: '2024-03-01T00:00:00Z'
            });

            const response = await handler(event);

            // Verify successful response
            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.body)).toEqual({
                message: 'Season modified successfully',
                season_id: testSeasonId,
                updated_fields: ['start_date']
            });

            // Verify Lambda was called with correct parameters
            expect(mockLambdaInvoke).toHaveBeenCalledTimes(1);
            const lambdaCall = mockLambdaInvoke.mock.calls[0][0];
            expect(lambdaCall.input.FunctionName).toBe('SeasonManager');
            expect(lambdaCall.input.InvocationType).toBe('RequestResponse');

            const payload = JSON.parse(lambdaCall.input.Payload);
            expect(payload.action).toBe('modifySeason');
            expect(payload.seasonData.season_id).toBe(testSeasonId);
            expect(payload.seasonData.start_date).toBe('2024-03-01T00:00:00Z');
        });

        it('should successfully modify end_date and return 200', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season_id: testSeasonId,
                end_date: '2024-06-30T23:59:59Z'
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.body)).toEqual({
                message: 'Season modified successfully',
                season_id: testSeasonId,
                updated_fields: ['end_date']
            });

            // Verify Lambda payload
            const lambdaCall = mockLambdaInvoke.mock.calls[0][0];
            const payload = JSON.parse(lambdaCall.input.Payload);
            expect(payload.seasonData.end_date).toBe('2024-06-30T23:59:59Z');
        });

        it('should successfully modify both dates and return 200', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season_id: testSeasonId,
                start_date: '2024-03-01T00:00:00Z',
                end_date: '2024-06-30T23:59:59Z'
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.body)).toEqual({
                message: 'Season modified successfully',
                season_id: testSeasonId,
                updated_fields: ['start_date', 'end_date']
            });

            // Verify Lambda payload contains both dates
            const lambdaCall = mockLambdaInvoke.mock.calls[0][0];
            const payload = JSON.parse(lambdaCall.input.Payload);
            expect(payload.seasonData.start_date).toBe('2024-03-01T00:00:00Z');
            expect(payload.seasonData.end_date).toBe('2024-06-30T23:59:59Z');
        });

        it('should successfully modify boolean flags and return 200', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season_id: testSeasonId,
                startSilently: true,
                endSilently: false
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.body)).toEqual({
                message: 'Season modified successfully',
                season_id: testSeasonId,
                updated_fields: ['startSilently', 'endSilently']
            });

            // Verify Lambda payload contains boolean flags
            const lambdaCall = mockLambdaInvoke.mock.calls[0][0];
            const payload = JSON.parse(lambdaCall.input.Payload);
            expect(payload.seasonData.startSilently).toBe(true);
            expect(payload.seasonData.endSilently).toBe(false);
        });

        it('should successfully modify all fields and return 200', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season_id: testSeasonId,
                start_date: '2024-03-01T00:00:00Z',
                end_date: '2024-06-30T23:59:59Z',
                startSilently: true,
                endSilently: false
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.body)).toEqual({
                message: 'Season modified successfully',
                season_id: testSeasonId,
                updated_fields: ['start_date', 'end_date', 'startSilently', 'endSilently']
            });

            // Verify Lambda payload contains all fields
            const lambdaCall = mockLambdaInvoke.mock.calls[0][0];
            const payload = JSON.parse(lambdaCall.input.Payload);
            expect(payload.seasonData).toEqual({
                season_id: testSeasonId,
                start_date: '2024-03-01T00:00:00Z',
                end_date: '2024-06-30T23:59:59Z',
                startSilently: true,
                endSilently: false
            });
        });
    });

    describe('Lambda Error Handling', () => {
        let errorTestSeasonId: string;

        beforeEach(async () => {
            // Create a test season for error handling tests
            errorTestSeasonId = 'error_test_season';
            await createTestSeason(errorTestSeasonId, {
                season: errorTestSeasonId,
                colloq_name: 'Error Test Season',
                start_date: '2024-01-01T00:00:00Z',
                end_date: '2024-12-31T23:59:59Z',
                payment_required: true,
                max_user_submissions: 3,
                can_vote: true,
                is_active: true
            });
        });

        it('should handle Lambda service errors and return 500', async () => {
            // Mock Lambda error response
            mockLambdaInvoke.mockRejectedValue(new Error('Lambda service unavailable'));

            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season_id: errorTestSeasonId,
                start_date: '2024-03-01T00:00:00Z'
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to modify season');
        });

        it('should handle Lambda function errors and return 500', async () => {
            // Mock Lambda function error response
            mockLambdaInvoke.mockResolvedValue({
                StatusCode: 500,
                Payload: new TextEncoder().encode(JSON.stringify({
                    error: 'Internal server error',
                    message: 'Failed to process season modification'
                }))
            });

            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season_id: errorTestSeasonId,
                start_date: '2024-03-01T00:00:00Z'
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to modify season');
        });
    });

    describe('Edge Cases', () => {
        let edgeCaseSeasonId: string;

        beforeEach(async () => {
            // Create a single test season for edge case tests
            edgeCaseSeasonId = 'edge_case_test_season';
            await createTestSeason(edgeCaseSeasonId, {
                season: edgeCaseSeasonId,
                colloq_name: 'Edge Case Test Season',
                start_date: '2024-01-01T00:00:00Z',
                end_date: '2024-12-31T23:59:59Z',
                payment_required: true,
                max_user_submissions: 3,
                can_vote: true,
                is_active: true
            });
        });

        it('should reject when end_date equals start_date', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season_id: edgeCaseSeasonId,
                start_date: '2024-03-01T00:00:00Z',
                end_date: '2024-03-01T00:00:00Z'
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('end_date must be after start_date');
        });

        it('should accept boolean false values as valid input', async () => {
            // Mock successful Lambda response for this test
            mockLambdaInvoke.mockResolvedValue({
                StatusCode: 200,
                Payload: new TextEncoder().encode(JSON.stringify({
                    success: true,
                    message: 'Season modified successfully'
                }))
            });

            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season_id: edgeCaseSeasonId,
                startSilently: false,
                endSilently: false
            });

            const response = await handler(event);

            // Boolean false values should pass validation and succeed
            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.body)).toEqual({
                message: 'Season modified successfully',
                season_id: edgeCaseSeasonId,
                updated_fields: ['startSilently', 'endSilently']
            });

            // Verify Lambda was called with boolean false values
            const lambdaCall = mockLambdaInvoke.mock.calls[0][0];
            const payload = JSON.parse(lambdaCall.input.Payload);
            expect(payload.seasonData.startSilently).toBe(false);
            expect(payload.seasonData.endSilently).toBe(false);
        });
    });

});