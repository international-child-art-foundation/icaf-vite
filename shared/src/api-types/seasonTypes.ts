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

// Request interface for modifying season dates
export interface ModifySeasonRequest {
    season_id: string;
    start_date?: string;
    end_date?: string;
    startSilently?: boolean;
    endSilently?: boolean;
}

// Response interface for season modification
export interface ModifySeasonResponse {
    message: string;
    season_id: string;
    updated_fields: string[];
}

// Validation helper for query parameters
export function validateListSeasonParams(params: any): string[] {
    const errors: string[] = [];

    if (params.active && !['true', 'false'].includes(params.active)) {
        errors.push('active parameter must be either "true" or "false"');
    }

    return errors;
}

// Validation function for modify season request
export function validateModifySeasonRequest(data: ModifySeasonRequest): string[] {
    const errors: string[] = [];

    validateModifySeasonId(data, errors);
    validateModifySeasonDates(data, errors);
    validateModifySeasonBooleans(data, errors);
    validateModifySeasonFields(data, errors);

    return errors;
}

function validateModifySeasonId(data: ModifySeasonRequest, errors: string[]): void {
    if (!data.season_id || typeof data.season_id !== 'string' || data.season_id.trim().length === 0) {
        errors.push('season_id is required and must be a non-empty string');
    }
}

function validateModifySeasonDates(data: ModifySeasonRequest, errors: string[]): void {
    if (data.start_date !== undefined) {
        if (typeof data.start_date !== 'string') {
            errors.push('start_date must be a string if provided');
        } else {
            const startDate = new Date(data.start_date);
            if (isNaN(startDate.getTime())) {
                errors.push('start_date must be a valid date string if provided');
            }
        }
    }

    if (data.end_date !== undefined) {
        if (typeof data.end_date !== 'string') {
            errors.push('end_date must be a string if provided');
        } else {
            const endDate = new Date(data.end_date);
            if (isNaN(endDate.getTime())) {
                errors.push('end_date must be a valid date string if provided');
            }
        }
    }

    // Validate date logic if both dates are provided
    if (data.start_date && data.end_date) {
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
        if (endDate <= startDate) {
            errors.push('end_date must be after start_date');
        }
    }
}

function validateModifySeasonBooleans(data: ModifySeasonRequest, errors: string[]): void {
    if (data.startSilently !== undefined && typeof data.startSilently !== 'boolean') {
        errors.push('startSilently must be a boolean if provided');
    }

    if (data.endSilently !== undefined && typeof data.endSilently !== 'boolean') {
        errors.push('endSilently must be a boolean if provided');
    }
}

function validateModifySeasonFields(data: ModifySeasonRequest, errors: string[]): void {
    if (!data.start_date && !data.end_date && data.startSilently === undefined && data.endSilently === undefined) {
        errors.push('At least one field (start_date, end_date, startSilently, or endSilently) must be provided for modification');
    }
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

// Request interface for waiving season fee
export interface WaiveSeasonFeeRequest {
    reason: string;
}

// Response interface for waiving season fee
export interface WaiveSeasonFeeResponse {
    message: string;
    season: string;
    season_name: string;
    payment_required: boolean;
    is_active: boolean;
    admin_action_id: string;
    timestamp: string;
}

// Validation function for waive season fee request
export function validateWaiveSeasonFeeRequest(data: any): string[] {
    const errors: string[] = [];

    if (!data.reason || typeof data.reason !== 'string') {
        errors.push('reason is required and must be a string');
    } else if (data.reason.trim().length === 0) {
        errors.push('reason cannot be empty');
    }

    return errors;
}

// Request interface for updating season submission limit
export interface UpdateSeasonSubmissionLimitRequest {
    max_user_submissions: number;
    reason: string;
}

// Response interface for updating season submission limit
export interface UpdateSeasonSubmissionLimitResponse {
    message: string;
    season: string;
    season_name: string;
    old_max_user_submissions: number;
    max_user_submissions: number;
    is_active: boolean;
    admin_action_id: string;
    timestamp: string;
}

// Validation function for update season submission limit request
export function validateUpdateSeasonSubmissionLimitRequest(data: any): string[] {
    const errors: string[] = [];

    // Validate max_user_submissions
    if (data.max_user_submissions === undefined || data.max_user_submissions === null) {
        errors.push('max_user_submissions is required');
    } else if (typeof data.max_user_submissions !== 'number') {
        errors.push('max_user_submissions must be a number');
    } else if (!Number.isInteger(data.max_user_submissions)) {
        errors.push('max_user_submissions must be an integer');
    } else if (data.max_user_submissions !== -1 && data.max_user_submissions < 1) {
        errors.push('max_user_submissions must be -1 (unlimited) or a positive integer (>= 1)');
    }

    // Validate reason
    if (!data.reason || typeof data.reason !== 'string') {
        errors.push('reason is required and must be a string');
    } else if (data.reason.trim().length === 0) {
        errors.push('reason cannot be empty');
    }

    return errors;
}
