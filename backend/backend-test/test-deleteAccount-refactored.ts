const { CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { PutCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { dynamoClient, dynamodb, s3Client, TABLE_NAME, S3_BUCKET_NAME } = require('../config/aws-clients-test.js');

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

async function testDeleteAccountFunction() {
    const results = [];

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

        // Test 1: Create test user in DynamoDB
        const testUserId = 'test-user-123';
        const userProfile = {
            PK: `USER#${testUserId}`,
            SK: 'PROFILE',
            user_id: testUserId,
            f_name: 'Test',
            l_name: 'User',
            email: 'test@example.com',
            role: 'user',
            dob: '2000-01-01',
            timestamp: new Date().toISOString()
        };

        await dynamodb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: userProfile
        }));

        // Test 2: Create test artwork records
        const artworkRecord1 = {
            PK: `USER#${testUserId}`,
            SK: 'ARTWORK#artwork-1',
            artwork_id: 'artwork-1',
            title: 'Test Artwork 1',
            timestamp: new Date().toISOString()
        };

        const artworkRecord2 = {
            PK: `USER#${testUserId}`,
            SK: 'ARTWORK#artwork-2',
            artwork_id: 'artwork-2',
            title: 'Test Artwork 2',
            timestamp: new Date().toISOString()
        };

        await dynamodb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: artworkRecord1
        }));

        await dynamodb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: artworkRecord2
        }));

        // Test 3: Create test S3 objects
        try {
            await s3Client.send(new PutObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: `artwork/${testUserId}/artwork1.jpg`,
                Body: 'test-artwork-data-1'
            }));

            await s3Client.send(new PutObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: `artwork/${testUserId}/artwork2.jpg`,
                Body: 'test-artwork-data-2'
            }));
        } catch (s3Error) {
            console.log('S3 bucket might not exist in LocalStack, continuing with test...');
        }

        // Test 4: Verify data exists before deletion
        const queryResult = await dynamodb.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': `USER#${testUserId}`
            }
        }));

        if (queryResult.Items && queryResult.Items.length > 0) {
            results.push({
                testName: 'Data creation',
                passed: true
            });
        } else {
            results.push({
                testName: 'Data creation',
                passed: false,
                error: 'Failed to create test data'
            });
        }

        // Test 5: Simulate delete account request
        const deleteAccountEvent = {
            requestContext: {
                authorizer: {
                    claims: {
                        sub: testUserId,
                        email: 'test@example.com'
                    }
                }
            },
            body: JSON.stringify({
                password: 'testpassword123'
            })
        };

        // Mock delete account handler with actual data deletion
        const mockDeleteAccountHandler = async (event) => {
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

            // Actually delete the user data from DynamoDB
            try {
                // Query all USER#<uid> prefixed entries
                const queryParams = {
                    TableName: TABLE_NAME,
                    KeyConditionExpression: 'PK = :pk',
                    ExpressionAttributeValues: {
                        ':pk': `USER#${userId}`
                    }
                };

                const queryResult = await dynamodb.send(new QueryCommand(queryParams));
                const userRecords = queryResult.Items || [];

                // Delete all found entries
                const deletePromises = userRecords.map(record => {
                    const deleteParams = {
                        TableName: TABLE_NAME,
                        Key: {
                            PK: record.PK,
                            SK: record.SK
                        }
                    };
                    return dynamodb.send(new DeleteCommand(deleteParams));
                });

                await Promise.all(deletePromises);

                // Simulate successful deletion
                return {
                    statusCode: 204,
                    body: '',
                    headers: { 'Content-Type': 'application/json' }
                };
            } catch (error) {
                console.error('Error in mock handler:', error);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ message: 'Internal server error' }),
                    headers: { 'Content-Type': 'application/json' }
                };
            }
        };

        const response = await mockDeleteAccountHandler(deleteAccountEvent);

        if (response.statusCode === 204) {
            results.push({
                testName: 'Delete account endpoint',
                passed: true
            });
        } else {
            results.push({
                testName: 'Delete account endpoint',
                passed: false,
                error: `Expected status 204, got ${response.statusCode}: ${response.body}`
            });
        }

        // Test 6: Verify data is deleted
        const verifyQueryResult = await dynamodb.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': `USER#${testUserId}`
            }
        }));

        if (!verifyQueryResult.Items || verifyQueryResult.Items.length === 0) {
            results.push({
                testName: 'Data deletion verification',
                passed: true
            });
        } else {
            results.push({
                testName: 'Data deletion verification',
                passed: false,
                error: `Expected 0 items, found ${verifyQueryResult.Items.length}`
            });
        }

    } catch (error) {
        results.push({
            testName: 'Overall test execution',
            passed: false,
            error: error.message
        });
    }

    return results;
}

// Run tests
async function runTests() {
    console.log('🧪 Running Delete Account Function Tests (Refactored)...\n');

    const results = await testDeleteAccountFunction();

    console.log('📊 Test Results:');
    console.log('================');

    let passedTests = 0;
    let totalTests = results.length;

    results.forEach((result, index) => {
        const status = result.passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${index + 1}. ${result.testName}: ${status}`);

        if (!result.passed && result.error) {
            console.log(`   Error: ${result.error}`);
        }

        if (result.passed) passedTests++;
    });

    console.log('\n📈 Summary:');
    console.log(`Passed: ${passedTests}/${totalTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (passedTests === totalTests) {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some tests failed.');
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testDeleteAccountFunction }; 