/**
 * Get Artwork by ID Handler
 * 
 * Handles GET requests to retrieve a single artwork by its ID:
 * - /api/artworks/{art_id}
 * 
 * DynamoDB Operation: GetCommand
 * - PK: ART#<art_id>
 * - SK: N/A
 */

import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';
import { ArtworkEntity } from '../../../shared/src/api-types/artworkTypes';

export const handler = async (event: ApiGatewayEvent): Promise<{
    statusCode: number;
    body: string;
    headers: Record<string, string>;
}> => {
    try {
        // 1. Validate HTTP method
        if (event.httpMethod !== 'GET') {
            return CommonErrors.methodNotAllowed();
        }

        // 2. Extract artwork ID from path parameters
        const artId = event.pathParameters?.art_id;
        if (!artId?.trim()) {
            return CommonErrors.badRequest('Artwork ID parameter is required in path');
        }

        // 3. Validate artwork ID format (basic validation)
        if (!/^[a-zA-Z0-9_-]+$/.test(artId)) {
            return CommonErrors.badRequest('Invalid artwork ID format');
        }

        // 4. Query DynamoDB for the artwork
        const getParams = {
            TableName: TABLE_NAME,
            Key: {
                PK: `ART#${artId}`,
                SK: 'N/A'
            }
        };

        const result = await dynamodb.send(new GetCommand(getParams));
        const artwork = result.Item;

        // 5. Check if artwork exists
        if (!artwork) {
            return CommonErrors.notFound('Artwork not found');
        }

        // 6. Format artwork for response
        const formattedArtwork: ArtworkEntity = {
            art_id: artwork.art_id || artwork.artwork_id || artId,
            user_id: artwork.user_id || '',
            season: artwork.season || '',
            title: artwork.title || '',
            description: artwork.description || '',
            f_name: artwork.f_name || '',
            age: artwork.age || '',
            location: artwork.location || '',
            is_virtual: artwork.is_virtual || false,
            is_ai_gen: artwork.is_ai_gen || false,
            model: artwork.model || '',
            file_type: artwork.file_type || '',
            is_approved: artwork.is_approved || false,
            votes: artwork.votes || 0,
            timestamp: artwork.timestamp || '',
            type: 'ART' as const
        };

        // 7. Return response
        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify({
                artwork: formattedArtwork,
                message: 'Artwork retrieved successfully'
            }),
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error: any) {
        console.error('Error getting artwork by ID:', error);

        // Handle specific DynamoDB errors
        if (error.name === 'ResourceNotFoundException') {
            return CommonErrors.notFound('Artwork not found');
        }

        if (error.name === 'ValidationException') {
            return CommonErrors.badRequest('Invalid artwork ID format');
        }

        return CommonErrors.internalServerError('Internal server error while retrieving artwork');
    }
};
