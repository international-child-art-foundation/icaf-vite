import { BatchGetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from '../../config/aws-clients';

type ApiEvent = {
    requestContext?: { authorizer?: { claims?: { sub?: string } } };
    queryStringParameters?: Record<string, string | undefined>;
};

export const handler = async (event: ApiEvent) => {
    try {
        // 1) Auth
        const userId = event.requestContext?.authorizer?.claims?.sub;
        if (!userId) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Unauthorized' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 2) Params
        const qp = event.queryStringParameters || {};
        const limit = Number.parseInt(String(qp.limit || '20'), 10) || 20;
        const lastEvaluatedKey = qp.last_evaluated_key ? JSON.parse(decodeURIComponent(String(qp.last_evaluated_key))) : undefined;

        // 3) Query Art_Ptr pointers for this user
        const ptrQueryParams = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':sk': 'ART#'
            },
            Limit: limit,
            ScanIndexForward: false,
            ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey })
        };

        const ptrResult = await dynamodb.send(new QueryCommand(ptrQueryParams));
        const pointers = ptrResult.Items || [];

        // Deduplicate by art_id to avoid duplicate BatchGet keys (legacy pointer + season pointer)
        const uniqueArtIds: string[] = Array.from(
            new Set(
                pointers
                    .map(p => p.art_id as string | undefined)
                    .filter((id): id is string => Boolean(id))
            )
        );

        // 4) Resolve corresponding ART entities via BatchGet
        const artKeys = uniqueArtIds.map((artId: string) => ({ PK: `ART#${artId}`, SK: 'N/A' }));

        let artsById: Record<string, any> = {};
        if (artKeys.length > 0) {
            const batchRes = await dynamodb.send(new BatchGetCommand({
                RequestItems: {
                    [TABLE_NAME]: {
                        Keys: artKeys
                    }
                }
            }));
            const found = batchRes.Responses?.[TABLE_NAME] || [];
            for (const item of found) {
                const artId = item.art_id || item.artwork_id;
                if (artId) artsById[artId] = item;
            }
        }

        // 5) (Optional) Season activation lookup removed as unused in current response shape

        // 6) Build artworks from unique art records and sort by actual art timestamp desc
        const artworks = uniqueArtIds.map(artId => {
            const art = artsById[artId];
            const ts = art?.timestamp || '';
            const season = art?.season || '';
            return {
                artwork_id: artId,
                title: art?.title || '',
                submission_date: ts,
                is_approved: Boolean(art?.is_approved),
                votes: Number.isFinite(art?.votes) ? art.votes : 0,
                season: season || ''
            };
        });

        artworks.sort((a, b) => String(b.submission_date).localeCompare(String(a.submission_date)));

        // 7) Response
        return {
            statusCode: 200,
            body: JSON.stringify({
                artworks,
                ...(ptrResult.LastEvaluatedKey && {
                    last_evaluated_key: encodeURIComponent(JSON.stringify(ptrResult.LastEvaluatedKey))
                })
            }),
            headers: { 'Content-Type': 'application/json' }
        };
    } catch (error: any) {
        console.error('Error listing artwork submissions:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};


