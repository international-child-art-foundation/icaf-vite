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
export type SubmitterRelationship = 'self' | 'parent' | 'guardian' | 'teacher';

// Full ART entity as stored in DynamoDB
export interface ArtworkEntity {
    // ── Required ───────────────────────────────────────────────────────────
    art_id: string;
    user_id: string;            // submitting user (guardian if is_virtual)
    is_virtual: boolean;        // true = artist has no account (guardian-submitted)
    status: ArtworkStatus;
    kudos_count: number;
    timestamp: number;          // Unix timestamp (seconds)
    legal_release_hash: string; // SHA-256 hash of the legal release PDF text accepted at submission
    type: 'ART';

    // ── Optional ───────────────────────────────────────────────────────────
    f_name?: string;
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

// Request body for submitting artwork (POST /user/artworks)
// file_type is used only to generate the presigned S3 upload URL; not stored on entity
export interface SubmitArtworkRequest {
    title?: string;
    description?: string;
    f_name?: string;
    age?: number;
    country?: string;
    region?: string;
    is_virtual: boolean;
    submitter_relationship?: SubmitterRelationship;
    theme_family?: string;
    theme_instance?: string;
    group_id?: string;
    legal_release_hash: string;
}

export interface SubmitArtworkResponse {
    success: boolean;
    art_id: string;
    presigned_url: string;
    message: string;
}

// Shape used in list and gallery responses (subset of ArtworkEntity)
export interface ArtworkListItem {
    art_id: string;
    f_name?: string;
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
    timestamp: number;
    is_virtual: boolean;
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
