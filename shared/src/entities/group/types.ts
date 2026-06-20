/**
 * Group Types
 *
 * Types for GROUP entities — collections of artworks submitted together,
 * e.g. a classroom set or a festival bundle.
 *
 * DynamoDB GROUP entity key structure:
 *   PK = GROUP#<group_id>
 *   SK = '-'
 *
 * GSI attributes written on creation (always):
 *   OWN_PK     = 'OWNER#<user_id>'
 *   OWN_SK     = 'TYPE#GROUP#TS#<unix_ts>#ID#<group_id>'
 *   REV_PK     = 'REVIEW'
 *   REV_SK     = 'STATUS#pending_review#TYPE#GROUP#TS#<unix_ts>#ID#<group_id>'
 *
 * GSI attributes written on approval (sparse — remove when hiding/rejecting):
 *   GRP_PK     = 'GROUPS'
 *   FGRP_PK    = 'GROUPS#FAMILY#<theme_family>'                   (if themed)
 *   IGRP_PK    = 'GROUPS#FAMILY#<family>#<instance_type>#<instance>' (if has instance)
 *   GRP_GSI_SK = 'TS#<unix_ts>#ID#<group_id>'                     (shared by all 3 group GSIs)
 */

import type { SubmitArtworkToGroupRequest } from '../art/types.js';

export type GroupStatus =
    | 'pending_review'
    | 'approved'
    | 'hidden'
    | 'rejected'
    | 'deleted_by_user';

// Extensible group type string — assigned by frontend at submission time
export type GroupType = 'classroom' | 'festival' | 'volunteer_bundle' | string;

// Full GROUP entity as stored in DynamoDB
export interface GroupEntity {
    // ── Required ───────────────────────────────────────────────────────────
    group_id: string;
    user_id: string;                // USER#<user_id> of the submitting user
    group_type: GroupType;
    status: GroupStatus;
    member_art_ids: string[];       // ordered list of art_ids (max ~50)
    ts: number;              // Unix ts (seconds)
    type: 'GROUP';
    notifications?: boolean;        // true when owner opted into group submission notifications

    // ── Optional ───────────────────────────────────────────────────────────
    theme?: string;                 // THEME SK, e.g. FAMILY#CHERRY_BLOSSOM#year#2026
    title?: string;
    class_name?: string;            // e.g. 'BIO 1017'
    submitter_display_name?: string; // may differ from owner's account name
    country?: string;
    region?: string;
    description?: string;
}

// Request body to create a new group (POST /user/groups)
export interface SubmitGroupRequest {
    theme?: string;
    group_type: GroupType;
    title: string;
    class_name?: string;
    submitter_display_name?: string;
    country?: string;
    region?: string;
    description?: string;
    notifications?: boolean;
}

export interface SubmitGroupResponse {
    success: boolean;
    group_id: string;
    message: string;
    ts: number;
}

export type CreateGroupArtworkRequest = SubmitArtworkToGroupRequest;

export type CreateGroupBaseRequest = SubmitGroupRequest & {
    artworks: CreateGroupArtworkRequest[];
};

export type GuestCreateGroupRequest = CreateGroupBaseRequest & {
    email: string;
    submitter_first_name: string;
    submitter_last_name: string;
};

// Identity comes from auth cookies.
export type AuthenticatedCreateGroupRequest = CreateGroupBaseRequest & {
    email?: never;
};

export type CreateGroupRequest = GuestCreateGroupRequest | AuthenticatedCreateGroupRequest;

export interface GetGroupResponse {
    group: GroupEntity;
}

// Shape used in list and gallery responses
export interface GroupListItem {
    group_id: string;
    theme?: string;
    group_type: GroupType;
    title: string;
    class_name?: string;
    submitter_display_name?: string;
    country: string;
    region?: string;
    preview_art_ids: string[];
    member_count: number;
    status: GroupStatus;
    ts: number;
    notifications?: boolean;
}

export interface ListGroupSubmissionsResponse {
    groups: GroupListItem[];
    has_more: boolean;
    last_key?: string;
}

// Request to update group details (PATCH)
export interface UpdateGroupRequest {
    title?: string;
    description?: string;
    class_name?: string;
    submitter_display_name?: string;
    country?: string;
    region?: string;
    theme?: string;
    notifications?: boolean;
}

export interface UpdateGroupResponse {
    success: true;
    group_id: string;
    status: 'pending_review';
}

export interface ReviewGroupQueueResponse {
    groups: GroupListItem[];
    has_more: boolean;
    last_key?: string;
}

export interface ChangeGroupStatusRequest {
    status: Extract<GroupStatus, 'approved' | 'hidden' | 'rejected'>;
}

export interface ChangeGroupStatusResponse {
    success: true;
    group_id: string;
    status: Extract<GroupStatus, 'approved' | 'hidden' | 'rejected'>;
}

export interface AdminUpdateGroupResponse {
    success: true;
    group_id: string;
    status: GroupStatus;
}
