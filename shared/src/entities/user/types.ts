/**
 * User Types
 *
 * Types for USER entities and all user-management API shapes.
 *
 * DynamoDB USER entity key structure:
 *   PK = USER#<user_id>
 *   SK = 'PROFILE'
 *
 * GSI attributes written on creation:
 *   EMAIL_PK = 'EMAIL#<email>'
 *   EMAIL_SK = 'TYPE#USER'
 */

export const ROLES = ['admin', 'contributor', 'guardian', 'user'] as const;
export type Role = typeof ROLES[number];

// Full USER entity as stored in DynamoDB
export interface UserEntity {
    // ── Required ───────────────────────────────────────────────────────────
    user_id: string;                    // UUID; mirror of PK
    email: string;
    is_virtual: boolean;                // true = no Cognito account yet
    timestamp: number;                  // Unix timestamp (seconds) of record creation
    banned: boolean;                    // false by default; banned users cannot submit
    has_magazine_subscription: boolean;
    has_newsletter_subscription: boolean;
    type: 'USER';

    // ── Optional ───────────────────────────────────────────────────────────
    f_name?: string;                    // max 24 chars; absent for donation-only virtual users
    l_name?: string;                    // max 24 chars
    dob?: string;                       // YYYY-MM-DD; NOT exposed in API responses
    role?: Role;                        // absent until account is verified
    verify_token?: string;              // UUID slug sent in verification email; cleared after use
    verify_token_expiration?: number;   // Unix timestamp; cleared after use
    verified_at?: number;               // Unix timestamp of account verification
}

// Safe API response shape — never exposes dob or verification tokens
export interface UserProfileResponse {
    user_id: string;
    email: string;
    f_name?: string;
    l_name?: string;
    role: Role;
    is_virtual: boolean;
    banned: boolean;
    has_magazine_subscription: boolean;
    has_newsletter_subscription: boolean;
    verified_at?: number;
    timestamp: number;
}

// Registration request (Cognito sign-up via POST /auth/register)
export interface RegisterRequest {
    email: string;
    password: string;
    f_name: string;
    l_name: string;
    dob: string;    // YYYY-MM-DD
}

// Verify account request (POST /auth/verify)
// Called when user clicks their verification link.
// Handles both flows:
//   - Virtual user (created via artwork submission): is_virtual=true, password required
//   - Standard Cognito user verifying after registration: is_virtual=false, no password needed
export interface VerifyAccountRequest {
    user_id: string;        // from link: icaf.org/create-account?id=<user_id>
    verify_token: string;   // slug from the verification email link
    password?: string;      // required when is_virtual=true (creates Cognito account)
}

// Delete account request
export interface DeleteAccountRequest {
    password: string;
}

// ── Admin / Contributor request types ────────────────────────────────────────

// PATCH /admin/users/{userId} — unified user update
export interface UpdateUserRequest {
    new_role?: Role;
    banned?: boolean;
    ban_reason?: string;    // required when banned=true
}

export interface UpdateUserResponse {
    message: string;
    user_id: string;
    role: Role;
    banned: boolean;
    admin_action_id?: string;
    timestamp: number;
    updated_fields: string[];
}

// Contributor role change (less permissive — cannot set 'admin')
export interface UpdateUserRoleRequest {
    new_role: Exclude<Role, 'admin'>;
}

// Admin alter role (can set 'admin')
export interface AlterUserRoleRequest {
    new_role: Role;
}

export interface AlterUserRoleResponse {
    message: string;
    user_id: string;
    old_role: Role;
    new_role: Role;
    updated_fields: string[];
}

// Ban / Unban
export interface BanUserRequest {
    reason: string;
}

export interface BanUnbanUserResponse {
    message: string;
    user_id: string;
    banned: boolean;
    admin_action_id: string;
    timestamp: number;
}

// Remove all artwork from a user (admin action)
export interface RemoveAllUserArtworkRequest {
    reason: string;
}

export interface RemoveAllUserArtworkResponse {
    message: string;
    user_id: string;
    artworks_removed: number;
    failed_deletions: { art_id: string; reason: string }[];
    admin_action_id: string;
    timestamp: number;
}

// Delete user account (admin action)
export interface DeleteUserAccountRequest {
    reason: string;
    delete_from_cognito?: boolean;
}

export interface DeleteUserAccountResponse {
    message: string;
    user_id: string;
    artworks_deleted: number;
    entries_deleted: number;
    cognito_deleted: boolean;
    admin_action_id: string;
    timestamp: number;
}

// Get Cognito info (admin)
export interface GetUserCognitoInfoResponse {
    user_id: string;
    email: string;
    email_verified: boolean;
    cognito_username: string;
    user_status: string;
    enabled: boolean;
    user_create_date?: string;
    user_last_modified_date?: string;
}

// Get artwork submitter email (admin)
export interface GetArtworkSubmitterEmailResponse {
    art_id: string;
    artwork_title: string;
    user_id: string;
    email: string;
}

// Contributor: set guardian submission limit
export interface SetGuardianSubmissionLimitRequest {
    max_constituents: number;
    reason: string;
}
