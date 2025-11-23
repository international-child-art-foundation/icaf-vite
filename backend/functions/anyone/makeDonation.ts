/**
 * Make Donation Handler
 * 
 * Handles POST requests from Every.org webhook when donations occur:
 * - /api/donations
 * 
 * DynamoDB Operations:
 * - DDB Write: Create DONATION entity (PK=USER#<uid> OR USER#ANON, SK=DONATION#<donation_id>)
 * - DDB Write: Update USER entity (PK=USER#<uid>, SK=PROFILE) - set has_paid=true if conditions met
 * 
 * Every.org Integration:
 * - Receives webhook events from Every.org when donations are successful
 * - Updates database with donation information
 * - Handles both authenticated and anonymous donations
 */

import { PutCommand, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';
import {
    EveryOrgDonationEvent,
    DonationEntity,
    DonationResponse,
    isValidDonationEvent,
    isValidDonationStatus,
    shouldProcessDonation
} from '../../../shared/src/api-types/donationTypes';



export const handler = async (event: ApiGatewayEvent): Promise<{
    statusCode: number;
    body: string;
    headers: Record<string, string>;
}> => {
    try {
        // 1. Validate HTTP method
        if (event.httpMethod !== 'POST') {
            return CommonErrors.methodNotAllowed();
        }

        // 2. Parse and validate request body
        if (!event.body) {
            return CommonErrors.badRequest('Request body is required');
        }

        let donationEvent: EveryOrgDonationEvent;
        try {
            donationEvent = JSON.parse(event.body);
        } catch (error) {
            return CommonErrors.badRequest('Invalid JSON in request body');
        }

        // 3. Validate donation event structure
        if (!isValidDonationEvent(donationEvent)) {
            return CommonErrors.badRequest('Invalid donation event structure');
        }

        // 4. Validate donation status
        if (!isValidDonationStatus(donationEvent.status)) {
            return CommonErrors.badRequest('Invalid donation status');
        }

        // 5. Only process completed donations
        if (!shouldProcessDonation(donationEvent.status)) {
            return {
                statusCode: HTTP_STATUS.OK,
                body: JSON.stringify({
                    message: 'Donation not completed, skipping processing',
                    status: donationEvent.status
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            };
        }

        // 6. Determine user ID (anonymous or authenticated)
        const userId = donationEvent.donor_id || 'ANON';
        const isAnonymous = !donationEvent.donor_id;

        // 7. Create DONATION entity
        const donationEntity: DonationEntity = {
            donation_id: donationEvent.donation_id,
            amount_cents: donationEvent.amount_cents,
            currency: donationEvent.currency || 'USD',
            status: donationEvent.status,
            donor_id: donationEvent.donor_id,
            donor_email: donationEvent.donor_email,
            message: donationEvent.message,
            anonymous: donationEvent.anonymous,
            timestamp: donationEvent.timestamp,
            campaign_id: donationEvent.campaign_id,
            transaction_id: donationEvent.transaction_id,
            type: 'DONATION'
        };

        const donationKey = {
            PK: `USER#${userId}`,
            SK: `DONATION#${donationEvent.donation_id}`
        };

        await dynamodb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                ...donationKey,
                ...donationEntity
            }
        }));

        // 8. Update USER entity if not anonymous and conditions are met
        if (!isAnonymous) {
            await updateUserProfile(userId, donationEvent.amount_cents, donationEvent.timestamp);
        }

        // 9. Return success response
        const response: DonationResponse = {
            message: 'Donation processed successfully',
            donation_id: donationEvent.donation_id,
            amount_cents: donationEvent.amount_cents,
            user_id: userId,
            anonymous: isAnonymous
        };

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify(response),
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        };

    } catch (error: any) {
        console.error('Error processing donation:', {
            error: error.message,
            stack: error.stack,
            event: {
                httpMethod: event.httpMethod,
                hasBody: !!event.body,
                bodyLength: event.body?.length || 0
            }
        });
        return CommonErrors.internalServerError('Internal server error while processing donation');
    }
};

/**
 * Update user profile with donation information
 */
async function updateUserProfile(userId: string, amountCents: number, timestamp: string): Promise<void> {
    try {
        // Get current user profile
        const userKey = {
            PK: `USER#${userId}`,
            SK: 'PROFILE'
        };

        const userResult = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: userKey
        }));

        const currentProfile = userResult.Item;
        const currentTotalDonations = currentProfile?.total_donations_cents || 0;
        const newTotalDonations = currentTotalDonations + amountCents;

        // Determine if user should have has_paid=true
        // This logic can be customized based on your business requirements
        const shouldHavePaid = determineIfUserShouldHavePaid(newTotalDonations);

        // Update user profile
        const updateParams: any = {
            TableName: TABLE_NAME,
            Key: userKey,
            UpdateExpression: 'SET total_donations_cents = :total, last_donation_timestamp = :timestamp',
            ExpressionAttributeValues: {
                ':total': newTotalDonations,
                ':timestamp': timestamp
            }
        };

        // Add has_paid update if needed
        if (shouldHavePaid) {
            updateParams.UpdateExpression += ', has_paid = :has_paid';
            updateParams.ExpressionAttributeValues[':has_paid'] = true;
        }

        await dynamodb.send(new UpdateCommand(updateParams));

        console.log(`Updated user profile for ${userId}: total_donations_cents=${newTotalDonations}, has_paid=${shouldHavePaid}`);

    } catch (error: any) {
        console.error(`Error updating user profile for ${userId}:`, error);
        // Don't throw error - donation was already recorded
    }
}

/**
 * Determine if user should have has_paid=true based on total donations
 * This is a placeholder function - customize based on your business logic
 */
function determineIfUserShouldHavePaid(totalDonationsCents: number): boolean {
    // Example: User needs to donate at least $10 to have has_paid=true
    const MINIMUM_PAYMENT_CENTS = 1000; // $10.00
    return totalDonationsCents >= MINIMUM_PAYMENT_CENTS;
}
