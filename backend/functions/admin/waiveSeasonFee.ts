import { GetCommand, QueryCommand, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';
import {
    WaiveSeasonFeeRequest,
    WaiveSeasonFeeResponse,
    validateWaiveSeasonFeeRequest
} from '../../../shared/src/api-types/seasonTypes';

export const handler = async (event: ApiGatewayEvent) => {
    try {
        // 1) Admin Authentication Check
        const adminUserId = event.requestContext?.authorizer?.claims?.sub;
        if (!adminUserId) {
            return CommonErrors.unauthorized();
        }

        // Check if user has admin role
        const adminResult = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${adminUserId}`,
                SK: 'PROFILE'
            }
        }));

        const adminUser = adminResult.Item;
        if (!adminUser || adminUser.role !== 'admin') {
            return CommonErrors.forbidden('Admin access required');
        }

        // 2) Get season name from path parameters
        const seasonName = event.pathParameters?.season;
        if (!seasonName) {
            return CommonErrors.badRequest('Season name is required in path');
        }

        // 3) Parse and validate request body
        if (!event.body) {
            return CommonErrors.badRequest('Request body is required');
        }

        let requestData: WaiveSeasonFeeRequest;
        try {
            requestData = JSON.parse(event.body);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return CommonErrors.badRequest('Invalid JSON in request body');
        }

        // Validate request data
        const validationErrors = validateWaiveSeasonFeeRequest(requestData);
        if (validationErrors.length > 0) {
            return CommonErrors.badRequest(`Validation failed: ${validationErrors.join(', ')}`);
        }

        // 4) Query season record (we don't know if it's active or not)
        const queryResult = await dynamodb.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND contains(SK, :season)',
            ExpressionAttributeValues: {
                ':pk': 'SEASON',
                ':season': `SEASON#${seasonName}`
            }
        }));

        const seasons = queryResult.Items || [];
        if (seasons.length === 0) {
            return CommonErrors.notFound(`Season '${seasonName}' not found`);
        }

        // Should only find one season with this name
        const season = seasons[0];
        const currentPK = season.PK;
        const currentSK = season.SK;
        const isActive = season.is_active || false;
        const colloqName = season.colloq_name || seasonName;

        // 5) Check if payment is already not required
        if (season.payment_required === false) {
            return CommonErrors.badRequest('Payment is already not required for this season');
        }

        // 6) Update season to waive payment requirement
        const timestamp = new Date().toISOString();

        await dynamodb.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: currentPK,
                SK: currentSK
            },
            UpdateExpression: 'SET payment_required = :payment_required, updated_at = :updated_at',
            ExpressionAttributeValues: {
                ':payment_required': false,
                ':updated_at': timestamp
            },
            ConditionExpression: 'attribute_exists(PK)'
        }));

        // 7) Create admin action record
        const adminActionId = `${timestamp}_${adminUserId}`;

        await dynamodb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                PK: 'SEASON',
                SK: `ADMIN_ACTION#${timestamp}#${seasonName}`,
                admin_action_id: adminActionId,
                action_type: 'waive_season_fee',
                admin_user_id: adminUserId,
                season: seasonName,
                reason: requestData.reason.trim(),
                timestamp: timestamp,
                created_at: timestamp,
                type: 'ADMIN_ACTION'
            }
        }));

        // 8) Return success response
        const response: WaiveSeasonFeeResponse = {
            message: 'Season payment requirement waived successfully',
            season: seasonName,
            season_name: colloqName,
            payment_required: false,
            is_active: isActive,
            admin_action_id: adminActionId,
            timestamp: timestamp
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

    } catch (error: any) {
        console.error('Error in waiveSeasonFee handler:', error);

        // Handle DynamoDB conditional check failed
        if (error.name === 'ConditionalCheckFailedException') {
            return CommonErrors.notFound('Season not found or already modified');
        }

        return CommonErrors.internalServerError('Failed to waive season fee');
    }
};
