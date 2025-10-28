import { GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { QueryCommand, BatchGetCommand } from '@aws-sdk/lib-dynamodb';
import { cognitoClient, dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, ApiGatewayResponse, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';

/**
 * List Constituent Artworks Handler
 *
 * Lists all artworks submitted by a guardian on behalf of virtual users (constituents).
 *
 * Flow:
 * 1. Get guardian user_id from accessToken
 * 2. Verify role >= guardian
 * 3. Query Art_Ptr entities for the guardian's submissions
 * 4. Filter by season if provided
 * 5. Batch get full Art entities
 * 6. Filter for is_virtual = true (constituent artworks only)
 * 7. Return paginated results
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

// Helper function to decode last_key
function decodeLastKey(encodedKey: string | undefined): Record<string, any> | undefined {
    if (!encodedKey) return undefined;
    try {
        return JSON.parse(Buffer.from(encodedKey, 'base64').toString('utf-8'));
    } catch {
        return undefined;
    }
}

// Helper function to encode last_key
function encodeLastKey(key: Record<string, any>): string {
    return Buffer.from(JSON.stringify(key)).toString('base64');
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
        let guardianUserId: string;
        let userRole: string;

        try {
            const result = await cognitoClient.send(new GetUserCommand({
                AccessToken: accessToken
            }));

            guardianUserId = result.Username!;
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

        // 3) Verify role >= guardian
        const roleHierarchy = ['user', 'guardian', 'contributor', 'admin'];
        const userRoleLevel = roleHierarchy.indexOf(userRole);
        const requiredRoleLevel = roleHierarchy.indexOf('guardian');

        if (userRoleLevel < requiredRoleLevel) {
            return CommonErrors.forbidden('Only guardians and above can access this endpoint');
        }

        // 4) Parse query parameters
        const season = event.queryStringParameters?.season;
        const limit = parseInt(event.queryStringParameters?.limit || '20');
        const lastKeyEncoded = event.queryStringParameters?.last_key;
        const exclusiveStartKey = decodeLastKey(lastKeyEncoded);

        // Validate limit
        if (limit < 1 || limit > 100) {
            return CommonErrors.badRequest('Limit must be between 1 and 100');
        }

        // 5) Query Art_Ptr entities
        const queryParams: any = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': `USER#${guardianUserId}`
            },
            Limit: limit * 2, // Get more to account for filtering
            ExclusiveStartKey: exclusiveStartKey
        };

        // Add season filter if provided
        if (season) {
            queryParams.KeyConditionExpression += ' AND begins_with(SK, :sk_prefix)';
            queryParams.ExpressionAttributeValues[':sk_prefix'] = `ART#${season}#`;
        } else {
            queryParams.KeyConditionExpression += ' AND begins_with(SK, :sk_prefix)';
            queryParams.ExpressionAttributeValues[':sk_prefix'] = 'ART#';
        }

        const queryResult = await dynamodb.send(new QueryCommand(queryParams));

        // 6) Extract art_ids from Art_Ptr entities
        const artPtrs = queryResult.Items || [];

        if (artPtrs.length === 0) {
            return {
                statusCode: HTTP_STATUS.OK,
                body: JSON.stringify({
                    artworks: [],
                    has_more: false
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS'
                }
            };
        }

        const artIds = artPtrs.map(ptr => ptr.art_id).filter(Boolean);

        // 7) Batch get Art entities
        const batchGetParams = {
            RequestItems: {
                [TABLE_NAME]: {
                    Keys: artIds.map((artId: string) => ({ PK: `ART#${artId}` }))
                }
            }
        };

        const batchResult = await dynamodb.send(new BatchGetCommand(batchGetParams));
        const artworks = batchResult.Responses?.[TABLE_NAME] || [];

        // 8) Filter for is_virtual = true (constituent artworks only)
        const constituentArtworks = artworks.filter((art: any) => art.is_virtual === true);

        // 9) Apply limit after filtering
        const paginatedArtworks = constituentArtworks.slice(0, limit);
        const hasMore = constituentArtworks.length > limit || !!queryResult.LastEvaluatedKey;

        // 10) Prepare response
        const response: any = {
            artworks: paginatedArtworks.map((art: any) => ({
                art_id: art.art_id?.replace('ART#', ''),
                season: art.season?.replace('SEASON#', ''),
                f_name: art.f_name,
                age: art.age,
                title: art.title,
                location: art.location,
                is_ai_gen: art.is_ai_gen,
                model: art.model,
                is_approved: art.is_approved,
                votes: art.votes,
                file_type: art.file_type,
                timestamp: art.timestamp
            })),
            has_more: hasMore
        };

        if (hasMore && queryResult.LastEvaluatedKey) {
            response.last_key = encodeLastKey(queryResult.LastEvaluatedKey);
        }

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify(response),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            }
        };

    } catch (error: any) {
        console.error('Error listing constituent artworks:', error);
        return CommonErrors.internalServerError('Failed to list constituent artworks');
    }
};
