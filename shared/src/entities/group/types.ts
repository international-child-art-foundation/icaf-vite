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
 *   FGRP_PK    = 'GROUPS#FAMILY#<theme_family>'                    (if themed)
 *   IGRP_PK    = 'GROUPS#FAMILY#<family>#INSTANCE#<instance>'      (if has instance)
 *   GRP_GSI_SK = 'TS#<unix_ts>#ID#<group_id>'                     (shared by all 3 group GSIs)
 */

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
    cover_art_ids: string[];        // 3–4 art_ids for gallery card thumbnails; may be []
    timestamp: number;              // Unix timestamp (seconds)
    type: 'GROUP';

    // ── Optional ───────────────────────────────────────────────────────────
    theme_family?: string;          // e.g. 'CHERRYBLOSSOM'
    theme_instance?: string;        // zero-padded 4-digit string, e.g. '2025'
    title?: string;
    class_name?: string;            // e.g. 'BIO 1017'
    teacher_display_name?: string;  // may differ from owner's account name
    country?: string;
    region?: string;
    description?: string;
}

// Request body to create a new group (POST /user/groups)
export interface SubmitGroupRequest {
    theme_family?: string;
    theme_instance?: string;
    group_type: GroupType;
    title: string;
    class_name?: string;
    teacher_display_name?: string;
    country: string;
    region?: string;
    description?: string;
}

export interface SubmitGroupResponse {
    success: boolean;
    group_id: string;
    message: string;
    timestamp: number;
}

export interface GetGroupResponse {
    group: GroupEntity;
}

// Shape used in list and gallery responses
export interface GroupListItem {
    group_id: string;
    theme_family?: string;
    theme_instance?: string;
    group_type: GroupType;
    title: string;
    class_name?: string;
    teacher_display_name?: string;
    country: string;
    region?: string;
    cover_art_ids: string[];
    member_count: number;
    status: GroupStatus;
    timestamp: number;
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
    teacher_display_name?: string;
    theme_family?: string;
    theme_instance?: string;
    cover_art_ids?: string[];
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
