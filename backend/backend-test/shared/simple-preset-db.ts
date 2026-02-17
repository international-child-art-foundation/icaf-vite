/**
 * Simplified Preset Test Database
 * 
 * This file provides a simple preset database system:
 * 1. Create all necessary test entities in one go
 * 2. Tests directly use the IDs of these preset entities
 * 3. Avoid each test creating its own data
 */

import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand, ScanCommand, DeleteCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

// Test configuration
export const TEST_CONFIG = {
    endpoint: 'http://localhost:4566',
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test'
    },
    tableName: process.env.TABLE_NAME || 'icaf-test-table'
};

// Import shared table schema
import { TABLE_SCHEMA } from './test-infrastructure';

// Initialize clients
const dynamoClient = new DynamoDBClient(TEST_CONFIG);
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Preset test data - all tests can use these fixed IDs
export const PRESET_TEST_DATA = {
    // User data
    users: {
        CHILD_USER: 'PRESET_CHILD_001',
        ADULT_USER: 'PRESET_ADULT_001',
        GUARDIAN_USER: 'PRESET_GUARDIAN_001',
        ADMIN_USER: 'PRESET_ADMIN_001',
        BANNED_USER: 'PRESET_BANNED_001',
        // New: Users for testing different season scenarios
        USER_WITH_ACTIVE_SUBMISSION: 'PRESET_USER_ACTIVE_001',
        USER_WITH_INACTIVE_SUBMISSION: 'PRESET_USER_INACTIVE_001',
        USER_WITHOUT_SUBMISSION: 'PRESET_USER_NONE_001',
        // Additional users for pagination testing
        PAGINATION_USER_1: 'PRESET_PAGINATION_USER_001',
        PAGINATION_USER_2: 'PRESET_PAGINATION_USER_002',
        PAGINATION_USER_3: 'PRESET_PAGINATION_USER_003',
        PAGINATION_USER_4: 'PRESET_PAGINATION_USER_004',
        PAGINATION_USER_5: 'PRESET_PAGINATION_USER_005',
        // Additional users for better pagination testing
        PAGINATION_USER_6: 'PRESET_PAGINATION_USER_006',
        PAGINATION_USER_7: 'PRESET_PAGINATION_USER_007',
        PAGINATION_USER_8: 'PRESET_PAGINATION_USER_008',
        PAGINATION_USER_9: 'PRESET_PAGINATION_USER_009',
        PAGINATION_USER_10: 'PRESET_PAGINATION_USER_010'
    },

    // Season data
    seasons: {
        CURRENT_SEASON: 'PRESET_CURRENT_2024',
        PAST_SEASON: 'PRESET_PAST_2023',
        FUTURE_SEASON: 'PRESET_FUTURE_2025',
        // New: Another active season for testing
        ANOTHER_ACTIVE_SEASON: 'PRESET_ACTIVE_2024'
    },

    // Artwork data
    artworks: {
        APPROVED_ARTWORK: 'PRESET_ARTWORK_001',
        PENDING_ARTWORK: 'PRESET_ARTWORK_002',
        AI_ARTWORK: 'PRESET_ARTWORK_003',
        // New: Artworks for testing different scenarios
        ACTIVE_SEASON_ARTWORK: 'PRESET_ARTWORK_ACTIVE_001',
        INACTIVE_SEASON_ARTWORK: 'PRESET_ARTWORK_INACTIVE_001',
        // Additional artworks for pagination testing
        PAGINATION_ARTWORK_1: 'PRESET_ARTWORK_PAGINATION_001',
        PAGINATION_ARTWORK_2: 'PRESET_ARTWORK_PAGINATION_002',
        PAGINATION_ARTWORK_3: 'PRESET_ARTWORK_PAGINATION_003',
        PAGINATION_ARTWORK_4: 'PRESET_ARTWORK_PAGINATION_004',
        PAGINATION_ARTWORK_5: 'PRESET_ARTWORK_PAGINATION_005',
        // Additional artworks for better pagination testing
        PAGINATION_ARTWORK_6: 'PRESET_ARTWORK_PAGINATION_006',
        PAGINATION_ARTWORK_7: 'PRESET_ARTWORK_PAGINATION_007',
        PAGINATION_ARTWORK_8: 'PRESET_ARTWORK_PAGINATION_008',
        PAGINATION_ARTWORK_9: 'PRESET_ARTWORK_PAGINATION_009',
        PAGINATION_ARTWORK_10: 'PRESET_ARTWORK_PAGINATION_010'
    },

    // Donation data
    donations: {
        SMALL_DONATION: 'PRESET_DONATION_001',
        LARGE_DONATION: 'PRESET_DONATION_002'
    }
};

