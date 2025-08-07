import { DynamoDBClient, CreateTableCommand, DescribeTableCommand, ScalarAttributeType, KeyType, BillingMode } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Test configuration
export const TEST_CONFIG = {
    endpoint: 'http://localhost:4566',
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test'
    },
    tableName: 'icaf-test-table'
};

// DynamoDB Table Schema based on your specification
export const TABLE_SCHEMA = {
    TableName: TEST_CONFIG.tableName,
    KeySchema: [
        { AttributeName: 'PK', KeyType: KeyType.HASH },
        { AttributeName: 'SK', KeyType: KeyType.RANGE }
    ],
    AttributeDefinitions: [
        { AttributeName: 'PK', AttributeType: ScalarAttributeType.S },
        { AttributeName: 'SK', AttributeType: ScalarAttributeType.S }
    ],
    BillingMode: BillingMode.PAY_PER_REQUEST
};

// Entity types for test data isolation
export const ENTITY_TYPES = {
    USER: 'USER',
    DONATION: 'DONATION',
    VOTE_PTR: 'VOTE_PTR',
    ART_PTR: 'ART_PTR',
    ART: 'ART',
    SEASON: 'SEASON',
    ADMIN_ACTION: 'ADMIN_ACTION'
} as const;

// Test data prefixes for isolation
export const TEST_PREFIXES = {
    REGISTER: 'TEST_REGISTER',
    USER: 'TEST_USER',
    ARTWORK: 'TEST_ARTWORK',
    DELETE_ACCOUNT: 'TEST_DELETE',
    GUARDIAN: 'TEST_GUARDIAN',
    ADMIN: 'TEST_ADMIN'
} as const;

