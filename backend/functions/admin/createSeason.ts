import { QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { InvokeCommand } from '@aws-sdk/client-lambda';
import { dynamodb, TABLE_NAME, lambdaClient } from '../../config/aws-clients';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';
import { CreateSeasonRequest, CreateSeasonResponse, validateCreateSeasonRequest } from '../../../shared/src/api-types/seasonTypes';

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

        // 2) Parse and validate request body
        if (!event.body) {
            return CommonErrors.badRequest('Request body is required');
        }

        let createSeasonData: CreateSeasonRequest;
        try {
            createSeasonData = JSON.parse(event.body);
        } catch (error: any) {
            console.error('JSON parsing error:', error);
            return CommonErrors.badRequest('Invalid JSON in request body');
        }

        // Validate required fields
        const validationErrors = validateCreateSeasonRequest(createSeasonData);
        if (validationErrors.length > 0) {
            return CommonErrors.badRequest('Validation failed', validationErrors);
        }

        // 3) Check if season name already exists
        const existingSeasonResult = await dynamodb.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': 'SEASON',
                ':sk': `#ACTIVE#true#SEASON#${createSeasonData.season}`
            }
        }));

        if (existingSeasonResult.Items && existingSeasonResult.Items.length > 0) {
            return CommonErrors.conflict(`Season '${createSeasonData.season}' already exists`);
        }

        // 4) Invoke SeasonManager Lambda for season creation
        const seasonManagerPayload = {
            action: 'createSeason',
            seasonData: {
                season: createSeasonData.season,
                colloq_name: createSeasonData.colloq_name,
                start_date: createSeasonData.start_date,
                end_date: createSeasonData.end_date,
                payment_required: createSeasonData.payment_required,
                max_user_submissions: createSeasonData.max_user_submissions,
                can_vote: createSeasonData.can_vote,
                startSilently: createSeasonData.startSilently || false,
                endSilently: createSeasonData.endSilently || false
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
                return CommonErrors.internalServerError('Failed to create season');
            }

            const responsePayload = JSON.parse(
                new TextDecoder().decode(invokeResult.Payload)
            );

            if (responsePayload.errorMessage) {
                console.error('SeasonManager Lambda error:', responsePayload.errorMessage);
                return CommonErrors.internalServerError('Failed to create season: ' + responsePayload.errorMessage);
            }

            // 5) Return success response
            const response: CreateSeasonResponse = {
                message: 'Season created successfully',
                season: {
                    season: createSeasonData.season,
                    colloq_name: createSeasonData.colloq_name,
                    start_date: createSeasonData.start_date,
                    end_date: createSeasonData.end_date,
                    payment_required: createSeasonData.payment_required,
                    max_user_submissions: createSeasonData.max_user_submissions,
                    can_vote: createSeasonData.can_vote,
                    is_active: true
                }
            };

            return {
                statusCode: HTTP_STATUS.CREATED,
                body: JSON.stringify(response),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS'
                }
            };

        } catch (lambdaError: any) {
            console.error('Error invoking SeasonManager Lambda:', lambdaError);
            return CommonErrors.internalServerError('Failed to create season');
        }

    } catch (error: any) {
        console.error('Error in createSeason handler:', error);
        return CommonErrors.internalServerError();
    }
};
