import { ScanCommand, GetCommand, BatchGetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';
import { AdminGetAllDonationsResponse, AdminDonationItem } from '../../../shared/src/api-types/donationTypes';

export const handler = async (event: ApiGatewayEvent) => {
    try {
        // 1) Admin Authentication Check
        const adminUserId = event.requestContext?.authorizer?.claims?.sub;
        if (!adminUserId) {
            return CommonErrors.unauthorized();
        }

        // Check if user has admin role
        const adminResult = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${adminUserId}`,
                SK: 'PROFILE'
            }
        }));

        const adminUser = adminResult.Item;
        if (!adminUser || adminUser.role !== 'admin') {
            return CommonErrors.forbidden('Admin access required');
        }

        // 2) Parse query parameters
        const qp = event.queryStringParameters || {};
        const limit = Math.min(Number.parseInt(String(qp.limit || '50'), 10) || 50, 100); // Max 100
        const lastEvaluatedKey = qp.last_evaluated_key
            ? JSON.parse(decodeURIComponent(String(qp.last_evaluated_key)))
            : undefined;

        // Optional filters
        const statusFilter = qp.status as string | undefined;
        const minAmount = qp.min_amount ? Number.parseInt(String(qp.min_amount), 10) : undefined;
        const maxAmount = qp.max_amount ? Number.parseInt(String(qp.max_amount), 10) : undefined;

        // 3) Build filter expression
        let filterExpression = '#type = :type';
        const expressionAttributeNames: Record<string, string> = {
            '#type': 'type'
        };
        const expressionAttributeValues: Record<string, any> = {
            ':type': 'DONATION'
        };

        // Add status filter if provided
        if (statusFilter) {
            filterExpression += ' AND #status = :status';
            expressionAttributeNames['#status'] = 'status';
            expressionAttributeValues[':status'] = statusFilter;
        }

        // Add amount range filters
        if (minAmount !== undefined) {
            filterExpression += ' AND amount_cents >= :minAmount';
            expressionAttributeValues[':minAmount'] = minAmount;
        }
        if (maxAmount !== undefined) {
            filterExpression += ' AND amount_cents <= :maxAmount';
            expressionAttributeValues[':maxAmount'] = maxAmount;
        }

        // 4) Scan DynamoDB for all donations
        const scanParams = {
            TableName: TABLE_NAME,
            FilterExpression: filterExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            Limit: limit,
            ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey })
        };

        const scanResult = await dynamodb.send(new ScanCommand(scanParams));
        const donations = scanResult.Items || [];

        // 5) Get user information for non-anonymous donations
        // Collect unique user IDs
        const userIds = Array.from(new Set(
            donations
                .filter(d => !d.anonymous && d.user_id)
                .map(d => d.user_id)
        )) as string[];

        // Batch get user profiles (max 100 at a time)
        const userProfiles: Record<string, any> = {};
        if (userIds.length > 0) {
            const BATCH_SIZE = 100;
            for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
                const batchUserIds = userIds.slice(i, i + BATCH_SIZE);
                const keys = batchUserIds.map(userId => ({
                    PK: `USER#${userId}`,
                    SK: 'PROFILE'
                }));

                try {
                    const batchResult = await dynamodb.send(new BatchGetCommand({
                        RequestItems: {
                            [TABLE_NAME]: {
                                Keys: keys
                            }
                        }
                    }));

                    const responses = batchResult.Responses?.[TABLE_NAME] || [];
                    responses.forEach(user => {
                        if (user.user_id) {
                            userProfiles[user.user_id] = user;
                        }
                    });
                } catch (error) {
                    console.error('Failed to batch get user profiles:', error);
                    // Continue without user names
                }
            }
        }

        // 6) Format donations
        const formattedDonations: AdminDonationItem[] = donations.map(donation => {
            const item: AdminDonationItem = {
                donation_id: donation.donation_id || '',
                user_id: donation.user_id || '',
                amount_cents: donation.amount_cents || 0,
                currency: donation.currency || 'USD',
                status: donation.status || 'pending',
                timestamp: donation.timestamp || '',
                anonymous: Boolean(donation.anonymous)
            };

            // Add optional fields
            if (donation.stripe_id) {
                item.stripe_id = donation.stripe_id;
            }
            if (donation.message) {
                item.message = donation.message;
            }

            // Add donor name if not anonymous and user profile exists
            if (!donation.anonymous && donation.user_id && userProfiles[donation.user_id]) {
                const user = userProfiles[donation.user_id];
                item.donor_name = `${user.f_name || ''} ${user.l_name || ''}`.trim();
            }

            return item;
        });

        // 7) Calculate summary statistics
        const totalDonations = formattedDonations.length;
        const totalAmountCents = formattedDonations.reduce((sum, d) => sum + d.amount_cents, 0);

        const succeededDonations = formattedDonations.filter(d => d.status === 'succeeded');
        const succeededCount = succeededDonations.length;
        const succeededAmountCents = succeededDonations.reduce((sum, d) => sum + d.amount_cents, 0);

        const pendingCount = formattedDonations.filter(d => d.status === 'pending').length;
        const failedCount = formattedDonations.filter(d => d.status === 'failed').length;

        // 8) Build response
        const response: AdminGetAllDonationsResponse = {
            donations: formattedDonations,
            summary: {
                total_donations: totalDonations,
                total_amount_cents: totalAmountCents,
                succeeded_count: succeededCount,
                succeeded_amount_cents: succeededAmountCents,
                pending_count: pendingCount,
                failed_count: failedCount
            },
            pagination: {
                has_more: Boolean(scanResult.LastEvaluatedKey),
                ...(scanResult.LastEvaluatedKey && {
                    last_evaluated_key: encodeURIComponent(JSON.stringify(scanResult.LastEvaluatedKey))
                })
            }
        };

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
        console.error('Error in getAllDonations handler:', error);
        return CommonErrors.internalServerError('Failed to retrieve donations');
    }
};
