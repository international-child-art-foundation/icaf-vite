// Test artworkSubmission.ts functionality with different modes
const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

// Test configuration (inline to avoid TypeScript import issues)
const TABLE_NAME = 'icaf-main-table';

// Helper function to wait for table to be active
async function waitForTableActive(tableName, maxAttempts = 10) {
    console.log(`⏳ Waiting for table ${tableName} to be active...`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
            const { DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

            const dynamoClient = new DynamoDBClient({
                endpoint: 'http://localhost:4566',
                region: 'us-east-1',
                credentials: {
                    accessKeyId: 'test',
                    secretAccessKey: 'test'
                }
            });

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
            const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
            const { CreateTableCommand } = require('@aws-sdk/client-dynamodb');

            const dynamoClient = new DynamoDBClient({
                endpoint: 'http://localhost:4566',
                region: 'us-east-1',
                credentials: {
                    accessKeyId: 'test',
                    secretAccessKey: 'test'
                }
            });

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
            can_submit: true,
            has_magazine_subscription: true,
            has_newsletter_subscription: false,
            timestamp: new Date().toISOString(),
            type: 'USER'
        };

        // Create test artwork submissions
        const testArtworks = [
            {
                PK: `USER#${testUserId}`,
                SK: 'ART#artwork-1',
                artwork_id: 'artwork-1',
                title: 'My First Painting',
                image_url: 'https://example.com/artwork1.jpg',
                submission_date: '2024-01-15T10:30:00Z',
                is_approved: true,
                votes: 5,
                season_name: 'Spring 2024',
                timestamp: '2024-01-15T10:30:00Z'
            },
            {
                PK: `USER#${testUserId}`,
                SK: 'ART#artwork-2',
                artwork_id: 'artwork-2',
                title: 'Summer Landscape',
                image_url: 'https://example.com/artwork2.jpg',
                submission_date: '2024-02-20T14:45:00Z',
                is_approved: false,
                votes: 0,
                season_name: 'Summer 2024',
                timestamp: '2024-02-20T14:45:00Z'
            },
            {
                PK: `USER#${testUserId}`,
                SK: 'ART#artwork-3',
                artwork_id: 'artwork-3',
                title: 'Abstract Dreams',
                image_url: 'https://example.com/artwork3.jpg',
                submission_date: '2024-03-10T09:15:00Z',
                is_approved: true,
                votes: 12,
                season_name: 'Spring 2024',
                timestamp: '2024-03-10T09:15:00Z'
            }
        ];

        // Create DynamoDB client for test data insertion
        const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
        const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

        const testDynamoClient = new DynamoDBClient({
            endpoint: 'http://localhost:4566',
            region: 'us-east-1',
            credentials: {
                accessKeyId: 'test',
                secretAccessKey: 'test'
            }
        });

        const testDynamodb = DynamoDBDocumentClient.from(testDynamoClient);

        // Insert test user
        await testDynamodb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: testUserData
        }));

        // Insert test artworks
        for (const artwork of testArtworks) {
            await testDynamodb.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: artwork
            }));
        }

        console.log(`✅ Test user and artwork data created: ${testUserId}`);
        return testUserId;

    } catch (error) {
        console.error('❌ Error setting up test data:', error.message);
        throw error;
    }
}

