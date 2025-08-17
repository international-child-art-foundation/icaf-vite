/**
 * user register test
 * 
 * this file shows how to use the new simplified test system for user register test
 * simple, efficient, and easy to maintain
 */

import { PRESET_TEST_DATA, PresetEvents, TestAssertions, TempTestData } from '../shared/simple-test-helpers';

// mock register handler (in actual case, this will be the real Lambda function)
const mockRegisterHandler = async (event: any) => {
    const body = JSON.parse(event.body);

    // validate required fields
    if (!body.email || !body.password || !body.f_name || !body.l_name || !body.birthdate) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing required fields' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    // validate email format
    if (!body.email.includes('@')) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid email format' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    // mock successful registration
    return {
        statusCode: 201,
        body: JSON.stringify({
            message: 'User registered successfully',
            user_id: `new_user_${Date.now()}`
        }),
        headers: { 'Content-Type': 'application/json' }
    };
};

describe('user register test - simplified version', () => {
    const testPrefix = 'REGISTER_TEST';

    afterEach(async () => {
        // cleanup any temporary test data
        await TempTestData.cleanup(testPrefix);
    });

    describe('successful registration scenario', () => {
        const validRegistrationData = [
            {
                name: 'child user registration',
                data: {
                    email: 'child@example.com',
                    password: 'SecurePass123!',
                    f_name: 'Child',
                    l_name: 'User',
                    birthdate: '2010-05-15'
                }
            },
            {
                name: 'adult user registration',
                data: {
                    email: 'adult@example.com',
                    password: 'SecurePass123!',
                    f_name: 'Adult',
                    l_name: 'User',
                    birthdate: '1990-03-20'
                }
            },
            {
                name: 'guardian user registration',
                data: {
                    email: 'guardian@example.com',
                    password: 'SecurePass123!',
                    f_name: 'Guardian',
                    l_name: 'User',
                    birthdate: '1985-08-10'
                }
            }
        ];

        test.each(validRegistrationData)('should successfully register: $name', async ({ data }) => {
            const event = {
                body: JSON.stringify(data),
                httpMethod: 'POST'
            };

            const response = await mockRegisterHandler(event);

            TestAssertions.validateSuccessResponse(response, 201);

            const body = JSON.parse(response.body);
            expect(body.message).toContain('successfully');
            expect(body.user_id).toBeDefined();
        });
    });

    describe('validation failure scenario', () => {
        const invalidRegistrationData = [
            {
                name: 'missing email',
                data: {
                    password: 'SecurePass123!',
                    f_name: 'Test',
                    l_name: 'User',
                    birthdate: '1990-01-01'
                },
                expectedError: 'Missing required fields'
            },
            {
                    name: 'missing password',
                data: {
                    email: 'test@example.com',
                    f_name: 'Test',
                    l_name: 'User',
                    birthdate: '1990-01-01'
                },
                expectedError: 'Missing required fields'
            },
            {
                name: 'invalid email format',
                data: {
                    email: 'invalid-email',
                    password: 'SecurePass123!',
                    f_name: 'Test',
                    l_name: 'User',
                    birthdate: '1990-01-01'
                },
                expectedError: 'Invalid email format'
            },
            {
                name: 'missing name',
                data: {
                    email: 'test@example.com',
                    password: 'SecurePass123!',
                    birthdate: '1990-01-01'
                },
                expectedError: 'Missing required fields'
            }
        ];

        test.each(invalidRegistrationData)('should reject invalid registration: $name', async ({ data, expectedError }) => {
            const event = {
                body: JSON.stringify(data),
                httpMethod: 'POST'
            };

            const response = await mockRegisterHandler(event);

            TestAssertions.validateErrorResponse(response, 400);

            const body = JSON.parse(response.body);
            expect(body.error).toBe(expectedError);
        });
    });

    describe('edge case test', () => {
        it('should handle special characters in name', async () => {
            const event = {
                body: JSON.stringify({
                    email: 'special@example.com',
                    password: 'SecurePass123!',
                    f_name: 'José',
                    l_name: 'González',
                    birthdate: '1990-01-01'
                }),
                httpMethod: 'POST'
            };

            const response = await mockRegisterHandler(event);
            TestAssertions.validateSuccessResponse(response, 201);
        });

        it('should handle long name', async () => {
            const longName = 'A'.repeat(50);
            const event = {
                body: JSON.stringify({
                    email: 'longname@example.com',
                    password: 'SecurePass123!',
                    f_name: longName,
                    l_name: 'User',
                    birthdate: '1990-01-01'
                }),
                httpMethod: 'POST'
            };

            const response = await mockRegisterHandler(event);
            TestAssertions.validateSuccessResponse(response, 201);
        });

        it('should handle minimum age user', async () => {
            const event = {
                body: JSON.stringify({
                    email: 'young@example.com',
                    password: 'SecurePass123!',
                    f_name: 'Very',
                    l_name: 'Young',
                    birthdate: new Date().getFullYear() - 5 + '-01-01' // 5 years old
                }),
                httpMethod: 'POST'
            };

            const response = await mockRegisterHandler(event);
            TestAssertions.validateSuccessResponse(response, 201);
        });
    });

    describe('integration test with preset data', () => {
        it('should verify preset user data existence', () => {
            // verify preset user ID exists and is formatted correctly
            expect(PRESET_TEST_DATA.users.CHILD_USER).toBe('PRESET_CHILD_001');
            expect(PRESET_TEST_DATA.users.ADULT_USER).toBe('PRESET_ADULT_001');
            expect(PRESET_TEST_DATA.users.GUARDIAN_USER).toBe('PRESET_GUARDIAN_001');
            expect(PRESET_TEST_DATA.users.ADMIN_USER).toBe('PRESET_ADMIN_001');
        });

        it('should generate preset user authentication event', () => {
            const childEvent = PresetEvents.childUser();
            const adultEvent = PresetEvents.adultUser();
            const guardianEvent = PresetEvents.guardianUser();
            const adminEvent = PresetEvents.adminUser();

            // verify event structure
            expect(childEvent.requestContext.authorizer.claims.sub).toBe(PRESET_TEST_DATA.users.CHILD_USER);
            expect(adultEvent.requestContext.authorizer.claims.sub).toBe(PRESET_TEST_DATA.users.ADULT_USER);
            expect(guardianEvent.requestContext.authorizer.claims.sub).toBe(PRESET_TEST_DATA.users.GUARDIAN_USER);
            expect(adminEvent.requestContext.authorizer.claims.sub).toBe(PRESET_TEST_DATA.users.ADMIN_USER);
        });
    });

    describe('temporary data test (if needed)', () => {
        it('should create and clean up temporary test user', async () => {
            // create temporary user (for tests that need special attributes)
            const tempUserId = await TempTestData.createTempUser(testPrefix, {
                f_name: 'Temp',
                l_name: 'User',
                role: 'contributor'
            });

            expect(tempUserId).toContain(testPrefix);

            // temporary user will be automatically cleaned up in afterEach
        });
    });
});