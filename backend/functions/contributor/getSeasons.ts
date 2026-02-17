import { GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { cognitoClient, dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, ApiGatewayResponse, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';

/**
 * Get Seasons Handler
 *
 * Allows contributors to fetch all seasons or only active seasons.
 * Queries SEASON entities from DynamoDB.
 *
 * Authorization: contributor+ roles only
 * Query Parameters:
 *   - active_only: boolean (optional, default false) - only return active seasons
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

// Season entity interface
interface SeasonEntity {
    season: string;
    colloq_name: string;
    is_active: boolean;
    start_date: string;
    end_date: string;
    payment_required: boolean;
    max_user_submissions: number;
    can_vote: boolean;
    total_votes: number;
}

// Helper function to format DynamoDB item as SeasonEntity
function formatSeasonEntity(item: any): SeasonEntity {
    return {
        season: item.season,
        colloq_name: item.colloq_name,
        is_active: item.is_active || false,
        start_date: item.start_date,
        end_date: item.end_date,
        payment_required: item.payment_required || false,
        max_user_submissions: item.max_user_submissions || 1,
        can_vote: item.can_vote || false,
        total_votes: item.total_votes || 0
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
            return CommonErrors.forbidden('Only contributors and above can fetch seasons');
        }

        // 4) Parse query parameters
        const queryParams = event.queryStringParameters || {};
        const activeOnly = queryParams.active_only === 'true';

        // 5) Query all SEASON entities
        const queryInput: any = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': 'SEASON'
            }
        };

        let queryResult;
        try {
            queryResult = await dynamodb.send(new QueryCommand(queryInput));
        } catch (queryError: any) {
            console.error('DynamoDB query error:', queryError);
            throw queryError;
        }

        const items = queryResult.Items || [];
        let seasons: SeasonEntity[] = items.map(item => formatSeasonEntity(item));

        // 6) Filter by active_only if requested
        if (activeOnly) {
            seasons = seasons.filter(season => season.is_active === true);
        }

        // 7) Sort seasons: active first, then by start_date descending (newest first)
        seasons.sort((a, b) => {
            // Active seasons first
            if (a.is_active !== b.is_active) {
                return a.is_active ? -1 : 1;
            }
            // Within same active status, sort by start_date descending
            const dateA = new Date(a.start_date).getTime();
            const dateB = new Date(b.start_date).getTime();
            return dateB - dateA;
        });

        // 8) Calculate summary statistics
        const hasActiveSeason = seasons.some(season => season.is_active);

        // 9) Return success response
        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify({
                seasons,
                count: seasons.length,
                has_active_season: hasActiveSeason
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            }
        };

    } catch (error: any) {
        console.error('Error fetching seasons:', error);
        return CommonErrors.internalServerError('Failed to fetch seasons');
    }
};
