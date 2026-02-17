import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';
import {
    AlterUserRoleResponse,
    AlterUserRoleBodyRequest,
    validateAlterUserRoleBodyRequest,
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

        let requestData: AlterUserRoleBodyRequest;
        try {
            requestData = JSON.parse(event.body);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return CommonErrors.badRequest('Invalid JSON in request body');
        }

        // Validate request data
        const validationErrors = validateAlterUserRoleBodyRequest(requestData);
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

        // 5) Check if role change is valid
        const oldRole = targetUser.role as Role;
        const newRole = requestData.new_role;

        // Prevent admin from changing their own role
        if (adminUserId === targetUserId) {
            return CommonErrors.badRequest('Cannot change your own role');
        }

        // Prevent changing to/from admin role (only super admin can do this)
        // This check only applies to other users, not the admin themselves (already handled above)
        if (oldRole === 'admin' || newRole === 'admin') {
            return CommonErrors.forbidden('Cannot modify admin roles');
        }

        // 6) Calculate new max_constituents_per_season based on new role
        const newUserType = determineUserType(newRole);
        const newMaxConstituents = getMaxConstituentsPerSeason(newUserType);

        // 7) Update user role in DynamoDB
        const updatedFields: string[] = [];
        const updateExpressionParts: string[] = [];
        const expressionAttributeNames: Record<string, string> = {};
        const expressionAttributeValues: Record<string, any> = {};

        // Update role
        if (oldRole !== newRole) {
            updateExpressionParts.push('#role = :new_role');
            expressionAttributeNames['#role'] = 'role';
            expressionAttributeValues[':new_role'] = newRole;
            updatedFields.push('role');
        }

        // Update max_constituents_per_season
        const currentMaxConstituents = targetUser.max_constituents_per_season || 0;
        if (currentMaxConstituents !== newMaxConstituents) {
            updateExpressionParts.push('#max_constituents = :new_max_constituents');
            expressionAttributeNames['#max_constituents'] = 'max_constituents_per_season';
            expressionAttributeValues[':new_max_constituents'] = newMaxConstituents;
            updatedFields.push('max_constituents_per_season');
        }

        if (updateExpressionParts.length === 0) {
            return CommonErrors.badRequest('No changes to apply');
        }

        // Update timestamp only if there are actual changes
        updateExpressionParts.push('#updated_at = :updated_at');
        expressionAttributeNames['#updated_at'] = 'updated_at';
        expressionAttributeValues[':updated_at'] = new Date().toISOString();
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

        // 8) Return success response
        const response: AlterUserRoleResponse = {
            message: 'User role updated successfully',
            user_id: targetUserId,
            old_role: oldRole,
            new_role: newRole,
            max_constituents_per_season: newMaxConstituents,
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
        console.error('Error in alterUserRole handler:', error);

        // Handle DynamoDB conditional check failed
        if (error.name === 'ConditionalCheckFailedException') {
            return CommonErrors.notFound('User not found or already modified');
        }

        return CommonErrors.internalServerError('Failed to update user role');
    }
};
