/**
 * Gallery Artworks Handler
 * 
 * Handles all gallery artwork queries with different sorting options:
 * - /api/gallery/artworks/newest
 * - /api/gallery/artworks/oldest  
 * - /api/gallery/artworks/highest-voted
 * - /api/gallery/artworks/lowest-voted
 */

import {
    SortType,
    GalleryQueryParams,
    GalleryResponse,
    isValidSortType
} from '../../../../shared/src/api-types/galleryTypes';
import { executeGalleryQuery, validateSeason } from './galleryShared';

// Error response for gallery APIs
interface GalleryErrorResponse {
    message: string;
    error?: string;
    sortType?: SortType;
    season?: string;
}

type APIGatewayEvent = {
    pathParameters?: { sortType?: string };
    queryStringParameters?: Record<string, string> | null;
    httpMethod: string;
};

export const handler = async (event: APIGatewayEvent): Promise<{
    statusCode: number;
    body: string;
    headers: Record<string, string>;
}> => {
    try {
        // 1. Validate HTTP method
        if (event.httpMethod !== 'GET') {
            return {
                statusCode: 405,
                body: JSON.stringify({
                    message: 'Method not allowed. Use GET.'
                } as GalleryErrorResponse),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 2. Extract and validate sort type from path
        const sortType = event.pathParameters?.sortType;
        if (!sortType || !isValidSortType(sortType)) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid sort type. Must be one of: newest, oldest, highest-voted, lowest-voted',
                    sortType: sortType || 'undefined'
                } as GalleryErrorResponse),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 3. Parse and validate query parameters
        const queryParams = event.queryStringParameters || {};

        // Validate required season parameter
        if (!queryParams.season?.trim()) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Season parameter is required',
                    sortType
                } as GalleryErrorResponse),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Validate limit parameter if provided
        if (queryParams.limit !== undefined) {
            // Check if it's a valid integer string first
            if (!/^\d+$/.test(queryParams.limit)) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: 'Limit must be a number between 1 and 100',
                        sortType
                    } as GalleryErrorResponse),
                    headers: { 'Content-Type': 'application/json' }
                };
            }

            const limit = parseInt(queryParams.limit);
            if (limit < 1 || limit > 100) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: 'Limit must be a number between 1 and 100',
                        sortType
                    } as GalleryErrorResponse),
                    headers: { 'Content-Type': 'application/json' }
                };
            }
        }

        // 4. Build gallery query parameters
        const galleryParams: GalleryQueryParams = {
            season: queryParams.season!,
            limit: queryParams.limit ? parseInt(queryParams.limit) : 20,
            lastEvaluatedKey: queryParams.lastEvaluatedKey,
            approved_only: queryParams.approved_only !== 'false' // Default to true
        };

        // 5. Validate season exists by checking if artworks exist for this season
        const isValidSeason = await validateSeason(galleryParams.season);
        if (!isValidSeason) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Season not found or no artworks available',
                    season: galleryParams.season,
                    sortType
                } as GalleryErrorResponse),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 6. Execute gallery query
        const response: GalleryResponse = await executeGalleryQuery(sortType, galleryParams);

        // 7. Return successful response
        return {
            statusCode: 200,
            body: JSON.stringify(response),
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error: any) {
        console.error(`Error in gallery ${event.pathParameters?.sortType} query:`, error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error while fetching gallery artworks',
                error: error.message,
                sortType: event.pathParameters?.sortType
            } as GalleryErrorResponse),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};
