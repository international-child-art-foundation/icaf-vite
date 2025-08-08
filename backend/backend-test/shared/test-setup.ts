// Global test setup for Jest
import { createTestTable } from './test-infrastructure';

// Global setup - runs once before all tests
beforeAll(async () => {
    console.log('🔧 Setting up global test environment...');
    try {
        await createTestTable();
        console.log('✅ Global test environment ready');
    } catch (error) {
        console.error('❌ Failed to setup global test environment:', error);
        throw error;
    }
}, 60000); // 60 second timeout for table creation

// Global teardown - runs once after all tests
afterAll(async () => {
    console.log('🧹 Cleaning up global test environment...');
    // Add any global cleanup here if needed
}, 30000);
