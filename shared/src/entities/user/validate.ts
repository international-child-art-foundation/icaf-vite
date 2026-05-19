import { DefaultRegistrationRequest, Role, ROLES } from './types.js';
import { MAX_NAME_LEN, MAX_EMAIL_LEN, MAX_PASSWORD_LEN, MAX_BAN_REASON_LEN } from './constants.js';
import { isValidEmail } from '../../utils/string.js';

const DOB_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateDefaultRegistrationRequest(data: DefaultRegistrationRequest): string[] {
    const errors: string[] = [];

    if (!data.email || !isValidEmail(data.email)) {
        errors.push('email must be a valid email address');
    } else if (data.email.length > MAX_EMAIL_LEN) {
        errors.push(`email must be ${MAX_EMAIL_LEN} characters or less`);
    }

    if (!data.password || data.password.length < 8) {
        errors.push('password must be at least 8 characters');
    } else if (data.password.length > MAX_PASSWORD_LEN) {
        errors.push(`password must be ${MAX_PASSWORD_LEN} characters or less`);
    }

    if (!data.f_name?.trim()) {
        errors.push('f_name is required');
    } else if (data.f_name.length > MAX_NAME_LEN) {
        errors.push(`f_name must be ${MAX_NAME_LEN} characters or less`);
    }

    if (!data.l_name?.trim()) {
        errors.push('l_name is required');
    } else if (data.l_name.length > MAX_NAME_LEN) {
        errors.push(`l_name must be ${MAX_NAME_LEN} characters or less`);
    }

    if (!data.dob || !DOB_RE.test(data.dob)) {
        errors.push('dob must be a date in YYYY-MM-DD format');
    }

    if (data.role !== 'guardian' && data.role !== 'user') {
        errors.push('role must be one of: guardian, user');
    }

    if (data.has_newsletter_subscription !== undefined && typeof data.has_newsletter_subscription !== 'boolean') {
        errors.push('has_newsletter_subscription, if provided, must be a boolean');
    }

    return errors;
}

export function isValidRole(role: string): role is Role {
    return ROLES.includes(role as Role);
}

// PATCH /admin/users/{userId}
export function validateUpdateUserRequest(data: any): string[] {
    const errors: string[] = [];

    if (data.new_role !== undefined && !isValidRole(data.new_role)) {
        errors.push(`new_role must be one of: ${ROLES.join(', ')}`);
    }

    if (data.banned !== undefined && typeof data.banned !== 'boolean') {
        errors.push('banned must be a boolean');
    }

    if (data.has_magazine_subscription !== undefined && typeof data.has_magazine_subscription !== 'boolean') {
        errors.push('has_magazine_subscription must be a boolean');
    }

    if (data.has_newsletter_subscription !== undefined && typeof data.has_newsletter_subscription !== 'boolean') {
        errors.push('has_newsletter_subscription must be a boolean');
    }

    if (data.banned === true && !data.ban_reason?.trim()) {
        errors.push('ban_reason is required when banning a user');
    }

    if (
        data.new_role === undefined &&
        data.banned === undefined &&
        data.has_magazine_subscription === undefined &&
        data.has_newsletter_subscription === undefined
    ) {
        errors.push('at least one update field must be provided');
    }

    return errors;
}

// Contributor role change (cannot assign 'admin')
export function validateUpdateUserRoleRequest(data: any): string[] {
    const errors: string[] = [];
    if (!data.new_role || !isValidRole(data.new_role)) {
        errors.push(`new_role must be one of: ${ROLES.filter(r => r !== 'admin').join(', ')}`);
    }
    if (data.new_role === 'admin') {
        errors.push('contributors cannot assign the admin role');
    }
    return errors;
}

// Admin role change (can assign 'admin')
export function validateAlterUserRoleRequest(data: any): string[] {
    const errors: string[] = [];
    if (!data.new_role || !isValidRole(data.new_role)) {
        errors.push(`new_role must be one of: ${ROLES.join(', ')}`);
    }
    return errors;
}

export function validateBanUserRequest(data: any): string[] {
    const errors: string[] = [];
    if (!data.reason?.trim()) {
        errors.push('reason is required and cannot be empty');
    } else if (data.reason.length > MAX_BAN_REASON_LEN) {
        errors.push(`reason must be ${MAX_BAN_REASON_LEN} characters or less`);
    }
    return errors;
}

export function validateRemoveAllUserArtworkRequest(data: any): string[] {
    if (!data.reason?.trim()) return ['reason is required and cannot be empty'];
    if (data.reason.length > MAX_BAN_REASON_LEN) return [`reason must be ${MAX_BAN_REASON_LEN} characters or less`];
    return [];
}

export function validateDeleteUserAccountRequest(data: any): string[] {
    const errors: string[] = [];
    if (!data.reason?.trim()) errors.push('reason is required and cannot be empty');
    else if (data.reason.length > MAX_BAN_REASON_LEN) errors.push(`reason must be ${MAX_BAN_REASON_LEN} characters or less`);
    if (data.delete_from_cognito !== undefined && typeof data.delete_from_cognito !== 'boolean') {
        errors.push('delete_from_cognito must be a boolean if provided');
    }
    return errors;
}
