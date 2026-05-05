import { Role, ROLES } from './types.js';

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

    if (data.banned === true && !data.ban_reason?.trim()) {
        errors.push('ban_reason is required when banning a user');
    }

    if (data.new_role === undefined && data.banned === undefined) {
        errors.push('at least one of new_role or banned must be provided');
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
    }
    return errors;
}

export function validateRemoveAllUserArtworkRequest(data: any): string[] {
    if (!data.reason?.trim()) return ['reason is required and cannot be empty'];
    return [];
}

export function validateDeleteUserAccountRequest(data: any): string[] {
    const errors: string[] = [];
    if (!data.reason?.trim()) errors.push('reason is required and cannot be empty');
    if (data.delete_from_cognito !== undefined && typeof data.delete_from_cognito !== 'boolean') {
        errors.push('delete_from_cognito must be a boolean if provided');
    }
    return errors;
}

export function validateSetGuardianSubmissionLimitRequest(data: any): string[] {
    const errors: string[] = [];
    if (
        data.max_constituents === undefined ||
        !Number.isInteger(data.max_constituents) ||
        data.max_constituents < 0
    ) {
        errors.push('max_constituents must be a non-negative integer');
    }
    if (!data.reason?.trim()) errors.push('reason is required');
    return errors;
}
