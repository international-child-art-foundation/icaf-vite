import { GuestSubmitArtworkRequest, SubmitArtworkRequest, UpdateArtworkRequest, SubmitterRelationship, UploadFileType } from './types.js';
import {
    UPLOAD_FILE_TYPES,
    MAX_TITLE_LEN,
    MAX_ARTIST_AGE,
    MAX_DESCRIPTION_LEN,
    MAX_STRING_LEN,
    SHA256_HEX,
    THEME_INSTANCE_FORMAT,
    FORBIDDEN_CHARS_SINGLELINE,
    FORBIDDEN_CHARS_MULTILINE,
} from './constants.js';
import { isValidEmail, isValidUUID } from '../../utils/string.js';

const MAX_EMAIL_LEN = 254;

export function isValidUploadFileType(t: string): t is UploadFileType {
    return UPLOAD_FILE_TYPES.includes(t as UploadFileType);
}

// Validates the optional artwork fields shared across submit, update, and group flows.
// Pass any object that may contain these optional fields.
export function validateOptionalArtworkFields(data: {
    title?: string;
    description?: string;
    f_name?: string;
    l_name?: string;
    age?: number;
    country?: string;
    region?: string;
    submitter_relationship?: SubmitterRelationship;
    theme_family?: string;
    theme_instance?: string;
    group_id?: string;
    notifications?: boolean;
}): string[] {
    const errors: string[] = [];

    if (data.title !== undefined) {
        if (typeof data.title !== 'string' || !data.title.trim()) {
            errors.push('title, if provided, must be a non-empty string');
        } else if (data.title.length > MAX_TITLE_LEN) {
            errors.push(`title must be ${MAX_TITLE_LEN} characters or less`);
        } else if (FORBIDDEN_CHARS_SINGLELINE.test(data.title)) {
            errors.push('title contains invalid characters');
        }
    }

    if (data.description !== undefined) {
        if (typeof data.description !== 'string') {
            errors.push('description must be a string');
        } else if (data.description.length > MAX_DESCRIPTION_LEN) {
            errors.push(`description must be ${MAX_DESCRIPTION_LEN} characters or less`);
        } else if (FORBIDDEN_CHARS_MULTILINE.test(data.description)) {
            errors.push('description contains invalid characters');
        }
    }

    for (const field of ['f_name', 'l_name'] as const) {
        const value = data[field];
        if (value !== undefined) {
            if (typeof value !== 'string' || !value.trim()) {
                errors.push(`${field}, if provided, must be a non-empty string`);
            } else if (value.length > MAX_STRING_LEN) {
                errors.push(`${field} must be ${MAX_STRING_LEN} characters or less`);
            } else if (FORBIDDEN_CHARS_SINGLELINE.test(value)) {
                errors.push(`${field} contains invalid characters`);
            }
        }
    }

    if (data.age !== undefined) {
        if (!Number.isInteger(data.age) || data.age < 1 || data.age > MAX_ARTIST_AGE) {
            errors.push(`age, if provided, must be an integer between 1 and ${MAX_ARTIST_AGE}`);
        }
    }

    if (data.country !== undefined) {
        if (typeof data.country !== 'string' || !data.country.trim()) {
            errors.push('country, if provided, must be a non-empty string');
        } else if (data.country.length > MAX_STRING_LEN) {
            errors.push(`country must be ${MAX_STRING_LEN} characters or less`);
        } else if (FORBIDDEN_CHARS_SINGLELINE.test(data.country)) {
            errors.push('country contains invalid characters');
        }
    }

    if (data.region !== undefined) {
        if (typeof data.region !== 'string' || data.region.length > MAX_STRING_LEN) {
            errors.push(`region must be a string of ${MAX_STRING_LEN} characters or less`);
        } else if (FORBIDDEN_CHARS_SINGLELINE.test(data.region)) {
            errors.push('region contains invalid characters');
        }
    }

    if (data.submitter_relationship !== undefined) {
        const valid: SubmitterRelationship[] = ['parent', 'guardian', 'teacher'];
        if (!valid.includes(data.submitter_relationship)) {
            errors.push(`submitter_relationship must be one of: ${valid.join(', ')}`);
        }
    }

    if (data.theme_family !== undefined) {
        if (typeof data.theme_family !== 'string' || !data.theme_family.trim()) {
            errors.push('theme_family, if provided, must be a non-empty string');
        } else if (data.theme_family.length > MAX_STRING_LEN) {
            errors.push(`theme_family must be ${MAX_STRING_LEN} characters or less`);
        }
    }

    if (data.theme_instance !== undefined) {
        if (!data.theme_family) {
            errors.push('theme_family is required when theme_instance is provided');
        }
        if (typeof data.theme_instance !== 'string' || !THEME_INSTANCE_FORMAT.test(data.theme_instance)) {
            errors.push('theme_instance must be a zero-padded 4-digit string');
        }
    }

    if (data.group_id !== undefined) {
        if (typeof data.group_id !== 'string' || !data.group_id.trim()) {
            errors.push('group_id, if provided, must be a non-empty string');
        } else if (!isValidUUID(data.group_id)) {
            errors.push('group_id must be a valid UUID');
        }
    }

    if (data.notifications !== undefined && typeof data.notifications !== 'boolean') {
        errors.push('notifications, if provided, must be a boolean');
    }

    return errors;
}

