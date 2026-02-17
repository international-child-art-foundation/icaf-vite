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
import { ApiGatewayEvent, HTTP_STATUS } from '../../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../../shared/src/api-types/errorTypes';

export const handler = async (event: ApiGatewayEvent): Promise<{
    statusCode: number;
    body: string;
    headers: Record<string, string>;
}> => {
    try {
        // 1. Validate HTTP method
        if (event.httpMethod !== 'GET') {
            return CommonErrors.methodNotAllowed();
        }

        // 2. Extract and validate sort type from path
        const sortType = event.pathParameters?.sortType;
        if (!sortType || !isValidSortType(sortType)) {
            return {
                statusCode: HTTP_STATUS.BAD_REQUEST,
                body: JSON.stringify({
                    message: 'Invalid sort type. Must be one of: newest, oldest, highest-voted, lowest-voted',
                    sortType: sortType || 'undefined'
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 3. Parse and validate query parameters
        const queryParams = event.queryStringParameters || {};

        // Validate required season parameter
        if (!queryParams.season?.trim()) {
            return {
                statusCode: HTTP_STATUS.BAD_REQUEST,
                body: JSON.stringify({
                    message: 'Season parameter is required',
                    sortType
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Validate limit parameter if provided
        if (queryParams.limit !== undefined) {
            // Check if it's a valid integer string first
            if (!/^\d+$/.test(queryParams.limit)) {
                return {
                    statusCode: HTTP_STATUS.BAD_REQUEST,
                    body: JSON.stringify({
                        message: 'Limit must be a number between 1 and 100',
                        sortType
                    }),
                    headers: { 'Content-Type': 'application/json' }
                };
            }

            const limit = parseInt(queryParams.limit);
            if (limit < 1 || limit > 100) {
                return {
                    statusCode: HTTP_STATUS.BAD_REQUEST,
                    body: JSON.stringify({
                        message: 'Limit must be a number between 1 and 100',
                        sortType
                    }),
                    headers: { 'Content-Type': 'application/json' }
                };
            }
        }

        // 4. Validate season exists and is accessible
        const seasonValidation = await validateSeason(queryParams.season);
        if (!seasonValidation) {
            return {
                statusCode: HTTP_STATUS.NOT_FOUND,
                body: JSON.stringify({
                    message: 'Season not found or no artworks available',
                    season: queryParams.season,
                    sortType
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 5. Execute the gallery query
        const galleryParams: GalleryQueryParams = {
            season: queryParams.season,
            limit: queryParams.limit ? parseInt(queryParams.limit) : 20,
            lastEvaluatedKey: queryParams.lastEvaluatedKey
        };

        const result = await executeGalleryQuery(sortType as SortType, galleryParams);

        // 6. Return response
        const response: GalleryResponse = {
            sortType: sortType as SortType,
            season: queryParams.season,
            artworks: result.artworks,
            count: result.artworks.length,
            hasMore: result.hasMore,
            pagination: {
                has_more: result.hasMore,
                last_evaluated_key: result.pagination.last_evaluated_key
            }
        };

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify(response),
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error: any) {
        console.error('Error in gallery artworks handler:', error);
        return CommonErrors.internalServerError('Internal server error while fetching gallery artworks');
    }
};

