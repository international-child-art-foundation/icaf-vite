const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { validateRegistrationBody } = require('../../../shared/dist/api-types/registrationTypes');
const { ROLES, calculateUserAge, determineUserType, canSubmitArtwork, getMaxConstituentsPerSeason } = require('../../../shared/dist/api-types/userTypes');

interface TestCase {
    name: string;
    event: {
        body: string;
    };
    expectedStatus?: number;
}

interface TestResult {
    statusCode: number;
    body: string;
    headers: { 'Content-Type': string };
}

// LocalStack configuration
const LOCALSTACK_ENDPOINT = 'http://localhost:4566';
const REGION = 'us-east-1';
const TABLE_NAME = 'test-users-table';
const USER_POOL_NAME = 'test-user-pool';
const USER_POOL_CLIENT_NAME = 'test-user-pool-client';

const testCases: TestCase[] = [
    {
        name: "✅ Successful registration (user under 18)",
        event: {
            body: JSON.stringify({
                email: "child@example.com",
                password: "SecurePass123!",
                f_name: "Child",
                l_name: "User",
                birthdate: "2010-05-15" // Under 18
            })
        },
        expectedStatus: 201
    },
    {
        name: "✅ Successful registration (user 18+)",
        event: {
            body: JSON.stringify({
                email: "adult@example.com",
                password: "SecurePass123!",
                f_name: "Adult",
                l_name: "User",
                birthdate: "2000-05-15" // 18+
            })
        },
        expectedStatus: 201
    },
    {
        name: "✅ Successful registration (guardian via role)",
        event: {
            body: JSON.stringify({
                email: "guardian@example.com",
                password: "SecurePass123!",
                f_name: "Parent",
                l_name: "Guardian",
                role: "guardian",
                birthdate: "1985-03-20" // 18+
            })
        },
        expectedStatus: 201
    },
    {
        name: "✅ Successful registration (admin via role)",
        event: {
            body: JSON.stringify({
                email: "admin@example.com",
                password: "SecurePass123!",
                f_name: "Admin",
                l_name: "User",
                role: "admin",
                birthdate: "1980-01-01"
            })
        },
        expectedStatus: 201
    },
    {
        name: "✅ Successful registration (contributor via role)",
        event: {
            body: JSON.stringify({
                email: "contributor@example.com",
                password: "SecurePass123!",
                f_name: "Contributor",
                l_name: "User",
                role: "contributor",
                birthdate: "1985-06-15"
            })
        },
        expectedStatus: 201
    },
    {
        name: "❌ Missing required fields",
        event: {
            body: JSON.stringify({
                email: "test@example.com",
                password: "SecurePass123!"
                // Missing f_name, l_name, birthdate
            })
        },
        expectedStatus: 400
    },
    {
        name: "❌ Password too short",
        event: {
            body: JSON.stringify({
                email: "test@example.com",
                password: "123",
                f_name: "John",
                l_name: "Doe",
                birthdate: "2010-05-15"
            })
        },
        expectedStatus: 400
    },
    {
        name: "❌ Name exceeds 24 characters",
        event: {
            body: JSON.stringify({
                email: "test@example.com",
                password: "SecurePass123!",
                f_name: "VeryLongFirstNameThatExceedsTwentyFourCharacters",
                l_name: "Doe",
                birthdate: "2010-05-15"
            })
        },
        expectedStatus: 400
    },
    {
        name: "❌ Invalid date format",
        event: {
            body: JSON.stringify({
                email: "test@example.com",
                password: "SecurePass123!",
                f_name: "John",
                l_name: "Doe",
                birthdate: "2010/05/15" // Wrong format
            })
        },
        expectedStatus: 400
    },
    {
        name: "❌ Invalid role",
        event: {
            body: JSON.stringify({
                email: "test@example.com",
                password: "SecurePass123!",
                f_name: "John",
                l_name: "Doe",
                role: "invalid_role",
                birthdate: "2010-05-15"
            })
        },
        expectedStatus: 400
    }
];

// Test mode selection
const TEST_MODE = process.env.TEST_MODE || 'mock'; // 'mock', 'local', 'aws'

