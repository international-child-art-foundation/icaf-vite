import { GetCommand, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';
import {
    UpdateUserRequest,
    UpdateUserResponse,
    validateUpdateUserRequest,
    getMaxConstituentsPerSeason,
    determineUserType,
    Role
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

        // 3) Parse and validate request body
        if (!event.body) {
            return CommonErrors.badRequest('Request body is required');
        }

        let requestData: UpdateUserRequest;
        try {
            requestData = JSON.parse(event.body);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return CommonErrors.badRequest('Invalid JSON in request body');
        }

        // Validate request data
        const validationErrors = validateUpdateUserRequest(requestData);
        if (validationErrors.length > 0) {
            return CommonErrors.badRequest(`Validation failed: ${validationErrors.join(', ')}`);
        }

        // 4) Check if target user exists
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

        // 5) Check if admin is trying to modify themselves
        if (adminUserId === targetUserId) {
            return CommonErrors.badRequest('Cannot modify your own user account');
        }

        // 6) Get current values
        const oldRole = targetUser.role as Role;
        const oldCanSubmit = targetUser.can_submit !== false; // Default to true if not set
        const oldMaxConstituents = targetUser.max_constituents_per_season || 0;

        // 7) Determine what changes are being made
        let roleChanged = false;
        let banStatusChanged = false;
        let newRole = oldRole;
        let newCanSubmit = oldCanSubmit;
        let newMaxConstituents = oldMaxConstituents;

        // Check role change
        if (requestData.new_role !== undefined && requestData.new_role !== oldRole) {
            // Prevent changing to/from admin role
            if (oldRole === 'admin' || requestData.new_role === 'admin') {
                return CommonErrors.forbidden('Cannot modify admin roles');
            }
            roleChanged = true;
            newRole = requestData.new_role;
            newMaxConstituents = getMaxConstituentsPerSeason(determineUserType(newRole));
        }

        // Check ban status change  
        if (requestData.can_submit !== undefined && requestData.can_submit !== oldCanSubmit) {
            banStatusChanged = true;
            newCanSubmit = requestData.can_submit;
        }

        // Check for no changes
        if (!roleChanged && !banStatusChanged) {
            return CommonErrors.badRequest('No changes to apply');
        }

        // 8) Create admin action records
        const timestamp = new Date().toISOString();
        let adminActionId = null;

        if (roleChanged) {
            const roleActionId = `${timestamp}_role_${adminUserId}`;
            await dynamodb.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    PK: `USER#${targetUserId}`,
                    SK: `ADMIN_ACTION#${timestamp}_role`,
                    admin_action_id: roleActionId,
                    action_type: 'role_change',
                    admin_user_id: adminUserId,
                    reason: `Changed role from ${oldRole} to ${newRole}`,
                    old_value: oldRole,
                    new_value: newRole,
                    timestamp: timestamp,
                    created_at: timestamp
                }
            }));
            adminActionId = roleActionId;
        }

        if (banStatusChanged) {
            const banActionId = `${timestamp}_${newCanSubmit ? 'unban' : 'ban'}_${adminUserId}`;
            await dynamodb.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    PK: `USER#${targetUserId}`,
                    SK: `ADMIN_ACTION#${timestamp}_${newCanSubmit ? 'unban' : 'ban'}`,
                    admin_action_id: banActionId,
                    action_type: newCanSubmit ? 'unban' : 'ban',
                    admin_user_id: adminUserId,
                    reason: newCanSubmit ? null : (requestData.ban_reason?.trim() || null),
                    old_value: oldCanSubmit,
                    new_value: newCanSubmit,
                    timestamp: timestamp,
                    created_at: timestamp
                }
            }));
            adminActionId = banActionId;
        }

        // 9) Update user profile in DynamoDB
        const updatedFields: string[] = [];
        const updateExpressionParts: string[] = [];
        const expressionAttributeNames: Record<string, string> = {};
        const expressionAttributeValues: Record<string, any> = {};

        if (roleChanged) {
            updateExpressionParts.push('#role = :new_role');
            expressionAttributeNames['#role'] = 'role';
            expressionAttributeValues[':new_role'] = newRole;
            updatedFields.push('role');

            if (newMaxConstituents !== oldMaxConstituents) {
                updateExpressionParts.push('#max_constituents = :new_max_constituents');
                expressionAttributeNames['#max_constituents'] = 'max_constituents_per_season';
                expressionAttributeValues[':new_max_constituents'] = newMaxConstituents;
                updatedFields.push('max_constituents_per_season');
            }
        }

        if (banStatusChanged) {
            updateExpressionParts.push('#can_submit = :can_submit');
            expressionAttributeNames['#can_submit'] = 'can_submit';
            expressionAttributeValues[':can_submit'] = newCanSubmit;
            updatedFields.push('can_submit');
        }

        // Always update timestamp
        updateExpressionParts.push('#updated_at = :updated_at');
        expressionAttributeNames['#updated_at'] = 'updated_at';
        expressionAttributeValues[':updated_at'] = timestamp;
        updatedFields.push('updated_at');

        await dynamodb.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${targetUserId}`,
                SK: 'PROFILE'
            },
            UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ConditionExpression: 'attribute_exists(PK)'
        }));

        // 10) Return success response
        const response: UpdateUserResponse = {
            message: 'User updated successfully',
            user_id: targetUserId,
            is_banned: !newCanSubmit,
            can_submit: newCanSubmit,
            role: newRole,
            max_constituents_per_season: newMaxConstituents,
            admin_action_id: adminActionId || undefined,
            timestamp: timestamp,
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

    } catch (error: any) {
        console.error('Error in updateUser handler:', error);

        // Handle DynamoDB conditional check failed
        if (error.name === 'ConditionalCheckFailedException') {
            return CommonErrors.notFound('User not found or already modified');
        }

        return CommonErrors.internalServerError('Failed to update user');
    }
};