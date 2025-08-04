import { CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
const { validateRegistrationBody, ACCESS_LEVELS } = require('../../shared/dist/api-types/registrationTypes');

/**
 * User Registration Handler
 * 
 * Guardian Logic:
 * - Users under 18 cannot register as guardians (they are typical users who need guardian info)
 * - Guardians are parents, teachers, etc. who register on behalf of users under 18
 * - The is_guardian flag determines if someone is registering as a guardian or typical user
 * - Users under 18 (typical users) require guardian information (g_f_name, g_l_name)
 * - Guardians (parents, teachers, etc.) don't need guardian info for themselves
 */

// Configure AWS clients based on environment
const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION || 'us-east-1',
    ...(process.env.NODE_ENV === 'test' && {
        endpoint: 'http://localhost:4566', // LocalStack endpoint
        credentials: {
            accessKeyId: 'test',
            secretAccessKey: 'test'
        }
    })
});

const dynamoClient = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    ...(process.env.NODE_ENV === 'test' && {
        endpoint: 'http://localhost:4566', // LocalStack endpoint
        credentials: {
            accessKeyId: 'test',
            secretAccessKey: 'test'
        }
    })
});

const dynamodb = DynamoDBDocumentClient.from(dynamoClient);

const USER_POOL_ID = process.env.USER_POOL_ID!;
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID!;
const TABLE_NAME = process.env.TABLE_NAME!;

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

        // Determine access level
        let accessLevel = 'user'; // Default access level

        // If access_level is provided, validate and use it
        if (body.access_level) {
            if (!ACCESS_LEVELS.includes(body.access_level)) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: 'Invalid access_level. Valid values are: admin, contributor, guardian, user'
                    }),
                    headers: { 'Content-Type': 'application/json' }
                };
            }
            accessLevel = body.access_level;
        }

        // If is_guardian is true, override access_level to guardian
        if (body.is_guardian === true) {
            accessLevel = 'guardian';
        }

        // Calculate user's age to determine if they can register as a guardian
        const birthDate = new Date(body.birthdate);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

        // Users under 18 cannot register as guardians
        if (body.is_guardian === true && actualAge < 18) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Users under 18 cannot register as guardians'
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Determine if guardian information is needed
        // Users under 18 (typical users) need guardian information
        // Guardians (parents, teachers, etc.) don't need guardian info
        const needsGuardianInfo = actualAge < 18 && accessLevel === 'user';
        if (needsGuardianInfo && (!body.g_f_name || !body.g_l_name)) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Guardian information required for users under 18'
                }),
                headers: { 'Content-Type': 'application/json' }
            };
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
                    Name: 'custom:access_level',
                    Value: accessLevel
                },
                ...(needsGuardianInfo ? [
                    {
                        Name: 'custom:guardianId',
                        Value: `${body.g_f_name}_${body.g_l_name}`
                    }
                ] : [])
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
            role: accessLevel, // Store access_level as role in DynamoDB for compatibility
            timestamp: new Date().toISOString(),
            can_submit: false,
            max_constituents_per_season: ['guardian', 'contributor', 'admin'].includes(accessLevel) ? -1 : 0,
            has_paid: false,
            accolades: [],
            has_magazine_subscription: false,
            has_newsletter_subscription: false,
            type: 'USER',
            user_id: userId,
            ...(needsGuardianInfo ? {
                guardianId: `${body.g_f_name}_${body.g_l_name}`,
                guardianFirstName: body.g_f_name,
                guardianLastName: body.g_l_name,
            } : {})
        };

        const dynamoParams = {
            TableName: TABLE_NAME,
            Item: userRecord
        };

        await dynamodb.send(new PutCommand(dynamoParams));

        // 3. Create guardian record if needed (for users under 18)
        if (needsGuardianInfo && body.g_f_name && body.g_l_name) {
            const guardianId = `${body.g_f_name}_${body.g_l_name}`;
            const guardianRecord = {
                PK: `GUARDIAN#${guardianId}`,
                SK: 'PROFILE',
                firstName: body.g_f_name,
                lastName: body.g_l_name,
                wards: [userId],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const guardianParams = {
                TableName: TABLE_NAME,
                Item: guardianRecord
            };

            await dynamodb.send(new PutCommand(guardianParams));
        }

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