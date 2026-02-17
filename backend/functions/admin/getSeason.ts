import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';
import { formatSeasonForApi } from '../../../shared/src/api-types/seasonTypes';

export const handler = async (event: ApiGatewayEvent) => {
    try {
        // 1) Admin Authentication Check
        const userId = event.requestContext?.authorizer?.claims?.sub;
        if (!userId) {
            return CommonErrors.unauthorized();
        }

        // Check if user has admin role
        const userResult = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${userId}`,
                SK: 'PROFILE'
            }
        }));

        const user = userResult.Item;
        if (!user || user.role !== 'admin') {
            return CommonErrors.forbidden('Admin access required');
        }

        // 2) Get season_id from path parameters
        const seasonId = event.pathParameters?.id;
        if (!seasonId) {
            return CommonErrors.badRequest('Season ID is required in path');
        }

        // 3) Get season data from DynamoDB
        const seasonResult = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: 'SEASON',
                SK: `#ACTIVE#true#SEASON#${seasonId}`
            }
        }));

        if (!seasonResult.Item) {
            return CommonErrors.notFound(`Season '${seasonId}' not found`);
        }

        // 4) Format and return season data
        const season = formatSeasonForApi(seasonResult.Item);

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify(season),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            }
        };

    } catch (error: any) {
        console.error('Error in getSeason handler:', error);
        return CommonErrors.internalServerError();
    }
};
