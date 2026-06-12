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
 *   EMAIL_PK = 'EMAIL#<normalized lowercase email>'
 *   EMAIL_SK = 'TYPE#USER'
 *
 * User email identity is case-insensitive. Store user.email and EMAIL_PK using
 * normalizeEmail(email) so auth, reset, registration, and virtual-account
 * flows resolve to the same user.
 */

export const ROLES = ['admin', 'contributor', 'user'] as const;
export type Role = typeof ROLES[number];

// Full USER entity as stored in DynamoDB
export interface UserEntity {
    // ── Required ───────────────────────────────────────────────────────────
    user_id: string;                    // UUID; mirror of PK
    email: string;
    is_virtual: boolean;                // true = no Cognito account yet
    ts: number;                  // Unix ts (seconds) of record creation
    banned: boolean;                    // false by default; banned users cannot submit
    has_magazine_subscription: boolean;
    has_newsletter_subscription: boolean;
    type: 'USER';

    // ── Optional ───────────────────────────────────────────────────────────
    f_name?: string;                    // max 24 chars; absent for donation-only virtual users
    l_name?: string;                    // max 24 chars
    dob?: string;                       // YYYY-MM-DD; NOT exposed in API responses
    role?: Role;                        // absent until account is verified
    auth_action_token?: string;              // UUID slug sent in verification email; cleared after use
    auth_action_token_exp?: number;   // Unix ts; cleared after use
    verified_at?: number;               // Unix ts of account verification
    emailed_signup_at?: number;           // Unix ts when a create-and-verify email was sent
    artwork_email_unsub_at?: number;     // Unix ts when artwork notification emails were disabled
    unsub_token?: string;               // Permanent token for user-level email unsubscribe links
    artwork_emails_off?: boolean;       // User opted out of artwork/group notification emails
    email_blocked?: true;                   // Address should not be emailed after bounce/complaint
}

// Safe API response shape — never exposes dob or auth action tokens
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
    artwork_emails_off: boolean;
    verified_at?: number;
    emailed_signup_at?: number;
    ts: number;
}

export interface DefaultRegistrationRequest {
    email: string;
    password: string;
    f_name: string;
    l_name: string;
    dob: string;    // YYYY-MM-DD
    has_newsletter_subscription?: boolean;
}

// Create a Cognito login and verify an existing app-side user in one step.
// This flow uses an app-generated verification link, not Cognito's code email.
export interface CreateAndVerifyRequest {
    user_id: string;        // from link: icaf.org/create-account?id=<user_id>
    auth_action_token: string;   // app-generated slug from the action email link
    password?: string;      // required when is_virtual=true; optional for unverified Cognito users resetting during activation
    f_name?: string;        // optional profile update during account creation
    l_name?: string;        // optional profile update during account creation
    dob?: string;           // optional profile update during account creation
    has_newsletter_subscription?: boolean;
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
    has_magazine_subscription?: boolean;
    has_newsletter_subscription?: boolean;
}

export interface UpdateUserResponse {
    message: string;
    user_id: string;
    role: Role;
    banned: boolean;
    has_magazine_subscription: boolean;
    has_newsletter_subscription: boolean;
    admin_action_id?: string;
    ts: number;
    updated_fields: string[];
}

// Contributor role change (less permissive — cannot set 'admin')
export interface UpdateUserRoleRequest {
    new_role: Exclude<Role, 'admin'>;
}

export interface UpdateUserRoleResponse {
    success: true;
    user_id: string;
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
    ts: number;
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
    ts: number;
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
    ts: number;
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

export interface GetEmailByUserIdResponse {
    user_id: string;
    email: string;
}

export interface HideAllUserArtworkResponse {
    success: true;
    user_id: string;
    items_hidden: number;
    admin_action_id: string;
}

export interface UnhideAllUserArtworkResponse {
    success: true;
    user_id: string;
    items_unhidden: number;
    admin_action_id: string;
}
