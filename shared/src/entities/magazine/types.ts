/**
 * Magazine Types
 *
 * Types for MAGAZINE entities.
 *
 * DynamoDB MAGAZINE entity key structure:
 *   PK = 'MAGAZINE'
 *   SK = '<slug>'
 *
 * slug is the URL-safe name matching the folder structure and CloudFront path,
 * e.g. 'ArtAndHealth', 'Happiness', 'AI&Art'.
 * Served at: https://magazines.icaf.org/<slug>/
 *
 * No GSI needed — magazines are always listed as a full collection (few dozen items).
 *
 * Note: created_at is stored as a number (Unix seconds) even though the entity
 * CSV lists the type as 'string' — this is consistent with the index.csv convention
 * that all timestamps are Unix numbers.
 *
 * Every field on this entity is required. Zips that contain no root-level image
 * file will be rejected by processZip rather than stored without a thumbnail_key.
 */

export type MagazineStatus = 'processing' | 'published' | 'unpublished';

export interface MagazineEntity {
    slug: string;           // URL path segment and S3 prefix, e.g. 'ArtAndHealth' (also SK)
    name: string;           // Display name, e.g. 'Art & Health'
    period: string;         // e.g. 'January–March 2026'
    volume: string;         // e.g. 'Volume 26, Issue 01, Number 81'
    status: MagazineStatus;
    uploaded_by: string;    // user_id of the uploader
    created_at: number;     // Unix timestamp (seconds) of upload initiation
    thumbnail_key: string;  // filename of the root-level image in the zip, e.g. 'cover.jpg'
                            // Set by processZip; record is in 'processing' status until this is written
    type: 'MAGAZINE';
}

// Request body for POST /admin/magazines — initiates a magazine upload
export interface InitiateMagazineUploadRequest {
    slug: string;
    name: string;
    period: string;
    volume: string;
    userId: string;
}

export interface InitiateMagazineUploadResponse {
    success: boolean;
    slug: string;
    presigned_url: string;  // PUT this zip here to trigger processing
    message: string;
}

// Shape used in public list response
export interface MagazineListItem {
    slug: string;
    name: string;
    period: string;
    volume: string;
    status: MagazineStatus;
    thumbnail_url: string;  // Full CloudFront URL, e.g. https://magazines.icaf.org/<slug>/cover.jpg
    created_at: number;
}

export interface ListMagazinesResponse {
    magazines: MagazineListItem[];
}
