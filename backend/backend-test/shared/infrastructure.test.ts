import {
    createTestUser,
    cleanupTestData,
    TEST_PREFIXES
} from './test-infrastructure';
import { TestSetup, TestValidator, USER_TEMPLATES } from './test-utils';

describe('Shared Test Infrastructure', () => {
    const testPrefix = TEST_PREFIXES.USER;

    afterEach(async () => {
        // Clean up after each test
        await cleanupTestData(testPrefix);
    });

    describe('User Management', () => {
        test('should create a test user successfully', async () => {
            const userId = 'test-user-1';
            const userData = {
                f_name: 'John',
                l_name: 'Doe',
                role: 'user',
                can_submit: true
            };

            const createdUserId = await createTestUser(userId, userData);

            expect(createdUserId).toBe(userId);
        });

        test('should create user with template', async () => {
            const userId = await TestSetup.createUserWithPrefix(testPrefix, 'adult', {
                f_name: 'Jane',
                l_name: 'Smith'
            });

            expect(userId).toBeDefined();
            expect(userId).toContain('TEST_USER');
        });

        test('should validate user data correctly', () => {
            const validUserData = {
                user_id: 'test-123',
                f_name: 'Test',
                l_name: 'User',
                dob: '2000-01-01',
                role: 'user',
                timestamp: new Date().toISOString(),
                type: 'USER'
            };

            const isValid = TestValidator.validateUserData(validUserData);
            expect(isValid).toBe(true);
        });

        test('should reject invalid user data', () => {
            const invalidUserData = {
                user_id: 'test-123',
                f_name: 'Test'
                // Missing required fields
            };

            const isValid = TestValidator.validateUserData(invalidUserData);
            expect(isValid).toBe(false);
        });
    });

    describe('Artwork Management', () => {
        test('should create artwork and art pointer', async () => {
            const userId = await TestSetup.createUserWithPrefix(testPrefix, 'adult');
            const artworkId = await TestSetup.createArtworkWithPrefix(testPrefix, userId, 'basic', {
                title: 'My Beautiful Artwork',
                description: 'A wonderful piece of art'
            });

            expect(artworkId).toBeDefined();
            expect(artworkId).toContain('TEST_USER');
        });

        test('should validate artwork data correctly', () => {
            const validArtworkData = {
                artwork_id: 'art-123',
                user_id: 'user-123',
                title: 'Test Artwork',
                season: 'SEASON#TEST',
                timestamp: new Date().toISOString(),
                type: 'ART'
            };

            const isValid = TestValidator.validateArtworkData(validArtworkData);
            expect(isValid).toBe(true);
        });
    });

    describe('Donation Management', () => {
        test('should create donation successfully', async () => {
            const userId = await TestSetup.createUserWithPrefix(testPrefix, 'adult');
            const donationId = await TestSetup.createDonationWithPrefix(testPrefix, userId, 'basic', {
                amount: 50.00,
                currency: 'USD'
            });

            expect(donationId).toBeDefined();
            expect(donationId).toContain('TEST_USER');
        });

        test('should validate donation data correctly', () => {
            const validDonationData = {
                user_id: 'user-123',
                stripe_id: 'stripe_123',
                donation_id: 'don_123',
                amount_cents: 2500,
                timestamp: new Date().toISOString(),
                type: 'DONATION'
            };

            const isValid = TestValidator.validateDonationData(validDonationData);
            expect(isValid).toBe(true);
        });
    });

    describe('Season Management', () => {
        test('should create season successfully', async () => {
            const seasonId = await TestSetup.createSeasonWithPrefix(testPrefix, 'current', {
                colloq_name: '2024 Art Competition'
            });

            expect(seasonId).toBeDefined();
            expect(seasonId).toContain('TEST_USER');
        });

        test('should validate season data correctly', () => {
            const validSeasonData = {
                season: '2024',
                colloq_name: 'Test Season',
                start_date: '2024-01-01',
                end_date: '2024-12-31',
                payment_required: false,
                max_user_submissions: 1,
                can_vote: true,
                total_votes: 0,
                is_active: true,
                timestamp: new Date().toISOString(),
                type: 'SEASON'
            };

            const isValid = TestValidator.validateSeasonData(validSeasonData);
            expect(isValid).toBe(true);
        });
    });

    describe('Data Isolation', () => {
        test('should isolate test data by prefix', async () => {
            const prefix1 = 'TEST_ISOLATION_1';
            const prefix2 = 'TEST_ISOLATION_2';

            // Create data with different prefixes
            const user1 = await TestSetup.createUserWithPrefix(prefix1, 'adult');
            const user2 = await TestSetup.createUserWithPrefix(prefix2, 'guardian');

            expect(user1).toContain(prefix1);
            expect(user2).toContain(prefix2);

            // Clean up both prefixes
            await cleanupTestData(prefix1);
            await cleanupTestData(prefix2);
        });
    });

    describe('Template Usage', () => {
        test('should use user templates correctly', () => {
            expect(USER_TEMPLATES.child).toBeDefined();
            expect(USER_TEMPLATES.adult).toBeDefined();
            expect(USER_TEMPLATES.guardian).toBeDefined();
            expect(USER_TEMPLATES.admin).toBeDefined();
            expect(USER_TEMPLATES.contributor).toBeDefined();

            expect(USER_TEMPLATES.child.role).toBe('user');
            expect(USER_TEMPLATES.guardian.role).toBe('guardian');
            expect(USER_TEMPLATES.admin.role).toBe('admin');
        });
    });
});
