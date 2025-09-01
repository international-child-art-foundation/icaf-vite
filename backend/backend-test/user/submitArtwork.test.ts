import { describe, beforeAll, afterAll, beforeEach, afterEach, test, expect } from '@jest/globals';
import { handler } from '../../functions/user/submitArtwork';
import { createTestTable, cleanupTestData, createTestUser } from '../shared/test-infrastructure';
import { TestDataGenerator } from '../shared/simple-test-helpers';
import { PRESET_TEST_DATA } from '../shared/simple-preset-db';

describe('Submit Artwork API', () => {
    let testUserIds: string[] = [];

    beforeAll(async () => {
        await createTestTable();
    });

    afterAll(async () => {
        // Cleanup all test data
        for (const userId of testUserIds) {
            await cleanupTestData(`USER#${userId}`);
        }
    });

    beforeEach(async () => {
        // Reset for each test
        testUserIds = [];
    });

    afterEach(async () => {
        // Clean up test data after each test
        for (const userId of testUserIds) {
            await cleanupTestData(`USER#${userId}`);
        }
        testUserIds = [];
    });

    test('should successfully submit artwork for valid user and season', async () => {
        // Create test user
        const userId = TestDataGenerator.generateUserId('SUBMIT_TEST');
        testUserIds.push(userId);

        await createTestUser(userId, {
            f_name: 'John',
            l_name: 'Artist',
            dob: '1990-01-01',
            role: 'user',
            can_submit: true,
            has_paid: true
        });

        // Use preset active season
        const season = PRESET_TEST_DATA.seasons.CURRENT_SEASON;

        const event = {
            requestContext: {
                authorizer: {
                    claims: {
                        sub: userId
                    }
                }
            },
            body: JSON.stringify({
                season: season,
                title: 'Test Artwork',
                description: 'A beautiful test artwork',
                file_type: 'jpg',
                is_ai_generated: false,
                f_name: 'John',
                age: 34,
                location: 'US',
                is_virtual: false
            })
        };

        const result = await handler(event);

        expect(result.statusCode).toBe(201);

        const body = JSON.parse(result.body);
        expect(body.success).toBe(true);
        expect(body.artwork_id).toBeDefined();
        expect(body.message).toContain('created successfully');
        expect(body.s3_key).toContain(season);
        expect(body.s3_key).toContain(userId);
        expect(body.submission_count).toBe(1);
        expect(body.season).toBe(season);
        expect(body.title).toBe('Test Artwork');
    });

    test('should reject submission without authentication', async () => {
        const event = {
            body: JSON.stringify({
                season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
                title: 'Test Artwork',
                file_type: 'jpg',
                is_ai_generated: false,
                f_name: 'John',
                age: 34,
                location: 'US',
                is_virtual: false
            })
        };

        const result = await handler(event);

        expect(result.statusCode).toBe(401);
        expect(JSON.parse(result.body).message).toBe('Unauthorized');
    });

    test('should reject submission with invalid JSON', async () => {
        const userId = TestDataGenerator.generateUserId('SUBMIT_TEST');
        testUserIds.push(userId);

        const event = {
            requestContext: {
                authorizer: {
                    claims: {
                        sub: userId
                    }
                }
            },
            body: 'invalid json'
        };

        const result = await handler(event);

        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body).message).toBe('Invalid JSON in request body');
    });

    test('should reject submission with validation errors', async () => {
        const userId = TestDataGenerator.generateUserId('SUBMIT_TEST');
        testUserIds.push(userId);

        const event = {
            requestContext: {
                authorizer: {
                    claims: {
                        sub: userId
                    }
                }
            },
            body: JSON.stringify({
                // Missing required fields
                season: '',
                title: '',
                file_type: 'invalid',
                is_ai_generated: false,
                f_name: '',
                age: -1,
                location: '',
                is_virtual: 'not_boolean'
            })
        };

        const result = await handler(event);

        expect(result.statusCode).toBe(400);

        const body = JSON.parse(result.body);
        expect(body.message).toBe('Validation failed');
        expect(body.errors).toBeInstanceOf(Array);
        expect(body.errors.length).toBeGreaterThan(0);
    });

    test('should reject submission for inactive season', async () => {
        const userId = TestDataGenerator.generateUserId('SUBMIT_TEST');
        testUserIds.push(userId);

        await createTestUser(userId, {
            f_name: 'John',
            l_name: 'Artist',
            dob: '1990-01-01',
            role: 'user',
            can_submit: true,
            has_paid: true
        });

        const event = {
            requestContext: {
                authorizer: {
                    claims: {
                        sub: userId
                    }
                }
            },
            body: JSON.stringify({
                season: 'INACTIVE_SEASON_2024',
                title: 'Test Artwork',
                file_type: 'jpg',
                is_ai_generated: false,
                f_name: 'John',
                age: 34,
                location: 'US',
                is_virtual: false
            })
        };

        const result = await handler(event);

        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body).message).toBe('Requested season is not active');
    });

    test('should reject submission for user without can_submit permission', async () => {
        const userId = TestDataGenerator.generateUserId('SUBMIT_TEST');
        testUserIds.push(userId);

        await createTestUser(userId, {
            f_name: 'John',
            l_name: 'Restricted',
            dob: '1990-01-01',
            role: 'user',
            can_submit: false, // Not allowed to submit
            has_paid: true
        });

        const event = {
            requestContext: {
                authorizer: {
                    claims: {
                        sub: userId
                    }
                }
            },
            body: JSON.stringify({
                season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
                title: 'Test Artwork',
                file_type: 'jpg',
                is_ai_generated: false,
                f_name: 'John',
                age: 34,
                location: 'US',
                is_virtual: false
            })
        };

        const result = await handler(event);

        expect(result.statusCode).toBe(403);
        expect(JSON.parse(result.body).message).toBe('User is not authorized to submit artwork');
    });

    test('should reject duplicate submission for same user and season', async () => {
        const userId = TestDataGenerator.generateUserId('SUBMIT_TEST');
        testUserIds.push(userId);

        await createTestUser(userId, {
            f_name: 'John',
            l_name: 'Artist',
            dob: '1990-01-01',
            role: 'user',
            can_submit: true,
            has_paid: true
        });

        const submissionData = {
            season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
            title: 'Test Artwork',
            file_type: 'jpg',
            is_ai_generated: false,
            f_name: 'John',
            age: 34,
            location: 'US',
            is_virtual: false
        };

        const event = {
            requestContext: {
                authorizer: {
                    claims: {
                        sub: userId
                    }
                }
            },
            body: JSON.stringify(submissionData)
        };

        // First submission should succeed
        const firstResult = await handler(event);
        expect(firstResult.statusCode).toBe(201);

        // Second submission should fail
        const secondResult = await handler(event);
        expect(secondResult.statusCode).toBe(409);
        expect(JSON.parse(secondResult.body).message).toBe('You have already submitted artwork for this season');
    });

    test('should handle AI-generated artwork submission', async () => {
        const userId = TestDataGenerator.generateUserId('SUBMIT_TEST');
        testUserIds.push(userId);

        await createTestUser(userId, {
            f_name: 'AI',
            l_name: 'Artist',
            dob: '1990-01-01',
            role: 'user',
            can_submit: true,
            has_paid: true
        });

        const event = {
            requestContext: {
                authorizer: {
                    claims: {
                        sub: userId
                    }
                }
            },
            body: JSON.stringify({
                season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
                title: 'AI Generated Art',
                description: 'Created with AI',
                file_type: 'png',
                is_ai_generated: true,
                ai_model: 'DALL-E 3',
                f_name: 'AI',
                age: 25,
                location: 'US',
                is_virtual: true
            })
        };

        const result = await handler(event);

        expect(result.statusCode).toBe(201);

        const body = JSON.parse(result.body);
        expect(body.success).toBe(true);
        expect(body.artwork_id).toBeDefined();
        expect(body.title).toBe('AI Generated Art');
    });
});
