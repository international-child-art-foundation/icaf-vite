import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
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
                statusCode: 400,
                body: JSON.stringify({ message: 'Bad Request' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 1) Load all active seasons
        const seasonRes = await dynamodb.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
            ExpressionAttributeValues: {
                ':pk': 'SEASON',
                ':skPrefix': '#ACTIVE#true#SEASON#'
            }
        }));
        const activeSeasons = new Set<string>((seasonRes.Items || []).map(s => {
            const sk: string = s.SK;
            const idx = sk.indexOf('#SEASON#');
            return idx >= 0 ? sk.substring(idx + '#SEASON#'.length) : s.season;
        }));
        if (activeSeasons.size === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'No active season' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 2) Find user's art pointer that belongs to any active season
        const ptrScan = await dynamodb.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':skPrefix': 'ART#'
            },
            ScanIndexForward: false
        }));
        const pointers = (ptrScan.Items || []) as Array<any>;
        const seasonPtr = pointers.find(p => typeof p.season === 'string' && activeSeasons.has(p.season));
        const targetSeason: string | undefined = seasonPtr?.season;
        const artId: string | undefined = seasonPtr?.art_id || seasonPtr?.artwork_id;
        if (!targetSeason || !artId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'No submission for active season' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 3) Fetch ART entity
        const artRes = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { PK: `ART#${artId}`, SK: 'N/A' }
        }));

        const art = artRes.Item;
        if (!art) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Submission not found' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Build response
        const responseBody = {
            art_id: artId,
            title: art.title || '',
            timestamp: art.timestamp || '',
            is_approved: Boolean(art.is_approved),
            votes: Number.isFinite(art.votes) ? art.votes : 0,
            season: art.season || targetSeason
        };

        return {
            statusCode: 201,
            body: JSON.stringify(responseBody),
            headers: { 'Content-Type': 'application/json' }
        };
    } catch (error: any) {
        console.error('Error fetching current season artwork submission:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};