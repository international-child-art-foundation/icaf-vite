/**
 * Business Logic Validation
 * 
 * Contains shared business logic validation functions
 * used across multiple API endpoints.
 */

import { ArtworkEntity } from './artworkTypes';

// Check if user can vote for artwork
export function canUserVoteForArtwork(
    userId: string,
    artwork: ArtworkEntity,
    activeSeasons: Set<string>
): { canVote: boolean; reason?: string } {
    // User cannot vote for their own artwork
    if (artwork.user_id === userId) {
        return {
            canVote: false,
            reason: 'Cannot vote for your own artwork'
        };
    }

    // Artwork must be approved
    if (!artwork.is_approved) {
        return {
            canVote: false,
            reason: 'Cannot vote for unapproved artwork'
        };
    }

    // Artwork must belong to current active season
    if (!artwork.season || !activeSeasons.has(artwork.season)) {
        return {
            canVote: false,
            reason: 'Voting not allowed for this season'
        };
    }

    return { canVote: true };
}

// Check if user can submit artwork
export function canUserSubmitArtwork(
    user: any,
    season: any
): { canSubmit: boolean; reason?: string } {
    // User must exist
    if (!user) {
        return {
            canSubmit: false,
            reason: 'User profile not found'
        };
    }

    // User must have submission permission
    if (!user.can_submit) {
        return {
            canSubmit: false,
            reason: 'User is not authorized to submit artwork'
        };
    }

    // Season must be active
    if (!season || !season.is_active) {
        return {
            canSubmit: false,
            reason: 'Requested season is not active'
        };
    }

    return { canSubmit: true };
}

// Validate season is active
export function isSeasonActive(season: any): boolean {
    return season && season.is_active === true;
}

// Extract season name from SK
export function extractSeasonFromSK(sk: string): string {
    const idx = sk.indexOf('#SEASON#');
    return idx >= 0 ? sk.substring(idx + '#SEASON#'.length) : sk;
}
