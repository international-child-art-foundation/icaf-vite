/**
 * createSeason test
 * 
 * Tests for admin createSeason functionality
 * Tests season creation with various scenarios
 */

import { PresetEvents, TempTestData } from '../shared/simple-preset-db';

// Helper function to create basic season data
const createBasicSeasonData = (overrides = {}) => ({
    season: 'test_season',
    colloq_name: 'Test Season',
    start_date: '2024-01-01T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    payment_required: true,
    max_user_submissions: 3,
    can_vote: true,
    ...overrides
});

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
import { handler } from '../../functions/admin/createSeason';

describe('createSeason test', () => {
    const testPrefix = 'CREATE_SEASON_TEST';

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
                    season: 'test_season',
                    colloq_name: 'Test Season',
                    start_date: '2024-01-01T00:00:00Z',
                    end_date: '2024-12-31T23:59:59Z',
                    payment_required: true,
                    max_user_submissions: 3,
                    can_vote: true
                }),
                httpMethod: 'POST'
            };

            const response = await handler(event);

            expect(response.statusCode).toBe(401);
            expect(response.body).toContain('Unauthorized');
        });

        it('should return 403 when user is not admin', async () => {
            const event = PresetEvents.createPostEvent('ADULT_USER', {
                season: 'test_season',
                colloq_name: 'Test Season',
                start_date: '2024-01-01T00:00:00Z',
                end_date: '2024-12-31T23:59:59Z',
                payment_required: true,
                max_user_submissions: 3,
                can_vote: true
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(403);
            expect(response.body).toContain('Admin access required');
        });

        it('should allow admin user to create season', async () => {
            // Mock successful Lambda response
            mockLambdaInvoke.mockResolvedValue({
                StatusCode: 200,
                Payload: new TextEncoder().encode(JSON.stringify({ success: true }))
            });

            const event = PresetEvents.createPostEvent('ADMIN_USER',
                createBasicSeasonData({
                    season: 'admin_test_season',
                    colloq_name: 'Admin Test Season'
                })
            );

            const response = await handler(event);

            expect(response.statusCode).toBe(201);
            const responseBody = JSON.parse(response.body);
            expect(responseBody.message).toBe('Season created successfully');
            expect(responseBody.season.season).toBe('admin_test_season');
        });
    });

    describe('Request Validation', () => {
        it('should return 400 when request body is missing', async () => {
            const event = {
                ...PresetEvents.createPostEvent('ADMIN_USER', {}),
                body: null
            };

            const response = await handler(event);

            expect(response.statusCode).toBe(400); // Bad Request
            expect(response.body).toContain('Request body is required');
        });

        it('should return 400 when season is missing', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER',
                createBasicSeasonData({ season: undefined })
            );

            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('season is required');
        });

        it('should return 400 when colloq_name is missing', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER',
                createBasicSeasonData({ colloq_name: undefined })
            );

            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('colloq_name is required');
        });

        it('should return 400 when start_date is invalid', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER',
                createBasicSeasonData({ start_date: 'invalid-date' })
            );

            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('start_date must be a valid date');
        });

        it('should return 400 when end_date is before start_date', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER',
                createBasicSeasonData({
                    start_date: '2024-03-01T00:00:00Z',
                    end_date: '2024-02-01T00:00:00Z'
                })
            );

            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('end_date must be after start_date');
        });

        it('should return 400 when payment_required is not boolean', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER',
                createBasicSeasonData({ payment_required: 'not-boolean' })
            );

            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('payment_required is required and must be a boolean');
        });

        it('should return 400 when max_user_submissions is not a positive integer', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER',
                createBasicSeasonData({ max_user_submissions: -1 })
            );

            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('max_user_submissions is required and must be a positive number');
        });

        it('should return 400 when can_vote is not boolean', async () => {
            const event = PresetEvents.createPostEvent('ADMIN_USER',
                createBasicSeasonData({ can_vote: 'not-boolean' })
            );

            const response = await handler(event);

            expect(response.statusCode).toBe(400);
            expect(response.body).toContain('can_vote is required and must be a boolean');
        });
    });

    describe('Season Name Uniqueness', () => {
        it('should return 409 when season name already exists', async () => {
            // Use an existing season from preset data to test duplicate detection
            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season: 'PRESET_CURRENT_2024', // This season already exists in preset data
                colloq_name: 'Another Duplicate Season',
                start_date: '2024-02-01T00:00:00Z',
                end_date: '2024-11-30T23:59:59Z',
                payment_required: false,
                max_user_submissions: 5,
                can_vote: false
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(409);
            expect(response.body).toContain('Season \'PRESET_CURRENT_2024\' already exists');

            // Verify Lambda was not called since it should fail before reaching Lambda
            expect(mockLambdaInvoke).not.toHaveBeenCalled();
        });
    });

    describe('Lambda Integration', () => {
        it('should call SeasonManager Lambda with correct payload for season creation', async () => {
            // Mock successful Lambda response
            mockLambdaInvoke.mockResolvedValue({
                StatusCode: 200,
                Payload: new TextEncoder().encode(JSON.stringify({ success: true }))
            });

            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season: 'lambda_test_season',
                colloq_name: 'Lambda Test Season',
                start_date: '2024-01-01T00:00:00Z',
                end_date: '2024-12-31T23:59:59Z',
                payment_required: true,
                max_user_submissions: 3,
                can_vote: true,
                startSilently: true,
                endSilently: false
            });

            const response = await handler(event);

            // Verify Lambda was called
            expect(mockLambdaInvoke).toHaveBeenCalledTimes(1);
            const lambdaCall = mockLambdaInvoke.mock.calls[0][0];
            expect(lambdaCall.input.FunctionName).toBe('SeasonManager');
            expect(lambdaCall.input.InvocationType).toBe('RequestResponse');

            const payload = JSON.parse(lambdaCall.input.Payload);
            expect(payload.action).toBe('createSeason');
            expect(payload.seasonData.season).toBe('lambda_test_season');
            expect(payload.seasonData.colloq_name).toBe('Lambda Test Season');
            expect(payload.seasonData.start_date).toBe('2024-01-01T00:00:00Z');
            expect(payload.seasonData.end_date).toBe('2024-12-31T23:59:59Z');
            expect(payload.seasonData.payment_required).toBe(true);
            expect(payload.seasonData.max_user_submissions).toBe(3);
            expect(payload.seasonData.can_vote).toBe(true);
            expect(payload.seasonData.startSilently).toBe(true);
            expect(payload.seasonData.endSilently).toBe(false);

            // Verify response
            expect(response.statusCode).toBe(201);
            const responseBody = JSON.parse(response.body);
            expect(responseBody.message).toBe('Season created successfully');
            expect(responseBody.season.season).toBe('lambda_test_season');
            expect(responseBody.season.colloq_name).toBe('Lambda Test Season');
            expect(responseBody.season.is_active).toBe(true);
        });

        it('should call SeasonManager Lambda with default values for optional fields', async () => {
            mockLambdaInvoke.mockResolvedValue({
                StatusCode: 200,
                Payload: new TextEncoder().encode(JSON.stringify({ success: true }))
            });

            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season: 'default_test_season',
                colloq_name: 'Default Test Season',
                start_date: '2024-01-01T00:00:00Z',
                end_date: '2024-12-31T23:59:59Z',
                payment_required: false,
                max_user_submissions: 1,
                can_vote: false
                // startSilently and endSilently not provided
            });

            const response = await handler(event);

            expect(mockLambdaInvoke).toHaveBeenCalledTimes(1);
            const lambdaCall = mockLambdaInvoke.mock.calls[0][0];
            const payload = JSON.parse(lambdaCall.input.Payload);
            expect(payload.seasonData.startSilently).toBe(false);
            expect(payload.seasonData.endSilently).toBe(false);

            expect(response.statusCode).toBe(201);
        });

        it('should handle Lambda invocation failure', async () => {
            // Mock Lambda failure
            mockLambdaInvoke.mockRejectedValue(new Error('Lambda invocation failed'));

            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season: 'failure_test_season',
                colloq_name: 'Failure Test Season',
                start_date: '2024-01-01T00:00:00Z',
                end_date: '2024-12-31T23:59:59Z',
                payment_required: true,
                max_user_submissions: 3,
                can_vote: true
            });

            const response = await handler(event);

            expect(mockLambdaInvoke).toHaveBeenCalledTimes(1);
            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to create season');
        });

        it('should handle Lambda returning error status code', async () => {
            // Mock Lambda returning error status
            mockLambdaInvoke.mockResolvedValue({
                StatusCode: 500,
                Payload: new TextEncoder().encode(JSON.stringify({ errorMessage: 'Internal server error' }))
            });

            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season: 'error_test_season',
                colloq_name: 'Error Test Season',
                start_date: '2024-01-01T00:00:00Z',
                end_date: '2024-12-31T23:59:59Z',
                payment_required: true,
                max_user_submissions: 3,
                can_vote: true
            });

            const response = await handler(event);

            expect(mockLambdaInvoke).toHaveBeenCalledTimes(1);
            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to create season');
        });

        it('should handle Lambda returning error in payload', async () => {
            // Mock Lambda returning error in payload
            mockLambdaInvoke.mockResolvedValue({
                StatusCode: 200,
                Payload: new TextEncoder().encode(JSON.stringify({ errorMessage: 'Season creation failed' }))
            });

            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season: 'payload_error_season',
                colloq_name: 'Payload Error Season',
                start_date: '2024-01-01T00:00:00Z',
                end_date: '2024-12-31T23:59:59Z',
                payment_required: true,
                max_user_submissions: 3,
                can_vote: true
            });

            const response = await handler(event);

            expect(mockLambdaInvoke).toHaveBeenCalledTimes(1);
            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to create season');
        });

        it('should handle Lambda returning invalid JSON response', async () => {
            // Mock Lambda returning invalid JSON
            mockLambdaInvoke.mockResolvedValue({
                StatusCode: 200,
                Payload: 'invalid json response'
            });

            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season: 'invalid_json_season',
                colloq_name: 'Invalid JSON Season',
                start_date: '2024-01-01T00:00:00Z',
                end_date: '2024-12-31T23:59:59Z',
                payment_required: true,
                max_user_submissions: 3,
                can_vote: true
            });

            const response = await handler(event);

            expect(mockLambdaInvoke).toHaveBeenCalledTimes(1);
            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to create season');
        });

        it('should handle Lambda returning empty response', async () => {
            // Mock Lambda returning empty response
            mockLambdaInvoke.mockResolvedValue({
                StatusCode: 200,
                Payload: ''
            });

            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season: 'empty_response_season',
                colloq_name: 'Empty Response Season',
                start_date: '2024-01-01T00:00:00Z',
                end_date: '2024-12-31T23:59:59Z',
                payment_required: true,
                max_user_submissions: 3,
                can_vote: true
            });

            const response = await handler(event);

            expect(mockLambdaInvoke).toHaveBeenCalledTimes(1);
            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to create season');
        });
    });

    describe('Successful Creation', () => {
        it('should successfully create season with all required fields', async () => {
            mockLambdaInvoke.mockResolvedValue({
                StatusCode: 200,
                Payload: new TextEncoder().encode(JSON.stringify({ success: true }))
            });

            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season: 'success_season',
                colloq_name: 'Success Season',
                start_date: '2024-01-01T00:00:00Z',
                end_date: '2024-12-31T23:59:59Z',
                payment_required: true,
                max_user_submissions: 3,
                can_vote: true
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(201);
            const responseBody = JSON.parse(response.body);
            expect(responseBody.message).toBe('Season created successfully');
            expect(responseBody.season.season).toBe('success_season');
            expect(responseBody.season.colloq_name).toBe('Success Season');
            expect(responseBody.season.payment_required).toBe(true);
            expect(responseBody.season.max_user_submissions).toBe(3);
            expect(responseBody.season.can_vote).toBe(true);
            expect(responseBody.season.is_active).toBe(true);

            // Verify Lambda was called with correct parameters
            expect(mockLambdaInvoke).toHaveBeenCalledTimes(1);
            const lambdaCall = mockLambdaInvoke.mock.calls[0][0];
            expect(lambdaCall.input.FunctionName).toBe('SeasonManager');
            expect(lambdaCall.input.InvocationType).toBe('RequestResponse');

            const payload = JSON.parse(lambdaCall.input.Payload);
            expect(payload.action).toBe('createSeason');
            expect(payload.seasonData.season).toBe('success_season');
            expect(payload.seasonData.colloq_name).toBe('Success Season');
        });

        it('should successfully create season with boolean false values', async () => {
            mockLambdaInvoke.mockResolvedValue({
                StatusCode: 200,
                Payload: new TextEncoder().encode(JSON.stringify({ success: true }))
            });

            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season: 'false_values_season',
                colloq_name: 'False Values Season',
                start_date: '2024-01-01T00:00:00Z',
                end_date: '2024-12-31T23:59:59Z',
                payment_required: false,
                max_user_submissions: 1,
                can_vote: false,
                startSilently: false,
                endSilently: false
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(201);
            const responseBody = JSON.parse(response.body);
            expect(responseBody.season.payment_required).toBe(false);
            expect(responseBody.season.max_user_submissions).toBe(1);
            expect(responseBody.season.can_vote).toBe(false);

            // Verify Lambda was called with correct parameters
            expect(mockLambdaInvoke).toHaveBeenCalledTimes(1);
            const lambdaCall = mockLambdaInvoke.mock.calls[0][0];
            const payload = JSON.parse(lambdaCall.input.Payload);
            expect(payload.seasonData.payment_required).toBe(false);
            expect(payload.seasonData.max_user_submissions).toBe(1);
            expect(payload.seasonData.can_vote).toBe(false);
        });
    });

    describe('Lambda Error Handling', () => {
        it('should handle Lambda service errors and return 500', async () => {
            // Mock Lambda error response
            mockLambdaInvoke.mockRejectedValue(new Error('Lambda service unavailable'));

            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season: 'error_test_season',
                colloq_name: 'Error Test Season',
                start_date: '2024-01-01T00:00:00Z',
                end_date: '2024-12-31T23:59:59Z',
                payment_required: true,
                max_user_submissions: 3,
                can_vote: true
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to create season');
        });

        it('should handle Lambda function errors and return 500', async () => {
            // Mock Lambda function error response
            mockLambdaInvoke.mockResolvedValue({
                StatusCode: 500,
                Payload: new TextEncoder().encode(JSON.stringify({
                    error: 'Internal server error',
                    message: 'Failed to process season creation'
                }))
            });

            const event = PresetEvents.createPostEvent('ADMIN_USER', {
                season: 'error_test_season',
                colloq_name: 'Error Test Season',
                start_date: '2024-01-01T00:00:00Z',
                end_date: '2024-12-31T23:59:59Z',
                payment_required: true,
                max_user_submissions: 3,
                can_vote: true
            });

            const response = await handler(event);

            expect(response.statusCode).toBe(500);
            expect(response.body).toContain('Failed to create season');
        });
    });
});
