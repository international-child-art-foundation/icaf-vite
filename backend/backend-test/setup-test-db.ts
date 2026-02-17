#!/usr/bin/env node

/**
 * Test database setup script
 * 
 * This script is responsible for:
 * 1. Starting localstack (if needed)
 * 2. Create DynamoDB table
 * 3. Fill preset test data
 * 
 * use method:
 *   npx ts-node setup-test-db.ts
 *   npx ts-node setup-test-db.ts --clean    # clean database
 *   npx ts-node setup-test-db.ts --reseed   # reseed database
 */

import { setupPresetDatabase, cleanupPresetDatabase, resetPresetDatabase, presetDB } from './shared/simple-preset-db';

// check localstack is running
async function checkLocalStack(): Promise<boolean> {
    try {
        const response = await fetch('http://localhost:4566/_localstack/health');
        const health = await response.json();
        return health.services?.dynamodb === 'available' || health.services?.dynamodb === 'running';
    } catch (error) {
        console.error('Error checking LocalStack health:', error);
        return false;
    }
}

// wait localstack start (not used, but kept for future use)
// async function waitForLocalStack(maxAttempts = 30): Promise<void> {
//     console.log('⏳ Waiting for LocalStack to be ready...');

//     for (let attempt = 1; attempt <= maxAttempts; attempt++) {
//         if (await checkLocalStack()) {
//             console.log('✅ LocalStack is ready!');
//             return;
//         }

//         console.log(`   Attempt ${attempt}/${maxAttempts}: LocalStack not ready yet...`);
//         await new Promise(resolve => setTimeout(resolve, 2000));
//     }

//     throw new Error(`LocalStack failed to start within ${maxAttempts * 2} seconds`);
// }

// main function
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    console.log('🚀 ICAF Test Database Setup');
    console.log('==========================');

    try {
        // check LocalStack status
        console.log('\n1️⃣ Checking LocalStack...');
        if (!(await checkLocalStack())) {
            console.log('❌ LocalStack is not running or DynamoDB is not available');
            console.log('💡 Please start LocalStack first:');
            console.log('   docker-compose up localstack');
            console.log('   or');
            console.log('   cd backend/backend-test && ./run-localstack-test.sh');
            process.exit(1);
        }

        console.log('✅ LocalStack is running and DynamoDB is available');

        // execute corresponding operation according to command
        console.log('\n2️⃣ Setting up test database...');

        switch (command) {
            case '--clean':
                console.log('🧹 Cleaning database...');
                await cleanupPresetDatabase();
                console.log('✅ Database cleaned successfully');
                break;

            case '--reseed':
                console.log('🔄 Reseeding database...');
                await resetPresetDatabase();
                console.log('✅ Database reseeded successfully');
                break;

            case '--check': {
                console.log('🔍 Checking database status...');
                const isReady = presetDB.isReady();
                console.log(`📊 Database ready: ${isReady ? '✅ Yes' : '❌ No'}`);
                if (!isReady) {
                    console.log('💡 Run without arguments to setup the database');
                }
                break;
            }

            default:
                console.log('🌱 Setting up database with preset data...');
                await setupPresetDatabase();
                console.log('✅ Database setup completed successfully');
                break;
        }

        console.log('\n🎉 Setup complete!');
        console.log('');
        console.log('📊 Available preset data:');
        console.log('   👤 Users: CHILD_USER, ADULT_USER, GUARDIAN_USER, ADMIN_USER');
        console.log('   📅 Seasons: CURRENT_SEASON, PAST_SEASON, FUTURE_SEASON');
        console.log('   🎨 Artworks: APPROVED_ARTWORK, PENDING_ARTWORK, AI_ARTWORK');
        console.log('   💰 Donations: SMALL_DONATION, LARGE_DONATION');
        console.log('');
        console.log('💡 You can now run tests:');
        console.log('   cd backend/backend-test');
        console.log('   pnpm test');
        console.log('');
        console.log('🔧 Other commands:');
        console.log('   npx ts-node setup-test-db.ts --clean    # Clean database');
        console.log('   npx ts-node setup-test-db.ts --reseed   # Reseed database');
        console.log('   npx ts-node setup-test-db.ts --check    # Check status');

    } catch (error) {
        console.error('\n❌ Setup failed:', error);
        console.log('\n🆘 Troubleshooting:');
        console.log('   1. Make sure LocalStack is running: docker-compose up localstack');
        console.log('   2. Check LocalStack health: curl http://localhost:4566/_localstack/health');
        console.log('   3. Check Docker is running: docker ps');
        console.log('   4. Try restarting LocalStack: docker-compose restart localstack');
        process.exit(1);
    }
}

// error handling
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled rejection:', error);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
    process.exit(1);
});

// execute main function
if (require.main === module) {
    main();
}
