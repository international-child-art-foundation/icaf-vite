import { GetCommand, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';
import {
    BanUnbanUserResponse
} from '../../../shared/src/api-types/userTypes';

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

        // 2) Get user ID from path parameters
        const targetUserId = event.pathParameters?.user_id;
        if (!targetUserId) {
            return CommonErrors.badRequest('User ID is required in path');
        }

        // 3) Check if target user exists
        const targetUserResult = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${targetUserId}`,
                SK: 'PROFILE'
            }
        }));

        const targetUser = targetUserResult.Item;
        if (!targetUser) {
            return CommonErrors.notFound(`User '${targetUserId}' not found`);
        }

        // 4) Check if admin is trying to unban themselves
        if (adminUserId === targetUserId) {
            return CommonErrors.badRequest('Cannot unban yourself');
        }

        // 5) Check if target user is already unbanned
        if (targetUser.can_submit === true) {
            return CommonErrors.badRequest('User is not currently banned');
        }

        // 6) Create admin action record
        const timestamp = new Date().toISOString();
        const adminActionId = `${timestamp}_${adminUserId}`;
        
        await dynamodb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                PK: `USER#${targetUserId}`,
                SK: `ADMIN_ACTION#${timestamp}`,
                admin_action_id: adminActionId,
                action_type: 'unban',
                admin_user_id: adminUserId,
                timestamp: timestamp,
                created_at: timestamp
            }
        }));

        // 7) Update user profile to unban them
        await dynamodb.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${targetUserId}`,
                SK: 'PROFILE'
            },
            UpdateExpression: 'SET can_submit = :can_submit, updated_at = :updated_at',
            ExpressionAttributeValues: {
                ':can_submit': true,
                ':updated_at': timestamp
            },
            ConditionExpression: 'attribute_exists(PK)'
        }));

        // 8) Return success response
        const response: BanUnbanUserResponse = {
            message: 'User unbanned successfully',
            user_id: targetUserId,
            is_banned: false,
            can_submit: true,
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
                'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
            }
        };

    } catch (error: any) {
        console.error('Error in unbanUser handler:', error);

        // Handle DynamoDB conditional check failed
        if (error.name === 'ConditionalCheckFailedException') {
            return CommonErrors.notFound('User not found or already modified');
        }

        return CommonErrors.internalServerError('Failed to unban user');
    }
};