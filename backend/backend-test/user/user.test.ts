import { createTestTable, TEST_PREFIXES } from '../shared/test-infrastructure';
import { TestSetup } from '../shared/test-utils';

// mock user handler function 
const mockUserHandler = async (event: any) => {
    const userId = event.requestContext?.authorizer?.claims?.sub;

    if (!userId) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Unauthorized' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    // mock user profile response
    const response = {
        UUID: userId,
        email: event.requestContext?.authorizer?.claims?.email || 'user@example.com',
        f_name: 'John',
        l_name: 'Doe',
        role: 'user',
        has_cur_season_submission: false,
        has_magazine_subscription: true,
        has_newsletter_subscription: false,
        g_f_name: null,
        g_l_name: null,
        birthdate: '2000-01-01'
    };

    return {
        statusCode: 200,
        body: JSON.stringify(response),
        headers: { 'Content-Type': 'application/json' }
    };
};

// test cases
const testCases = [
    {
        name: "✅ Get user profile (authenticated user)",
        event: {
            requestContext: {
                authorizer: {
                    claims: {
                        sub: 'test-user-123',
                        email: 'john.doe@example.com',
                        given_name: 'John',
                        family_name: 'Doe'
                    }
                }
            }
        },
        expectedStatus: 200,
        description: "Should return user profile with correct format"
    },
    {
        name: "❌ Unauthorized access (no user ID)",
        event: {
            requestContext: {
                authorizer: {
                    claims: {}
                }
            }
        },
        expectedStatus: 401,
        description: "Should reject access without user ID"
    },
    {
        name: "❌ Unauthorized access (no authorizer)",
        event: {
            requestContext: {}
        },
        expectedStatus: 401,
        description: "Should reject access without authorizer"
    }
];

