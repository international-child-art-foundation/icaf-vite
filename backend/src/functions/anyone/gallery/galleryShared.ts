/**
 * Gallery Shared Logic
 * 
 * Contains common query logic and configurations for gallery endpoints.
 * Handles DynamoDB GSI queries for different sorting requirements.
 * 
 * Required GSI Structure:
 * 
 * GSI1 - Time Sorted (Season):
 *   PK: GSI1PK = SEASON#<id>
 *   SK: GSI1SK = TIMESTAMP#<timestamp>#ART#<art_id>
 *   Sparse: is_approved=true
 * 
 * GSI2 - Vote Sorted (Season):
 *   PK: GSI2PK = SEASON#<id>  
 *   SK: GSI2SK = VOTES#<votes>#TIMESTAMP#<timestamp>#ART#<art_id>
 *   Sparse: is_approved=true
 *   Notes: Votes are left-padded (0000001), timestamp for determinism
 */

import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from '../../../config/aws-clients';
import {
    SortType,
    GalleryQueryParams
} from '../../../../shared/src/api-types/galleryTypes';
import { ArtworkEntity } from '../../../../shared/src/api-types/artworkTypes';

// GSI configuration for different query types
interface GSIQueryConfig {
    indexName: string;
    keyConditionExpression: string;
    scanIndexForward: boolean;
}

// Helper function to format DynamoDB item as ArtworkEntity
function formatArtworkEntity(item: any): ArtworkEntity {
    return {
        art_id: item.art_id || item.artwork_id,
        user_id: item.user_id,
        season: item.season,
        title: item.title,
        description: item.description,
        f_name: item.f_name,
        age: item.age,
        location: item.location,
        is_virtual: item.is_virtual || false,
        is_ai_gen: item.is_ai_gen || false,
        model: item.model,
        file_type: item.file_type,
        is_approved: item.is_approved || false,
        votes: item.votes || 0,
        timestamp: item.timestamp,
        type: 'ART' as const
    };
}



// Query configurations for each sort type
const QUERY_CONFIGS: Record<SortType, GSIQueryConfig> = {
    'newest': {
        indexName: 'GSI1', // Time Sorted (Season)
        keyConditionExpression: 'GSI1PK = :seasonPK',
        scanIndexForward: false, // DESC order for newest first (latest timestamp)
    },
    'oldest': {
        indexName: 'GSI1', // Time Sorted (Season)
        keyConditionExpression: 'GSI1PK = :seasonPK',
        scanIndexForward: true, // ASC order for oldest first (earliest timestamp)
    },
    'highest-voted': {
        indexName: 'GSI2', // Vote Sorted (Season)
        keyConditionExpression: 'GSI2PK = :seasonPK',
        scanIndexForward: false, // DESC order for highest votes first (votes are left-padded)
    },
    'lowest-voted': {
        indexName: 'GSI2', // Vote Sorted (Season)
        keyConditionExpression: 'GSI2PK = :seasonPK',
        scanIndexForward: true, // ASC order for lowest votes first (votes are left-padded)
    }
};

/**
 * Execute gallery query based on sort type and parameters
 */
export async function executeGalleryQuery(
    sortType: SortType,
    params: GalleryQueryParams
): Promise<{
    artworks: ArtworkEntity[];
    count: number;
    hasMore: boolean;
    season: string;
    sortType: SortType;
    pagination: {
        has_more: boolean;
        last_evaluated_key?: string;
    };
}> {

    const config = QUERY_CONFIGS[sortType];
    const limit = Math.min(params.limit || 20, 100);

    // Build query parameters
    const queryParams: any = {
        TableName: TABLE_NAME,
        IndexName: config.indexName,
        KeyConditionExpression: config.keyConditionExpression,
        ExpressionAttributeValues: {
            ':seasonPK': `SEASON#${params.season}` // Format: SEASON#SEASON#<id> (season already contains SEASON# prefix)
        },
        ScanIndexForward: config.scanIndexForward,
        Limit: limit
    };


    // Add pagination if provided
    if (params.lastEvaluatedKey) {
        try {
            const decodedKey = Buffer.from(params.lastEvaluatedKey, 'base64').toString();
            queryParams.ExclusiveStartKey = JSON.parse(decodedKey);
        } catch (error) {
            console.error('❌ Pagination: Error decoding lastEvaluatedKey:', error);
            // Return empty result instead of throwing error for invalid pagination key
            return {
                artworks: [],
                count: 0,
                hasMore: false,
                season: params.season,
                sortType,
                pagination: {
                    has_more: false,
                    last_evaluated_key: undefined
                }
            };
        }
    }

    // Execute query
    try {
        const result = await dynamodb.send(new QueryCommand(queryParams));
        const items = result.Items || [];

        // Format artwork items for response
        const artworks: ArtworkEntity[] = items.map(item => formatArtworkEntity(item));

        // Encode pagination key
        let encodedLastKey: string | undefined;
        if (result.LastEvaluatedKey) {
            encodedLastKey = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
        }

        return {
            artworks,
            count: artworks.length,
            hasMore: !!result.LastEvaluatedKey,
            season: params.season,
            sortType,
            pagination: {
                has_more: !!result.LastEvaluatedKey,
                last_evaluated_key: encodedLastKey
            }
        };

    } catch (error: any) {
        // Handle common DynamoDB errors
        if (error.name === 'ResourceNotFoundException') {
            throw new Error(`GSI ${config.indexName} not found. Please ensure the required GSI is created.`);
        }
        if (error.name === 'ValidationException') {
            throw new Error(`Invalid query parameters: ${error.message}`);
        }
        throw error;
    }
}

/**
 * Validate season exists by checking if there are any artworks for this season
 * This is more practical than checking SEASON entity which may not exist in tests
 */
export async function validateSeason(season: string): Promise<boolean> {
    try {
        // Check if any artworks exist for this season using GSI1
        const result = await dynamodb.send(new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: 'GSI1',
            KeyConditionExpression: 'GSI1PK = :seasonPK',
            ExpressionAttributeValues: {
                ':seasonPK': `SEASON#${season}`
            },
            Limit: 1
        }));

        return (result.Items?.length || 0) > 0;
    } catch (error) {
        console.error('Error validating season:', error);
        return false;
    }
}

/**
 * Get available seasons for gallery browsing
 */
export async function getAvailableSeasons(): Promise<string[]> {
    try {
        const result = await dynamodb.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': 'SEASON'
            },
            ProjectionExpression: 'season'
        }));

        return (result.Items || []).map(item => item.season).filter(Boolean);
    } catch (error) {
        console.error('Error getting available seasons:', error);
        return [];
    }
}