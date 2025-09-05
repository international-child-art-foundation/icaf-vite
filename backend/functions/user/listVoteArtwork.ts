import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';

export const handler = async (event: ApiGatewayEvent) => {
    try {
        // 1) Auth
        const userId = event.requestContext?.authorizer?.claims?.sub;
        if (!userId) {
            return CommonErrors.unauthorized();
        }

        // 2) Params
        const qp = event.queryStringParameters || {};
        const limit = Number.parseInt(String(qp.limit || '20'), 10) || 20;
        const lastEvaluatedKey = qp.last_evaluated_key ? JSON.parse(decodeURIComponent(String(qp.last_evaluated_key))) : undefined;
        const seasonFilter = qp.season_filter; // 'active', 'all', or specific season

        // 3) Get active seasons (for highlighting and filtering)
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

        // 4) Query VOTE records for this user
        const voteQueryParams = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':sk': 'VOTE#'
            },
            Limit: limit * 3, // Query more to account for filtering
            ScanIndexForward: false,
            ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey })
        };

        const voteResult = await dynamodb.send(new QueryCommand(voteQueryParams));
        const votes = voteResult.Items || [];

        // 5) Filter by season if specified
        let filteredVotes = votes;
        if (seasonFilter && seasonFilter !== 'all') {
            if (seasonFilter === 'active') {
                // Filter to only active seasons
                filteredVotes = votes.filter(vote => {
                    const voteSeason = vote.season;
                    return activeSeasons.includes(voteSeason);
                });
            } else {
                // Filter to specific season
                filteredVotes = votes.filter(vote => {
                    const voteSeason = vote.season;
                    return voteSeason === seasonFilter;
                });
            }
        }

        // Limit after filtering
        filteredVotes = filteredVotes.slice(0, limit);

        // 6) Get artwork details for each vote
        const artworks: any[] = [];
        for (const vote of filteredVotes) {
            if (vote.art_id) {
                const artworkResult = await dynamodb.send(new GetCommand({
                    TableName: TABLE_NAME,
                    Key: {
                        PK: `ART#${vote.art_id}`,
                        SK: 'N/A'
                    }
                }));

                const artwork = artworkResult.Item;
                if (artwork) {
                    const season = artwork.season || '';
                    const isActiveSeason = activeSeasons.includes(season);

                    artworks.push({
                        artwork_id: vote.art_id,
                        title: artwork.title || '',
                        submission_date: artwork.timestamp || '',
                        is_approved: Boolean(artwork.is_approved),
                        votes: Number.isFinite(artwork.votes) ? artwork.votes : 0,
                        season: season,
                        is_active_season: isActiveSeason,
                        vote_timestamp: vote.timestamp || ''
                    });
                }
            }
        }

        // Sort by vote timestamp desc
        artworks.sort((a, b) => String(b.vote_timestamp).localeCompare(String(a.vote_timestamp)));

        // 7) Calculate summary stats
        const activeSeasonVotes = artworks.filter(art => art.is_active_season).length;
        const totalVotes = artworks.length;

        // 8) Response
        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify({
                artworks,
                summary: {
                    total_votes: totalVotes,
                    active_season_votes: activeSeasonVotes,
                    active_seasons: activeSeasons
                },
                pagination: {
                    has_more: Boolean(voteResult.LastEvaluatedKey),
                    ...(voteResult.LastEvaluatedKey && {
                        last_evaluated_key: encodeURIComponent(JSON.stringify(voteResult.LastEvaluatedKey))
                    })
                }
            }),
            headers: { 'Content-Type': 'application/json' }
        };
    } catch (error: any) {
        console.error('Error listing vote artwork:', error);
        return CommonErrors.internalServerError();
    }
};