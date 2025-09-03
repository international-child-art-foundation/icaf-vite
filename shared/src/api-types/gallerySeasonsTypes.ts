/**
 * Gallery Seasons API Types
 * 
 * Defines types for gallery seasons API endpoints that display
 * artwork collections from specific seasons with different sorting options.
 */

// Supported sort types for gallery seasons queries
export type GallerySeasonsSortType = 'newest' | 'oldest' | 'highest_votes' | 'lowest_votes';

// Query parameters for gallery seasons endpoints
export interface GallerySeasonsQueryParams {
    sort: GallerySeasonsSortType;
    limit?: number;
    last_evaluated_key?: string;
}

// Gallery seasons API response format
export interface GallerySeasonsResponse {
    artworks: GallerySeasonsArtwork[];
    pagination: {
        has_more: boolean;
        last_evaluated_key?: string | null;
    };
}

// Simplified artwork format for gallery seasons
export interface GallerySeasonsArtwork {
    art_id: string;
    title: string;
    artist_name: string;
    votes: number;
    timestamp: string;
}

// Validation helper for sort types
export function isValidGallerySeasonsSortType(sortType: string): sortType is GallerySeasonsSortType {
    return ['newest', 'oldest', 'highest_votes', 'lowest_votes'].includes(sortType);
}
