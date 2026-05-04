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
 *   OWN_PK    = 'OWNER#<user_id>'
 *   OWN_SK    = 'TYPE#ART#TS#<unix_ts>#ID#<art_id>'
 *   REV_PK    = 'REVIEW'
 *   REV_SK    = 'STATUS#pending_review#TYPE#ART#TS#<unix_ts>#ID#<art_id>'
 *
 * GSI attributes written on approval (sparse — remove when hiding/rejecting):
 *   GALL_PK   = 'GALLERY'
 *   FAM_PK    = 'FAMILY#<theme_family>'                        (if themed)
 *   INST_PK   = 'FAMILY#<family>#INSTANCE#<instance>'         (if has instance)
 *   ART_GSI_SK = 'TS#<unix_ts>#ART#<art_id>'                 (shared by all 3 gallery GSIs)
 *
 * Note: file_type is NOT stored on the entity. The processImage Lambda normalises
 * all uploads to .avif or .png. file_type is only used during submission to
 * generate a presigned S3 URL.
 */

export const UPLOAD_FILE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'] as const;
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
    // Prediction: f_name/age/country/title feel submission-essential but the
    // schema marks them optional — they may be absent for programmatic imports.
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

// Supported upload formats (sent by client for presigned URL generation only)
export function isValidUploadFileType(t: string): t is UploadFileType {
    return UPLOAD_FILE_TYPES.includes(t as UploadFileType);
}

// Request body for submitting artwork (POST /user/artworks)
// file_type is used only to generate the presigned S3 upload URL; not stored on entity
export interface SubmitArtworkRequest {
    file_type: UploadFileType;
    title: string;
    description?: string;
    f_name: string;
    age: number;
    country: string;
    region?: string;
    is_virtual: boolean;
    submitter_relationship?: SubmitterRelationship;
    theme_family?: string;
    theme_instance?: string;
    group_id?: string;
    legal_release_hash?: string;
    is_ai_generated: boolean;   // informational, stored if needed by future fields
}

export interface SubmitArtworkResponse {
    success: boolean;
    art_id: string;
    presigned_url: string;
    upload_expires_at: number;  // Unix timestamp
    message: string;
}

// Shape used in list and gallery responses (subset of ArtworkEntity)
export interface ArtworkListItem {
    art_id: string;
    f_name: string;
    age: number;
    country: string;
    region?: string;
    title: string;
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

// Guardian view of constituent artworks
export interface ListConstituentArtworksRequest {
    limit?: number;
    last_key?: string;
}

export interface ListConstituentArtworksResponse {
    artworks: ArtworkListItem[];
    has_more: boolean;
    last_key?: string;
}

// Validation
export function validateSubmissionData(data: SubmitArtworkRequest): string[] {
    const errors: string[] = [];

    if (!data.title?.trim()) {
        errors.push('title is required');
    } else if (data.title.length > 200) {
        errors.push('title must be 200 characters or less');
    }

    if (!isValidUploadFileType(data.file_type)) {
        errors.push(`file_type must be one of: ${UPLOAD_FILE_TYPES.join(', ')}`);
    }

    if (!data.f_name?.trim()) {
        errors.push('f_name (artist first name) is required');
    }

    if (!Number.isInteger(data.age) || data.age < 1 || data.age > 150) {
        errors.push('age must be a valid integer between 1 and 150');
    }

    if (!data.country?.trim()) {
        errors.push('country is required');
    }

    if (typeof data.is_virtual !== 'boolean') {
        errors.push('is_virtual must be a boolean');
    }

    if (data.theme_instance && !data.theme_family) {
        errors.push('theme_family is required when theme_instance is provided');
    }

    return errors;
}
