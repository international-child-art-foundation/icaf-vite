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

// Error response for gallery seasons APIs
interface GallerySeasonsErrorResponse {
    message: string;
    error?: string;
    sort?: GallerySeasonsSortType;
    season?: string;
}

type APIGatewayEvent = {
    pathParameters?: { season?: string };
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
                } as GallerySeasonsErrorResponse),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 2. Extract and validate season from path
        const season = event.pathParameters?.season;
        if (!season?.trim()) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Season parameter is required in path'
                } as GallerySeasonsErrorResponse),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 3. Parse and validate query parameters
        const queryParams = event.queryStringParameters || {};

        // Validate required sort parameter
        if (!queryParams.sort?.trim()) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Sort parameter is required. Must be one of: newest, oldest, highest_votes, lowest_votes',
                    season
                } as GallerySeasonsErrorResponse),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        if (!isValidGallerySeasonsSortType(queryParams.sort)) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid sort parameter. Must be one of: newest, oldest, highest_votes, lowest_votes',
                    sort: queryParams.sort,
                    season
                } as GallerySeasonsErrorResponse),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Validate limit parameter if provided
        if (queryParams.limit !== undefined) {
            if (!/^\d+$/.test(queryParams.limit)) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: 'Limit must be a number between 1 and 100',
                        sort: queryParams.sort,
                        season
                    } as GallerySeasonsErrorResponse),
                    headers: { 'Content-Type': 'application/json' }
                };
            }

            const limit = parseInt(queryParams.limit);
            if (limit < 1 || limit > 100) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: 'Limit must be a number between 1 and 100',
                        sort: queryParams.sort,
                        season
                    } as GallerySeasonsErrorResponse),
                    headers: { 'Content-Type': 'application/json' }
                };
            }
        }

        // 4. Build gallery seasons query parameters
        const galleryParams: GallerySeasonsQueryParams = {
            sort: queryParams.sort as GallerySeasonsSortType,
            limit: queryParams.limit ? parseInt(queryParams.limit) : 20,
            last_evaluated_key: queryParams.last_evaluated_key
        };

        // 5. Validate season exists and has artworks
        const isValidSeason = await validateSeasonForGallery(season);
        if (!isValidSeason) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Season not found or no artworks available',
                    season,
                    sort: queryParams.sort
                } as GallerySeasonsErrorResponse),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 6. Execute gallery seasons query
        const response: GallerySeasonsResponse = await executeGallerySeasonsQuery(
            galleryParams.sort,
            galleryParams,
            season
        );

        // 7. Return successful response
        return {
            statusCode: 200,
            body: JSON.stringify(response),
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error: any) {
        console.error(`Error in gallery seasons query for season ${event.pathParameters?.season}:`, error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error while fetching gallery season artworks',
                error: error.message,
                season: event.pathParameters?.season,
                sort: event.queryStringParameters?.sort
            } as GallerySeasonsErrorResponse),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};
