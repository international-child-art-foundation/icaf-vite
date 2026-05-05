/**
 * Account Action Types
 *
 * Types for ACCOUNT_ACTION entities — an audit log of contributor/admin actions
 * taken on user accounts and their content.
 *
 * DynamoDB ACCOUNT_ACTION entity key structure:
 *   PK = USER#<user_id>     (the user being acted upon)
 *   SK = AA#<unix_timestamp>
 */

export type AccountActionType =
    | 'ban'
    | 'unban'
    | 'reject_artwork'
    | 'reject_group'
    | 'waive_payment'
    | 'delete_artwork'
    | 'change_password'
    | 'hide_artwork'
    | 'hide_artwork_bulk'
    | 'hide_group'
    | 'hide_all';

// Full ACCOUNT_ACTION entity as stored in DynamoDB
export interface AccountActionEntity {
    user_id: string;                // target user (from PK)
    timestamp: number;              // Unix timestamp (from SK)
    initiator_id?: string;          // blank if initiator === target user
    action: AccountActionType;
    reason?: string;                // required for some actions (contributor-only)
    target_user_id?: string;        // if a bulk action was taken, the affected user ID
    art_id?: string;                // include where applicable
    group_id?: string;              // include where applicable
    type: 'ACCOUNT_ACTION';
}
