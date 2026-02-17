import { GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { cognitoClient, dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, ApiGatewayResponse, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';

/**
 * Link Anonymous Donation Handler
 *
 * Allows contributors and admins to link an anonymous donation to a user account.
 * This migrates the DONATION entity from PK=USER#ANON to PK=USER#<user_id>.
 *
 * Authorization: contributor+ (contributor and admin)
 * Request Body:
 *   - donation_id: string (required) - the donation ID (with or without DONATION# prefix)
 *   - user_id: string (required) - target user ID (without USER# prefix)
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
            return CommonErrors.forbidden('Only contributors and above can link anonymous donations');
        }

        // 4) Parse request body
        if (!event.body) {
            return CommonErrors.badRequest('Request body is required');
        }

        let requestData: { donation_id: string; user_id: string };
        try {
            requestData = JSON.parse(event.body);
        } catch (error) {
            return CommonErrors.badRequest('Invalid JSON in request body');
        }

        let { donation_id, user_id } = requestData;

        // 5) Validate donation_id
        if (!donation_id || typeof donation_id !== 'string' || donation_id.trim() === '') {
            return CommonErrors.badRequest('donation_id is required and must be a non-empty string');
        }

        // 6) Validate user_id
        if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
            return CommonErrors.badRequest('user_id is required and must be a non-empty string');
        }

        // 7) Normalize donation_id (ensure it has DONATION# prefix)
        if (!donation_id.startsWith('DONATION#')) {
            donation_id = `DONATION#${donation_id}`;
        }

        // 8) Get anonymous donation
        let anonymousDonation: any;
        try {
            const getResult = await dynamodb.send(new GetCommand({
                TableName: TABLE_NAME,
                Key: {
                    PK: 'USER#ANON',
                    SK: donation_id
                }
            }));

            if (!getResult.Item) {
                return CommonErrors.notFound('Anonymous donation not found');
            }

            anonymousDonation = getResult.Item;
        } catch (getError: any) {
            console.error('DynamoDB get error (anonymous donation):', getError);
            throw getError;
        }

        // 9) Verify donation is actually anonymous
        if (anonymousDonation.PK !== 'USER#ANON') {
            return CommonErrors.badRequest('Donation is already linked to a user');
        }

        // 10) Verify target user exists
        try {
            const userResult = await dynamodb.send(new GetCommand({
                TableName: TABLE_NAME,
                Key: {
                    PK: `USER#${user_id}`,
                    SK: 'PROFILE'
                }
            }));

            if (!userResult.Item) {
                return CommonErrors.notFound('User not found');
            }
        } catch (getUserError: any) {
            console.error('DynamoDB get error (user):', getUserError);
            throw getUserError;
        }

        // 11) Perform TransactWriteCommand: delete old + create new + ADMIN_ACTION
        const timestamp = Date.now();

        try {
            await dynamodb.send(new TransactWriteCommand({
                TransactItems: [
                    // Delete old anonymous donation
                    {
                        Delete: {
                            TableName: TABLE_NAME,
                            Key: {
                                PK: 'USER#ANON',
                                SK: donation_id
                            },
                            ConditionExpression: 'attribute_exists(PK)'
                        }
                    },
                    // Create new donation linked to user
                    {
                        Put: {
                            TableName: TABLE_NAME,
                            Item: {
                                PK: `USER#${user_id}`,
                                SK: donation_id,
                                amount_cents: anonymousDonation.amount_cents,
                                currency: anonymousDonation.currency,
                                timestamp: anonymousDonation.timestamp,
                                type: 'DONATION',
                                user_id: `USER#${user_id}`,  // Update user_id field
                                stripe_id: anonymousDonation.stripe_id
                            }
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
                                action: 'link_anonymous_donation',
                                donation_id: donation_id,
                                old_pk: 'USER#ANON',
                                new_pk: `USER#${user_id}`,
                                amount_cents: anonymousDonation.amount_cents,
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
                return CommonErrors.badRequest('Donation has been modified or deleted');
            }
            throw transactError;
        }

        // 12) Return success response
        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify({
                success: true,
                message: 'Anonymous donation linked successfully',
                donation_id: donation_id,
                user_id: user_id,
                amount_cents: anonymousDonation.amount_cents,
                currency: anonymousDonation.currency
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            }
        };

    } catch (error: any) {
        console.error('Error linking anonymous donation:', error);
        return CommonErrors.internalServerError('Failed to link anonymous donation');
    }
};
