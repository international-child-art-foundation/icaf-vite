import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from '../../config/aws-clients';

type ApiEvent = {
    requestContext?: { authorizer?: { claims?: { sub?: string } } };
    queryStringParameters?: Record<string, string | undefined>;
};

export const handler = async (event: ApiEvent) => {
    try {
        // Auth
        const userId = event.requestContext?.authorizer?.claims?.sub;
        if (!userId) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Unauthorized' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Parse query parameters
        const limit = parseInt(event.queryStringParameters?.limit || '20');
        const lastEvaluatedKeyParam = event.queryStringParameters?.last_evaluated_key;
        const lastEvaluatedKey = lastEvaluatedKeyParam ? JSON.parse(lastEvaluatedKeyParam) : undefined;

        // Query user's donations
        const queryParams = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':sk': 'DONATION#'
            },
            Limit: limit,
            ScanIndexForward: false, // Most recent first
            ExclusiveStartKey: lastEvaluatedKey
        };

        const result = await dynamodb.send(new QueryCommand(queryParams));
        const items = result.Items || [];

        // Transform data
        const donations = items.map(item => ({
            donation_id: item.SK.replace('DONATION#', ''),
            amount_cent: item.amount_cents,
            timestamp: item.timestamp,
            currency: item.currency
        }));

        // Calculate total amount for current page
        const total_amount_cent = donations.reduce((sum, d) => sum + d.amount_cent, 0);

        // Build response
        const responseBody: any = {
            donations,
            total_amount_cent
        };

        if (result.LastEvaluatedKey) {
            responseBody.last_evaluated_key = JSON.stringify(result.LastEvaluatedKey);
        }

        return {
            statusCode: 200,
            body: JSON.stringify(responseBody),
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error: any) {
        console.error('Error listing donations:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};