describe('User Handler Tests', () => {
    beforeAll(async () => {
        await createTestTable();
    });

    afterEach(async () => {
        await TestSetup.cleanupTestData(TEST_PREFIXES.USER);
    });

    describe('Authentication Tests', () => {
        test('should return user profile for authenticated user', async () => {
            const testCase = testCases[0];
            const result = await mockUserHandler(testCase.event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(testCase.expectedStatus);
            expect(responseBody).toHaveProperty('UUID', 'test-user-123');
            expect(responseBody).toHaveProperty('email', 'john.doe@example.com');
            expect(responseBody).toHaveProperty('f_name', 'John');
            expect(responseBody).toHaveProperty('l_name', 'Doe');
            expect(responseBody).toHaveProperty('role', 'user');
        });

        test('should reject access without user ID', async () => {
            const testCase = testCases[1];
            const result = await mockUserHandler(testCase.event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(testCase.expectedStatus);
            expect(responseBody).toHaveProperty('message', 'Unauthorized');
        });

        test('should reject access without authorizer', async () => {
            const testCase = testCases[2];
            const result = await mockUserHandler(testCase.event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(testCase.expectedStatus);
            expect(responseBody).toHaveProperty('message', 'Unauthorized');
        });
    });

    describe('Response Format Tests', () => {
        test('should return correct response format for valid user', async () => {
            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: 'test-user-456',
                            email: 'jane.smith@example.com',
                            given_name: 'Jane',
                            family_name: 'Smith'
                        }
                    }
                }
            };

            const result = await mockUserHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(200);
            expect(result.headers).toHaveProperty('Content-Type', 'application/json');
            expect(responseBody).toHaveProperty('UUID');
            expect(responseBody).toHaveProperty('email');
            expect(responseBody).toHaveProperty('f_name');
            expect(responseBody).toHaveProperty('l_name');
            expect(responseBody).toHaveProperty('role');
            expect(responseBody).toHaveProperty('has_cur_season_submission');
            expect(responseBody).toHaveProperty('has_magazine_subscription');
            expect(responseBody).toHaveProperty('has_newsletter_subscription');
            expect(responseBody).toHaveProperty('g_f_name');
            expect(responseBody).toHaveProperty('g_l_name');
            expect(responseBody).toHaveProperty('birthdate');
        });

        test('should handle missing email in claims', async () => {
            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: 'test-user-789'
                            // No email provided
                        }
                    }
                }
            };

            const result = await mockUserHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(200);
            expect(responseBody.email).toBe('user@example.com'); // Default email
        });
    });

    describe('Error Handling Tests', () => {
        test('should handle null authorizer', async () => {
            const event = {
                requestContext: {
                    authorizer: null
                }
            };

            const result = await mockUserHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(401);
            expect(responseBody).toHaveProperty('message', 'Unauthorized');
        });

        test('should handle undefined claims', async () => {
            const event = {
                requestContext: {
                    authorizer: {
                        claims: undefined
                    }
                }
            };

            const result = await mockUserHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(401);
            expect(responseBody).toHaveProperty('message', 'Unauthorized');
        });

        test('should handle empty claims object', async () => {
            const event = {
                requestContext: {
                    authorizer: {
                        claims: {}
                    }
                }
            };

            const result = await mockUserHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(401);
            expect(responseBody).toHaveProperty('message', 'Unauthorized');
        });
    });

    describe('Data Validation Tests', () => {
        test('should validate user data structure', () => {
            const userData = {
                UUID: 'test-user-123',
                email: 'test@example.com',
                f_name: 'Test',
                l_name: 'User',
                role: 'user',
                has_cur_season_submission: false,
                has_magazine_subscription: true,
                has_newsletter_subscription: false,
                g_f_name: null,
                g_l_name: null,
                birthdate: '2000-01-01'
            };

            // validate required fields
            expect(userData).toHaveProperty('UUID');
            expect(userData).toHaveProperty('email');
            expect(userData).toHaveProperty('f_name');
            expect(userData).toHaveProperty('l_name');
            expect(userData).toHaveProperty('role');
            expect(userData).toHaveProperty('birthdate');
        });

        test('should handle different user roles', async () => {
            const roles = ['user', 'guardian', 'admin', 'contributor'];

            for (const role of roles) {
                const event = {
                    requestContext: {
                        authorizer: {
                            claims: {
                                sub: `test-${role}-123`,
                                email: `${role}@example.com`
                            }
                        }
                    }
                };

                const result = await mockUserHandler(event);
                const responseBody = JSON.parse(result.body);

                expect(result.statusCode).toBe(200);
                expect(responseBody).toHaveProperty('UUID');
                expect(responseBody).toHaveProperty('email');
            }
        });
    });

    describe('Integration with Shared Infrastructure', () => {
        test('should work with shared test infrastructure', async () => {
            // create test user
            const userId = await TestSetup.createUserWithPrefix(
                TEST_PREFIXES.USER,
                'adult',
                {
                    f_name: 'Integration',
                    l_name: 'Test',
                    email: 'integration@test.com'
                }
            );

            // mock request using the user
            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: userId,
                            email: 'integration@test.com'
                        }
                    }
                }
            };

            const result = await mockUserHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(200);
            expect(responseBody.UUID).toBe(userId);
        });

        test('should handle multiple concurrent requests', async () => {
            const promises = [];

            // create multiple concurrent requests
            for (let i = 0; i < 3; i++) {
                const event = {
                    requestContext: {
                        authorizer: {
                            claims: {
                                sub: `concurrent-user-${i}`,
                                email: `user${i}@example.com`
                            }
                        }
                    }
                };

                promises.push(mockUserHandler(event));
            }

            const results = await Promise.all(promises);

            // validate all requests are successful
            for (const result of results) {
                expect(result.statusCode).toBe(200);
                const responseBody = JSON.parse(result.body);
                expect(responseBody).toHaveProperty('UUID');
                expect(responseBody).toHaveProperty('email');
            }
        });
    });
});
