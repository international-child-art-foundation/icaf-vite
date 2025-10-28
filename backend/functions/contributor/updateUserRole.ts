import { GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { cognitoClient, dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, ApiGatewayResponse, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';

/**
 * Update User Role Handler
 *
 * Allows admins to change user roles between 'user' and 'guardian'.
 * Also updates max_constituents_per_season accordingly.
 *
 * Authorization: admin only
 * Request Body:
 *   - user_id: string (required) - target user ID
 *   - new_role: 'user' | 'guardian' (required)
 *   - max_constituents_per_season: number (optional, defaults: guardian=50, user=0)
 */

// Helper function to parse cookies from Cookie header
function parseCookies(cookieHeader: string | undefined): Record<string, string> {
    if (!cookieHeader) {
        return {};
    }

    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
        const [name, ...rest] = cookie.split('=');
        if (name && rest.length > 0) {
            cookies[name.trim()] = rest.join('=').trim();
        }
    });
    return cookies;
}

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
    try {
        // 1) Extract accessToken from Cookie header
        const cookieHeader = event.headers?.['Cookie'] || event.headers?.['cookie'];
        const cookies = parseCookies(cookieHeader);
        const accessToken = cookies['accessToken'];

        if (!accessToken) {
            return {
                statusCode: HTTP_STATUS.UNAUTHORIZED,
                body: JSON.stringify({ message: 'Authentication required' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 2) Get user info from Cognito
        let userRole: string;
        let adminId: string;

        try {
            const result = await cognitoClient.send(new GetUserCommand({
                AccessToken: accessToken
            }));

            const attributes = result.UserAttributes || [];
            userRole = attributes.find(attr => attr.Name === 'custom:role')?.Value || 'user';
            adminId = result.Username || '';
        } catch (error: any) {
            console.error('Cognito GetUser error:', error);
            return {
                statusCode: HTTP_STATUS.UNAUTHORIZED,
                body: JSON.stringify({ message: 'Invalid or expired token' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 3) Verify role is admin or contributor
        if (userRole !== 'admin' && userRole !== 'contributor'){
            return CommonErrors.forbidden('Only admins can update user roles');
        }

        // 4) Parse request body
        if (!event.body) {
            return CommonErrors.badRequest('Request body is required');
        }

        let requestData: { user_id: string; new_role: string; max_constituents_per_season?: number };
        try {
            requestData = JSON.parse(event.body);
        } catch (error) {
            return CommonErrors.badRequest('Invalid JSON in request body');
        }

        const { user_id, new_role, max_constituents_per_season } = requestData;

        // 5) Validate user_id
        if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
            return CommonErrors.badRequest('user_id is required and must be a non-empty string');
        }

        // 6) Validate new_role
        if (!new_role || (new_role !== 'user' && new_role !== 'guardian')) {
            return CommonErrors.badRequest('new_role must be either "user" or "guardian"');
        }

        // 7) Determine max_constituents value
        const maxConstituents = max_constituents_per_season ?? (new_role === 'guardian' ? 50 : 0);

        // 8) Get current user data
        let currentUser: any;
        try {
            const getResult = await dynamodb.send(new GetCommand({
                TableName: TABLE_NAME,
                Key: {
                    PK: `USER#${user_id}`,
                    SK: 'PROFILE'
                }
            }));

            if (!getResult.Item) {
                return CommonErrors.notFound('User not found');
            }

            currentUser = getResult.Item;
        } catch (getError: any) {
            console.error('DynamoDB get error:', getError);
            throw getError;
        }

        const currentRole = currentUser.role || 'user';

        // 9) Check if user is already the target role
        if (currentRole === new_role) {
            return CommonErrors.badRequest(`User is already a ${new_role}`);
        }

        // 10) Prevent changing admin/contributor roles
        if (currentRole === 'admin' || currentRole === 'contributor') {
            return CommonErrors.badRequest('Cannot change role for admin/contributor users');
        }

        // 11) Verify current role is user or guardian
        if (currentRole !== 'user' && currentRole !== 'guardian') {
            return CommonErrors.badRequest(`Cannot change role from ${currentRole}`);
        }

        // 12) Perform TransactWriteCommand: update role + create ADMIN_ACTION
        const timestamp = Date.now();

        try {
            await dynamodb.send(new TransactWriteCommand({
                TransactItems: [
                    // Update USER entity
                    {
                        Update: {
                            TableName: TABLE_NAME,
                            Key: {
                                PK: `USER#${user_id}`,
                                SK: 'PROFILE'
                            },
                            UpdateExpression: 'SET #role = :new_role, max_constituents_per_season = :max',
                            ExpressionAttributeNames: {
                                '#role': 'role'
                            },
                            ExpressionAttributeValues: {
                                ':new_role': new_role,
                                ':max': maxConstituents
                            },
                            ConditionExpression: 'attribute_exists(PK)'
                        }
                    },
                    // Create ADMIN_ACTION entity
                    {
                        Put: {
                            TableName: TABLE_NAME,
                            Item: {
                                PK: `USER#${user_id}`,
                                SK: `ADMIN_ACTION#${timestamp}`,
                                target_user_id: user_id,
                                done_by: adminId,
                                action: 'update_user_role',
                                old_role: currentRole,
                                new_role: new_role,
                                max_constituents_per_season: maxConstituents,
                                timestamp: timestamp,
                                type: 'ADMIN_ACTION'
                            }
                        }
                    }
                ]
            }));
        } catch (transactError: any) {
            console.error('DynamoDB transaction error:', transactError);
            if (transactError.name === 'TransactionCanceledException') {
                return CommonErrors.notFound('User not found or has been modified');
            }
            throw transactError;
        }

        // 13) Return success response
        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify({
                success: true,
                message: 'User role updated successfully',
                user_id: user_id,
                old_role: currentRole,
                new_role: new_role,
                max_constituents_per_season: maxConstituents
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            }
        };

    } catch (error: any) {
        console.error('Error updating user role:', error);
        return CommonErrors.internalServerError('Failed to update user role');
    }
};
