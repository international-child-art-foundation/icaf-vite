import { createTestUser, createTestArtwork, createTestDonation, createTestSeason, createTestVotePointer, createTestArtPointer, createTestAdminAction, cleanupTestData } from './test-infrastructure';

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

    static generateVoteTimestamp(): number {
        return Date.now();
    }

    static generateAdminTimestamp(): string {
        return new Date().toISOString();
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
        season: 'SEASON#TEST',
        f_name: 'Test',
        age: 18,
        is_virtual: false,
        location: 'US',
        is_ai_gen: false,
        model: undefined,
        is_approved: false,
        votes: 0,
        title: 'Test Artwork',
        file_type: 'PNG',
        description: 'A test artwork for testing purposes'
    },
    detailed: {
        season: 'SEASON#TEST',
        f_name: 'Detailed',
        age: 20,
        is_virtual: false,
        location: 'US',
        is_ai_gen: false,
        model: undefined,
        is_approved: true,
        votes: 5,
        title: 'Detailed Test Artwork',
        file_type: 'JPEG',
        description: 'A detailed test artwork with more information',
        tags: ['landscape', 'nature', 'colorful']
    }
};

// Test donation data templates
export const DONATION_TEMPLATES = {
    basic: {
        amount_cents: 2500,
        currency: 'USD',
        status: 'succeeded'
    },
    large: {
        amount_cents: 10000,
        currency: 'USD',
        status: 'succeeded'
    },
    failed: {
        amount_cents: 2500,
        currency: 'USD',
        status: 'failed'
    }
};

// Admin action templates
export const ADMIN_ACTION_TEMPLATES = {
    ban: {
        action: 'ban',
        reason: 'Violation of guidelines',
        done_by: 'admin@test'
    },
    unban: {
        action: 'unban',
        reason: 'Appeal accepted',
        done_by: 'admin@test'
    },
    reject: {
        action: 'reject',
        reason: 'Inappropriate content',
        done_by: 'moderator@test'
    }
};

// Test season data templates
export const SEASON_TEMPLATES = {
    current: {
        colloq_name: 'Current Test Season',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        payment_required: false,
        max_user_submissions: 1,
        can_vote: true,
        total_votes: 0,
        is_active: true
    },
    past: {
        colloq_name: 'Past Test Season',
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        payment_required: false,
        max_user_submissions: 1,
        can_vote: false,
        total_votes: 0,
        is_active: false
    },
    future: {
        colloq_name: 'Future Test Season',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        payment_required: true,
        max_user_submissions: 1,
        can_vote: false,
        total_votes: 0,
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

    static async createVotePointerWithPrefix(prefix: string, userId: string, season?: string, artId?: string, customData: any = {}) {
        const resolvedSeason = season ?? TestDataGenerator.generateSeason(prefix);
        const resolvedArtId = artId ?? TestDataGenerator.generateArtworkId(prefix);
        const timestamp = customData.timestamp ?? TestDataGenerator.generateVoteTimestamp();
        return createTestVotePointer(userId, resolvedSeason, resolvedArtId, { ...customData, timestamp });
    }

    static async createArtPointerWithPrefix(prefix: string, userId: string, season?: string, artId?: string, customData: any = {}) {
        const resolvedSeason = season ?? TestDataGenerator.generateSeason(prefix);
        const resolvedArtId = artId ?? TestDataGenerator.generateArtworkId(prefix);
        return createTestArtPointer(userId, resolvedSeason, resolvedArtId, { ...customData });
    }

    static async createAdminActionWithPrefix(_prefix: string, userId: string, template: keyof typeof ADMIN_ACTION_TEMPLATES = 'ban', customData: any = {}) {
        const data = { ...ADMIN_ACTION_TEMPLATES[template], ...customData };
        const timestamp = data.timestamp ?? TestDataGenerator.generateAdminTimestamp();
        await createTestAdminAction(userId, data.action, { ...data, timestamp });
        return timestamp as string;
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
        const requiredFields = ['user_id', 'title', 'timestamp', 'type', 'season'];
        const hasRequired = requiredFields.every(field => artworkData.hasOwnProperty(field));
        const hasArtId = artworkData.hasOwnProperty('art_id') || artworkData.hasOwnProperty('artwork_id');
        return hasRequired && hasArtId;
    }

    static validateDonationData(donationData: any): boolean {
        const baseFields = ['user_id', 'stripe_id', 'timestamp', 'type'];
        const hasBase = baseFields.every(field => donationData.hasOwnProperty(field));
        const hasAmount = donationData.hasOwnProperty('amount') || donationData.hasOwnProperty('amount_cents');
        const hasDonationId = donationData.hasOwnProperty('donation_id');
        return hasBase && hasAmount && hasDonationId;
    }

    static validateSeasonData(seasonData: any): boolean {
        const requiredFields = ['season', 'colloq_name', 'start_date', 'end_date', 'timestamp', 'type', 'is_active'];
        const baseOk = requiredFields.every(field => seasonData.hasOwnProperty(field));
        const extras = ['payment_required', 'max_user_submissions', 'can_vote', 'total_votes'];
        return baseOk && extras.every(field => seasonData.hasOwnProperty(field));
    }

    static validateAdminActionData(adminActionData: any): boolean {
        const requiredFields = ['user_id', 'action', 'done_by', 'timestamp', 'reason', 'type'];
        return requiredFields.every(field => adminActionData.hasOwnProperty(field));
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
