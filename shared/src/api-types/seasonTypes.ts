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

// Request interface for creating a season
export interface CreateSeasonRequest {
    season: string;
    colloq_name: string;
    start_date: string;
    end_date: string;
    payment_required: boolean;
    max_user_submissions: number;
    can_vote: boolean;
    startSilently?: boolean;
    endSilently?: boolean;
}

// Response interface for season creation
export interface CreateSeasonResponse {
    message: string;
    season: {
        season: string;
        colloq_name: string;
        start_date: string;
        end_date: string;
        payment_required: boolean;
        max_user_submissions: number;
        can_vote: boolean;
        is_active: boolean;
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

// Validation helper for create season request
export function validateCreateSeasonRequest(data: CreateSeasonRequest): string[] {
    const errors: string[] = [];

    // Validate required string fields
    validateStringFields(data, errors);

    // Validate date fields
    validateDateFields(data, errors);

    // Validate boolean fields
    validateBooleanFields(data, errors);

    // Validate numeric fields
    validateNumericFields(data, errors);

    // Validate optional fields
    validateOptionalFields(data, errors);

    return errors;
}

function validateStringFields(data: CreateSeasonRequest, errors: string[]): void {
    if (!data.season || typeof data.season !== 'string' || data.season.trim().length === 0) {
        errors.push('season is required and must be a non-empty string');
    }

    if (!data.colloq_name || typeof data.colloq_name !== 'string' || data.colloq_name.trim().length === 0) {
        errors.push('colloq_name is required and must be a non-empty string');
    }
}

function validateDateFields(data: CreateSeasonRequest, errors: string[]): void {
    if (!data.start_date || typeof data.start_date !== 'string') {
        errors.push('start_date is required and must be a string');
    } else {
        const startDate = new Date(data.start_date);
        if (isNaN(startDate.getTime())) {
            errors.push('start_date must be a valid date');
        }
    }

    if (!data.end_date || typeof data.end_date !== 'string') {
        errors.push('end_date is required and must be a string');
    } else {
        const endDate = new Date(data.end_date);
        if (isNaN(endDate.getTime())) {
            errors.push('end_date must be a valid date');
        }
    }

    // Validate date range
    if (data.start_date && data.end_date) {
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate >= endDate) {
            errors.push('end_date must be after start_date');
        }
    }
}

function validateBooleanFields(data: CreateSeasonRequest, errors: string[]): void {
    if (typeof data.payment_required !== 'boolean') {
        errors.push('payment_required is required and must be a boolean');
    }

    if (typeof data.can_vote !== 'boolean') {
        errors.push('can_vote is required and must be a boolean');
    }
}

function validateNumericFields(data: CreateSeasonRequest, errors: string[]): void {
    if (typeof data.max_user_submissions !== 'number' || data.max_user_submissions < 1) {
        errors.push('max_user_submissions is required and must be a positive number');
    }
}

function validateOptionalFields(data: CreateSeasonRequest, errors: string[]): void {
    if (data.startSilently !== undefined && typeof data.startSilently !== 'boolean') {
        errors.push('startSilently must be a boolean if provided');
    }

    if (data.endSilently !== undefined && typeof data.endSilently !== 'boolean') {
        errors.push('endSilently must be a boolean if provided');
    }
}
