/**
 * Gallery Seasons Shared Logic
 * 
 * Contains shared logic for Gallery Seasons API queries
 */

import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from '../../../config/aws-clients';
import { GallerySeasonsSortType, GallerySeasonsQueryParams, GallerySeasonsResponse, GallerySeasonsArtwork } from '../../../../shared/src/api-types/gallerySeasonsTypes';

// GSI configuration for different sort types
interface GSIQueryConfig {
    indexName: string;
    keyConditionExpression: string;
    scanIndexForward: boolean;
}

const QUERY_CONFIGS: Record<GallerySeasonsSortType, GSIQueryConfig> = {
    'newest': {
        indexName: 'GSI1',
        keyConditionExpression: 'GSI1PK = :seasonPK',
        scanIndexForward: false, // Newest first (DESC by timestamp)
    },
    'oldest': {
        indexName: 'GSI1',
        keyConditionExpression: 'GSI1PK = :seasonPK',
        scanIndexForward: true, // Oldest first (ASC by timestamp)
    },
    'highest_votes': {
        indexName: 'GSI2',
        keyConditionExpression: 'GSI2PK = :seasonPK',
        scanIndexForward: false, // Highest votes first (DESC by votes)
    },
    'lowest_votes': {
        indexName: 'GSI2',
        keyConditionExpression: 'GSI2PK = :seasonPK',
        scanIndexForward: true, // Lowest votes first (ASC by votes)
    }
};

/**
 * Execute gallery seasons query based on sort type
 */
export async function executeGallerySeasonsQuery(
    sortType: GallerySeasonsSortType,
    params: GallerySeasonsQueryParams,
    season: string
): Promise<GallerySeasonsResponse> {
    const config = QUERY_CONFIGS[sortType];

    // Build query parameters
    const queryParams: any = {
        TableName: TABLE_NAME,
        IndexName: config.indexName,
        KeyConditionExpression: config.keyConditionExpression,
        ExpressionAttributeValues: {
            ':seasonPK': `SEASON#${season}`
        },
        ScanIndexForward: config.scanIndexForward,
        Limit: params.limit || 20
    };

    // Add pagination if provided
    if (params.last_evaluated_key) {
        try {
            const decodedKey = JSON.parse(decodeURIComponent(params.last_evaluated_key));
            queryParams.ExclusiveStartKey = decodedKey;
        } catch (error) {
            console.warn('Invalid last_evaluated_key, ignoring pagination');
        }
    }

    try {
        const result = await dynamodb.send(new QueryCommand(queryParams));

        // Format artworks for response
        const artworks: GallerySeasonsArtwork[] = (result.Items || []).map(item => ({
            art_id: item.art_id || '',
            title: item.title || '',
            artist_name: item.f_name || 'Unknown Artist',
            votes: item.votes || 0,
            timestamp: item.timestamp || ''
        }));

        // Encode last evaluated key for pagination
        let encodedKey: string | undefined;
        if (result.LastEvaluatedKey) {
            encodedKey = encodeURIComponent(JSON.stringify(result.LastEvaluatedKey));
        }

        return {
            artworks,
            pagination: {
                has_more: !!result.LastEvaluatedKey,
                last_evaluated_key: encodedKey || null
            }
        };
    } catch (error: any) {
        if (error.name === 'ResourceNotFoundException') {
            throw new Error('Gallery index not found');
        }
        if (error.name === 'ValidationException') {
            throw new Error('Invalid query parameters');
        }
        throw error;
    }
}

/**
 * Validate if season exists and has artworks
 */
export async function validateSeasonForGallery(season: string): Promise<boolean> {
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
        console.error('Error validating season for gallery:', error);
        return false;
    }
}
