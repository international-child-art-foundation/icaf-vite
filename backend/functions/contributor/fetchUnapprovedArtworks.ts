import { GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { cognitoClient, dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, ApiGatewayResponse, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';
import { ArtworkEntity } from '../../../shared/src/api-types/artworkTypes';

/**
 * Fetch Unapproved Artworks Handler
 *
 * Allows contributors to fetch unapproved artworks for review.
 * Uses GSI4 (Unapproved index) to query artworks with is_approved=false.
 *
 * Authorization: contributor+ roles only
 * Query Parameters:
 *   - limit: number of artworks to return (default 20, max 100)
 *   - season: optional filter by season (format: SEASON#<season>)
 *   - lastEvaluatedKey: pagination token (base64 encoded)
 */

// Helper function to parse cookies from Cookie header
function parseCookies(cookieHeader: string | undefined): Record<string, string> {
    if (!cookieHeader) {
        return {};
    }

    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
        const [name, ...rest] = cookie.split('=');
        if (name && rest.length > 0) {
            cookies[name.trim()] = rest.join('=').trim();
        }
    });
    return cookies;
}

// Helper function to format DynamoDB item as ArtworkEntity
function formatArtworkEntity(item: any): ArtworkEntity {
    return {
        art_id: item.art_id || item.artwork_id,
        user_id: item.user_id,
        season: item.season,
        title: item.title,
        description: item.description,
        f_name: item.f_name,
        age: item.age,
        location: item.location,
        is_virtual: item.is_virtual || false,
        is_ai_gen: item.is_ai_gen || false,
        model: item.model,
        file_type: item.file_type,
        is_approved: item.is_approved || false,
        votes: item.votes || 0,
        timestamp: item.timestamp,
        type: 'ART' as const
    };
}

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
    try {
        // 1) Extract accessToken from Cookie header
        const cookieHeader = event.headers?.['Cookie'] || event.headers?.['cookie'];
        const cookies = parseCookies(cookieHeader);
        const accessToken = cookies['accessToken'];

        if (!accessToken) {
            return {
                statusCode: HTTP_STATUS.UNAUTHORIZED,
                body: JSON.stringify({ message: 'Authentication required' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 2) Get user info from Cognito
        let userRole: string;

        try {
            const result = await cognitoClient.send(new GetUserCommand({
                AccessToken: accessToken
            }));

            const attributes = result.UserAttributes || [];
            userRole = attributes.find(attr => attr.Name === 'custom:role')?.Value || 'user';
        } catch (error: any) {
            console.error('Cognito GetUser error:', error);
            return {
                statusCode: HTTP_STATUS.UNAUTHORIZED,
                body: JSON.stringify({ message: 'Invalid or expired token' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        // 3) Verify role >= contributor
        const roleHierarchy = ['user', 'guardian', 'contributor', 'admin'];
        const userRoleLevel = roleHierarchy.indexOf(userRole);
        const requiredRoleLevel = roleHierarchy.indexOf('contributor');

        if (userRoleLevel < requiredRoleLevel) {
            return CommonErrors.forbidden('Only contributors and above can fetch unapproved artworks');
        }

        // 4) Parse query parameters
        const queryParams = event.queryStringParameters || {};
        const limit = Math.min(parseInt(queryParams.limit || '20', 10), 100);
        const season = queryParams.season; // Format: SEASON#<season>
        const lastEvaluatedKey = queryParams.lastEvaluatedKey;

        // 5) Build DynamoDB query
        const queryInput: any = {
            TableName: TABLE_NAME,
            IndexName: 'GSI4',
            Limit: limit,
            ScanIndexForward: false // Descending order (newest first)
        };

        // Build KeyConditionExpression based on whether season filter is provided
        if (season) {
            // Filter by season using begins_with
            queryInput.KeyConditionExpression = 'GSI4PK = :unapproved AND begins_with(GSI4SK, :season)';
            queryInput.ExpressionAttributeValues = {
                ':unapproved': 'UNAPPROVED',
                ':season': `${season}#` // Add trailing # for begins_with
            };
        } else {
            // Get all unapproved artworks
            queryInput.KeyConditionExpression = 'GSI4PK = :unapproved';
            queryInput.ExpressionAttributeValues = {
                ':unapproved': 'UNAPPROVED'
            };
        }

        // Add pagination if provided
        if (lastEvaluatedKey) {
            try {
                const decodedKey = Buffer.from(lastEvaluatedKey, 'base64').toString();
                queryInput.ExclusiveStartKey = JSON.parse(decodedKey);
            } catch (error) {
                console.error('Error decoding lastEvaluatedKey:', error);
                return CommonErrors.badRequest('Invalid pagination key');
            }
        }

        // 6) Execute query
        let queryResult;
        try {
            queryResult = await dynamodb.send(new QueryCommand(queryInput));
        } catch (queryError: any) {
            console.error('DynamoDB query error:', queryError);
            if (queryError.name === 'ResourceNotFoundException') {
                return CommonErrors.internalServerError('Unapproved artworks index not found');
            }
            throw queryError;
        }

        const items = queryResult.Items || [];
        const artworks: ArtworkEntity[] = items.map(item => formatArtworkEntity(item));

        // Encode pagination key
        let encodedLastKey: string | undefined;
        if (queryResult.LastEvaluatedKey) {
            encodedLastKey = Buffer.from(JSON.stringify(queryResult.LastEvaluatedKey)).toString('base64');
        }

        // 7) Return success response
        const responseBody: any = {
            artworks,
            count: artworks.length,
            hasMore: !!queryResult.LastEvaluatedKey,
            pagination: {
                has_more: !!queryResult.LastEvaluatedKey,
                last_evaluated_key: encodedLastKey
            }
        };

        // Include season in response if it was filtered
        if (season) {
            responseBody.season = season;
        }

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify(responseBody),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            }
        };

    } catch (error: any) {
        console.error('Error fetching unapproved artworks:', error);
        return CommonErrors.internalServerError('Failed to fetch unapproved artworks');
    }
};
