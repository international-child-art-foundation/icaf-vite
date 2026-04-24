/**
 * Gallery Seasons Handler
 * 
 * Handles gallery artwork queries from specific seasons with different sorting options:
 * - /api/gallery/seasons/{season}/artworks?sort=newest
 * - /api/gallery/seasons/{season}/artworks?sort=oldest
 * - /api/gallery/seasons/{season}/artworks?sort=highest_votes
 * - /api/gallery/seasons/{season}/artworks?sort=lowest_votes
 */

import {
    GallerySeasonsSortType,
    GallerySeasonsQueryParams,
    GallerySeasonsResponse,
    isValidGallerySeasonsSortType
} from '../../../../shared/src/api-types/gallerySeasonsTypes';
import { executeGallerySeasonsQuery, validateSeasonForGallery } from './gallerySeasonsShared';
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

        // 2. Extract and validate season from path
        const season = event.pathParameters?.season;
        if (!season?.trim()) {
            return CommonErrors.badRequest('Season parameter is required in path');
        }

        // 3. Parse and validate query parameters
        const queryParams = event.queryStringParameters || {};

        // Validate required sort parameter
        if (!queryParams.sort?.trim()) {
            return CommonErrors.badRequest('Sort parameter is required. Must be one of: newest, oldest, highest_votes, lowest_votes');
        }

        if (!isValidGallerySeasonsSortType(queryParams.sort)) {
            return CommonErrors.badRequest('Invalid sort parameter. Must be one of: newest, oldest, highest_votes, lowest_votes');
        }

        // Validate limit parameter if provided
        if (queryParams.limit !== undefined) {
            if (!/^\d+$/.test(queryParams.limit)) {
                return CommonErrors.badRequest('Limit must be a number between 1 and 100');
            }

            const limit = parseInt(queryParams.limit);
            if (limit < 1 || limit > 100) {
                return CommonErrors.badRequest('Limit must be a number between 1 and 100');
            }
        }

        // 4. Validate season exists and is accessible
        const seasonValidation = await validateSeasonForGallery(season);
        if (!seasonValidation) {
            return CommonErrors.notFound('Season not found or no artworks available');
        }

        // 5. Execute the gallery query
        const queryParamsTyped: GallerySeasonsQueryParams = {
            sort: queryParams.sort as GallerySeasonsSortType,
            limit: queryParams.limit ? parseInt(queryParams.limit) : 20
        };

        const result = await executeGallerySeasonsQuery(queryParams.sort as GallerySeasonsSortType, queryParamsTyped, season);

        // 6. Return response
        const response: GallerySeasonsResponse = {
            artworks: result.artworks,
            pagination: {
                has_more: result.pagination.has_more,
                last_evaluated_key: result.pagination.last_evaluated_key
            }
        };

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify(response),
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error: any) {
        console.error('Error in gallery seasons handler:', error);
        return CommonErrors.internalServerError('Internal server error while fetching gallery seasons');
    }
};

