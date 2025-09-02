/**
 * Simplified Preset Test Database
 * 
 * This file provides a simple preset database system:
 * 1. Create all necessary test entities in one go
 * 2. Tests directly use the IDs of these preset entities
 * 3. Avoid each test creating its own data
 */

import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

// Test configuration
export const TEST_CONFIG = {
    endpoint: 'http://localhost:4566',
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test'
    },
    tableName: process.env.TABLE_NAME || 'icaf-test-table'
};

// Import shared table schema
import { TABLE_SCHEMA } from './test-infrastructure';

// Initialize clients
const dynamoClient = new DynamoDBClient(TEST_CONFIG);
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Preset test data - all tests can use these fixed IDs
export const PRESET_TEST_DATA = {
    // User data
    users: {
        CHILD_USER: 'PRESET_CHILD_001',
        ADULT_USER: 'PRESET_ADULT_001',
        GUARDIAN_USER: 'PRESET_GUARDIAN_001',
        ADMIN_USER: 'PRESET_ADMIN_001',
        BANNED_USER: 'PRESET_BANNED_001',
        // New: Users for testing different season scenarios
        USER_WITH_ACTIVE_SUBMISSION: 'PRESET_USER_ACTIVE_001',
        USER_WITH_INACTIVE_SUBMISSION: 'PRESET_USER_INACTIVE_001',
        USER_WITHOUT_SUBMISSION: 'PRESET_USER_NONE_001'
    },

    // Season data
    seasons: {
        CURRENT_SEASON: 'PRESET_CURRENT_2024',
        PAST_SEASON: 'PRESET_PAST_2023',
        FUTURE_SEASON: 'PRESET_FUTURE_2025',
        // New: Another active season for testing
        ANOTHER_ACTIVE_SEASON: 'PRESET_ACTIVE_2024'
    },

    // Artwork data
    artworks: {
        APPROVED_ARTWORK: 'PRESET_ARTWORK_001',
        PENDING_ARTWORK: 'PRESET_ARTWORK_002',
        AI_ARTWORK: 'PRESET_ARTWORK_003',
        // New: Artworks for testing different scenarios
        ACTIVE_SEASON_ARTWORK: 'PRESET_ARTWORK_ACTIVE_001',
        INACTIVE_SEASON_ARTWORK: 'PRESET_ARTWORK_INACTIVE_001'
    },

    // Donation data
    donations: {
        SMALL_DONATION: 'PRESET_DONATION_001',
        LARGE_DONATION: 'PRESET_DONATION_002'
    }
};

