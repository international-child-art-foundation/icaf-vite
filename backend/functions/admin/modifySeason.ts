import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { InvokeCommand } from '@aws-sdk/client-lambda';
import { dynamodb, TABLE_NAME, lambdaClient } from '../../config/aws-clients';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';
import { ModifySeasonRequest, ModifySeasonResponse, validateModifySeasonRequest } from '../../../shared/src/api-types/seasonTypes';

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

        // 3) Parse and validate request body
        if (!event.body) {
            return CommonErrors.badRequest('Request body is required');
        }

        let modifySeasonData: Omit<ModifySeasonRequest, 'season_id'>;
        try {
            modifySeasonData = JSON.parse(event.body);
        } catch (error: any) {
            console.error('JSON parsing error:', error);
            return CommonErrors.badRequest('Invalid JSON in request body');
        }

        // Create full ModifySeasonRequest with season_id from path
        const fullModifySeasonData: ModifySeasonRequest = {
            season_id: seasonId,
            ...modifySeasonData
        };

        // Validate required fields
        const validationErrors = validateModifySeasonRequest(fullModifySeasonData);
        if (validationErrors.length > 0) {
            return CommonErrors.badRequest('Validation failed', validationErrors);
        }

        // 4) Check if season exists
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

        // 5) Invoke SeasonManager Lambda for season modification
        const seasonManagerPayload = {
            action: 'modifySeason',
            seasonData: {
                season_id: seasonId,
                start_date: fullModifySeasonData.start_date,
                end_date: fullModifySeasonData.end_date,
                startSilently: fullModifySeasonData.startSilently,
                endSilently: fullModifySeasonData.endSilently
            }
        };

        try {
            const invokeResult = await lambdaClient.send(new InvokeCommand({
                FunctionName: process.env.SEASON_MANAGER_FUNCTION_NAME || 'SeasonManager',
                Payload: JSON.stringify(seasonManagerPayload),
                InvocationType: 'RequestResponse'
            }));

            if (invokeResult.StatusCode !== 200) {
                console.error('SeasonManager Lambda invocation failed:', invokeResult);
                return CommonErrors.internalServerError('Failed to modify season');
            }

            const responsePayload = JSON.parse(
                new TextDecoder().decode(invokeResult.Payload)
            );

            if (responsePayload.errorMessage) {
                console.error('SeasonManager Lambda error:', responsePayload.errorMessage);
                return CommonErrors.internalServerError('Failed to modify season: ' + responsePayload.errorMessage);
            }

            // 6) Return success response
            const updatedFields: string[] = [];
            if (fullModifySeasonData.start_date !== undefined) updatedFields.push('start_date');
            if (fullModifySeasonData.end_date !== undefined) updatedFields.push('end_date');
            if (fullModifySeasonData.startSilently !== undefined) updatedFields.push('startSilently');
            if (fullModifySeasonData.endSilently !== undefined) updatedFields.push('endSilently');

            const response: ModifySeasonResponse = {
                message: 'Season modified successfully',
                season_id: seasonId,
                updated_fields: updatedFields
            };

            return {
                statusCode: HTTP_STATUS.OK,
                body: JSON.stringify(response),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'PATCH,OPTIONS'
                }
            };

        } catch (lambdaError: any) {
            console.error('Error invoking SeasonManager Lambda:', lambdaError);
            return CommonErrors.internalServerError('Failed to modify season');
        }

    } catch (error: any) {
        console.error('Error in modifySeason handler:', error);
        return CommonErrors.internalServerError();
    }
};