// Preset entity data
const PRESET_ENTITIES = [
    // Users
    {
        PK: `USER#${PRESET_TEST_DATA.users.CHILD_USER}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.CHILD_USER,
        f_name: 'Alice',
        l_name: 'Young',
        dob: '2010-03-15',
        role: 'user',
        can_submit: false,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.ADULT_USER}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.ADULT_USER,
        f_name: 'Bob',
        l_name: 'Smith',
        dob: '1990-06-20',
        role: 'user',
        can_submit: true,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.GUARDIAN_USER}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.GUARDIAN_USER,
        f_name: 'Carol',
        l_name: 'Johnson',
        dob: '1980-12-05',
        role: 'guardian',
        can_submit: true,
        max_constituents_per_season: 5,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.ADMIN_USER}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.ADMIN_USER,
        f_name: 'David',
        l_name: 'Wilson',
        dob: '1975-08-18',
        role: 'admin',
        can_submit: true,
        max_constituents_per_season: -1,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },

    // Additional users for pagination testing
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_1}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_1,
        f_name: 'PaginationUser1',
        l_name: 'Test',
        dob: '1995-01-01',
        role: 'user',
        can_submit: true,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_2}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_2,
        f_name: 'PaginationUser2',
        l_name: 'Test',
        dob: '1996-02-02',
        role: 'user',
        can_submit: true,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_3}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_3,
        f_name: 'PaginationUser3',
        l_name: 'Test',
        dob: '1997-03-03',
        role: 'user',
        can_submit: true,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_4}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_4,
        f_name: 'PaginationUser4',
        l_name: 'Test',
        dob: '1998-04-04',
        role: 'user',
        can_submit: true,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_5}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_5,
        f_name: 'PaginationUser5',
        l_name: 'Test',
        dob: '1999-05-05',
        role: 'user',
        can_submit: true,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },

    // Additional users for better pagination testing
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_6}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_6,
        f_name: 'PaginationUser6',
        l_name: 'Test',
        dob: '1994-06-06',
        role: 'user',
        can_submit: true,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_7}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_7,
        f_name: 'PaginationUser7',
        l_name: 'Test',
        dob: '1993-07-07',
        role: 'user',
        can_submit: true,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_8}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_8,
        f_name: 'PaginationUser8',
        l_name: 'Test',
        dob: '1992-08-08',
        role: 'user',
        can_submit: true,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_9}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_9,
        f_name: 'PaginationUser9',
        l_name: 'Test',
        dob: '1991-09-09',
        role: 'user',
        can_submit: true,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_10}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_10,
        f_name: 'PaginationUser10',
        l_name: 'Test',
        dob: '1990-10-10',
        role: 'user',
        can_submit: true,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },

    // New users - for testing different season scenarios
    {
        PK: `USER#${PRESET_TEST_DATA.users.USER_WITH_ACTIVE_SUBMISSION}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.USER_WITH_ACTIVE_SUBMISSION,
        f_name: 'ActiveUser',
        l_name: 'HasSubmission',
        dob: '1995-05-10',
        role: 'user',
        can_submit: true,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.USER_WITH_INACTIVE_SUBMISSION}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.USER_WITH_INACTIVE_SUBMISSION,
        f_name: 'InactiveUser',
        l_name: 'HasSubmission',
        dob: '1992-08-15',
        role: 'user',
        can_submit: true,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.USER_WITHOUT_SUBMISSION}`,
        SK: 'PROFILE',
        user_id: PRESET_TEST_DATA.users.USER_WITHOUT_SUBMISSION,
        f_name: 'NoSubmission',
        l_name: 'User',
        dob: '1993-12-20',
        role: 'user',
        can_submit: true,
        has_paid: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'USER'
    },

    // Seasons
    {
        PK: 'SEASON',
        SK: `#ACTIVE#true#SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        colloq_name: 'Current Test Season 2024',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        payment_required: false,
        max_user_submissions: 3,
        can_vote: true,
        is_active: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'SEASON'
    },
    {
        PK: 'SEASON',
        SK: `#ACTIVE#false#SEASON#${PRESET_TEST_DATA.seasons.PAST_SEASON}`,
        season: PRESET_TEST_DATA.seasons.PAST_SEASON,
        colloq_name: 'Past Test Season 2023',
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        payment_required: false,
        max_user_submissions: 1,
        can_vote: false,
        is_active: false,
        timestamp: '2023-01-01T00:00:00.000Z',
        type: 'SEASON'
    },

    // New: Another active season
    {
        PK: 'SEASON',
        SK: `#ACTIVE#true#SEASON#${PRESET_TEST_DATA.seasons.ANOTHER_ACTIVE_SEASON}`,
        season: PRESET_TEST_DATA.seasons.ANOTHER_ACTIVE_SEASON,
        colloq_name: 'Another Active Season 2024',
        start_date: '2024-03-01',
        end_date: '2024-06-30',
        payment_required: false,
        max_user_submissions: 3,
        can_vote: true,
        is_active: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        type: 'SEASON'
    },

    // Artworks
    {
        PK: `ART#${PRESET_TEST_DATA.artworks.APPROVED_ARTWORK}`,
        SK: 'N/A',
        art_id: PRESET_TEST_DATA.artworks.APPROVED_ARTWORK,
        user_id: PRESET_TEST_DATA.users.CHILD_USER,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        f_name: 'Alice',
        age: 14,
        title: 'Sunset Dreams',
        is_approved: true,
        votes: 25,
        file_type: 'PNG',
        timestamp: '2024-01-15T10:00:00.000Z',
        type: 'ART',
        // GSI1 fields for time-based sorting
        GSI1PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI1SK: `TIMESTAMP#2024-01-15T10:00:00.000Z#ART#${PRESET_TEST_DATA.artworks.APPROVED_ARTWORK}`,
        // GSI2 fields for vote-based sorting
        GSI2PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI2SK: `VOTES#0000025#TIMESTAMP#2024-01-15T10:00:00.000Z#ART#${PRESET_TEST_DATA.artworks.APPROVED_ARTWORK}`
    },
    {
        PK: `ART#${PRESET_TEST_DATA.artworks.PENDING_ARTWORK}`,
        SK: 'N/A',
        art_id: PRESET_TEST_DATA.artworks.PENDING_ARTWORK,
        user_id: PRESET_TEST_DATA.users.ADULT_USER,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        f_name: 'Bob',
        age: 33,
        title: 'Digital Symphony',
        is_approved: false,
        votes: 0,
        file_type: 'JPEG',
        timestamp: '2024-02-10T14:30:00.000Z',
        type: 'ART'
    },

    // New artworks - testing different season scenarios
    {
        PK: `ART#${PRESET_TEST_DATA.artworks.ACTIVE_SEASON_ARTWORK}`,
        SK: 'N/A',
        art_id: PRESET_TEST_DATA.artworks.ACTIVE_SEASON_ARTWORK,
        user_id: PRESET_TEST_DATA.users.USER_WITH_ACTIVE_SUBMISSION,
        season: PRESET_TEST_DATA.seasons.ANOTHER_ACTIVE_SEASON,
        f_name: 'ActiveUser',
        age: 29,
        title: 'Active Season Art',
        is_approved: true,
        votes: 15,
        file_type: 'PNG',
        timestamp: '2024-03-15T12:00:00.000Z',
        type: 'ART'
    },
    {
        PK: `ART#${PRESET_TEST_DATA.artworks.INACTIVE_SEASON_ARTWORK}`,
        SK: 'N/A',
        art_id: PRESET_TEST_DATA.artworks.INACTIVE_SEASON_ARTWORK,
        user_id: PRESET_TEST_DATA.users.USER_WITH_INACTIVE_SUBMISSION,
        season: PRESET_TEST_DATA.seasons.PAST_SEASON,
        f_name: 'InactiveUser',
        age: 32,
        title: 'Past Season Art',
        is_approved: true,
        votes: 8,
        file_type: 'JPEG',
        timestamp: '2023-06-10T15:30:00.000Z',
        type: 'ART'
    },

    // Artwork pointers
    {
        PK: `USER#${PRESET_TEST_DATA.users.CHILD_USER}`,
        SK: `ART#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        type: 'ART_PTR',
        user_id: PRESET_TEST_DATA.users.CHILD_USER,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        art_id: PRESET_TEST_DATA.artworks.APPROVED_ARTWORK
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.ADULT_USER}`,
        SK: `ART#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        type: 'ART_PTR',
        user_id: PRESET_TEST_DATA.users.ADULT_USER,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        art_id: PRESET_TEST_DATA.artworks.PENDING_ARTWORK
    },

    // New artwork pointers - testing different season scenarios
    {
        PK: `USER#${PRESET_TEST_DATA.users.USER_WITH_ACTIVE_SUBMISSION}`,
        SK: `ART#${PRESET_TEST_DATA.seasons.ANOTHER_ACTIVE_SEASON}`,
        type: 'ART_PTR',
        user_id: PRESET_TEST_DATA.users.USER_WITH_ACTIVE_SUBMISSION,
        season: PRESET_TEST_DATA.seasons.ANOTHER_ACTIVE_SEASON,
        art_id: PRESET_TEST_DATA.artworks.ACTIVE_SEASON_ARTWORK
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.USER_WITH_INACTIVE_SUBMISSION}`,
        SK: `ART#${PRESET_TEST_DATA.seasons.PAST_SEASON}`,
        type: 'ART_PTR',
        user_id: PRESET_TEST_DATA.users.USER_WITH_INACTIVE_SUBMISSION,
        season: PRESET_TEST_DATA.seasons.PAST_SEASON,
        art_id: PRESET_TEST_DATA.artworks.INACTIVE_SEASON_ARTWORK
    },

    // Additional artworks for pagination testing - all in CURRENT_SEASON
    {
        PK: `ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_1}`,
        SK: 'N/A',
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_1,
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_1,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        f_name: 'PaginationUser1',
        age: 29,
        title: 'Pagination Art 1',
        is_approved: true,
        votes: 30,
        file_type: 'PNG',
        location: 'Test Location 1',
        timestamp: '2024-01-20T09:00:00.000Z',
        type: 'ART',
        // GSI1 fields for time-based sorting
        GSI1PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI1SK: `TIMESTAMP#2024-01-20T09:00:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_1}`,
        // GSI2 fields for vote-based sorting
        GSI2PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI2SK: `VOTES#0000030#TIMESTAMP#2024-01-20T09:00:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_1}`
    },
    {
        PK: `ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_2}`,
        SK: 'N/A',
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_2,
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_2,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        f_name: 'PaginationUser2',
        age: 28,
        title: 'Pagination Art 2',
        is_approved: true,
        votes: 22,
        file_type: 'JPEG',
        location: 'Test Location 2',
        timestamp: '2024-01-25T11:30:00.000Z',
        type: 'ART',
        // GSI1 fields for time-based sorting
        GSI1PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI1SK: `TIMESTAMP#2024-01-25T11:30:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_2}`,
        // GSI2 fields for vote-based sorting
        GSI2PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI2SK: `VOTES#0000022#TIMESTAMP#2024-01-25T11:30:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_2}`
    },
    {
        PK: `ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_3}`,
        SK: 'N/A',
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_3,
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_3,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        f_name: 'PaginationUser3',
        age: 27,
        title: 'Pagination Art 3',
        is_approved: true,
        votes: 18,
        file_type: 'PNG',
        location: 'Test Location 3',
        timestamp: '2024-01-30T14:15:00.000Z',
        type: 'ART',
        // GSI1 fields for time-based sorting
        GSI1PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI1SK: `TIMESTAMP#2024-01-30T14:15:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_3}`,
        // GSI2 fields for vote-based sorting
        GSI2PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI2SK: `VOTES#0000018#TIMESTAMP#2024-01-30T14:15:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_3}`
    },
    {
        PK: `ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_4}`,
        SK: 'N/A',
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_4,
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_4,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        f_name: 'PaginationUser4',
        age: 26,
        title: 'Pagination Art 4',
        is_approved: true,
        votes: 12,
        file_type: 'JPEG',
        location: 'Test Location 4',
        timestamp: '2024-02-05T16:45:00.000Z',
        type: 'ART',
        // GSI1 fields for time-based sorting
        GSI1PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI1SK: `TIMESTAMP#2024-02-05T16:45:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_4}`,
        // GSI2 fields for vote-based sorting
        GSI2PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI2SK: `VOTES#0000012#TIMESTAMP#2024-02-05T16:45:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_4}`
    },
    {
        PK: `ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_5}`,
        SK: 'N/A',
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_5,
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_5,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        f_name: 'PaginationUser5',
        age: 25,
        title: 'Pagination Art 5',
        is_approved: true,
        votes: 8,
        file_type: 'PNG',
        location: 'Test Location 5',
        timestamp: '2024-02-10T10:20:00.000Z',
        type: 'ART',
        // GSI1 fields for time-based sorting
        GSI1PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI1SK: `TIMESTAMP#2024-02-10T10:20:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_5}`,
        // GSI2 fields for vote-based sorting
        GSI2PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI2SK: `VOTES#0000008#TIMESTAMP#2024-02-10T10:20:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_5}`
    },

    // Additional artworks for better pagination testing
    {
        PK: `ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_6}`,
        SK: 'N/A',
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_6,
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_6,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        f_name: 'PaginationUser6',
        age: 30,
        title: 'Pagination Art 6',
        is_approved: true,
        votes: 6,
        file_type: 'PNG',
        location: 'Test Location 6',
        timestamp: '2024-02-15T08:30:00.000Z',
        type: 'ART',
        // GSI1 fields for time-based sorting
        GSI1PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI1SK: `TIMESTAMP#2024-02-15T08:30:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_6}`,
        // GSI2 fields for vote-based sorting
        GSI2PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI2SK: `VOTES#0000006#TIMESTAMP#2024-02-15T08:30:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_6}`
    },
    {
        PK: `ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_7}`,
        SK: 'N/A',
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_7,
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_7,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        f_name: 'PaginationUser7',
        age: 31,
        title: 'Pagination Art 7',
        is_approved: true,
        votes: 4,
        file_type: 'JPEG',
        location: 'Test Location 7',
        timestamp: '2024-02-20T12:15:00.000Z',
        type: 'ART',
        // GSI1 fields for time-based sorting
        GSI1PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI1SK: `TIMESTAMP#2024-02-20T12:15:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_7}`,
        // GSI2 fields for vote-based sorting
        GSI2PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI2SK: `VOTES#0000004#TIMESTAMP#2024-02-20T12:15:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_7}`
    },
    {
        PK: `ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_8}`,
        SK: 'N/A',
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_8,
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_8,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        f_name: 'PaginationUser8',
        age: 32,
        title: 'Pagination Art 8',
        is_approved: true,
        votes: 2,
        file_type: 'PNG',
        location: 'Test Location 8',
        timestamp: '2024-02-25T15:45:00.000Z',
        type: 'ART',
        // GSI1 fields for time-based sorting
        GSI1PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI1SK: `TIMESTAMP#2024-02-25T15:45:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_8}`,
        // GSI2 fields for vote-based sorting
        GSI2PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI2SK: `VOTES#0000002#TIMESTAMP#2024-02-25T15:45:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_8}`
    },
    {
        PK: `ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_9}`,
        SK: 'N/A',
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_9,
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_9,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        f_name: 'PaginationUser9',
        age: 33,
        title: 'Pagination Art 9',
        is_approved: true,
        votes: 1,
        file_type: 'JPEG',
        location: 'Test Location 9',
        timestamp: '2024-03-01T09:20:00.000Z',
        type: 'ART',
        // GSI1 fields for time-based sorting
        GSI1PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI1SK: `TIMESTAMP#2024-03-01T09:20:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_9}`,
        // GSI2 fields for vote-based sorting
        GSI2PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI2SK: `VOTES#0000001#TIMESTAMP#2024-03-01T09:20:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_9}`
    },
    {
        PK: `ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_10}`,
        SK: 'N/A',
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_10,
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_10,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        f_name: 'PaginationUser10',
        age: 34,
        title: 'Pagination Art 10',
        is_approved: true,
        votes: 0,
        file_type: 'PNG',
        location: 'Test Location 10',
        timestamp: '2024-03-05T11:10:00.000Z',
        type: 'ART',
        // GSI1 fields for time-based sorting
        GSI1PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI1SK: `TIMESTAMP#2024-03-05T11:10:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_10}`,
        // GSI2 fields for vote-based sorting
        GSI2PK: `SEASON#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        GSI2SK: `VOTES#0000000#TIMESTAMP#2024-03-05T11:10:00.000Z#ART#${PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_10}`
    },

    // Additional artwork pointers for pagination testing
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_1}`,
        SK: `ART#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        type: 'ART_PTR',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_1,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_1
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_2}`,
        SK: `ART#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        type: 'ART_PTR',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_2,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_2
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_3}`,
        SK: `ART#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        type: 'ART_PTR',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_3,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_3
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_4}`,
        SK: `ART#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        type: 'ART_PTR',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_4,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_4
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_5}`,
        SK: `ART#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        type: 'ART_PTR',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_5,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_5
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_6}`,
        SK: `ART#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        type: 'ART_PTR',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_6,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_6
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_7}`,
        SK: `ART#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        type: 'ART_PTR',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_7,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_7
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_8}`,
        SK: `ART#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        type: 'ART_PTR',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_8,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_8
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_9}`,
        SK: `ART#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        type: 'ART_PTR',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_9,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_9
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.PAGINATION_USER_10}`,
        SK: `ART#${PRESET_TEST_DATA.seasons.CURRENT_SEASON}`,
        type: 'ART_PTR',
        user_id: PRESET_TEST_DATA.users.PAGINATION_USER_10,
        season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
        art_id: PRESET_TEST_DATA.artworks.PAGINATION_ARTWORK_10
    },

    // Donations
    {
        PK: `USER#${PRESET_TEST_DATA.users.ADULT_USER}`,
        SK: `DONATION#${PRESET_TEST_DATA.donations.SMALL_DONATION}`,
        user_id: PRESET_TEST_DATA.users.ADULT_USER,
        donation_id: PRESET_TEST_DATA.donations.SMALL_DONATION,
        stripe_id: 'stripe_preset_001',
        amount_cents: 2500,
        currency: 'USD',
        status: 'succeeded',
        timestamp: '2024-01-20T12:00:00.000Z',
        type: 'DONATION'
    },
    {
        PK: `USER#${PRESET_TEST_DATA.users.GUARDIAN_USER}`,
        SK: `DONATION#${PRESET_TEST_DATA.donations.LARGE_DONATION}`,
        user_id: PRESET_TEST_DATA.users.GUARDIAN_USER,
        donation_id: PRESET_TEST_DATA.donations.LARGE_DONATION,
        stripe_id: 'stripe_preset_002',
        amount_cents: 10000,
        currency: 'USD',
        status: 'succeeded',
        timestamp: '2024-02-15T14:30:00.000Z',
        type: 'DONATION'
    }
];

