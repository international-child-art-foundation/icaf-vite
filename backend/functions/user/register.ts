import { SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { cognitoClient, dynamodb, USER_POOL_ID, USER_POOL_CLIENT_ID, TABLE_NAME } from '../../config/aws-clients';
const { validateRegistrationBody } = require('../../../shared/dist/api-types/registrationTypes');
const { ROLES, calculateUserAge, determineUserType, canSubmitArtwork, getMaxConstituentsPerSeason } = require('../../../shared/dist/api-types/userTypes');

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

export const handler = async (event: any) => {
    try {
        const body = JSON.parse(event.body);

        // Validate required fields
        if (!body.email || !body.password || !body.f_name || !body.l_name || !body.birthdate) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing required fields: email, password, f_name, l_name, birthdate'
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Validate field lengths
        if (body.f_name.length > 24 || body.l_name.length > 24) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'First name and last name must be 24 characters or less'
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(body.birthdate)) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Birthdate must be in YYYY-MM-DD format'
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Check password strength
        if (body.password.length < 8) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Password must be at least 8 characters long'
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Determine role
        let role = 'user'; // Default role

        // If role is provided, validate and use it
        if (body.role) {
            if (!ROLES.includes(body.role)) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: 'Invalid role. Valid values are: admin, contributor, guardian, user'
                    }),
                    headers: { 'Content-Type': 'application/json' }
                };
            }
            role = body.role;
        }

        // Calculate user's age and determine user type
        const userAge = calculateUserAge(body.birthdate);
        const userType = determineUserType(role);
        const canSubmit = canSubmitArtwork(userType);
        const maxConstituents = getMaxConstituentsPerSeason(userType);

        // Note: Users under 18 can register but cannot submit artwork
        // They will need a guardian to submit artwork on their behalf

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

        // 2. Create user record in DynamoDB
        const userRecord = {
            PK: `USER#${userId}`,
            SK: 'PROFILE',
            f_name: body.f_name,
            l_name: body.l_name,
            dob: body.birthdate, // Store as dob in DynamoDB
            role: role, // Store role in DynamoDB
            user_type: userType,
            timestamp: new Date().toISOString(),
            can_submit: canSubmit,
            max_constituents_per_season: maxConstituents,
            has_paid: false,
            accolades: [],
            has_magazine_subscription: false,
            has_newsletter_subscription: false,
            type: 'USER',
            user_id: userId
        };

        const dynamoParams = {
            TableName: TABLE_NAME,
            Item: userRecord
        };

        await dynamodb.send(new PutCommand(dynamoParams));

        // Note: Guardian records will be created when guardians submit artwork on behalf of others

        return {
            statusCode: 201,
            body: JSON.stringify({
                UUID: userId
            }),
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error: any) {
        console.error('Registration error:', error);

        // Handle Cognito errors
        if (error.name === 'UsernameExistsException') {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'User with this email already exists'
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        if (error.name === 'InvalidPasswordException') {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Password does not meet requirements'
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error during registration',
                error: error.message
            }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
}; 