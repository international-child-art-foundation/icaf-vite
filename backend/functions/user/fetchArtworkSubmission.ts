import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from '../../config/aws-clients';

export const handler = async (event: any) => {
    try {
        // 1. Authentication check
        const userId = event.requestContext?.authorizer?.claims?.sub;

        if (!userId) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Unauthorized' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 2. Parse query parameters
        const queryParams = event.queryStringParameters || {};
        const limit = parseInt(queryParams.limit) || 20;
        const lastEvaluatedKey = queryParams.last_evaluated_key ?
            JSON.parse(decodeURIComponent(queryParams.last_evaluated_key)) : undefined;

        // 3. Build DynamoDB query parameters
        const queryCommandParams = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':sk': 'ART#'
            },
            Limit: limit,
            ScanIndexForward: false, // Get most recent first
            ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey })
        };

        // 4. Execute query
        const result = await dynamodb.send(new QueryCommand(queryCommandParams));
        const artworks = result.Items || [];

        // 5. Transform response format
        const transformedArtworks = artworks.map(artwork => ({
            artwork_id: artwork.artwork_id || artwork.SK.replace('ARTWORK#', ''),
            title: artwork.title || '',
            image_url: artwork.image_url || '',
            submission_date: artwork.submission_date || artwork.timestamp || '',
            is_approved: artwork.is_approved || false,
            votes: artwork.votes || 0,
            season_name: artwork.season_name || ''
        }));

        // 6. Build response
        const response = {
            artworks: transformedArtworks,
            ...(result.LastEvaluatedKey && {
                last_evaluated_key: encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
            })
        };

        return {
            statusCode: 200,
            body: JSON.stringify(response),
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error: any) {
        console.error('Error fetching artwork submissions:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};