/**
 * Preset database manager
 */
export class SimplePresetDB {
    private static instance: SimplePresetDB;
    private isSetup = false;

    private constructor() { }

    static getInstance(): SimplePresetDB {
        if (!SimplePresetDB.instance) {
            SimplePresetDB.instance = new SimplePresetDB();
        }
        return SimplePresetDB.instance;
    }

    /**
     * Setup preset database (create table and populate data)
     */
    async setup(): Promise<void> {
        if (this.isSetup) {
            console.log('📦 Preset database already setup');
            return;
        }

        console.log('🌱 Setting up preset test database...');

        try {
            // 1. Create table
            await this.createTable();

            // 2. Wait for table to become active
            await this.waitForTableActive();

            // 3. Populate preset data
            await this.seedData();

            // 4. Wait for GSI indexes to be fully active
            console.log('⏳ Waiting for GSI indexes to be fully active...');
            await this.waitForGSIActive();

            this.isSetup = true;
            console.log('✅ Preset test database setup complete!');
            this.logAvailableData();

        } catch (error) {
            console.error('❌ Error setting up preset database:', error);
            throw error;
        }
    }

    /**
     * Cleanup preset data (don't delete entire table, to be compatible with other tests)
     */
    async cleanup(): Promise<void> {
        console.log('🧹 Cleaning up preset data...');
        try {
            // Only cleanup preset data, don't delete entire table
            const presetPrefixes = ['PRESET_', 'USER#PRESET_', 'ART#PRESET_', 'SEASON'];

            for (const prefix of presetPrefixes) {
                const scanResult = await docClient.send(new ScanCommand({
                    TableName: TEST_CONFIG.tableName,
                    FilterExpression: 'begins_with(PK, :prefix)',
                    ExpressionAttributeValues: {
                        ':prefix': prefix
                    }
                }));

                if (scanResult.Items && scanResult.Items.length > 0) {
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
                    console.log(`🗑️  Cleaned up ${scanResult.Items.length} preset items with prefix: ${prefix}`);
                }
            }

            this.isSetup = false;
            console.log('✅ Preset data cleaned up');
        } catch (error: any) {
            if (error.name === 'ResourceNotFoundException') {
                console.log('✅ Table does not exist, nothing to clean');
            } else {
                console.error('❌ Error cleaning preset data:', error);
                throw error;
            }
        }
    }

