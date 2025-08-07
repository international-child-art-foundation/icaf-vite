import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from '../../config/aws-clients';

export const handler = async (event: any) => {
    try {
        const userId = event.requestContext?.authorizer?.claims?.sub;

        if (!userId) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Unauthorized' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Get user profile from DynamoDB
        const tableName = process.env.TABLE_NAME!;

        const getParams = {
            TableName: tableName,
            Key: {
                PK: `USER#${userId}`,
                SK: 'PROFILE'
            }
        };

        const result = await dynamodb.send(new GetCommand(getParams));

        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User profile not found' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        const userProfile = result.Item;

        // Map DynamoDB data to API response format
        const response = {
            UUID: userProfile.user_id || userId,
            email: event.requestContext?.authorizer?.claims?.email || userProfile.email,
            f_name: userProfile.f_name,
            l_name: userProfile.l_name,
            role: userProfile.role || 'user',
            has_cur_season_submission: userProfile.can_submit || false,
            has_magazine_subscription: userProfile.has_magazine_subscription || false,
            has_newsletter_subscription: userProfile.has_newsletter_subscription || false,
            g_f_name: userProfile.guardianFirstName,
            g_l_name: userProfile.guardianLastName,
            birthdate: userProfile.dob
        };

        return {
            statusCode: 200,
            body: JSON.stringify(response),
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error: any) {
        console.error('Error fetching user profile:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};

