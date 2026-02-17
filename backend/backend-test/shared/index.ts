// Export simplified test system (recommended for new tests)
export * from './simple-preset-db';
export * from './simple-test-helpers';

// Export legacy test infrastructure (for existing tests that need it)
export * from './test-infrastructure';
export * from './test-utils';

// Re-export commonly used items for convenience
export {
    // New simplified system - preset database
    PRESET_TEST_DATA,
    setupPresetDatabase,
    cleanupPresetDatabase,
    resetPresetDatabase
} from './simple-preset-db';

export {
    // New simplified system - test helpers
    PresetEvents,
    TempTestData,
    TestEventGenerator,
    TestAssertions
} from './simple-test-helpers';

export {
    // Legacy system
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
    TestDataGenerator as LegacyTestDataGenerator,
    TestValidator,
    USER_TEMPLATES,
    ARTWORK_TEMPLATES,
    DONATION_TEMPLATES,
    SEASON_TEMPLATES,
    TEST_CONSTANTS
} from './test-utils';
