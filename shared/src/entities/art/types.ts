/**
 * Artwork Types
 *
 * Types for ART entities, submission requests, and gallery responses.
 *
 * DynamoDB ART entity key structure:
 *   PK = ART#<art_id>
 *   SK = '-'
 *
 * GSI attributes written on creation (always):
 *   OWN_PK     = 'OWNER#<user_id>'
 *   OWN_SK     = 'TYPE#ART#TS#<unix_ts>#ID#<art_id>'
 *   REV_PK     = 'REVIEW'
 *   REV_SK     = 'STATUS#pending_review#TYPE#ART#TS#<unix_ts>#ID#<art_id>'
 *
 * GSI attributes written on approval (sparse — remove when hiding/rejecting):
 *   GALL_PK    = 'GALLERY'
 *   FAM_PK     = 'FAMILY#<theme_family>'                        (if themed)
 *   INST_PK    = 'FAMILY#<family>#INSTANCE#<instance>'         (if has instance)
 *   ART_GSI_SK = 'TS#<unix_ts>#ART#<art_id>'                  (shared by all 3 gallery GSIs)
 */

import { UPLOAD_FILE_TYPES } from './constants.js';

export type UploadFileType = typeof UPLOAD_FILE_TYPES[number];

// Possible artwork statuses.
// deleted_by_user → sparse GSI attrs removed; entry stays in DB as a soft-delete record.
export type ArtworkStatus =
    | 'pending_review'
    | 'approved'
    | 'hidden'
    | 'rejected'
    | 'deleted_by_user';

// How the artwork was submitted relative to the submitter's account
export type SubmitterRelationship = 'parent' | 'guardian' | 'teacher';

// Full ART entity as stored in DynamoDB
export interface ArtworkEntity {
    // ── Required ───────────────────────────────────────────────────────────
    art_id: string;
    user_id: string;            // submitting user
    status: ArtworkStatus;
    kudos_count: number;
    ts: number;          // Unix ts (seconds)
    release_hash: string;       // SHA-256 hash of the legal release PDF text accepted at submission
    digital_signature?: string; // Submitter's typed signature captured at submission
    promotional_use: boolean;   // submitter opted into promotional/commercial use
    type: 'ART';
    notifications?: boolean;    // true when submitter opted into submission notifications

    // ── Optional ───────────────────────────────────────────────────────────
    f_name?: string;
    l_name?: string;
    age?: number;
    country?: string;
    region?: string;
    title?: string;
    description?: string;       // max ~300 words
    theme_family?: string;      // e.g. 'CHERRYBLOSSOM'
    theme_instance?: string;    // zero-padded 4-digit string, e.g. '2025'
    group_id?: string;          // GROUP#<gid> if part of a group submission
    submitter_relationship?: SubmitterRelationship;
}

// Artwork fields common to all submission flows
// file_type is used only to generate the presigned S3 upload URL; not stored on the entity
interface ArtworkSubmissionFields {
    art_id: string;
    file_type: UploadFileType;
    release_hash: string;
    digital_signature?: string;
    promotional_use?: boolean;
    title?: string;
    description?: string;
    f_name?: string;
    l_name?: string;
    age?: number;
    country?: string;
    region?: string;
    submitter_relationship?: SubmitterRelationship;
    theme_family?: string;
    theme_instance?: string;
    group_id?: string;
    notifications?: boolean;
}

// Request body for authenticated artwork submission (POST /user/artworks)
// Identity comes from the auth token — no email/user_id needed in the body
export type SubmitArtworkRequest = ArtworkSubmissionFields;

// Request body for guest artwork submission (POST /anyone/artworks)
// Caller provides either email (new guest or email lookup) or user_id (returning guest
// who already has a virtual account saved locally). Exactly one must be present.
export type GuestSubmitArtworkRequest = ArtworkSubmissionFields & (
    | { email: string; user_id?: never }
    | { user_id: string; email?: never }
);

export interface SubmitArtworkResponse {
    success: boolean;
    art_id: string;
    message: string;
}

export interface CreateArtworkUploadRequest {
    file_type: UploadFileType;
}

export interface CreateArtworkUploadResponse {
    success: true;
    art_id: string;
    presigned_url: string;
    message: string;
}

export interface GetArtworkResponse {
    artwork: Omit<ArtworkEntity, 'digital_signature' | 'digital_signature_hash'>;
}

// Shape used in list and gallery responses (subset of ArtworkEntity)
export interface ArtworkListItem {
    art_id: string;
    f_name?: string;
    l_name?: string;
    age?: number;
    country?: string;
    region?: string;
    title?: string;
    description?: string;
    theme_family?: string;
    theme_instance?: string;
    group_id?: string;
    status: ArtworkStatus;
    kudos_count: number;
    ts: number;
    promotional_use: boolean;
    notifications?: boolean;
    submitter_relationship?: SubmitterRelationship;
}

export interface ListArtworkSubmissionsResponse {
    artworks: ArtworkListItem[];
    has_more: boolean;
    last_key?: string;
}

export interface ListConstituentArtworksRequest {
    limit?: number;
    last_key?: string;
}

export interface ListConstituentArtworksResponse {
    artworks: ArtworkListItem[];
    has_more: boolean;
    last_key?: string;
}

// Request body for updating an owned artwork (PATCH /user/artworks/{art_id})
// All fields optional — only provided fields are written. Always triggers re-review.
export interface UpdateArtworkRequest {
    title?: string;
    description?: string;
    f_name?: string;
    l_name?: string;
    age?: number;
    country?: string;
    region?: string;
    submitter_relationship?: SubmitterRelationship;
    theme_family?: string;
    theme_instance?: string;
    notifications?: boolean;
}

export interface SubmitArtworkToGroupRequest {
    art_id: string;
    file_type: UploadFileType;
    release_hash: string;
    digital_signature?: string;
    promotional_use?: boolean;
    f_name?: string;
    l_name?: string;
    age?: number;
    country?: string;
    region?: string;
    title?: string;
    description?: string;
    submitter_relationship?: SubmitterRelationship;
    theme_family?: string;
    theme_instance?: string;
    notifications?: boolean;
}

export type UpdateConstituentArtworkRequest = UpdateArtworkRequest;

export interface UpdateArtworkResponse {
    success: true;
    art_id: string;
    status: 'pending_review';
}

export interface VoteArtworkResponse {
    success: true;
    art_id: string;
    kudos_count?: number;
}

export interface DeleteAllArtworksResponse {
    success: true;
    artworks_deleted: number;
    total_deleted: number;
}

export interface ReviewArtworkQueueResponse {
    artworks: ArtworkListItem[];
    has_more: boolean;
    last_key?: string;
}

export interface ChangeArtworkStatusRequest {
    status: Extract<ArtworkStatus, 'approved' | 'hidden' | 'rejected'>;
}

export interface ChangeArtworkStatusResponse {
    success: true;
    art_id: string;
    status: Extract<ArtworkStatus, 'approved' | 'hidden' | 'rejected'>;
}
