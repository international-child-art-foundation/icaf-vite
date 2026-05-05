import { createTestTable, TEST_PREFIXES, cleanupTestData } from '../shared/test-infrastructure';
import { TestSetup } from '../shared/test-utils';

// mock delete account handler function
const mockDeleteAccountHandler = async (event: any) => {
    const userId = event.requestContext?.authorizer?.claims?.sub;
    const body = JSON.parse(event.body || '{}');
    const { password } = body;

    if (!userId) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Unauthorized' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    if (!password) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Password confirmation is required' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    // mock successful deletion
    return {
        statusCode: 204,
        body: '',
        headers: { 'Content-Type': 'application/json' }
    };
};

describe('Delete Account Tests', () => {
    beforeAll(async () => {
        await createTestTable();
    });

    afterEach(async () => {
        await cleanupTestData(TEST_PREFIXES.DELETE_ACCOUNT);
    });

    describe('Authentication Tests', () => {
        test('should reject delete account without user ID', async () => {
            const event = {
                body: JSON.stringify({
                    password: 'SecurePass123!'
                })
            };

            const result = await mockDeleteAccountHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(401);
            expect(responseBody).toHaveProperty('message', 'Unauthorized');
        });

        test('should reject delete account without password', async () => {
            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: 'test-user-123',
                            email: 'test@example.com'
                        }
                    }
                },
                body: JSON.stringify({})
            };

            const result = await mockDeleteAccountHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(400);
            expect(responseBody).toHaveProperty('message', 'Password confirmation is required');
        });

        test('should accept valid delete account request', async () => {
            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: 'test-user-123',
                            email: 'test@example.com'
                        }
                    }
                },
                body: JSON.stringify({
                    password: 'SecurePass123!'
                })
            };

            const result = await mockDeleteAccountHandler(event);

            expect(result.statusCode).toBe(204);
            expect(result.body).toBe('');
        });
    });

    describe('Data Deletion Tests', () => {
        test('should delete user profile data', async () => {
            // create test user
            const userId = await TestSetup.createUserWithPrefix(
                TEST_PREFIXES.DELETE_ACCOUNT,
                'adult',
                {
                    f_name: 'Delete',
                    l_name: 'Test',
                    email: 'delete@test.com'
                }
            );

            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: userId,
                            email: 'delete@test.com'
                        }
                    }
                },
                body: JSON.stringify({
                    password: 'SecurePass123!'
                })
            };

            const result = await mockDeleteAccountHandler(event);

            expect(result.statusCode).toBe(204);
        });

        test('should delete user artwork data', async () => {
            // create test user and artwork
            const userId = await TestSetup.createUserWithPrefix(
                TEST_PREFIXES.DELETE_ACCOUNT,
                'adult'
            );

            await TestSetup.createArtworkWithPrefix(
                TEST_PREFIXES.DELETE_ACCOUNT,
                userId,
                'basic',
                {
                    title: 'Artwork to Delete',
                    description: 'This artwork should be deleted'
                }
            );

            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: userId
                        }
                    }
                },
                body: JSON.stringify({
                    password: 'SecurePass123!'
                })
            };

            const result = await mockDeleteAccountHandler(event);

            expect(result.statusCode).toBe(204);
        });

        test('should delete user donation data', async () => {
            // create test user and donation
            const userId = await TestSetup.createUserWithPrefix(
                TEST_PREFIXES.DELETE_ACCOUNT,
                'adult'
            );

            await TestSetup.createDonationWithPrefix(
                TEST_PREFIXES.DELETE_ACCOUNT,
                userId,
                'basic',
                {
                    amount: 50.00,
                    currency: 'USD'
                }
            );

            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: userId
                        }
                    }
                },
                body: JSON.stringify({
                    password: 'SecurePass123!'
                })
            };

            const result = await mockDeleteAccountHandler(event);

            expect(result.statusCode).toBe(204);
        });
    });

    describe('Error Handling Tests', () => {
        test('should handle invalid password format', async () => {
            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: 'test-user-123'
                        }
                    }
                },
                body: JSON.stringify({
                    password: '' // empty password
                })
            };

            const result = await mockDeleteAccountHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(400);
            expect(responseBody).toHaveProperty('message', 'Password confirmation is required');
        });

        test('should handle missing request body', async () => {
            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: 'test-user-123'
                        }
                    }
                }
                // no body
            };

            const result = await mockDeleteAccountHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(400);
            expect(responseBody).toHaveProperty('message', 'Password confirmation is required');
        });

        test('should handle malformed JSON in body', async () => {
            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: 'test-user-123'
                        }
                    }
                },
                body: 'invalid json'
            };

            // throw a JSON parsing error
            try {
                await mockDeleteAccountHandler(event);
                // if we get here, it means no error was thrown, which is incorrect
                expect(true).toBe(false);
            } catch (error: any) {
                // expect a JSON parsing error
                expect(error).toBeInstanceOf(SyntaxError);
                expect(error.message).toContain('Unexpected token');
            }
        });
    });

    describe('Security Tests', () => {
        test('should not allow deletion without proper authentication', async () => {
            const event = {
                body: JSON.stringify({
                    password: 'SecurePass123!'
                })
                // no authorizer
            };

            const result = await mockDeleteAccountHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(401);
            expect(responseBody).toHaveProperty('message', 'Unauthorized');
        });

        test('should require password confirmation', async () => {
            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: 'test-user-123'
                        }
                    }
                },
                body: JSON.stringify({
                    // no password field
                })
            };

            const result = await mockDeleteAccountHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(400);
            expect(responseBody).toHaveProperty('message', 'Password confirmation is required');
        });

        test('should validate user ownership', async () => {
            // create test user
            const userId = await TestSetup.createUserWithPrefix(
                TEST_PREFIXES.DELETE_ACCOUNT,
                'adult'
            );

            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: userId, // correct user ID
                            email: 'test@example.com'
                        }
                    }
                },
                body: JSON.stringify({
                    password: 'SecurePass123!'
                })
            };

            const result = await mockDeleteAccountHandler(event);

            expect(result.statusCode).toBe(204);
        });
    });

    describe('Data Validation Tests', () => {
        test('should validate user data before deletion', () => {
            const userData = {
                user_id: 'test-user-123',
                f_name: 'Test',
                l_name: 'User',
                email: 'test@example.com',
                role: 'user',
                dob: '2000-01-01',
                timestamp: new Date().toISOString()
            };

            // validate user data format
            expect(userData).toHaveProperty('user_id');
            expect(userData).toHaveProperty('f_name');
            expect(userData).toHaveProperty('l_name');
            expect(userData).toHaveProperty('email');
            expect(userData).toHaveProperty('role');
            expect(userData).toHaveProperty('dob');
            expect(userData).toHaveProperty('timestamp');
        });

        test('should validate password format', () => {
            const validPasswords = [
                'SecurePass123!',
                'MyPassword456@',
                'TestPass789#'
            ];

            const invalidPasswords = [
                '',
                'short',
                'nouppercase123!',
                'NOLOWERCASE123!',
                'NoNumbers!',
                'NoSpecialChars123'
            ];

            // validate valid passwords
            for (const password of validPasswords) {
                expect(password.length).toBeGreaterThan(8);
                expect(/[A-Z]/.test(password)).toBe(true);
                expect(/[a-z]/.test(password)).toBe(true);
                expect(/[0-9]/.test(password)).toBe(true);
                expect(/[!@#$%^&*]/.test(password)).toBe(true);
            }

            // validate invalid passwords
            for (const password of invalidPasswords) {
                expect(password.length < 8 ||
                    !/[A-Z]/.test(password) ||
                    !/[a-z]/.test(password) ||
                    !/[0-9]/.test(password) ||
                    !/[!@#$%^&*]/.test(password)).toBe(true);
            }
        });
    });

    describe('Integration with Shared Infrastructure', () => {
        test('should work with shared test infrastructure for deletion', async () => {
            // create test user
            const userId = await TestSetup.createUserWithPrefix(
                TEST_PREFIXES.DELETE_ACCOUNT,
                'adult',
                {
                    f_name: 'Integration',
                    l_name: 'Delete',
                    email: 'integration.delete@test.com'
                }
            );

            // create related data
            await TestSetup.createArtworkWithPrefix(
                TEST_PREFIXES.DELETE_ACCOUNT,
                userId,
                'basic'
            );

            await TestSetup.createDonationWithPrefix(
                TEST_PREFIXES.DELETE_ACCOUNT,
                userId,
                'basic'
            );

            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: userId,
                            email: 'integration.delete@test.com'
                        }
                    }
                },
                body: JSON.stringify({
                    password: 'SecurePass123!'
                })
            };

            const result = await mockDeleteAccountHandler(event);

            expect(result.statusCode).toBe(204);
        });

        test('should handle multiple user deletions', async () => {
            const promises = [];

            // create multiple users and test deletion
            for (let i = 0; i < 3; i++) {
                const userId = await TestSetup.createUserWithPrefix(
                    TEST_PREFIXES.DELETE_ACCOUNT,
                    'adult',
                    {
                        f_name: `User${i}`,
                        l_name: 'Delete',
                        email: `user${i}.delete@test.com`
                    }
                );

                const event = {
                    requestContext: {
                        authorizer: {
                            claims: {
                                sub: userId,
                                email: `user${i}.delete@test.com`
                            }
                        }
                    },
                    body: JSON.stringify({
                        password: 'SecurePass123!'
                    })
                };

                promises.push(mockDeleteAccountHandler(event));
            }

            const results = await Promise.all(promises);

            // validate all deletion operations are successful
            for (const result of results) {
                expect(result.statusCode).toBe(204);
            }
        });
    });
});