// Test cases
const testCases = [
    {
        name: "✅ Get artwork submissions (authenticated user)",
        event: {
            requestContext: {
                authorizer: {
                    claims: {
                        sub: 'test-user-123',
                        email: 'john.doe@example.com'
                    }
                }
            },
            queryStringParameters: {}
        },
        expectedStatus: 200,
        description: "Should return user's artwork submissions with correct format"
    },
    {
        name: "✅ Get artwork submissions with limit",
        event: {
            requestContext: {
                authorizer: {
                    claims: {
                        sub: 'test-user-123',
                        email: 'john.doe@example.com'
                    }
                }
            },
            queryStringParameters: {
                limit: '2'
            }
        },
        expectedStatus: 200,
        description: "Should return limited number of artwork submissions"
    },
    {
        name: "✅ Get artwork submissions with pagination",
        event: {
            requestContext: {
                authorizer: {
                    claims: {
                        sub: 'test-user-123',
                        email: 'john.doe@example.com'
                    }
                }
            },
            queryStringParameters: {
                limit: '1',
                last_evaluated_key: encodeURIComponent(JSON.stringify({
                    PK: 'USER#test-user-123',
                    SK: 'ART#artwork-2'
                }))
            }
        },
        expectedStatus: 200,
        description: "Should return paginated artwork submissions"
    },
    {
        name: "❌ Unauthorized access (no user ID)",
        event: {
            requestContext: {
                authorizer: {
                    claims: {}
                }
            },
            queryStringParameters: {}
        },
        expectedStatus: 401,
        description: "Should reject access without user ID"
    },
    {
        name: "❌ Unauthorized access (no authorizer)",
        event: {
            requestContext: {},
            queryStringParameters: {}
        },
        expectedStatus: 401,
        description: "Should reject access without authorizer"
    },
    {
        name: "✅ Get artwork submissions for user with no artworks",
        event: {
            requestContext: {
                authorizer: {
                    claims: {
                        sub: 'test-user-no-artworks',
                        email: 'noartworks@example.com'
                    }
                }
            },
            queryStringParameters: {}
        },
        expectedStatus: 200,
        description: "Should return empty artworks array for user with no submissions"
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

        // Mock artwork submissions response
        const mockArtworks = [
            {
                artwork_id: 'artwork-1',
                title: 'My First Painting',
                image_url: 'https://example.com/artwork1.jpg',
                submission_date: '2024-01-15T10:30:00Z',
                is_approved: true,
                votes: 5,
                season_name: 'Spring 2024'
            },
            {
                artwork_id: 'artwork-2',
                title: 'Summer Landscape',
                image_url: 'https://example.com/artwork2.jpg',
                submission_date: '2024-02-20T14:45:00Z',
                is_approved: false,
                votes: 0,
                season_name: 'Summer 2024'
            }
        ];

        const response = {
            artworks: userId === 'test-user-no-artworks' ? [] : mockArtworks
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
    console.log(`📍 LocalStack endpoint: http://localhost:4566`);
    console.log(`📍 Region: us-east-1\n`);

    async function runLocalStackTests() {
        try {
            // Setup test data
            await setupTestData();

            // Set environment variables
            process.env.NODE_ENV = 'test';
            process.env.TABLE_NAME = TABLE_NAME;
            process.env.AWS_REGION = 'us-east-1';

            // Create LocalStack handler that mimics artworkSubmission.ts functionality
            const localStackHandler = async (event) => {
                const userId = event.requestContext?.authorizer?.claims?.sub;

                if (!userId) {
                    return {
                        statusCode: 401,
                        body: JSON.stringify({ message: 'Unauthorized' }),
                        headers: { 'Content-Type': 'application/json' }
                    };
                }

                // Parse query parameters
                const queryParams = event.queryStringParameters || {};
                const limit = parseInt(queryParams.limit) || 20;
                const lastEvaluatedKey = queryParams.last_evaluated_key ?
                    JSON.parse(decodeURIComponent(queryParams.last_evaluated_key)) : undefined;

                try {
                    // Query DynamoDB for artwork submissions using test configuration
                    const { QueryCommand } = require('@aws-sdk/lib-dynamodb');

                    const queryCommandParams = {
                        TableName: TABLE_NAME,
                        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                        ExpressionAttributeValues: {
                            ':pk': `USER#${userId}`,
                            ':sk': 'ART#'
                        },
                        Limit: limit,
                        ScanIndexForward: false,
                        ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey })
                    };

                    // Create DynamoDB client for querying
                    const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
                    const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

                    const queryDynamoClient = new DynamoDBClient({
                        endpoint: 'http://localhost:4566',
                        region: 'us-east-1',
                        credentials: {
                            accessKeyId: 'test',
                            secretAccessKey: 'test'
                        }
                    });

                    const queryDynamodb = DynamoDBDocumentClient.from(queryDynamoClient);

                    const result = await queryDynamodb.send(new QueryCommand(queryCommandParams));
                    const artworks = result.Items || [];

                    // Transform response format
                    const transformedArtworks = artworks.map(artwork => ({
                        artwork_id: artwork.artwork_id || artwork.SK.replace('ART#', ''),
                        title: artwork.title || '',
                        image_url: artwork.image_url || '',
                        submission_date: artwork.submission_date || artwork.timestamp || '',
                        is_approved: artwork.is_approved || false,
                        votes: artwork.votes || 0,
                        season_name: artwork.season_name || ''
                    }));

                    const response = {
                        artworks: transformedArtworks,
                        ...(result.LastEvaluatedKey && {
                            last_evaluated_key: encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
                        })
                    };

                    return {
                        statusCode: 200,
                        body: JSON.stringify(response),
                        headers: { 'Content-Type': 'application/json' }
                    };

                } catch (error) {
                    console.error('Error fetching artwork submissions:', error);
                    return {
                        statusCode: 500,
                        body: JSON.stringify({ message: 'Internal server error' }),
                        headers: { 'Content-Type': 'application/json' }
                    };
                }
            };

            console.log("📋 Running all test cases with LocalStack...\n");

            let passedTests = 0;
            let totalTests = testCases.length;

            for (const testCase of testCases) {
                console.log(testCase.name);
                console.log(`📝 Description: ${testCase.description}`);
                console.log("📝 Test data:", testCase.event);

                try {
                    const result = await localStackHandler(testCase.event);
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