// Preset entity data
const PRESET_ENTITIES = [
    // Users
    {
        PK: `USER#${PRESET_TEST_DATA.users.CHILD_USER}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.CHILD_USER,
        f_name: 'Alice',
        l_name: 'Young',
        dob: '2010-03-15',
        role: 'user',
        can_submit: false,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.ADULT_USER}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.ADULT_USER,
        f_name: 'Bob',
        l_name: 'Smith',
        dob: '1990-06-20',
        role: 'user',
        can_submit: true,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.GUARDIAN_USER}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.GUARDIAN_USER,
        f_name: 'Carol',
        l_name: 'Johnson',
        dob: '1980-12-05',
        role: 'guardian',
        can_submit: true,
        max_constituents_per_season: 5,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.ADMIN_USER}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.ADMIN_USER,
        f_name: 'David',
        l_name: 'Wilson',
        dob: '1975-08-18',
        role: 'admin',
        can_submit: true,
        max_constituents_per_season: -1,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },

    // New users - for testing different season scenarios
    {
        PK: `USER#${PRESET_TEST_DATA.users.USER_WITH_ACTIVE_SUBMISSION}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.USER_WITH_ACTIVE_SUBMISSION,
        f_name: 'ActiveUser',
        l_name: 'HasSubmission',
        dob: '1995-05-10',
        role: 'user',
        can_submit: true,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.USER_WITH_INACTIVE_SUBMISSION}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.USER_WITH_INACTIVE_SUBMISSION,
        f_name: 'InactiveUser',
        l_name: 'HasSubmission',
        dob: '1992-08-15',
        role: 'user',
        can_submit: true,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.USER_WITHOUT_SUBMISSION}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.USER_WITHOUT_SUBMISSION,
        f_name: 'NoSubmission',
        l_name: 'User',
        dob: '1993-12-20',
        role: 'user',
        can_submit: true,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },

    // Seasons
    {
        PK: 'SEASON',
        SK: `#ACTIVE#true#SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        colloq_name: 'Current Test Season 2024',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        payment_required: false,
        max_user_submissions: 3,
        can_vote: true,
        is_active: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'SEASON'
    },
    {
        PK: 'SEASON',
        SK: `#ACTIVE#false#SEASON#${PRESET_TEST_DATA.seasons.PAST_SEASON}`,
        season: PRESET_TEST_DATA.seasons.PAST_SEASON,
        colloq_name: 'Past Test Season 2023',
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        payment_required: false,
        max_user_submissions: 1,
        can_vote: false,
        is_active: false,
        timestamp: '2023-01-01T00:00:00.000Z',
        type: 'SEASON'
    },

    // New: Another active season
    {
        PK: 'SEASON',
        SK: `#ACTIVE#true#SEASON#${PRESET_TEST_DATA.seasons.ANOTHER_ACTIVE_SEASON}`,
        season: PRESET_TEST_DATA.seasons.ANOTHER_ACTIVE_SEASON,
        colloq_name: 'Another Active Season 2024',
        start_date: '2024-03-01',
        end_date: '2024-06-30',
        payment_required: false,
        max_user_submissions: 3,
        can_vote: true,
        is_active: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'SEASON'
    },

    // Artworks
    {
        PK: `ART#${PRESET_TEST_DATA.artworks.APPROVED_ARTWORK}`,
        SK: 'N/A',
        art_id: PRESET_TEST_DATA.artworks.APPROVED_ARTWORK,
        user_id: PRESET_TEST_DATA.users.CHILD_USER,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        f_name: 'Alice',
        age: 14,
        title: 'Sunset Dreams',
        is_approved: true,
        votes: 25,
        file_type: 'PNG',
        timestamp: '2024-01-15T10:00:00.000Z',
        type: 'ART'
    },
    {
        PK: `ART#${PRESET_TEST_DATA.artworks.PENDING_ARTWORK}`,
        SK: 'N/A',
        art_id: PRESET_TEST_DATA.artworks.PENDING_ARTWORK,
        user_id: PRESET_TEST_DATA.users.ADULT_USER,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        f_name: 'Bob',
        age: 33,
        title: 'Digital Symphony',
        is_approved: false,
        votes: 0,
        file_type: 'JPEG',
        timestamp: '2024-02-10T14:30:00.000Z',
        type: 'ART'
    },

    // New artworks - testing different season scenarios
    {
        PK: `ART#${PRESET_TEST_DATA.artworks.ACTIVE_SEASON_ARTWORK}`,
        SK: 'N/A',
        art_id: PRESET_TEST_DATA.artworks.ACTIVE_SEASON_ARTWORK,
        user_id: PRESET_TEST_DATA.users.USER_WITH_ACTIVE_SUBMISSION,
        season: PRESET_TEST_DATA.seasons.ANOTHER_ACTIVE_SEASON,
        f_name: 'ActiveUser',
        age: 29,
        title: 'Active Season Art',
        is_approved: true,
        votes: 15,
        file_type: 'PNG',
        timestamp: '2024-03-15T12:00:00.000Z',
        type: 'ART'
    },
    {
        PK: `ART#${PRESET_TEST_DATA.artworks.INACTIVE_SEASON_ARTWORK}`,
        SK: 'N/A',
        art_id: PRESET_TEST_DATA.artworks.INACTIVE_SEASON_ARTWORK,
        user_id: PRESET_TEST_DATA.users.USER_WITH_INACTIVE_SUBMISSION,
        season: PRESET_TEST_DATA.seasons.PAST_SEASON,
        f_name: 'InactiveUser',
        age: 32,
        title: 'Past Season Art',
        is_approved: true,
        votes: 8,
        file_type: 'JPEG',
        timestamp: '2023-06-10T15:30:00.000Z',
        type: 'ART'
    },

    // Artwork pointers
    {
        PK: `USER#${PRESET_TEST_DATA.users.CHILD_USER}`,
        SK: `ART#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        type: 'ART_PTR',
        user_id: PRESET_TEST_DATA.users.CHILD_USER,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        art_id: PRESET_TEST_DATA.artworks.APPROVED_ARTWORK
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.ADULT_USER}`,
        SK: `ART#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        type: 'ART_PTR',
        user_id: PRESET_TEST_DATA.users.ADULT_USER,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        art_id: PRESET_TEST_DATA.artworks.PENDING_ARTWORK
    },

    // New artwork pointers - testing different season scenarios
    {
        PK: `USER#${PRESET_TEST_DATA.users.USER_WITH_ACTIVE_SUBMISSION}`,
        SK: `ART#${PRESET_TEST_DATA.seasons.ANOTHER_ACTIVE_SEASON}`,
        type: 'ART_PTR',
        user_id: PRESET_TEST_DATA.users.USER_WITH_ACTIVE_SUBMISSION,
        season: PRESET_TEST_DATA.seasons.ANOTHER_ACTIVE_SEASON,
        art_id: PRESET_TEST_DATA.artworks.ACTIVE_SEASON_ARTWORK
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.USER_WITH_INACTIVE_SUBMISSION}`,
        SK: `ART#${PRESET_TEST_DATA.seasons.PAST_SEASON}`,
        type: 'ART_PTR',
        user_id: PRESET_TEST_DATA.users.USER_WITH_INACTIVE_SUBMISSION,
        season: PRESET_TEST_DATA.seasons.PAST_SEASON,
        art_id: PRESET_TEST_DATA.artworks.INACTIVE_SEASON_ARTWORK
    },

    // Donations
    {
        PK: `USER#${PRESET_TEST_DATA.users.ADULT_USER}`,
        SK: `DONATION#${PRESET_TEST_DATA.donations.SMALL_DONATION}`,
        user_id: PRESET_TEST_DATA.users.ADULT_USER,
        donation_id: PRESET_TEST_DATA.donations.SMALL_DONATION,
        stripe_id: 'stripe_preset_001',
        amount_cents: 2500,
        currency: 'USD',
        status: 'succeeded',
        timestamp: '2024-01-20T12:00:00.000Z',
        type: 'DONATION'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.GUARDIAN_USER}`,
        SK: `DONATION#${PRESET_TEST_DATA.donations.LARGE_DONATION}`,
        user_id: PRESET_TEST_DATA.users.GUARDIAN_USER,
        donation_id: PRESET_TEST_DATA.donations.LARGE_DONATION,
        stripe_id: 'stripe_preset_002',
        amount_cents: 10000,
        currency: 'USD',
        status: 'succeeded',
        timestamp: '2024-02-15T14:30:00.000Z',
        type: 'DONATION'
    }
];

