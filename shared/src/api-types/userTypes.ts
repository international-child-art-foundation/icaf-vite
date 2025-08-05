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
        case 'guardian':
            return -1; // Unlimited
        case 'user':
            return 1; // Can submit for themselves
        default:
            return 0;
    }
} 