/**
 * Donation API Types
 * 
 * Defines types for donation-related API endpoints and
 * Every.org webhook integration.
 */

// Every.org webhook event structure
export interface EveryOrgDonationEvent {
    donation_id: string;
    amount_cents: number;
    currency: string;
    status: 'completed' | 'pending' | 'failed' | 'cancelled';
    donor_id?: string; // Optional - may not exist for anonymous donations
    donor_email?: string;
    message?: string;
    anonymous: boolean;
    timestamp: string;
    campaign_id?: string;
    transaction_id?: string;
}

// Donation entity structure for DynamoDB
export interface DonationEntity {
    donation_id: string;
    amount_cents: number;
    currency: string;
    status: string;
    donor_id?: string;
    donor_email?: string;
    message?: string;
    anonymous: boolean;
    timestamp: string;
    campaign_id?: string;
    transaction_id?: string;
    type: 'DONATION';
}

// Donation API response structure
export interface DonationResponse {
    message: string;
    donation_id: string;
    amount_cents: number;
    user_id: string;
    anonymous: boolean;
}

// Donation processing result
export interface DonationProcessingResult {
    success: boolean;
    donation_id: string;
    user_id: string;
    anonymous: boolean;
    amount_cents: number;
    has_paid_updated?: boolean;
    total_donations_cents?: number;
}

// Validation helper for donation events
export function isValidDonationEvent(event: any): event is EveryOrgDonationEvent {
    return (
        typeof event === 'object' &&
        event !== null &&
        typeof event.donation_id === 'string' &&
        typeof event.amount_cents === 'number' &&
        typeof event.status === 'string' &&
        typeof event.anonymous === 'boolean' &&
        typeof event.timestamp === 'string'
    );
}

// Validation helper for donation status
export function isValidDonationStatus(status: string): status is EveryOrgDonationEvent['status'] {
    return ['completed', 'pending', 'failed', 'cancelled'].includes(status);
}

// Check if donation is completed and should be processed
export function shouldProcessDonation(status: string): boolean {
    return status === 'completed';
}
