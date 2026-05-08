import { AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { cognitoClient, dynamodb, USER_POOL_ID, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';
import { GetUserCognitoInfoResponse } from '../../../shared/src/api-types/userTypes';

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

        // 3) Get user information from Cognito
        let cognitoUser;
        try {
            const cognitoResult = await cognitoClient.send(new AdminGetUserCommand({
                UserPoolId: USER_POOL_ID,
                Username: targetUserId
            }));
            cognitoUser = cognitoResult;
        } catch (error: any) {
            if (error.name === 'UserNotFoundException') {
                return CommonErrors.notFound(`User '${targetUserId}' not found in Cognito`);
            }
            throw error;
        }

        // 4) Extract user attributes from Cognito
        const userAttributes = cognitoUser.UserAttributes || [];
        const getAttributeValue = (name: string): string | undefined => {
            const attr = userAttributes.find(a => a.Name === name);
            return attr?.Value;
        };

        const email = getAttributeValue('email') || '';
        const emailVerified = getAttributeValue('email_verified') === 'true';
        const username = cognitoUser.Username || targetUserId;
        const userStatus = cognitoUser.UserStatus || 'UNKNOWN';
        const userCreateDate = cognitoUser.UserCreateDate?.toISOString();
        const userLastModifiedDate = cognitoUser.UserLastModifiedDate?.toISOString();
        const enabled = cognitoUser.Enabled !== false;

        // 5) Return success response
        const response: GetUserCognitoInfoResponse = {
            user_id: targetUserId,
            email: email,
            email_verified: emailVerified,
            username: username,
            user_status: userStatus,
            enabled: enabled,
            user_create_date: userCreateDate,
            user_last_modified_date: userLastModifiedDate
        };

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify(response),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            }
        };

    } catch (error: any) {
        console.error('Error in getUserCognitoInfo handler:', error);

        return CommonErrors.internalServerError('Failed to get user Cognito information');
    }
};
