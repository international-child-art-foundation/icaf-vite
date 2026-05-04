/**
 * Donation / Payment Types
 *
 * Types for PAYMENT entities. Payments are processed externally (Stripe) and
 * recorded here via webhook. The backend does not initiate charges.
 *
 * DynamoDB PAYMENT entity key structure:
 *   PK = USER#<user_id>   (USER#ANON for anonymous/unlinked donations)
 *   SK = PAYMENT#<payment_id>   (payment_id = Stripe charge/payment_intent ID)
 *
 * GSI attributes: none — addressable by user_id directly.
 * To look up donations by email pre-account-linking, query EmailGSI then PAYMENT SK.
 */

// Full PAYMENT entity as stored in DynamoDB
export interface PaymentEntity {
    user_id: string;            // USER#<user_id> or USER#ANON
    payment_id: string;         // Stripe ID (payment_intent or charge ID)
    payment_service: 'stripe';
    email?: string;             // stored to allow future account linking
    amount_cents: number;
    currency: string;           // e.g. 'USD', 'EUR'
    timestamp: number;          // Unix timestamp (seconds)
    type: 'PAYMENT';
}

// Admin-facing donation item in list responses
export interface PaymentListItem {
    user_id: string;
    payment_id: string;
    payment_service: 'stripe';
    email?: string;
    amount_cents: number;
    currency: string;
    timestamp: number;
}

export interface ListPaymentsResponse {
    payments: PaymentListItem[];
    total_amount_cents: number;
    count: number;
    has_more: boolean;
    last_key?: string;
}

// User-facing view of their own payments
export interface UserPaymentItem {
    payment_id: string;
    amount_cents: number;
    currency: string;
    timestamp: number;
}

export interface ListUserPaymentsResponse {
    payments: UserPaymentItem[];
    has_more: boolean;
    last_key?: string;
}
