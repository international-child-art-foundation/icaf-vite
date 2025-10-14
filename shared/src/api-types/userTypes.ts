/**
 * User Types and Roles
 * 
 * Defines user types, roles, and related enums
 * for the ICAF application.
 */

// Valid roles in order of permissions (Admin > Contributor > Guardian > User)
export const ROLES = ['admin', 'contributor', 'guardian', 'user'] as const;
export type Role = typeof ROLES[number];

// User types based on role and age
export type UserType = 'admin' | 'contributor' | 'guardian' | 'user';

// User profile information
export interface UserProfile {
    UUID: string;
    email: string;
    f_name: string;
    l_name: string;
    birthdate: string;
    role: Role;
    user_type: UserType;
    can_submit_artwork: boolean;
    max_constituents_per_season: number;
    has_paid: boolean;
    accolades: string[];
    has_magazine_subscription: boolean;
    has_newsletter_subscription: boolean;
    created_at: string;
    updated_at: string;
}

// User registration data
export interface UserRegistrationData {
    email: string;
    password: string;
    f_name: string;
    l_name: string;
    birthdate: string;
    role?: Role;
}

// Delete account request data
export interface DeleteAccountRequest {
    password: string; // Confirmation password
}

// User response for API calls
export interface UserResponse {
    UUID: string;
    email: string;
    f_name: string;
    l_name: string;
    role: Role;
    has_cur_season_submission: boolean;
    has_magazine_subscription: boolean;
    has_newsletter_subscription: boolean;
    birthdate: string;
}

// Helper functions
export function calculateUserAge(birthdate: string): number {
    const birthDate = new Date(birthdate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
}

export function determineUserType(role: Role): UserType {
    if (role === 'admin') return 'admin';
    if (role === 'contributor') return 'contributor';
    if (role === 'guardian') return 'guardian';
    return 'user';
}

export function canSubmitArtwork(userType: UserType): boolean {
    return ['admin', 'contributor', 'guardian', 'user'].includes(userType);
}

export function getMaxConstituentsPerSeason(userType: UserType): number {
    switch (userType) {
        case 'admin':
        case 'contributor':
            return -1; // Unlimited
        case 'guardian':
            return 50; // Limited to 50 constituents
        case 'user':
            return 0; // Cannot submit for others
        default:
            return 0;
    }
}

// Request interface for altering user role (legacy - with user_id in body)
export interface AlterUserRoleRequest {
    user_id: string;
    new_role: Role;
}

// Request interface for altering user role (RESTful - user_id in path)
export interface AlterUserRoleBodyRequest {
    new_role: Role;
}

// Response interface for altering user role
export interface AlterUserRoleResponse {
    message: string;
    user_id: string;
    old_role: Role;
    new_role: Role;
    max_constituents_per_season: number; // 0 if user, 50 if guardian, -1 if contributor/admin
    updated_fields: string[];
}

// Validation function for alter user role request (legacy)
export function validateAlterUserRoleRequest(data: any): string[] {
    const errors: string[] = [];
    
    if (!data.user_id || typeof data.user_id !== 'string') {
        errors.push('user_id is required and must be a string');
    }
    
    if (!data.new_role || typeof data.new_role !== 'string') {
        errors.push('new_role is required and must be a string');
    } else if (!ROLES.includes(data.new_role)) {
        errors.push(`new_role must be one of: ${ROLES.join(', ')}`);
    }
    
    return errors;
}

// Validation function for alter user role body request (RESTful)
export function validateAlterUserRoleBodyRequest(data: any): string[] {
    const errors: string[] = [];
    
    if (!data.new_role || typeof data.new_role !== 'string') {
        errors.push('new_role is required and must be a string');
    } else if (!ROLES.includes(data.new_role)) {
        errors.push(`new_role must be one of: ${ROLES.join(', ')}`);
    }
    
    return errors;
}

// Request interface for updating user (unified PATCH API)
export interface UpdateUserRequest {
    new_role?: Role;
    can_submit?: boolean;
    ban_reason?: string; // Required when can_submit is set to false
}

// Response interface for user update operations
export interface UpdateUserResponse {
    message: string;
    user_id: string;
    is_banned: boolean;
    can_submit: boolean;
    role: Role;
    max_constituents_per_season: number;
    admin_action_id?: string; // Only present if actions were taken
    timestamp: string;
    updated_fields: string[];
}

// Legacy interfaces (keep for backward compatibility)
export interface BanUserRequest {
    reason: string;
}

export interface UnbanUserRequest {}

export interface BanUnbanUserResponse {
    message: string;
    user_id: string;
    is_banned: boolean;
    can_submit: boolean;
    admin_action_id: string;
    timestamp: string;
}

// Validation function for update user request
export function validateUpdateUserRequest(data: any): string[] {
    const errors: string[] = [];
    
    if (data.new_role !== undefined) {
        if (typeof data.new_role !== 'string') {
            errors.push('new_role must be a string');
        } else if (!ROLES.includes(data.new_role)) {
            errors.push(`new_role must be one of: ${ROLES.join(', ')}`);
        }
    }
    
    if (data.can_submit !== undefined && typeof data.can_submit !== 'boolean') {
        errors.push('can_submit must be a boolean');
    }
    
    if (data.can_submit === false && (!data.ban_reason || typeof data.ban_reason !== 'string' || data.ban_reason.trim().length === 0)) {
        errors.push('ban_reason is required when banning a user');
    }
    
    if (data.ban_reason !== undefined && data.can_submit !== false) {
        errors.push('ban_reason can only be provided when can_submit is false');
    }
    
    // At least one field must be provided
    if (data.new_role === undefined && data.can_submit === undefined) {
        errors.push('At least one field (new_role or can_submit) must be provided');
    }
    
    return errors;
}

// Legacy validation function for ban user request
export function validateBanUserRequest(data: any): string[] {
    const errors: string[] = [];

    if (!data.reason || typeof data.reason !== 'string') {
        errors.push('reason is required and must be a string');
    } else if (data.reason.trim().length === 0) {
        errors.push('reason cannot be empty');
    }

    return errors;
}

// Request interface for removing all user artwork
export interface RemoveAllUserArtworkRequest {
    reason: string;
}

// Response interface for removing all user artwork
export interface RemoveAllUserArtworkResponse {
    message: string;
    user_id: string;
    artworks_removed: number;
    total_artworks: number;
    deleted_artwork_ids: string[];
    failed_deletions: { art_id: string; reason: string }[];
    admin_action_id: string;
    timestamp: string;
}

// Validation function for remove all user artwork request
export function validateRemoveAllUserArtworkRequest(data: any): string[] {
    const errors: string[] = [];

    if (!data.reason || typeof data.reason !== 'string') {
        errors.push('reason is required and must be a string');
    } else if (data.reason.trim().length === 0) {
        errors.push('reason cannot be empty');
    }

    return errors;
}

// Response interface for getting user Cognito information
export interface GetUserCognitoInfoResponse {
    user_id: string;
    email: string;
    email_verified: boolean;
    username: string;
    user_status: string;
    enabled: boolean;
    user_create_date?: string;
    user_last_modified_date?: string;
} 