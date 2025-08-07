import { createTestUser, createTestArtwork, createTestDonation, createTestSeason, cleanupTestData } from './test-infrastructure';

// Test data generators
export class TestDataGenerator {
    private static counter = 0;

    static generateUserId(prefix: string = 'test'): string {
        return `${prefix}-user-${++this.counter}-${Date.now()}`;
    }

    static generateArtworkId(prefix: string = 'test'): string {
        return `${prefix}-artwork-${++this.counter}-${Date.now()}`;
    }

    static generateStripeId(prefix: string = 'test'): string {
        return `${prefix}_stripe_${++this.counter}_${Date.now()}`;
    }

    static generateSeason(prefix: string = 'test'): string {
        return `${prefix}-season-${++this.counter}`;
    }
}

// Test user data templates
export const USER_TEMPLATES = {
    child: {
        f_name: 'Child',
        l_name: 'User',
        dob: '2010-05-15',
        role: 'user',
        can_submit: false,
        max_constituents_per_season: 0,
        has_paid: false,
        accolades: [],
        has_magazine_subscription: false,
        has_newsletter_subscription: false
    },
    adult: {
        f_name: 'Adult',
        l_name: 'User',
        dob: '2000-05-15',
        role: 'user',
        can_submit: true,
        max_constituents_per_season: 0,
        has_paid: true,
        accolades: [],
        has_magazine_subscription: true,
        has_newsletter_subscription: false
    },
    guardian: {
        f_name: 'Parent',
        l_name: 'Guardian',
        dob: '1985-03-20',
        role: 'guardian',
        can_submit: true,
        max_constituents_per_season: 5,
        has_paid: true,
        accolades: [],
        has_magazine_subscription: true,
        has_newsletter_subscription: true
    },
    admin: {
        f_name: 'Admin',
        l_name: 'User',
        dob: '1980-01-01',
        role: 'admin',
        can_submit: true,
        max_constituents_per_season: -1, // infinite
        has_paid: true,
        accolades: [],
        has_magazine_subscription: true,
        has_newsletter_subscription: true
    },
    contributor: {
        f_name: 'Contributor',
        l_name: 'User',
        dob: '1985-06-15',
        role: 'contributor',
        can_submit: true,
        max_constituents_per_season: 0,
        has_paid: true,
        accolades: [],
        has_magazine_subscription: true,
        has_newsletter_subscription: false
    }
};

// Test artwork data templates
export const ARTWORK_TEMPLATES = {
    basic: {
        title: 'Test Artwork',
        description: 'A test artwork for testing purposes',
        medium: 'Digital',
        dimensions: '1920x1080',
        file_size: 1024000
    },
    detailed: {
        title: 'Detailed Test Artwork',
        description: 'A detailed test artwork with more information',
        medium: 'Oil on Canvas',
        dimensions: '24x36 inches',
        file_size: 2048000,
        tags: ['landscape', 'nature', 'colorful']
    }
};

// Test donation data templates
export const DONATION_TEMPLATES = {
    basic: {
        amount: 25.00,
        currency: 'USD',
        status: 'succeeded'
    },
    large: {
        amount: 100.00,
        currency: 'USD',
        status: 'succeeded'
    },
    failed: {
        amount: 25.00,
        currency: 'USD',
        status: 'failed'
    }
};

// Test season data templates
export const SEASON_TEMPLATES = {
    current: {
        name: 'Current Test Season',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        is_active: true
    },
    past: {
        name: 'Past Test Season',
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        is_active: false
    },
    future: {
        name: 'Future Test Season',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        is_active: false
    }
};

// Test setup helpers
export class TestSetup {
    static async createUserWithPrefix(prefix: string, template: keyof typeof USER_TEMPLATES = 'adult', customData: any = {}) {
        const userId = TestDataGenerator.generateUserId(prefix);
        const userData = { ...USER_TEMPLATES[template], ...customData };
        await createTestUser(userId, userData);
        return userId;
    }

    static async createArtworkWithPrefix(prefix: string, userId: string, template: keyof typeof ARTWORK_TEMPLATES = 'basic', customData: any = {}) {
        const artworkId = TestDataGenerator.generateArtworkId(prefix);
        const artworkData = { ...ARTWORK_TEMPLATES[template], ...customData };
        await createTestArtwork(artworkId, userId, artworkData);
        return artworkId;
    }

    static async createDonationWithPrefix(prefix: string, userId: string, template: keyof typeof DONATION_TEMPLATES = 'basic', customData: any = {}) {
        const stripeId = TestDataGenerator.generateStripeId(prefix);
        const donationData = { ...DONATION_TEMPLATES[template], ...customData };
        await createTestDonation(userId, stripeId, donationData);
        return stripeId;
    }

    static async createSeasonWithPrefix(prefix: string, template: keyof typeof SEASON_TEMPLATES = 'current', customData: any = {}) {
        const season = TestDataGenerator.generateSeason(prefix);
        const seasonData = { ...SEASON_TEMPLATES[template], ...customData };
        await createTestSeason(season, seasonData);
        return season;
    }

    static async cleanupTestData(prefix: string) {
        await cleanupTestData(prefix);
    }
}

// Test validation helpers
export class TestValidator {
    static validateUserData(userData: any): boolean {
        const requiredFields = ['user_id', 'f_name', 'l_name', 'dob', 'role', 'timestamp', 'type'];
        return requiredFields.every(field => userData.hasOwnProperty(field));
    }

    static validateArtworkData(artworkData: any): boolean {
        const requiredFields = ['artwork_id', 'user_id', 'title', 'timestamp', 'type'];
        return requiredFields.every(field => artworkData.hasOwnProperty(field));
    }

    static validateDonationData(donationData: any): boolean {
        const requiredFields = ['user_id', 'stripe_id', 'amount', 'timestamp', 'type'];
        return requiredFields.every(field => donationData.hasOwnProperty(field));
    }

    static validateSeasonData(seasonData: any): boolean {
        const requiredFields = ['season', 'name', 'start_date', 'end_date', 'timestamp', 'type'];
        return requiredFields.every(field => seasonData.hasOwnProperty(field));
    }
}

// Test constants
export const TEST_CONSTANTS = {
    VALID_EMAILS: [
        'test@example.com',
        'user@test.org',
        'admin@icaf.org'
    ],
    INVALID_EMAILS: [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com'
    ],
    VALID_PASSWORDS: [
        'SecurePass123!',
        'MyPassword456@',
        'TestPass789#'
    ],
    INVALID_PASSWORDS: [
        'short',
        'nouppercase123!',
        'NOLOWERCASE123!',
        'NoNumbers!',
        'NoSpecialChars123'
    ],
    VALID_DATES: [
        '2000-01-01',
        '2010-05-15',
        '1985-03-20'
    ],
    INVALID_DATES: [
        '2000-13-01',
        '2000-01-32',
        'invalid-date',
        '2000/01/01'
    ],
    VALID_ROLES: ['user', 'guardian', 'contributor', 'admin'],
    INVALID_ROLES: ['invalid', 'guest', 'moderator']
};
