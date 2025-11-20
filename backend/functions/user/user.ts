import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';

export const handler = async (event: ApiGatewayEvent) => {
    try {
        // Auth
        const userId = event.requestContext?.authorizer?.claims?.sub;
        if (!userId) {
            return CommonErrors.unauthorized();
        }

        // Get user profile
        const userResult = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${userId}`,
                SK: 'PROFILE'
            }
        }));

        const user = userResult.Item;
        if (!user) {
            return CommonErrors.notFound('User profile not found');
        }

        // Return user profile (excluding sensitive fields)
        const userProfile = {
            user_id: user.user_id,
            email: user.email,
            name: user.name,
            role: user.role,
            age: user.age,
            location: user.location,
            can_submit: user.can_submit,
            has_paid: user.has_paid,
            created_at: user.created_at,
            updated_at: user.updated_at
        };

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify(userProfile),
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error: any) {
        console.error('Error getting user profile:', error);
        return CommonErrors.internalServerError();
    }
};