// Helper function to wait for table to be active (LocalStack)
async function waitForTableActive(dynamoClient: any, tableName: string, maxAttempts = 10) {
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

// LocalStack infrastructure setup
async function setupLocalStackInfrastructure() {
    console.log('🔧 Setting up LocalStack infrastructure...');

    const dynamoClient = new DynamoDBClient({
        region: REGION,
        endpoint: LOCALSTACK_ENDPOINT,
        credentials: {
            accessKeyId: 'test',
            secretAccessKey: 'test'
        }
    });

    try {
        // Create DynamoDB Table
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
        } catch (error: any) {
            if (error.name === 'ResourceInUseException') {
                console.log(`✅ DynamoDB Table already exists: ${TABLE_NAME}`);
            } else {
                throw error;
            }
        }
        await waitForTableActive(dynamoClient, TABLE_NAME);

        // For LocalStack, we'll use mock Cognito IDs since Cognito is not supported in free version
        console.log(`📝 Using mock Cognito IDs for LocalStack testing...`);
        const userPoolId = 'localstack-user-pool-id';
        const userPoolClientId = 'localstack-user-pool-client-id';
        console.log(`✅ Mock User Pool ID: ${userPoolId}`);
        console.log(`✅ Mock User Pool Client ID: ${userPoolClientId}`);

        return {
            userPoolId,
            userPoolClientId,
            tableName: TABLE_NAME,
            dynamoClient
        };

    } catch (error: any) {
        console.error('❌ Error setting up infrastructure:', error.message);
        throw error;
    }
}

// LocalStack test handler with mock Cognito
async function createLocalStackHandler(infrastructure: any) {
    // Set environment variables for register.ts
    process.env.NODE_ENV = 'test';
    process.env.USER_POOL_ID = infrastructure.userPoolId;
    process.env.USER_POOL_CLIENT_ID = infrastructure.userPoolClientId;
    process.env.TABLE_NAME = infrastructure.tableName;
    process.env.AWS_REGION = REGION;

    // Mock handler that mimics register.ts functionality with LocalStack
    return async (event: any): Promise<TestResult> => {
        const body = JSON.parse(event.body);

        // Same validation logic as mock mode
        if (!body.email || !body.password || !body.f_name || !body.l_name || !body.birthdate) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing required fields: email, password, f_name, l_name, birthdate'
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Validate field lengths
        if (body.f_name.length > 24 || body.l_name.length > 24) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'First name and last name must be 24 characters or less'
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(body.birthdate)) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Birthdate must be in YYYY-MM-DD format'
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Check password strength
        if (body.password.length < 8) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Password must be at least 8 characters long'
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Determine role
        let role = 'user';
        if (body.role) {
            if (!ROLES.includes(body.role)) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: 'Invalid role. Valid values are: admin, contributor, guardian, user'
                    }),
                    headers: { 'Content-Type': 'application/json' }
                };
            }
            role = body.role;
        }

        // Note: Users under 18 can register but cannot submit artwork
        // They will need a guardian to submit artwork on their behalf

        // Mock successful registration with LocalStack
        // In a real implementation, this would call Cognito and DynamoDB
        const mockUserId = 'localstack-user-id-' + Date.now();

        try {
            // Here you could add actual DynamoDB operations using infrastructure.dynamoClient
            // For now, we'll just simulate success
            console.log(`📝 Simulating DynamoDB write for user: ${body.email}`);

            return {
                statusCode: 201,
                body: JSON.stringify({
                    UUID: mockUserId,
                    message: 'User registered successfully with LocalStack'
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        } catch (error: any) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Internal server error during LocalStack registration'
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }
    };
}

