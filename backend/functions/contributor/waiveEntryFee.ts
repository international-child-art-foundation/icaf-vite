import { GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { cognitoClient, dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, ApiGatewayResponse, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';

/**
 * Waive Entry Fee Handler
 *
 * Allows contributors to waive the contest entry fee for a user (lifetime).
 * This sets has_paid=true on the USER entity without requiring actual payment.
 *
 * Authorization: contributor+ roles only
 * No action logging required.
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

        try {
            const result = await cognitoClient.send(new GetUserCommand({
                AccessToken: accessToken
            }));

            const attributes = result.UserAttributes || [];
            userRole = attributes.find(attr => attr.Name === 'custom:role')?.Value || 'user';
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
            return CommonErrors.forbidden('Only contributors and above can waive entry fees');
        }

        // 4) Parse request body
        if (!event.body) {
            return CommonErrors.badRequest('Request body is required');
        }

        let requestData: { user_id: string };
        try {
            requestData = JSON.parse(event.body);
        } catch (error) {
            return CommonErrors.badRequest('Invalid JSON in request body');
        }

        const { user_id } = requestData;

        // 5) Validate user_id
        if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
            return CommonErrors.badRequest('user_id is required and must be a non-empty string');
        }

        // 6) Update USER entity to set has_paid=true
        try {
            await dynamodb.send(new UpdateCommand({
                TableName: TABLE_NAME,
                Key: {
                    PK: `USER#${user_id}`,
                    SK: 'PROFILE'
                },
                UpdateExpression: 'SET has_paid = :true',
                ExpressionAttributeValues: {
                    ':true': true
                },
                ConditionExpression: 'attribute_exists(PK)' // Ensure user exists
            }));
        } catch (updateError: any) {
            console.error('DynamoDB update error:', updateError);
            if (updateError.name === 'ConditionalCheckFailedException') {
                return CommonErrors.notFound('User not found');
            }
            throw updateError;
        }

        // 7) Return success response
        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify({
                success: true,
                message: 'Entry fee waived successfully',
                user_id: user_id,
                has_paid: true
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            }
        };

    } catch (error: any) {
        console.error('Error waiving entry fee:', error);
        return CommonErrors.internalServerError('Failed to waive entry fee');
    }
};
