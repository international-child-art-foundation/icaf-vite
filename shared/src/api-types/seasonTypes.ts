/**
 * Season API Types
 * 
 * Defines types for season-related API endpoints
 * and data structures.
 */

// Season data structure for API responses
export interface Season {
    season: string;
    colloq_name: string;
    start_date: string;
    end_date: string;
    payment_required: boolean;
    max_user_submissions: number;
    can_vote: boolean;
    total_votes: number;
    is_active: boolean;
}

// List seasons response (all seasons)
export interface ListSeasonsResponse {
    seasons: Season[];
    count: number;
    filter_applied: string;
}

// List active seasons response
export interface ListActiveSeasonsResponse {
    active_seasons: Season[];
    count: number;
    filter_applied: string;
}

// List inactive seasons response
export interface ListInactiveSeasonsResponse {
    inactive_seasons: Season[];
    count: number;
    filter_applied: string;
}

// Union type for all possible list season responses
export type ListSeasonResponse = ListSeasonsResponse | ListActiveSeasonsResponse | ListInactiveSeasonsResponse;

// Query parameters for list seasons endpoint
export interface ListSeasonQueryParams {
    active?: 'true' | 'false';
}

// Season entity structure (matches DynamoDB schema)
export interface SeasonEntity {
    PK: string; // 'SEASON'
    SK: string; // '#ACTIVE#<boolean>#SEASON#<season>'
    season: string;
    colloq_name: string;
    start_date: string;
    end_date: string;
    payment_required: boolean;
    max_user_submissions: number;
    can_vote: boolean;
    total_votes: number;
    is_active: boolean;
    type: 'SEASON';
    compound_sk?: string; // Alias for SK
}

// Helper function to convert SeasonEntity to Season API format
export function formatSeasonForApi(seasonEntity: any): Season {
    return {
        season: seasonEntity.season,
        colloq_name: seasonEntity.colloq_name,
        start_date: seasonEntity.start_date,
        end_date: seasonEntity.end_date,
        payment_required: seasonEntity.payment_required || false,
        max_user_submissions: seasonEntity.max_user_submissions || 1,
        can_vote: seasonEntity.can_vote || false,
        total_votes: seasonEntity.total_votes || 0,
        is_active: seasonEntity.is_active || false
    };
}

// Validation helper for query parameters
export function validateListSeasonParams(params: any): string[] {
    const errors: string[] = [];

    if (params.active && !['true', 'false'].includes(params.active)) {
        errors.push('active parameter must be either "true" or "false"');
    }

    return errors;
}