/**
 * Preset database manager
 */
export class SimplePresetDB {
    private static instance: SimplePresetDB;
    private isSetup = false;

    private constructor() { }

    static getInstance(): SimplePresetDB {
        if (!SimplePresetDB.instance) {
            SimplePresetDB.instance = new SimplePresetDB();
        }
        return SimplePresetDB.instance;
    }

    /**
     * Setup preset database (create table and populate data)
     */
    async setup(): Promise<void> {
        if (this.isSetup) {
            console.log('📦 Preset database already setup');
            return;
        }

        console.log('🌱 Setting up preset test database...');

        try {
            // 1. Create table
            await this.createTable();

            // 2. Wait for table to become active
            await this.waitForTableActive();

            // 3. Populate preset data
            await this.seedData();

            this.isSetup = true;
            console.log('✅ Preset test database setup complete!');
            this.logAvailableData();

        } catch (error) {
            console.error('❌ Error setting up preset database:', error);
            throw error;
        }
    }

    /**
     * Cleanup preset data (don't delete entire table, to be compatible with other tests)
     */
    async cleanup(): Promise<void> {
        console.log('🧹 Cleaning up preset data...');
        try {
            // Only cleanup preset data, don't delete entire table
            const presetPrefixes = ['PRESET_', 'USER#PRESET_', 'ART#PRESET_', 'SEASON'];

            for (const prefix of presetPrefixes) {
                const scanResult = await docClient.send(new ScanCommand({
                    TableName: TEST_CONFIG.tableName,
                    FilterExpression: 'begins_with(PK, :prefix)',
                    ExpressionAttributeValues: {
                        ':prefix': prefix
                    }
                }));

                if (scanResult.Items && scanResult.Items.length > 0) {
                    const deletePromises = scanResult.Items.map(item =>
                        docClient.send(new DeleteCommand({
                            TableName: TEST_CONFIG.tableName,
                            Key: {
                                PK: item.PK,
                                SK: item.SK
                            }
                        }))
                    );

                    await Promise.all(deletePromises);
                    console.log(`🗑️  Cleaned up ${scanResult.Items.length} preset items with prefix: ${prefix}`);
                }
            }

            this.isSetup = false;
            console.log('✅ Preset data cleaned up');
        } catch (error: any) {
            if (error.name === 'ResourceNotFoundException') {
                console.log('✅ Table does not exist, nothing to clean');
            } else {
                console.error('❌ Error cleaning preset data:', error);
                throw error;
            }
        }
    }