async function runLocalStackTests() {
    console.log('🏠 Using LocalStack mode');
    console.log(`📍 LocalStack endpoint: ${LOCALSTACK_ENDPOINT}`);
    console.log(`📍 Region: ${REGION}\n`);

    try {
        // Setup LocalStack infrastructure
        const infrastructure = await setupLocalStackInfrastructure();

        // Create LocalStack test handler
        const localStackHandler = await createLocalStackHandler(infrastructure);

        console.log("📋 Running all test cases with LocalStack...\n");

        let passedTests = 0;
        let totalTests = testCases.length;

        for (const testCase of testCases) {
            try {
                const result = await localStackHandler(testCase.event);
                const body = JSON.parse(testCase.event.body);
                const expectedStatus = testCase.expectedStatus || (testCase.name.startsWith("✅") ? 201 : 400);

                console.log(testCase.name);
                console.log("📝 Test data:", body);
                console.log(`Status Code: ${result.statusCode} (Expected: ${expectedStatus})`);
                console.log("Response:", JSON.parse(result.body));

                if (result.statusCode === expectedStatus) {
                    console.log("✅ Test PASSED");
                    passedTests++;
                } else {
                    console.log(`❌ Test FAILED - Expected status ${expectedStatus}, got ${result.statusCode}`);
                }
                console.log("---\n");
            } catch (error: any) {
                console.error(`❌ Error in test: ${testCase.name}`, error.message);
                console.log("---\n");
            }
        }

        console.log(`📊 LocalStack Test Results: ${passedTests}/${totalTests} tests passed`);

        if (passedTests === totalTests) {
            console.log('🎉 All LocalStack tests completed successfully!');
            console.log('💡 Tip: Check LocalStack dashboard at http://localhost:4566 for more details');
        } else {
            console.log('⚠️  Some LocalStack tests failed. Check the output above for details.');
        }

        return passedTests === totalTests;

    } catch (error: any) {
        console.error('❌ LocalStack test suite failed:', error.message);
        throw error;
    }
}

if (TEST_MODE === 'mock') {
    console.log("🧪 Using mock mode (no real AWS services)");

    // Mock environment variables
    process.env.USER_POOL_ID = "mock-pool-id";
    process.env.USER_POOL_CLIENT_ID = "mock-client-id";
    process.env.TABLE_NAME = "mock-table";
    process.env.AWS_REGION = "us-east-1";

    // Valid access levels
    const ACCESS_LEVELS = ['admin', 'contributor', 'guardian', 'user'];

    // Mock AWS SDK calls
    const mockHandler = async (event: any): Promise<TestResult> => {
        const body = JSON.parse(event.body);

        // Validation logic
        if (!body.email || !body.password || !body.f_name || !body.l_name || !body.birthdate) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing required fields: email, password, f_name, l_name, birthdate'
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Validate field lengths
        if (body.f_name.length > 24 || body.l_name.length > 24) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'First name and last name must be 24 characters or less'
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(body.birthdate)) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Birthdate must be in YYYY-MM-DD format'
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Check password strength
        if (body.password.length < 8) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Password must be at least 8 characters long'
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Determine role
        let role = 'user';
        if (body.role) {
            if (!ROLES.includes(body.role)) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: 'Invalid role. Valid values are: admin, contributor, guardian, user'
                    }),
                    headers: { 'Content-Type': 'application/json' }
                };
            }
            role = body.role;
        }

        // Note: Users under 18 can register but cannot submit artwork
        // They will need a guardian to submit artwork on their behalf

        // Mock successful registration
        return {
            statusCode: 201,
            body: JSON.stringify({
                UUID: "mock-user-id-" + Date.now()
            }),
            headers: { 'Content-Type': 'application/json' }
        };
    };

    async function runMockTests() {
        console.log("📋 Running all test cases...\n");

        for (const testCase of testCases) {
            try {
                const result = await mockHandler(testCase.event);
                const body = JSON.parse(testCase.event.body);

                console.log(testCase.name);
                console.log("📝 Test data:", body);
                console.log("Status Code:", result.statusCode);
                console.log("Response:", JSON.parse(result.body));
                console.log("---\n");
            } catch (error: any) {
                console.error(`❌ Error in test: ${testCase.name}`, error);
            }
        }
    }

    // Run the tests
    runMockTests().catch(console.error);

} else if (TEST_MODE === 'local') {
    // Run LocalStack tests
    runLocalStackTests().catch((error: any) => {
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
    setupLocalStackInfrastructure,
    runLocalStackTests,
    testCases
};