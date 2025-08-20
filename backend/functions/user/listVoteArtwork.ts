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
        const seasonFilter = qp.season_filter; // 'active', 'all', or specific season

        // 3) Get current active season(s) (for highlighting)
        let activeSeasons: string[] = [];
        try {
            const seasonResult = await dynamodb.send(new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                ExpressionAttributeValues: {
                    ':pk': 'SEASON',
                    ':sk': '#ACTIVE#true#'
                }
            }));
            
            // Get all active seasons
            activeSeasons = (seasonResult.Items || []).map(season => {
                // Extract season name from compound_sk: #ACTIVE#<boolean>#SEASON#<season>
                const skParts = season.compound_sk?.split('#') || [];
                return skParts[4] || season.season || '';
            }).filter(Boolean);
            
        } catch (error) {
            console.warn('Failed to get active seasons:', error);
        }

        // 4) Query Vote_Ptr pointers for this user
        const ptrQueryParams = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':sk': 'VOTE#'
            },
            Limit: limit * 3, // Query more to account for filtering
            ScanIndexForward: false, // Most recent first
            ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey })
        };

        const ptrResult = await dynamodb.send(new QueryCommand(ptrQueryParams));
        const votePointers = ptrResult.Items || [];

        // Filter by season if specified
        let filteredPointers = votePointers;
        if (seasonFilter && seasonFilter !== 'all') {
            if (seasonFilter === 'active') {
                // Parse season from compound_sk: VOTE#<season>#TIMESTAMP#<timestamp>
                filteredPointers = votePointers.filter(pointer => {
                    const skParts = pointer.compound_sk?.split('#') || [];
                    const voteSeason = skParts[1] || pointer.season;
                    return activeSeasons.includes(voteSeason);
                });
            } else {
                // Specific season filter
                filteredPointers = votePointers.filter(pointer => {
                    const skParts = pointer.compound_sk?.split('#') || [];
                    const voteSeason = skParts[1] || pointer.season;
                    return voteSeason === seasonFilter;
                });
            }
        }

        // Limit after filtering
        filteredPointers = filteredPointers.slice(0, limit);

        // Deduplicate by art_id to avoid duplicate BatchGet keys
        const uniqueArtIds: string[] = Array.from(
            new Set(
                filteredPointers
                    .map(p => p.art_id as string | undefined)
                    .filter((id): id is string => Boolean(id))
            )
        );

        // 5) Resolve corresponding ART entities via BatchGet
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

        // 6) Build votes with artwork details and highlight current season
        const votes = filteredPointers.map(pointer => {
            const art = artsById[pointer.art_id];
            const isCurrentSeason = pointer.season === currentActiveSeason;
            
            // Parse compound_sk to extract season and timestamp
            // Format: VOTE#<season>#TIMESTAMP#<timestamp>
            const skParts = pointer.compound_sk?.split('#') || [];
            const voteTimestamp = skParts[3] ? parseInt(skParts[3]) : pointer.timestamp;
            const voteSeason = skParts[1] || pointer.season;
            
            return {
                vote_id: `VOTE_${pointer.user_id}_${pointer.art_id}_${voteTimestamp}`,
                art_id: pointer.art_id,
                artwork_title: art?.title || '',
                artwork_image_url: art?.image_url || '',
                season: voteSeason || '',
                is_active_season: activeSeasons.includes(voteSeason),
                voted_at: new Date(voteTimestamp * 1000).toISOString(),
                vote_count_at_time: art?.votes || 0,
                artwork_status: art?.is_approved ? 'approved' : 'pending'
            };
        });

        // Sort by timestamp descending (most recent first)
        votes.sort((a, b) => new Date(b.voted_at).getTime() - new Date(a.voted_at).getTime());

        // 7) Calculate summary stats
        const activeSeasonVotes = votes.filter(v => v.is_active_season).length;
        const totalVotes = votes.length;

        // 8) Response
        return {
            statusCode: 200,
            body: JSON.stringify({
                votes,
                summary: {
                    total_votes: totalVotes,
                    active_season_votes: activeSeasonVotes,
                    active_seasons: activeSeasons
                },
                pagination: {
                    has_more: Boolean(ptrResult.LastEvaluatedKey),
                    ...(ptrResult.LastEvaluatedKey && {
                        last_evaluated_key: encodeURIComponent(JSON.stringify(ptrResult.LastEvaluatedKey))
                    })
                }
            }),
            headers: { 'Content-Type': 'application/json' }
        };
    } catch (error: any) {
        console.error('Error listing user votes:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};