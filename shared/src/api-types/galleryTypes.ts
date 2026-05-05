/**
 * Gallery Types
 *
 * Types for public gallery endpoints (artworks and groups).
 * Gallery supports time-based sorting only (no kudos-based sort — no GSI for it).
 *
 * Gallery GSI query shapes:
 *   All artworks:            PK='GALLERY',                              SK begins_with ''
 *   Artworks by family:      PK='FAMILY#<family>',                      SK begins_with ''
 *   Artworks by instance:    PK='FAMILY#<family>#INSTANCE#<instance>',  SK begins_with ''
 *   All groups:              PK='GROUPS',                               SK begins_with ''
 *   Groups by family:        PK='GROUPS#FAMILY#<family>',               SK begins_with ''
 *   Groups by instance:      PK='GROUPS#FAMILY#<family>#INSTANCE#<i>',  SK begins_with ''
 */

import { ArtworkListItem } from '../entities/art/types.js';
import { GroupListItem } from '../entities/group/types.js';

// Gallery supports newest/oldest only — the SK encodes timestamp
export type SortOrder = 'newest' | 'oldest';

// Query parameters accepted by gallery endpoints
export interface GalleryQueryParams {
    sort?: SortOrder;           // default: 'newest'
    limit?: number;             // default: 20, max: 100
    last_key?: string;          // base64-encoded pagination cursor
    theme_family?: string;      // filter by theme family (path param preferred)
    theme_instance?: string;    // filter by theme instance (path param preferred)
}

// Artwork gallery response
export interface GalleryArtworksResponse {
    artworks: ArtworkListItem[];
    count: number;
    sort: SortOrder;
    theme_family?: string;
    theme_instance?: string;
    has_more: boolean;
    last_key?: string;
}

// Group gallery response
export interface GalleryGroupsResponse {
    groups: GroupListItem[];
    count: number;
    sort: SortOrder;
    theme_family?: string;
    theme_instance?: string;
    has_more: boolean;
    last_key?: string;
}

export function isValidSortOrder(sort: string): sort is SortOrder {
    return sort === 'newest' || sort === 'oldest';
}