export function validateSubmissionData(data: SubmitArtworkRequest): string[] {
    const errors: string[] = [];

    if (!data.file_type || !isValidUploadFileType(data.file_type as string)) {
        errors.push(`file_type must be one of: ${UPLOAD_FILE_TYPES.join(', ')}`);
    }

    if (data.promotional_use !== undefined && typeof data.promotional_use !== 'boolean') {
        errors.push('promotional_use, if provided, must be a boolean');
    }

    if (!data.release_hash || !SHA256_HEX.test(data.release_hash)) {
        errors.push('release_hash must be a valid SHA-256 hex string');
    }

    if (data.digital_signature !== undefined) {
        if (typeof data.digital_signature !== 'string' || !data.digital_signature.trim()) {
            errors.push('digital_signature, if provided, must be a non-empty string');
        } else if (data.digital_signature.length > MAX_STRING_LEN) {
            errors.push(`digital_signature must be ${MAX_STRING_LEN} characters or less`);
        } else if (FORBIDDEN_CHARS_SINGLELINE.test(data.digital_signature)) {
            errors.push('digital_signature contains invalid characters');
        }
    }

    return [...errors, ...validateOptionalArtworkFields(data)];
}

export function validateUpdateArtworkRequest(data: UpdateArtworkRequest): string[] {
    return validateOptionalArtworkFields(data);
}

// Guest artwork submission — requires either email or user_id (not both)
export function validateGuestSubmitArtworkRequest(data: GuestSubmitArtworkRequest): string[] {
    const errors: string[] = [];

    const hasEmail = data.email !== undefined;
    const hasUserId = data.user_id !== undefined;

    if (!hasEmail && !hasUserId) {
        errors.push('either email or user_id is required');
    } else if (hasEmail && hasUserId) {
        errors.push('only one of email or user_id may be provided');
    } else if (hasEmail) {
        if (!isValidEmail(data.email!)) {
            errors.push('email must be a valid email address');
        } else if (data.email!.length > MAX_EMAIL_LEN) {
            errors.push(`email must be ${MAX_EMAIL_LEN} characters or less`);
        }
    } else if (hasUserId) {
        if (!data.user_id!.trim()) {
            errors.push('user_id, if provided, must be non-empty');
        } else if (!isValidUUID(data.user_id!)) {
            errors.push('user_id must be a valid UUID');
        }
    }

    return [...errors, ...validateSubmissionData(data)];
}

export function isValidArtId(artId: string): boolean {
    return isValidUUID(artId);
}

export function validateArtId(artId: string): string[] {
    const errors: string[] = [];

    if (typeof artId !== 'string' || !artId.trim()) {
        errors.push('art_id path parameter is required');
    } else if (!isValidArtId(artId)) {
        errors.push('art_id is invalid');
    }

    return errors;
}
