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
 *   FAM_PK     = 'FAMILY#<theme_family>'                       (if themed)
 *   INST_PK    = 'FAMILY#<family>#<instance_type>#<instance>'  (if has instance)
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
export type SubmitterRelationship = 'legal_guardian' | 'adult_facilitator';

// Full ART entity as stored in DynamoDB
export interface ArtworkEntity {
    // ── Required ───────────────────────────────────────────────────────────
    art_id: string;
    user_id: string;            // submitting user
    status: ArtworkStatus;
    kudos_count: number;
    ts: number;          // Unix ts (seconds)
    rev_num: number;     // Optimistic-lock revision; starts at 1
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
    theme?: string;             // THEME SK, e.g. FAMILY#CHERRY_BLOSSOM#year#2026
    group_id?: string;          // GROUP#<gid> if part of a group submission
    submitter_relationship?: SubmitterRelationship;
}

// Artwork fields common to all submission flows
// file_type is used only to generate the presigned S3 upload URL; not stored on the entity
interface ArtworkSubmissionFields {
    art_id: string;
    file_type: UploadFileType;
    digital_signature: string;
    promotional_use?: boolean;
    title?: string;
    description?: string;
    f_name?: string;
    l_name?: string;
    age?: number;
    country?: string;
    region?: string;
    submitter_relationship?: SubmitterRelationship;
    theme?: string;
    notifications?: boolean;
}

interface SubmitterIdentityFields {
    submitter_first_name: string;
    submitter_last_name: string;
}

// Request body for authenticated artwork submission (POST /user/artworks)
// Identity comes from the auth token — no email/user_id needed in the body
export type SubmitArtworkRequest = ArtworkSubmissionFields;

// Request body for guest artwork submission (POST /anyone/artworks).
// The server resolves an existing virtual user or creates one from the email.
export type GuestSubmitArtworkRequest = ArtworkSubmissionFields & SubmitterIdentityFields & {
    email: string;
};

export interface SubmitArtworkResponse {
    success: boolean;
    art_id: string;
    message: string;
}

export interface CreateArtworkUploadRequest {
    file_type: UploadFileType;
    file_size_bytes: number;
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
    theme?: string;
    group_id?: string;
    status: ArtworkStatus;
    kudos_count: number;
    ts: number;
    rev_num: number;
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
    theme?: string;
    notifications?: boolean;
}

export interface SubmitArtworkToGroupRequest {
    art_id: string;
    file_type: UploadFileType;
    digital_signature: string;
    promotional_use?: boolean;
    f_name?: string;
    l_name?: string;
    age?: number;
    country?: string;
    region?: string;
    title?: string;
    description?: string;
    submitter_relationship?: SubmitterRelationship;
    theme?: string;
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
    rev_num: number;
}

export interface ChangeArtworkStatusResponse {
    success: true;
    art_id: string;
    status: Extract<ArtworkStatus, 'approved' | 'hidden' | 'rejected'>;
}
