import { GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { cognitoClient, dynamodb, sqsClient, TABLE_NAME, CLEANUP_QUEUE_URL } from '../../config/aws-clients';
import { ApiGatewayEvent, ApiGatewayResponse, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';

/**
 * Reject Artwork Handler
 *
 * Allows contributors to reject/revoke artwork by performing soft delete and triggering async cleanup.
 *
 * Implementation:
 * 1. Query ART entity to get user_id, season, email
 * 2. TransactWriteCommand:
 *    - Update ART entity: SET is_deleted=true, deleted_at, deleted_by, deletion_reason
 *    - Create ADMIN_ACTION entity for audit logging
 * 3. Send SQS message to trigger async cleanup (S3, Art_Ptr, email)
 * 4. Return success immediately
 *
 * Authorization: contributor+ roles only
 * Request Body:
 *   - art_id: string (required)
 *   - reason: string (required, reason for rejection)
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
        let contributorId: string;

        try {
            const result = await cognitoClient.send(new GetUserCommand({
                AccessToken: accessToken
            }));

            const attributes = result.UserAttributes || [];
            userRole = attributes.find(attr => attr.Name === 'custom:role')?.Value || 'user';
            contributorId = result.Username || '';
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
            return CommonErrors.forbidden('Only contributors and above can reject artworks');
        }

        // 4) Parse request body
        if (!event.body) {
            return CommonErrors.badRequest('Request body is required');
        }

        let requestData: { art_id: string; reason: string };
        try {
            requestData = JSON.parse(event.body);
        } catch (error) {
            return CommonErrors.badRequest('Invalid JSON in request body');
        }

        const { art_id, reason } = requestData;

        // 5) Validate art_id and reason
        if (!art_id || typeof art_id !== 'string' || art_id.trim() === '') {
            return CommonErrors.badRequest('art_id is required and must be a non-empty string');
        }

        if (!reason || typeof reason !== 'string' || reason.trim() === '') {
            return CommonErrors.badRequest('reason is required and must be a non-empty string');
        }

        // 6) Query ART entity to get user_id, season, email
        let artworkItem: any;
        try {
            const getResult = await dynamodb.send(new GetCommand({
                TableName: TABLE_NAME,
                Key: {
                    PK: `ART#${art_id}`,
                    SK: 'N/A'
                }
            }));

            if (!getResult.Item) {
                return CommonErrors.notFound('Artwork not found');
            }

            artworkItem = getResult.Item;

            // Check if already deleted
            if (artworkItem.is_deleted === true) {
                return CommonErrors.badRequest('Artwork is already deleted');
            }
        } catch (getError: any) {
            console.error('DynamoDB get error:', getError);
            throw getError;
        }

        const userId = artworkItem.user_id;
        const season = artworkItem.season;
        const userEmail = artworkItem.email || '';

        if (!userId || !season) {
            console.error('Missing user_id or season in artwork:', artworkItem);
            return CommonErrors.internalServerError('Artwork data is incomplete');
        }

        // 7) Perform TransactWriteCommand: soft delete + create ADMIN_ACTION
        const timestamp = Date.now();

        try {
            await dynamodb.send(new TransactWriteCommand({
                TransactItems: [
                    // Update ART entity: soft delete
                    {
                        Update: {
                            TableName: TABLE_NAME,
                            Key: {
                                PK: `ART#${art_id}`,
                                SK: 'N/A'
                            },
                            UpdateExpression: 'SET is_deleted = :true, deleted_at = :timestamp, deleted_by = :contributor_id, deletion_reason = :reason',
                            ConditionExpression: 'attribute_exists(PK) AND (attribute_not_exists(is_deleted) OR is_deleted = :false)',
                            ExpressionAttributeValues: {
                                ':true': true,
                                ':timestamp': timestamp,
                                ':contributor_id': contributorId,
                                ':reason': reason,
                                ':false': false
                            }
                        }
                    },
                    // Create ADMIN_ACTION entity
                    {
                        Put: {
                            TableName: TABLE_NAME,
                            Item: {
                                PK: `USER#${userId}`,
                                SK: `ADMIN_ACTION#${timestamp}`,
                                target_user_id: userId,
                                done_by: contributorId,
                                action: 'reject',
                                reason: reason,
                                art_id: art_id,
                                timestamp: timestamp,
                                type: 'ADMIN_ACTION'
                            }
                        }
                    }
                ]
            }));
        } catch (transactError: any) {
            console.error('DynamoDB transaction error:', transactError);
            if (transactError.name === 'TransactionCanceledException') {
                // Check if artwork was already deleted
                return CommonErrors.badRequest('Artwork is already deleted or does not exist');
            }
            throw transactError;
        }

        // 8) Send SQS message for async cleanup
        const cleanupMessage = {
            art_id,
            user_id: userId,
            season,
            email: userEmail,
            contributor_id: contributorId,
            reason,
            timestamp
        };

        try {
            await sqsClient.send(new SendMessageCommand({
                QueueUrl: CLEANUP_QUEUE_URL,
                MessageBody: JSON.stringify(cleanupMessage),
                MessageAttributes: {
                    'action': {
                        DataType: 'String',
                        StringValue: 'cleanup_rejected_artwork'
                    }
                }
            }));
        } catch (sqsError: any) {
            // Log SQS error but don't fail the request
            // The soft delete has succeeded, cleanup can be retried manually
            console.error('SQS send error (non-fatal):', sqsError);
        }

        // 9) Return success response
        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify({
                success: true,
                message: 'Artwork rejected successfully',
                art_id: art_id,
                user_id: userId,
                is_deleted: true,
                cleanup_queued: true
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            }
        };

    } catch (error: any) {
        console.error('Error rejecting artwork:', error);
        return CommonErrors.internalServerError('Failed to reject artwork');
    }
};
