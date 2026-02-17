import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from '../../config/aws-clients';
import {
    formatSeasonForApi,
    validateListSeasonParams,
    ListSeasonResponse,
    Season
} from '../../../shared/src/api-types/seasonTypes';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';

/**
 * List Seasons Handler
 * 
 * Queries seasons from the SEASON entity with optional filtering.
 * 
 * Query Parameters:
 * - active=true: Only return currently active seasons (SK begins_with "#ACTIVE#true")
 * - active=false: Only return inactive seasons (SK begins_with "#ACTIVE#false") 
 * - No active param: Return all seasons
 * 
 * This endpoint is accessible to anyone (no authentication required).
 */

export const handler = async (event: ApiGatewayEvent): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
    try {
        // Parse query parameters
        const queryParams = event.queryStringParameters || {};
        const activeFilter = queryParams.active;

        // Validate query parameters
        const validationErrors = validateListSeasonParams(queryParams);
        if (validationErrors.length > 0) {
            return CommonErrors.badRequest('Invalid query parameters', validationErrors);
        }

        let dynamoQueryParams;

        if (activeFilter === 'true') {
            // Query for only active seasons
            dynamoQueryParams = {
                TableName: TABLE_NAME,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                ExpressionAttributeValues: {
                    ':pk': 'SEASON',
                    ':sk': '#ACTIVE#true'
                }
            };
        } else if (activeFilter === 'false') {
            // Query for only inactive seasons
            dynamoQueryParams = {
                TableName: TABLE_NAME,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                ExpressionAttributeValues: {
                    ':pk': 'SEASON',
                    ':sk': '#ACTIVE#false'
                }
            };
        } else {
            // Query for all seasons (both active and inactive)
            dynamoQueryParams = {
                TableName: TABLE_NAME,
                KeyConditionExpression: 'PK = :pk',
                ExpressionAttributeValues: {
                    ':pk': 'SEASON'
                }
            };
        }

        const result = await dynamodb.send(new QueryCommand(dynamoQueryParams));
        const seasons = result.Items || [];

        // Format the response data using the helper function
        const formattedSeasons: Season[] = seasons.map(season => formatSeasonForApi(season));

        // Create typed response based on filter
        let response: ListSeasonResponse;

        if (activeFilter === 'true') {
            response = {
                active_seasons: formattedSeasons,
                count: formattedSeasons.length,
                filter_applied: `active=${activeFilter}`
            };
        } else if (activeFilter === 'false') {
            response = {
                inactive_seasons: formattedSeasons,
                count: formattedSeasons.length,
                filter_applied: `active=${activeFilter}`
            };
        } else {
            response = {
                seasons: formattedSeasons,
                count: formattedSeasons.length,
                filter_applied: 'none'
            };
        }

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify(response),
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error: any) {
        console.error('Error fetching seasons:', error);
        return CommonErrors.internalServerError('Internal server error while fetching seasons');
    }
};
