import { GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { cognitoClient, dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, ApiGatewayResponse, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';

/**
 * Set Guardian Submission Limit Handler
 *
 * Allows contributors and admins to update the max_constituents_per_season for guardian users.
 * This gives guardians more (or fewer) credits to submit artworks.
 *
 * Authorization: contributor+ (contributor and admin)
 * Request Body:
 *   - user_id: string (required) - target guardian ID
 *   - max_constituents_per_season: number (required) - new limit (integer >= 0)
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
        let contributorId: string;

        try {
            const result = await cognitoClient.send(new GetUserCommand({
                AccessToken: accessToken
            }));

            const attributes = result.UserAttributes || [];
            userRole = attributes.find(attr => attr.Name === 'custom:role')?.Value || 'user';
            contributorId = result.Username || '';
        } catch (error: any) {
            console.error('Cognito GetUser error:', error);
            return {
                statusCode: HTTP_STATUS.UNAUTHORIZED,
                body: JSON.stringify({ message: 'Invalid or expired token' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 3) Verify role >= contributor
        const roleHierarchy = ['user', 'guardian', 'contributor', 'admin'];
        const userRoleLevel = roleHierarchy.indexOf(userRole);
        const requiredRoleLevel = roleHierarchy.indexOf('contributor');

        if (userRoleLevel < requiredRoleLevel) {
            return CommonErrors.forbidden('Only contributors and above can set guardian submission limits');
        }

        // 4) Parse request body
        if (!event.body) {
            return CommonErrors.badRequest('Request body is required');
        }

        let requestData: { user_id: string; max_constituents_per_season: number };
        try {
            requestData = JSON.parse(event.body);
        } catch (error) {
            return CommonErrors.badRequest('Invalid JSON in request body');
        }

        const { user_id, max_constituents_per_season } = requestData;

        // 5) Validate user_id
        if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
            return CommonErrors.badRequest('user_id is required and must be a non-empty string');
        }

        // 6) Validate max_constituents_per_season
        if (max_constituents_per_season === undefined || max_constituents_per_season === null) {
            return CommonErrors.badRequest('max_constituents_per_season is required');
        }

        if (!Number.isInteger(max_constituents_per_season) || max_constituents_per_season < 0) {
            return CommonErrors.badRequest('max_constituents_per_season must be a non-negative integer');
        }

        // 7) Get current user data
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
        const currentLimit = currentUser.max_constituents_per_season || 0;

        // 8) Check if user is a guardian
        if (currentRole !== 'guardian') {
            return CommonErrors.badRequest('User must be a guardian');
        }

        // 9) Check if value is already the same
        if (currentLimit === max_constituents_per_season) {
            return CommonErrors.badRequest('Submission limit is already set to this value');
        }

        // 10) Perform TransactWriteCommand: update limit + create ADMIN_ACTION
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
                            UpdateExpression: 'SET max_constituents_per_season = :new_limit',
                            ExpressionAttributeValues: {
                                ':new_limit': max_constituents_per_season
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
                                done_by: contributorId,
                                action: 'set_guardian_submission_limit',
                                old_value: currentLimit,
                                new_value: max_constituents_per_season,
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

        // 11) Return success response
        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify({
                success: true,
                message: 'Guardian submission limit updated successfully',
                user_id: user_id,
                old_value: currentLimit,
                new_value: max_constituents_per_season
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            }
        };

    } catch (error: any) {
        console.error('Error setting guardian submission limit:', error);
        return CommonErrors.internalServerError('Failed to set guardian submission limit');
    }
};