    /**
     * Reset database
     */
    async reset(): Promise<void> {
        await this.cleanup();
        await this.setup();
    }

    /**
     * Check if setup is complete
     */
    isReady(): boolean {
        return this.isSetup;
    }

    // Private method: create table
    private async createTable(): Promise<void> {
        try {
            await dynamoClient.send(new CreateTableCommand(TABLE_SCHEMA));
            console.log(`✅ Table created: ${TABLE_SCHEMA.TableName}`);
        } catch (error: any) {
            if (error.name === 'ResourceInUseException') {
                console.log(`✅ Table already exists: ${TABLE_SCHEMA.TableName}`);
            } else {
                throw error;
            }
        }
    }

    // Private method: wait for table to be active
    private async waitForTableActive(): Promise<void> {
        console.log('⏳ Waiting for table to be active...');

        for (let attempt = 1; attempt <= 30; attempt++) {
            try {
                const result = await dynamoClient.send(new DescribeTableCommand({
                    TableName: TABLE_SCHEMA.TableName
                }));

                if (result.Table?.TableStatus === 'ACTIVE') {
                    console.log('✅ Table is active');
                    return;
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.log(`   Attempt ${attempt}/30: Error checking table status`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        throw new Error('Table failed to become active');
    }

    // Private method: seed data
    private async seedData(): Promise<void> {
        console.log('📝 Seeding preset data...');

        const BATCH_SIZE = 25;
        for (let i = 0; i < PRESET_ENTITIES.length; i += BATCH_SIZE) {
            const batch = PRESET_ENTITIES.slice(i, i + BATCH_SIZE);
            const putRequests = batch.map(item => ({
                PutRequest: { Item: item }
            }));

            await docClient.send(new BatchWriteCommand({
                RequestItems: {
                    [TABLE_SCHEMA.TableName]: putRequests
                }
            }));
        }

        console.log(`✅ Seeded ${PRESET_ENTITIES.length} preset entities`);
    }

    // Private method: log available data
    private logAvailableData(): void {
        console.log('\n📊 Available preset data:');
        console.log('Users:');
        Object.entries(PRESET_TEST_DATA.users).forEach(([key, id]) => {
            console.log(`  ${key}: ${id}`);
        });
        console.log('Seasons:');
        Object.entries(PRESET_TEST_DATA.seasons).forEach(([key, id]) => {
            console.log(`  ${key}: ${id}`);
        });
        console.log('Artworks:');
        Object.entries(PRESET_TEST_DATA.artworks).forEach(([key, id]) => {
            console.log(`  ${key}: ${id}`);
        });
        console.log('Donations:');
        Object.entries(PRESET_TEST_DATA.donations).forEach(([key, id]) => {
            console.log(`  ${key}: ${id}`);
        });
    }
}

// Export convenient instance and functions
export const presetDB = SimplePresetDB.getInstance();

export async function setupPresetDatabase(): Promise<void> {
    await presetDB.setup();
}

export async function cleanupPresetDatabase(): Promise<void> {
    await presetDB.cleanup();
}

export async function resetPresetDatabase(): Promise<void> {
    await presetDB.reset();
}

// Export DynamoDB client for testing
export { docClient };