    /**
     * Reset database
     */
    async reset(): Promise<void> {
        await this.cleanup();
        await this.setup();
    }

    /**
     * Check if setup is complete
     */
    isReady(): boolean {
        return this.isSetup;
    }

    // Private method: create table
    private async createTable(): Promise<void> {
        try {
            await dynamoClient.send(new CreateTableCommand(TABLE_SCHEMA));
            console.log(`✅ Table created: ${TABLE_SCHEMA.TableName}`);
        } catch (error: any) {
            if (error.name === 'ResourceInUseException') {
                console.log(`✅ Table already exists: ${TABLE_SCHEMA.TableName}`);
            } else {
                throw error;
            }
        }
    }

    // Private method: wait for table to be active
    private async waitForTableActive(): Promise<void> {
        console.log('⏳ Waiting for table to be active...');

        for (let attempt = 1; attempt <= 30; attempt++) {
            try {
                const result = await dynamoClient.send(new DescribeTableCommand({
                    TableName: TABLE_SCHEMA.TableName
                }));

                if (result.Table?.TableStatus === 'ACTIVE') {
                    console.log('✅ Table is active');
                    return;
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.log(`   Attempt ${attempt}/30: Error checking table status`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        throw new Error('Table failed to become active');
    }

    // Private method: wait for GSI indexes to be active
    private async waitForGSIActive(): Promise<void> {
        console.log('⏳ Waiting for GSI indexes to be active...');

        for (let attempt = 1; attempt <= 30; attempt++) {
            try {
                const result = await dynamoClient.send(new DescribeTableCommand({
                    TableName: TABLE_SCHEMA.TableName
                }));

                const table = result.Table;
                if (!table) {
                    throw new Error('Table not found');
                }

                // Check if all GSI indexes are active
                const gsiIndexes = table.GlobalSecondaryIndexes || [];
                const activeIndexes = gsiIndexes.filter(index => index.IndexStatus === 'ACTIVE');

                if (gsiIndexes.length > 0 && activeIndexes.length === gsiIndexes.length) {
                    console.log(`✅ All ${gsiIndexes.length} GSI indexes are active`);
                    return;
                }

                console.log(`   Attempt ${attempt}/30: ${activeIndexes.length}/${gsiIndexes.length} GSI indexes active`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between attempts
            } catch (error) {
                console.log(`   Attempt ${attempt}/30: Error checking GSI status: ${error}`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        console.log('⚠️  GSI indexes may not be fully active, continuing anyway...');
    }

    // Private method: seed data
    private async seedData(): Promise<void> {
        console.log('📝 Seeding preset data...');

        const BATCH_SIZE = 25;
        for (let i = 0; i < PRESET_ENTITIES.length; i += BATCH_SIZE) {
            const batch = PRESET_ENTITIES.slice(i, i + BATCH_SIZE);
            const putRequests = batch.map(item => ({
                PutRequest: { Item: item }
            }));

            await docClient.send(new BatchWriteCommand({
                RequestItems: {
                    [TABLE_SCHEMA.TableName]: putRequests
                }
            }));
        }

        console.log(`✅ Seeded ${PRESET_ENTITIES.length} preset entities`);
    }

    // Private method: log available data
    private logAvailableData(): void {
        console.log('\n📊 Available preset data:');
        console.log('Users:');
        Object.entries(PRESET_TEST_DATA.users).forEach(([key, id]) => {
            console.log(`  ${key}: ${id}`);
        });
        console.log('Seasons:');
        Object.entries(PRESET_TEST_DATA.seasons).forEach(([key, id]) => {
            console.log(`  ${key}: ${id}`);
        });
        console.log('Artworks:');
        Object.entries(PRESET_TEST_DATA.artworks).forEach(([key, id]) => {
            console.log(`  ${key}: ${id}`);
        });
        console.log('Donations:');
        Object.entries(PRESET_TEST_DATA.donations).forEach(([key, id]) => {
            console.log(`  ${key}: ${id}`);
        });
    }
}

// Export convenient instance and functions
export const presetDB = SimplePresetDB.getInstance();

export async function setupPresetDatabase(): Promise<void> {
    await presetDB.setup();
}

export async function cleanupPresetDatabase(): Promise<void> {
    await presetDB.cleanup();
}

export async function resetPresetDatabase(): Promise<void> {
    await presetDB.reset();
}

// Export DynamoDB client for testing
export { docClient };

// ============================================================================
// TEMPORARY TEST DATA TOOLS (merged from simple-test-helpers.ts)
// ============================================================================

/**
 * Test data ID generator
 */
export class TestDataGenerator {
    private static counter = 0;

    static generateId(prefix: string = 'TEST'): string {
        return `${prefix}_${++this.counter}_${Date.now()}`;
    }

    static generateUserId(prefix: string = 'TEST_USER'): string {
        return this.generateId(prefix);
    }

    static generateArtworkId(prefix: string = 'TEST_ART'): string {
        return this.generateId(prefix);
    }
}

/**
 * Temporary test data creator (for tests that need special data)
 */
export class TempTestData {
    /**
     * Create temporary user (will be cleaned up after test)
     */
    static async createTempUser(prefix: string, userData: any = {}): Promise<string> {
        const userId = TestDataGenerator.generateUserId(prefix);

        await docClient.send(new PutCommand({
            TableName: TEST_CONFIG.tableName,
            Item: {
                PK: `USER#${userId}`,
                SK: 'PROFILE',
                user_id: userId,
                f_name: 'Temp',
                l_name: 'User',
                dob: '2000-01-01',
                role: 'user',
                timestamp: new Date().toISOString(),
                type: 'USER',
                ...userData
            }
        }));

        return userId;
    }

    /**
     * Create temporary artwork
     */
    static async createTempArtwork(prefix: string, userId: string, artworkData: any = {}): Promise<string> {
        const artworkId = TestDataGenerator.generateArtworkId(prefix);
        const timestamp = artworkData.timestamp || new Date().toISOString();
        const season = artworkData.season || PRESET_TEST_DATA.seasons.CURRENT_SEASON;
        const votes = artworkData.votes || 0;
        const isApproved = artworkData.is_approved !== undefined ? artworkData.is_approved : false;

        // Prepare base item
        const item: any = {
            PK: `ART#${artworkId}`,
            SK: 'N/A',
            art_id: artworkId,
            user_id: userId,
            title: 'Temp Artwork',
            season: season,
            votes: votes,
            is_approved: isApproved,
            timestamp: timestamp,
            type: 'ART',
            ...artworkData
        };

        // Add GSI fields only if artwork is approved (sparse GSI)
        if (isApproved) {
            const paddedVotes = votes.toString().padStart(7, '0'); // Left-pad votes: 0000001

            // GSI1 fields for time-based sorting
            item.GSI1PK = `SEASON#${season}`;
            item.GSI1SK = `TIMESTAMP#${timestamp}#ART#${artworkId}`;

            // GSI2 fields for vote-based sorting
            item.GSI2PK = `SEASON#${season}`;
            item.GSI2SK = `VOTES#${paddedVotes}#TIMESTAMP#${timestamp}#ART#${artworkId}`;
        }

        await docClient.send(new PutCommand({
            TableName: TEST_CONFIG.tableName,
            Item: item
        }));

        return artworkId;
    }

    /**
     * Cleanup temporary test data by prefix
     */
    static async cleanup(prefix: string): Promise<void> {
        try {
            const result = await docClient.send(new ScanCommand({
                TableName: TEST_CONFIG.tableName,
                FilterExpression: 'contains(PK, :prefix) OR contains(art_id, :prefix) OR contains(user_id, :prefix)',
                ExpressionAttributeValues: {
                    ':prefix': prefix
                }
            }));

            if (result.Items && result.Items.length > 0) {
                console.log(`🧹 Cleaning up ${result.Items.length} temporary items with prefix: ${prefix}`);

                // Delete items one by one
                for (const item of result.Items) {
                    await docClient.send(new DeleteCommand({
                        TableName: TEST_CONFIG.tableName,
                        Key: {
                            PK: item.PK,
                            SK: item.SK
                        }
                    }));
                }

                console.log(`✅ Cleaned up ${result.Items.length} temporary items`);
            }
        } catch (error) {
            console.error('❌ Error cleaning up temporary data:', error);
            throw error;
        }
    }
}

/**
 * Test event generators for Lambda functions
 */
export class TestEventGenerator {
    /**
     * Create authenticated event with user context
     */
    static createAuthEvent(userId: string, userInfo: any = {}): any {
        return {
            requestContext: {
                authorizer: {
                    claims: {
                        sub: userId,
                        'cognito:username': userId,
                        ...userInfo
                    }
                }
            },
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }

    /**
     * Generate POST event with body
     */
    static createPostEvent(userId: string, body: any, userInfo: any = {}): any {
        return {
            ...this.createAuthEvent(userId, userInfo),
            body: JSON.stringify(body),
            httpMethod: 'POST'
        };
    }

    /**
     * Generate GET event with query parameters
     */
    static createGetEvent(userId: string, queryParams: any = {}, userInfo: any = {}): any {
        return {
            ...this.createAuthEvent(userId, userInfo),
            queryStringParameters: queryParams,
            httpMethod: 'GET'
        };
    }

    /**
     * Generate PATCH event with body and path parameters
     */
    static createPatchEvent(userId: string, body: any, pathParams: any = {}, userInfo: any = {}): any {
        return {
            ...this.createAuthEvent(userId, userInfo),
            body: JSON.stringify(body),
            pathParameters: pathParams,
            httpMethod: 'PATCH'
        };
    }

    /**
     * Generate PUT event with body and path parameters
     */
    static createPutEvent(userId: string, body: any, pathParams: any = {}, userInfo: any = {}): any {
        return {
            ...this.createAuthEvent(userId, userInfo),
            body: JSON.stringify(body),
            pathParameters: pathParams,
            httpMethod: 'PUT'
        };
    }

    /**
     * Generate DELETE event with path parameters
     */
    static createDeleteEvent(userId: string, pathParams: any = {}, userInfo: any = {}): any {
        return {
            ...this.createAuthEvent(userId, userInfo),
            pathParameters: pathParams,
            httpMethod: 'DELETE'
        };
    }
}

/**
 * Backward compatibility - preset events using preset data
 */
export const PresetEvents = {
    /**
     * Create authenticated event using preset user
     */
    createAuthEvent: (presetUserKey: keyof typeof PRESET_TEST_DATA.users, userInfo: any = {}) => {
        const userId = PRESET_TEST_DATA.users[presetUserKey];
        return TestEventGenerator.createAuthEvent(userId, userInfo);
    },

    /**
     * Create POST event using preset user
     */
    createPostEvent: (presetUserKey: keyof typeof PRESET_TEST_DATA.users, body: any, userInfo: any = {}) => {
        const userId = PRESET_TEST_DATA.users[presetUserKey];
        return TestEventGenerator.createPostEvent(userId, body, userInfo);
    },

    /**
     * Create GET event using preset user
     */
    createGetEvent: (presetUserKey: keyof typeof PRESET_TEST_DATA.users, queryParams: any = {}, userInfo: any = {}) => {
        const userId = PRESET_TEST_DATA.users[presetUserKey];
        return TestEventGenerator.createGetEvent(userId, queryParams, userInfo);
    },

    /**
     * Create PATCH event using preset user
     */
    createPatchEvent: (presetUserKey: keyof typeof PRESET_TEST_DATA.users, body: any, pathParams: any = {}, userInfo: any = {}) => {
        const userId = PRESET_TEST_DATA.users[presetUserKey];
        return TestEventGenerator.createPatchEvent(userId, body, pathParams, userInfo);
    },

    /**
     * Create PUT event using preset user
     */
    createPutEvent: (presetUserKey: keyof typeof PRESET_TEST_DATA.users, body: any, pathParams: any = {}, userInfo: any = {}) => {
        const userId = PRESET_TEST_DATA.users[presetUserKey];
        return TestEventGenerator.createPutEvent(userId, body, pathParams, userInfo);
    },

    /**
     * Create DELETE event using preset user
     */
    createDeleteEvent: (presetUserKey: keyof typeof PRESET_TEST_DATA.users, pathParams: any = {}, userInfo: any = {}) => {
        const userId = PRESET_TEST_DATA.users[presetUserKey];
        return TestEventGenerator.createDeleteEvent(userId, pathParams, userInfo);
    },

    // Backward compatibility - simplified method names
    childUser: (userInfo: any = {}) => {
        const userId = PRESET_TEST_DATA.users.CHILD_USER;
        return TestEventGenerator.createAuthEvent(userId, userInfo);
    },

    adultUser: (userInfo: any = {}) => {
        const userId = PRESET_TEST_DATA.users.ADULT_USER;
        return TestEventGenerator.createAuthEvent(userId, userInfo);
    },

    guardianUser: (userInfo: any = {}) => {
        const userId = PRESET_TEST_DATA.users.GUARDIAN_USER;
        return TestEventGenerator.createAuthEvent(userId, userInfo);
    },

    adminUser: (userInfo: any = {}) => {
        const userId = PRESET_TEST_DATA.users.ADMIN_USER;
        return TestEventGenerator.createAuthEvent(userId, userInfo);
    },

    bannedUser: (userInfo: any = {}) => {
        const userId = PRESET_TEST_DATA.users.BANNED_USER;
        return TestEventGenerator.createAuthEvent(userId, userInfo);
    }
};

/**
 * Test assertion helpers
 */
export class TestAssertions {
    /**
     * Validate Lambda response structure
     */
    static validateLambdaResponse(response: any): void {
        expect(response).toHaveProperty('statusCode');
        expect(response).toHaveProperty('body');
        expect(response).toHaveProperty('headers');
        expect(typeof response.statusCode).toBe('number');
        expect(typeof response.body).toBe('string');
        expect(typeof response.headers).toBe('object');
    }

    /**
     * Validate successful response
     */
    static validateSuccessResponse(response: any, expectedStatusCode: number = 200): void {
        this.validateLambdaResponse(response);
        expect(response.statusCode).toBe(expectedStatusCode);

        const body = JSON.parse(response.body);
        expect(body).not.toHaveProperty('error');
    }

    /**
     * Validate error response
     */
    static validateErrorResponse(response: any, expectedStatusCode: number, expectedErrorMessage?: string): void {
        this.validateLambdaResponse(response);
        expect(response.statusCode).toBe(expectedStatusCode);

        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('error');

        if (expectedErrorMessage) {
            expect(body.error).toContain(expectedErrorMessage);
        }
    }
}
