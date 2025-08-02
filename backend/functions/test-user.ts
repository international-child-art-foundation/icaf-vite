// Test user.ts functionality with different modes
const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

// LocalStack configuration
const LOCALSTACK_ENDPOINT = 'http://localhost:4566';
const REGION = 'us-east-1';
const TABLE_NAME = 'test-users-table';

// Initialize DynamoDB client for LocalStack
const dynamoClient = new DynamoDBClient({
    region: REGION,
    endpoint: LOCALSTACK_ENDPOINT,
    credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test'
    }
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Helper function to wait for table to be active
async function waitForTableActive(tableName, maxAttempts = 10) {
    console.log(`⏳ Waiting for table ${tableName} to be active...`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const result = await dynamoClient.send(new DescribeTableCommand({
                TableName: tableName
            }));

            if (result.Table.TableStatus === 'ACTIVE') {
                console.log(`✅ Table ${tableName} is now active`);
                return true;
            }

            console.log(`   Attempt ${attempt}/${maxAttempts}: Table status is ${result.Table.TableStatus}`);
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.log(`   Attempt ${attempt}/${maxAttempts}: Error checking table status`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    throw new Error(`Table ${tableName} did not become active within ${maxAttempts} attempts`);
}

async function setupTestData() {
    console.log('🔧 Setting up test data...');

    try {
        // Create DynamoDB Table if it doesn't exist
        console.log(`📝 Creating DynamoDB Table: ${TABLE_NAME}...`);
        try {
            await dynamoClient.send(new CreateTableCommand({
                TableName: TABLE_NAME,
                KeySchema: [
                    { AttributeName: 'PK', KeyType: 'HASH' },
                    { AttributeName: 'SK', KeyType: 'RANGE' }
                ],
                AttributeDefinitions: [
                    { AttributeName: 'PK', AttributeType: 'S' },
                    { AttributeName: 'SK', AttributeType: 'S' }
                ],
                BillingMode: 'PAY_PER_REQUEST'
            }));
            console.log(`✅ DynamoDB Table created: ${TABLE_NAME}`);
        } catch (error) {
            if (error.name === 'ResourceInUseException') {
                console.log(`✅ DynamoDB Table already exists: ${TABLE_NAME}`);
            } else {
                throw error;
            }
        }
        await waitForTableActive(TABLE_NAME);

        // Create test user data
        const testUserId = 'test-user-123';
        const testUserData = {
            PK: `USER#${testUserId}`,
            SK: 'PROFILE',
            user_id: testUserId,
            f_name: 'John',
            l_name: 'Doe',
            dob: '2000-01-01',
            role: 'user',
            can_submit: false,
            has_magazine_subscription: true,
            has_newsletter_subscription: false,
            timestamp: new Date().toISOString(),
            type: 'USER'
        };

        // Insert test user
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: testUserData
        }));

        console.log(`✅ Test user data created: ${testUserId}`);
        return testUserId;

    } catch (error) {
        console.error('❌ Error setting up test data:', error.message);
        throw error;
    }
}

// Test cases
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

// Test mode selection
const TEST_MODE = process.env.TEST_MODE || 'mock';

if (TEST_MODE === 'mock') {
    console.log("🧪 Using mock mode (no real AWS services)");

    // Mock environment variables
    process.env.NODE_ENV = 'test';
    process.env.TABLE_NAME = "mock-table";
    process.env.AWS_REGION = "us-east-1";

    // Mock handler
    const mockHandler = async (event) => {
        const userId = event.requestContext?.authorizer?.claims?.sub;

        if (!userId) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Unauthorized' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Mock user profile response
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

    async function runMockTests() {
        console.log("📋 Running all test cases...\n");

        for (const testCase of testCases) {
            console.log(testCase.name);
            console.log(`📝 Description: ${testCase.description}`);
            console.log("📝 Test data:", testCase.event);

            try {
                const result = await mockHandler(testCase.event);
                const responseBody = JSON.parse(result.body);

                console.log(`Status Code: ${result.statusCode} (Expected: ${testCase.expectedStatus})`);
                console.log("Response:", responseBody);

                if (result.statusCode === testCase.expectedStatus) {
                    console.log("✅ Test PASSED");
                } else {
                    console.log(`❌ Test FAILED - Expected status ${testCase.expectedStatus}, got ${result.statusCode}`);
                }

            } catch (error) {
                console.error(`❌ Error in test: ${testCase.name}`, error.message);
            }

            console.log("---\n");
        }
    }

    runMockTests().catch(console.error);

} else if (TEST_MODE === 'local') {
    console.log("🏠 Using LocalStack mode");
    console.log(`📍 LocalStack endpoint: ${LOCALSTACK_ENDPOINT}`);
    console.log(`📍 Region: ${REGION}\n`);

    async function runLocalStackTests() {
        try {
            // Setup test data
            await setupTestData();

            // Set environment variables
            process.env.NODE_ENV = 'test';
            process.env.TABLE_NAME = TABLE_NAME;
            process.env.AWS_REGION = REGION;

            // Import the user handler
            const { handler } = require('./user.ts');

            console.log("📋 Running all test cases with LocalStack...\n");

            let passedTests = 0;
            let totalTests = testCases.length;

            for (const testCase of testCases) {
                console.log(testCase.name);
                console.log(`📝 Description: ${testCase.description}`);
                console.log("📝 Test data:", testCase.event);

                try {
                    const result = await handler(testCase.event);
                    const responseBody = JSON.parse(result.body);

                    console.log(`Status Code: ${result.statusCode} (Expected: ${testCase.expectedStatus})`);
                    console.log("Response:", responseBody);

                    if (result.statusCode === testCase.expectedStatus) {
                        console.log("✅ Test PASSED");
                        passedTests++;
                    } else {
                        console.log(`❌ Test FAILED - Expected status ${testCase.expectedStatus}, got ${result.statusCode}`);
                    }

                } catch (error) {
                    console.error(`❌ Error in test: ${testCase.name}`, error.message);
                }

                console.log("---\n");
            }

            console.log(`📊 LocalStack Test Results: ${passedTests}/${totalTests} tests passed`);

            if (passedTests === totalTests) {
                console.log('🎉 All LocalStack tests completed successfully!');
                console.log('💡 Tip: Check LocalStack dashboard at http://localhost:4566 for more details');
            } else {
                console.log('⚠️  Some LocalStack tests failed. Check the output above for details.');
            }

            return passedTests === totalTests;

        } catch (error) {
            console.error('❌ LocalStack test suite failed:', error.message);
            throw error;
        }
    }

    runLocalStackTests().catch((error) => {
        console.error('❌ LocalStack test execution failed:', error.message);
        process.exit(1);
    });

} else if (TEST_MODE === 'aws') {
    console.log("☁️ Using AWS mode (real AWS services)");
    // Real AWS implementation would go here
    console.log("⚠️  AWS mode not yet implemented");

} else {
    console.error("❌ Invalid TEST_MODE. Use 'mock', 'local', or 'aws'");
    process.exit(1);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Test interrupted by user');
    process.exit(0);
});

// Export for module usage
module.exports = {
    setupTestData,
    testCases
}; 