// Initialize DynamoDB clients
const dynamoClient = new DynamoDBClient(TEST_CONFIG);
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Helper function to wait for table to be active
async function waitForTableActive(tableName: string, maxAttempts = 10): Promise<boolean> {
    console.log(`⏳ Waiting for table ${tableName} to be active...`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const result = await dynamoClient.send(new DescribeTableCommand({
                TableName: tableName
            }));

            if (result.Table?.TableStatus === 'ACTIVE') {
                console.log(`✅ Table ${tableName} is now active`);
                return true;
            }

            console.log(`   Attempt ${attempt}/${maxAttempts}: Table status is ${result.Table?.TableStatus}`);
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.log(`   Attempt ${attempt}/${maxAttempts}: Error checking table status`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    throw new Error(`Table ${tableName} did not become active within ${maxAttempts} attempts`);
}

// Create test table if it doesn't exist
export async function createTestTable(): Promise<void> {
    console.log('🔧 Setting up test infrastructure...');

    try {
        console.log(`📝 Creating DynamoDB Table: ${TABLE_SCHEMA.TableName}...`);

        try {
            await dynamoClient.send(new CreateTableCommand(TABLE_SCHEMA));
            console.log(`✅ DynamoDB Table created: ${TABLE_SCHEMA.TableName}`);
        } catch (error: any) {
            if (error.name === 'ResourceInUseException') {
                console.log(`✅ DynamoDB Table already exists: ${TABLE_SCHEMA.TableName}`);
            } else {
                throw error;
            }
        }

        await waitForTableActive(TABLE_SCHEMA.TableName);
        console.log('✅ Test infrastructure ready');

    } catch (error) {
        console.error('❌ Error setting up test infrastructure:', error);
        throw error;
    }
}

// Clean up test data by prefix
export async function cleanupTestData(prefix: string): Promise<void> {
    console.log(`🧹 Cleaning up test data with prefix: ${prefix}`);

    try {
        // Scan for items with the prefix (since we can't use begins_with on PK in query)
        const scanResult = await docClient.send(new ScanCommand({
            TableName: TEST_CONFIG.tableName,
            FilterExpression: 'begins_with(PK, :prefix)',
            ExpressionAttributeValues: {
                ':prefix': prefix
            }
        }));

        if (scanResult.Items && scanResult.Items.length > 0) {
            console.log(`🗑️  Deleting ${scanResult.Items.length} test items...`);

            // Delete items in batches
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
            console.log(`✅ Cleaned up ${scanResult.Items.length} test items`);
        } else {
            console.log('ℹ️  No test data to clean up');
        }

    } catch (error) {
        console.error('❌ Error cleaning up test data:', error);
        throw error;
    }
}

// Create test user data
export async function createTestUser(userId: string, userData: Partial<any> = {}): Promise<string> {
    const defaultUserData = {
        PK: `USER#${userId}`,
        SK: 'PROFILE',
        user_id: userId,
        f_name: 'Test',
        l_name: 'User',
        dob: '2000-01-01',
        role: 'user',
        timestamp: new Date().toISOString(),
        can_submit: false,
        max_constituents_per_season: 0,
        has_paid: false,
        accolades: [],
        has_magazine_subscription: false,
        has_newsletter_subscription: false,
        type: 'USER'
    };

    const finalUserData = { ...defaultUserData, ...userData };

    await docClient.send(new PutCommand({
        TableName: TEST_CONFIG.tableName,
        Item: finalUserData
    }));

    console.log(`✅ Test user created: ${userId}`);
    return userId;
}

// Create test artwork data
export async function createTestArtwork(artworkId: string, userId: string, artworkData: Partial<any> = {}): Promise<string> {
    const defaultArtworkData = {
        PK: `ART#${artworkId}`,
        SK: 'N/A',
        artwork_id: artworkId,
        user_id: userId,
        title: 'Test Artwork',
        description: 'Test artwork description',
        timestamp: new Date().toISOString(),
        type: 'ART'
    };

    const finalArtworkData = { ...defaultArtworkData, ...artworkData };

    await docClient.send(new PutCommand({
        TableName: TEST_CONFIG.tableName,
        Item: finalArtworkData
    }));

    // Create art pointer for user
    const artPointerData = {
        PK: `USER#${userId}`,
        SK: `ART#${artworkId}`,
        artwork_id: artworkId,
        timestamp: new Date().toISOString(),
        type: 'ART_PTR'
    };

    await docClient.send(new PutCommand({
        TableName: TEST_CONFIG.tableName,
        Item: artPointerData
    }));

    console.log(`✅ Test artwork created: ${artworkId} for user: ${userId}`);
    return artworkId;
}

// Create test donation data
export async function createTestDonation(userId: string, stripeId: string, donationData: Partial<any> = {}): Promise<string> {
    const defaultDonationData = {
        PK: `USER#${userId}`,
        SK: `DONATION#${stripeId}`,
        user_id: userId,
        stripe_id: stripeId,
        amount: 25.00,
        currency: 'USD',
        timestamp: new Date().toISOString(),
        type: 'DONATION'
    };

    const finalDonationData = { ...defaultDonationData, ...donationData };

    await docClient.send(new PutCommand({
        TableName: TEST_CONFIG.tableName,
        Item: finalDonationData
    }));

    console.log(`✅ Test donation created: ${stripeId} for user: ${userId}`);
    return stripeId;
}

// Create test season data
export async function createTestSeason(season: string, seasonData: Partial<any> = {}): Promise<string> {
    const defaultSeasonData = {
        PK: 'SEASON',
        SK: season,
        season: season,
        name: `Test Season ${season}`,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        is_active: true,
        timestamp: new Date().toISOString(),
        type: 'SEASON'
    };

    const finalSeasonData = { ...defaultSeasonData, ...seasonData };

    await docClient.send(new PutCommand({
        TableName: TEST_CONFIG.tableName,
        Item: finalSeasonData
    }));

    console.log(`✅ Test season created: ${season}`);
    return season;
}

// Export clients for use in tests
export { dynamoClient, docClient };
