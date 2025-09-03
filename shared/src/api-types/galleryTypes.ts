/**
 * Gallery API Types
 * 
 * Defines types for gallery-related API endpoints that display
 * artwork collections with different sorting options.
 */

import { ArtworkEntity } from './artworkTypes';

// Supported sort types for gallery queries
export type SortType = 'newest' | 'oldest' | 'highest-voted' | 'lowest-voted';

// Query parameters for gallery endpoints
export interface GalleryQueryParams {
    season: string;
    limit?: number;
    lastEvaluatedKey?: string;
    approved_only?: boolean;
}

// Gallery API response format
export interface GalleryResponse {
    artworks: ArtworkEntity[];
    count: number;
    hasMore: boolean;
    season: string;
    sortType: SortType;
    pagination: {
        has_more: boolean;
        last_evaluated_key?: string;
    };
}

// Validation helper for sort types
export function isValidSortType(sortType: string): sortType is SortType {
    return ['newest', 'oldest', 'highest-voted', 'lowest-voted'].includes(sortType);
}
