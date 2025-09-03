import { GetCommand, PutCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';
import { canUserVoteForArtwork, extractSeasonFromSK } from '../../../shared/src/api-types/businessLogic';

export const handler = async (event: ApiGatewayEvent) => {
    try {
        // Auth
        const userId = event.requestContext?.authorizer?.claims?.sub;
        if (!userId) {
            return CommonErrors.unauthorized();
        }

        // Get artwork ID from path parameters
        const artId = event.pathParameters?.art_id;
        if (!artId) {
            return CommonErrors.badRequest('Artwork ID is required');
        }

        // Get artwork details
        const artworkResult = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `ART#${artId}`,
                SK: 'N/A'
            }
        }));

        const artwork = artworkResult.Item;
        if (!artwork) {
            return CommonErrors.badRequest('Artwork not found');
        }

        // Check if artwork is approved
        if (!artwork.is_approved) {
            return CommonErrors.forbidden('Cannot vote for unapproved artwork');
        }

        // Check if user is trying to vote for their own artwork
        if (artwork.user_id === userId) {
            return CommonErrors.forbidden('Cannot vote for your own artwork');
        }

        // Get current active seasons
        const seasonsResult = await dynamodb.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
            ExpressionAttributeValues: {
                ':pk': 'SEASON',
                ':skPrefix': '#ACTIVE#true#SEASON#'
            }
        }));

        const activeSeasons = new Set<string>((seasonsResult.Items || []).map(s => {
            const sk: string = s.SK;
            return extractSeasonFromSK(sk);
        }));

        // Check if user can vote for this artwork
        const voteValidation = canUserVoteForArtwork(userId, artwork as any, activeSeasons);
        if (!voteValidation.canVote) {
            return CommonErrors.forbidden(voteValidation.reason || 'Voting not allowed');
        }

        const artworkSeason = artwork.season;

        // Check if user has already voted in this season
        const existingVoteResult = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${userId}`,
                SK: `VOTE#${artworkSeason}`
            }
        }));

        if (existingVoteResult.Item) {
            return CommonErrors.badRequest('Already voted for this artwork');
        }

        // Create vote record
        const timestamp = new Date().toISOString();
        const voteId = `VOTE_${userId}_${artId}_${Date.now()}`;

        await dynamodb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                PK: `USER#${userId}`,
                SK: `VOTE#${artworkSeason}`,
                vote_id: voteId,
                art_id: artId,
                season: artworkSeason,
                timestamp: timestamp,
                type: 'VOTE_PTR'
            }
        }));

        // Update artwork vote count
        const currentVotes = Number.isFinite(artwork.votes) ? artwork.votes : 0;
        const newVoteCount = currentVotes + 1;

        await dynamodb.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `ART#${artId}`,
                SK: 'N/A'
            },
            UpdateExpression: 'SET votes = :newVotes',
            ExpressionAttributeValues: {
                ':newVotes': newVoteCount
            }
        }));

        // Return success response
        return {
            statusCode: HTTP_STATUS.CREATED,
            body: JSON.stringify({
                success: true,
                vote_id: voteId,
                art_id: artId,
                new_vote_count: newVoteCount,
                message: 'Vote recorded successfully',
                timestamp: Date.now()
            }),
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error: any) {
        console.error('Error processing vote:', error);
        return CommonErrors.internalServerError();
    }
};
