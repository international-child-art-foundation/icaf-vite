import { GetCommand, PutCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from '../../config/aws-clients';

type ApiEvent = {
    requestContext?: { authorizer?: { claims?: { sub?: string } } };
    pathParameters?: { art_id?: string };
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

        // Get artwork ID from path parameters
        const artId = event.pathParameters?.art_id;
        if (!artId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Artwork ID is required' }),
                headers: { 'Content-Type': 'application/json' }
            };
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
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Artwork not found' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Check if artwork is approved
        if (!artwork.is_approved) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Cannot vote for unapproved artwork' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Check if user is trying to vote for their own artwork
        if (artwork.user_id === userId) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Cannot vote for your own artwork' }),
                headers: { 'Content-Type': 'application/json' }
            };
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
            const idx = sk.indexOf('#SEASON#');
            return idx >= 0 ? sk.substring(idx + '#SEASON#'.length) : s.season;
        }));

        // Check if artwork belongs to current active season
        const artworkSeason = artwork.season;
        if (!artworkSeason || !activeSeasons.has(artworkSeason)) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Voting not allowed for this season' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // Check if user has already voted in this season
        const existingVoteResult = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${userId}`,
                SK: `VOTE#${artworkSeason}`
            }
        }));

        if (existingVoteResult.Item) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Already voted for this artwork' }),
                headers: { 'Content-Type': 'application/json' }
            };
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
            statusCode: 201,
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
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};
