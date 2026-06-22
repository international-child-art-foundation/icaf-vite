/**
 * Takedown Request Types
 *
 * Types for TAKEDOWN_REQUEST (TDR) entities.
 * These represent DMCA-style content removal requests submitted by anyone.
 *
 * DynamoDB TDR entity key structure:
 *   PK = 'TDR'
 *   SK = 'TS#<unix_ts>#TDR_ID#<tdr_id>'
 */

export type TakedownStatus =
    | 'requesting'  // pending — will auto-execute at scheduled_execution_at
    | 'disputing'   // contributor extended the window
    | 'executed'    // artwork/group has been hidden and S3 objects tagged
    | 'canceled';   // contributor dismissed the request

// Full TDR entity as stored in DynamoDB
export interface TakedownRequestEntity {
    // PK = 'TDR', SK = 'TS#<unix_ts>#TDR_ID#<tdr_id>'
    tdr_id: string;
    ts: number;              // Unix ts (seconds); duplicated from SK
    status: TakedownStatus;
    art_id?: string;                // target artwork (or group, or both)
    group_id?: string;              // target group
    requester_email: string;
    requester_name: string;
    reason: string;
    scheduled_execution_at: number; // Unix ts — auto-execute deadline
    reviewed_by?: string;           // user_id of reviewer (contributor/admin)
    reviewed_at?: number;           // Unix ts of review
    review_notes?: string;
    type: 'TAKEDOWN_REQUEST';
}

// Request body for initiating a takedown (POST /takedown) — anyone can submit
export interface InitiateTakedownRequest {
    art_id?: string;
    group_id?: string;
    requester_email: string;
    requester_name: string;
    reason: string;
}

export interface InitiateTakedownResponse {
    success: boolean;
    tdr_id: string;
    message: string;
    scheduled_execution_at: number;
}

// Admin/contributor response shape for review list
export interface TakedownRequestListItem {
    tdr_id: string;
    tdr_sk: string;
    ts: number;
    status: TakedownStatus;
    art_id?: string;
    group_id?: string;
    requester_email: string;
    requester_name: string;
    reason: string;
    scheduled_execution_at: number;
    reviewed_by?: string;
    reviewed_at?: number;
    review_notes?: string;
}

export interface ListTakedownRequestsResponse {
    requests: TakedownRequestListItem[];
    has_more: boolean;
    last_key?: string;
}

// Request to cancel, dispute, or execute a takedown (admin)
export interface ReviewTakedownRequest {
    action: 'cancel' | 'dispute' | 'execute';
    review_notes?: string;
}

export interface ReviewTakedownResponse {
    success: true;
    tdr_sk: string;
    status: Extract<TakedownStatus, 'canceled' | 'disputing' | 'executed'>;
    affected_art_ids?: string[];
    affected_group_ids?: string[];
    tagged_object_count?: number;
}
