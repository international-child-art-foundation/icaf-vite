import { QueryCommand } from '@aws-sdk/lib-dynamodb';
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

        // 3) Query donations for this user
        const donationQueryParams = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':sk': 'DONATION#'
            },
            Limit: limit,
            ScanIndexForward: false, // Most recent first
            ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey })
        };

        const donationResult = await dynamodb.send(new QueryCommand(donationQueryParams));
        const donations = donationResult.Items || [];

        // 4) Format donations
        const formattedDonations = donations.map(donation => ({
            donation_id: donation.donation_id || '',
            amount_cent: donation.amount_cents || 0,
            currency: donation.currency || 'USD',
            status: donation.status || 'pending',
            timestamp: donation.timestamp || '',
            message: donation.message || '',
            anonymous: Boolean(donation.anonymous)
        }));

        // 5) Calculate summary
        const totalAmountCents = formattedDonations.reduce((sum, d) => sum + d.amount_cent, 0);
        const totalDonations = formattedDonations.length;

        // 6) Response
        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify({
                donations: formattedDonations,
                total_amount_cent: totalAmountCents,
                summary: {
                    total_donations: totalDonations,
                    currency: 'USD'
                },
                pagination: {
                    has_more: Boolean(donationResult.LastEvaluatedKey),
                    ...(donationResult.LastEvaluatedKey && {
                        last_evaluated_key: encodeURIComponent(JSON.stringify(donationResult.LastEvaluatedKey))
                    })
                }
            }),
            headers: { 'Content-Type': 'application/json' }
        };
    } catch (error: any) {
        console.error('Error listing donations:', error);
        return CommonErrors.internalServerError();
    }
};
