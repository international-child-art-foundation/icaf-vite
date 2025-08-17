/**
 * simple global test setup
 * 
 * this file is responsible for:
 * 1. setting up and cleaning up global test environment
 * 2. ensuring preset database is ready before all tests
 */

import { setupPresetDatabase, cleanupPresetDatabase } from './simple-preset-db';
import { createTestTable } from './test-infrastructure';

// global setup - run once before all tests
beforeAll(async () => {
    console.log('🔧 Setting up global test environment...');
    try {
        // first ensure table exists (compatible with old tests)
        await createTestTable();

        // then setup preset data
        await setupPresetDatabase();

        console.log('✅ Global test environment ready');
    } catch (error) {
        console.error('❌ Failed to setup global test environment:', error);
        throw error;
    }
}, 60000); // 60 seconds timeout

// global cleanup - run once after all tests
afterAll(async () => {
    console.log('🧹 Cleaning up global test environment...');
    try {
        await cleanupPresetDatabase();
        console.log('✅ Global test environment cleaned up');
    } catch (error) {
        console.error('❌ Error during global cleanup:', error);
        // don't throw error, to avoid masking test failures
    }
}, 30000); // 30 seconds timeout
