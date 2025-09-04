import { BatchGetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
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

        // 4) Query Art_Ptr pointers for this user
        const ptrQueryParams = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':sk': 'ART#'
            },
            Limit: limit * 3, // Query more to account for filtering
            ScanIndexForward: false,
            ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey })
        };

        const ptrResult = await dynamodb.send(new QueryCommand(ptrQueryParams));
        const pointers = ptrResult.Items || [];

        // 5) Filter by season if specified
        let filteredPointers = pointers;
        if (seasonFilter && seasonFilter !== 'all') {
            if (seasonFilter === 'active') {
                // Filter to only active seasons
                filteredPointers = pointers.filter(pointer => {
                    // Extract season from SK: ART#<season>
                    const skParts = pointer.SK?.split('#') || [];
                    const artSeason = skParts[1] || pointer.season;
                    return activeSeasons.includes(artSeason);
                });
            } else {
                // Filter to specific season
                filteredPointers = pointers.filter(pointer => {
                    const skParts = pointer.SK?.split('#') || [];
                    const artSeason = skParts[1] || pointer.season;
                    return artSeason === seasonFilter;
                });
            }
        }

        // Limit after filtering
        filteredPointers = filteredPointers.slice(0, limit);

        // Deduplicate by art_id to avoid duplicate BatchGet keys (legacy pointer + season pointer)
        const uniqueArtIds: string[] = Array.from(
            new Set(
                filteredPointers
                    .map(p => p.art_id as string | undefined)
                    .filter((id): id is string => Boolean(id))
            )
        );

        // 6) Resolve corresponding ART entities via BatchGet
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

        // 7) Build artworks from unique art records and sort by actual art timestamp desc
        const artworks = uniqueArtIds.map(artId => {
            const art = artsById[artId];
            const ts = art?.timestamp || '';
            const season = art?.season || '';
            const isActiveSeason = activeSeasons.includes(season);

            return {
                artwork_id: artId,
                title: art?.title || '',
                submission_date: ts,
                is_approved: Boolean(art?.is_approved),
                votes: Number.isFinite(art?.votes) ? art.votes : 0,
                season: season || '',
                is_active_season: isActiveSeason,
            };
        });

        artworks.sort((a, b) => String(b.submission_date).localeCompare(String(a.submission_date)));

        // 8) Calculate summary stats
        const activeSeasonArtworks = artworks.filter(art => art.is_active_season).length;
        const totalArtworks = artworks.length;

        // 9) Response
        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify({
                artworks,
                summary: {
                    total_artworks: totalArtworks,
                    active_season_artworks: activeSeasonArtworks,
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
        console.error('Error listing artwork submissions:', error);
        return CommonErrors.internalServerError();
    }
};