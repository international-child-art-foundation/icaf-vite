import { AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { cognitoClient, dynamodb, USER_POOL_ID, TABLE_NAME } from '../../config/aws-clients';
import { determineUserType, canSubmitArtwork, getMaxConstituentsPerSeason } from '../../../shared/src/api-types/userTypes';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';

/**
 * Verify Account Handler
 *
 * This function creates a DynamoDB USER entity for users who have already
 * registered in Cognito. It retrieves user information from Cognito using
 * the email address and creates the corresponding USER record in DynamoDB.
 *
 * Workflow:
 * 1. Get email from request body
 * 2. Query Cognito to get user attributes (user_id, f_name, l_name, dob, role)
 * 3. Create USER entity in DynamoDB with default values
 */

export const handler = async (event: ApiGatewayEvent) => {
    try {
        const body = JSON.parse(event.body || '{}');

        // 1) Validate email
        if (!body.email) {
            return CommonErrors.badRequest('Email is required');
        }

        const email = body.email.trim();

        // 2) Get user from Cognito by email (username)
        let cognitoUser;
        try {
            cognitoUser = await cognitoClient.send(new AdminGetUserCommand({
                UserPoolId: USER_POOL_ID,
                Username: email
            }));
        } catch (error: any) {
            if (error.name === 'UserNotFoundException') {
                return CommonErrors.notFound('User not found in Cognito. Please register first.');
            }
            throw error;
        }

        // 3) Extract user attributes from Cognito
        const userAttributes = cognitoUser.UserAttributes || [];
        const getAttributeValue = (name: string): string | undefined => {
            const attr = userAttributes.find(a => a.Name === name);
            return attr?.Value;
        };

        const userId = cognitoUser.Username; // This is the user_id (sub)
        const f_name = getAttributeValue('given_name') || '';
        const l_name = getAttributeValue('family_name') || '';
        const birthdate = getAttributeValue('birthdate') || '';
        const roleFromCognito = getAttributeValue('custom:role') || 'user';

        // Validate required fields
        if (!f_name || !l_name || !birthdate) {
            return CommonErrors.badRequest('Missing required user attributes in Cognito (given_name, family_name, birthdate)');
        }

        // 4) Check if user already exists in DynamoDB
        const existingUser = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${userId}`,
                SK: 'PROFILE'
            }
        }));

        if (existingUser.Item) {
            return CommonErrors.badRequest('User already verified. DynamoDB record already exists.');
        }

        // 5) Calculate derived user attributes
        const userType = determineUserType(roleFromCognito as any);
        const canSubmit = canSubmitArtwork(userType);
        const maxConstituents = getMaxConstituentsPerSeason(userType);

        // 6) Create USER entity in DynamoDB
        const userRecord = {
            PK: `USER#${userId}`,
            SK: 'PROFILE',
            user_id: userId,
            f_name: f_name,
            l_name: l_name,
            dob: birthdate,
            role: roleFromCognito,
            user_type: userType,
            can_submit: canSubmit,
            max_constituents_per_season: maxConstituents,
            timestamp: new Date().toISOString(),
            has_paid: false,
            accolades: [],
            type: 'USER',
            has_magazine_subscription: false,
            has_newsletter_subscription: false
        };

        await dynamodb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: userRecord
        }));

        // 7) Return success
        return {
            statusCode: HTTP_STATUS.CREATED,
            body: JSON.stringify({
                message: 'Account verified successfully',
                user_id: userId,
                f_name: f_name,
                l_name: l_name,
                role: roleFromCognito
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            }
        };

    } catch (error: any) {
        console.error('Error verifying account:', error);
        return CommonErrors.internalServerError('Failed to verify account');
    }
};
