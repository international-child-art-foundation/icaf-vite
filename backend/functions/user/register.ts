import { SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient, USER_POOL_CLIENT_ID } from '../../config/aws-clients';
import { ROLES } from '../../../shared/src/api-types/userTypes';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';

/**
 * User Registration Handler
 * 
 * Simplified Registration Logic:
 * - All users (guardian and regular) have the same format with f_name and l_name
 * - No guardian information is required during registration
 * - Users under 18 can register but cannot submit artwork
 * - Guardians can submit artwork on behalf of others later
 * - Access levels: admin, contributor, guardian, user
 */

export const handler = async (event: ApiGatewayEvent) => {
    try {
        const body = JSON.parse(event.body || '{}');

        // Validate required fields
        if (!body.email || !body.password || !body.f_name || !body.l_name || !body.birthdate) {
            return CommonErrors.badRequest('Missing required fields: email, password, f_name, l_name, birthdate');
        }

        // Validate field lengths
        if (body.f_name.length > 24 || body.l_name.length > 24) {
            return CommonErrors.badRequest('First name and last name must be 24 characters or less');
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(body.birthdate)) {
            return CommonErrors.badRequest('Birthdate must be in YYYY-MM-DD format');
        }

        // Check password strength
        if (body.password.length < 8) {
            return CommonErrors.badRequest('Password must be at least 8 characters long');
        }

        // Determine role
        let role = 'user'; // Default role

        // If role is provided, validate and use it
        if (body.role) {
            if (!ROLES.includes(body.role as any)) {
                return CommonErrors.badRequest('Invalid role. Valid values are: admin, contributor, guardian, user');
            }
            role = body.role as any;
        }

        // 1. Register user in Cognito
        const cognitoParams = {
            ClientId: USER_POOL_CLIENT_ID,
            Username: body.email,
            Password: body.password,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: body.email
                },
                {
                    Name: 'given_name',
                    Value: body.f_name
                },
                {
                    Name: 'family_name',
                    Value: body.l_name
                },
                {
                    Name: 'birthdate',
                    Value: body.birthdate
                },
                {
                    Name: 'custom:role',
                    Value: role
                }
            ]
        };

        const signUpResult = await cognitoClient.send(new SignUpCommand(cognitoParams));
        const userId = signUpResult.UserSub;

        // Note: DynamoDB USER entity will be created when user verifies their account
        // This allows users to register in Cognito first, then complete their profile later

        return {
            statusCode: HTTP_STATUS.CREATED,
            body: JSON.stringify({
                message: 'User registered successfully in Cognito. Please verify your account to complete registration.',
                user_id: userId
            }),
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error: any) {
        console.error('Registration error:', error);

        // Handle Cognito errors
        if (error.name === 'UsernameExistsException') {
            return CommonErrors.badRequest('User with this email already exists');
        }

        if (error.name === 'InvalidPasswordException') {
            return CommonErrors.badRequest('Password does not meet requirements');
        }

        return CommonErrors.internalServerError('Internal server error during registration');
    }
}; 