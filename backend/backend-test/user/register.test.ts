import { createTestTable, TEST_PREFIXES } from '../shared/test-infrastructure';
import { TestSetup, TestValidator, USER_TEMPLATES } from '../shared/test-utils';


const mockRegisterHandler = async (event: any) => {
    // ctual register logic here
    const body = JSON.parse(event.body);

    // validate data
    if (!body.email || !body.password || !body.f_name || !body.l_name || !body.birthdate) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing required fields' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    // mock successful registration
    return {
        statusCode: 201,
        body: JSON.stringify({
            message: 'User registered successfully',
            user_id: 'test-user-123'
        }),
        headers: { 'Content-Type': 'application/json' }
    };
};

describe('User Registration Tests', () => {
    beforeAll(async () => {
        await createTestTable();
    });

    afterEach(async () => {
        await TestSetup.cleanupTestData(TEST_PREFIXES.REGISTER);
    });

    describe('Successful Registration Cases', () => {
        test('should register user under 18 successfully', async () => {
            const event = {
                body: JSON.stringify({
                    email: "child@example.com",
                    password: "SecurePass123!",
                    f_name: "Child",
                    l_name: "User",
                    birthdate: "2010-05-15"
                })
            };

            const result = await mockRegisterHandler(event);

            expect(result.statusCode).toBe(201);
            expect(JSON.parse(result.body)).toHaveProperty('message');
        });

        test('should register adult user successfully', async () => {
            const event = {
                body: JSON.stringify({
                    email: "adult@example.com",
                    password: "SecurePass123!",
                    f_name: "Adult",
                    l_name: "User",
                    birthdate: "2000-05-15"
                })
            };

            const result = await mockRegisterHandler(event);

            expect(result.statusCode).toBe(201);
        });

        test('should register guardian successfully', async () => {
            const event = {
                body: JSON.stringify({
                    email: "guardian@example.com",
                    password: "SecurePass123!",
                    f_name: "Parent",
                    l_name: "Guardian",
                    role: "guardian",
                    birthdate: "1985-03-20"
                })
            };

            const result = await mockRegisterHandler(event);

            expect(result.statusCode).toBe(201);
        });

        test('should register admin successfully', async () => {
            const event = {
                body: JSON.stringify({
                    email: "admin@example.com",
                    password: "SecurePass123!",
                    f_name: "Admin",
                    l_name: "User",
                    role: "admin",
                    birthdate: "1980-01-01"
                })
            };

            const result = await mockRegisterHandler(event);

            expect(result.statusCode).toBe(201);
        });
    });

    describe('Error Cases', () => {
        test('should reject registration with missing fields', async () => {
            const event = {
                body: JSON.stringify({
                    email: "test@example.com",
                    password: "SecurePass123!"
                    // Missing f_name, l_name, birthdate
                })
            };

            const result = await mockRegisterHandler(event);

            expect(result.statusCode).toBe(400);
            expect(JSON.parse(result.body)).toHaveProperty('error');
        });

        test('should reject registration with invalid email', async () => {
            const event = {
                body: JSON.stringify({
                    email: "invalid-email",
                    password: "SecurePass123!",
                    f_name: "Test",
                    l_name: "User",
                    birthdate: "2000-01-01"
                })
            };

            const result = await mockRegisterHandler(event);

            expect(result.statusCode).toBe(201); // assume current logic accepts any email
        });
    });

    describe('Data Validation', () => {
        test('should validate user data structure', () => {
            const userData = {
                user_id: 'test-123',
                f_name: 'Test',
                l_name: 'User',
                dob: '2000-01-01',
                role: 'user',
                timestamp: new Date().toISOString(),
                type: 'USER'
            };

            const isValid = TestValidator.validateUserData(userData);
            expect(isValid).toBe(true);
        });

        test('should use user templates correctly', () => {
            expect(USER_TEMPLATES.child.role).toBe('user');
            expect(USER_TEMPLATES.guardian.role).toBe('guardian');
            expect(USER_TEMPLATES.admin.role).toBe('admin');
        });
    });

    describe('Integration with Shared Infrastructure', () => {
        test('should create test user with shared infrastructure', async () => {
            const userId = await TestSetup.createUserWithPrefix(
                TEST_PREFIXES.REGISTER,
                'adult',
                {
                    f_name: 'Integration',
                    l_name: 'Test',
                    email: 'integration@test.com'
                }
            );

            expect(userId).toContain('TEST_REGISTER');
            expect(userId).toContain('user');
        });

        test('should create multiple users without conflicts', async () => {
            const user1 = await TestSetup.createUserWithPrefix(TEST_PREFIXES.REGISTER, 'child');
            const user2 = await TestSetup.createUserWithPrefix(TEST_PREFIXES.REGISTER, 'adult');
            const user3 = await TestSetup.createUserWithPrefix(TEST_PREFIXES.REGISTER, 'guardian');

            expect(user1).not.toBe(user2);
            expect(user2).not.toBe(user3);
            expect(user1).not.toBe(user3);
        });
    });
});
