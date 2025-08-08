// Export all shared test infrastructure
export * from './test-infrastructure';
export * from './test-utils';
export { runExampleTest, ExampleTestSuite } from './example-test';

// Re-export commonly used items for convenience
export {
    TEST_CONFIG,
    TABLE_SCHEMA,
    TEST_PREFIXES,
    createTestTable,
    cleanupTestData,
    createTestUser,
    createTestArtwork,
    createTestDonation,
    createTestSeason,
    dynamoClient,
    docClient
} from './test-infrastructure';

export {
    TestSetup,
    TestDataGenerator,
    TestValidator,
    USER_TEMPLATES,
    ARTWORK_TEMPLATES,
    DONATION_TEMPLATES,
    SEASON_TEMPLATES,
    TEST_CONSTANTS
} from './test-utils';
