import { SubmitArtworkRequest, UpdateArtworkRequest, SubmitterRelationship, UploadFileType } from './types.js';
import {
    UPLOAD_FILE_TYPES,
    MAX_TITLE_LEN,
    MAX_DESCRIPTION_LEN,
    MAX_STRING_LEN,
    SHA256_HEX,
    THEME_INSTANCE_FORMAT,
} from './constants.js';

export function isValidUploadFileType(t: string): t is UploadFileType {
    return UPLOAD_FILE_TYPES.includes(t as UploadFileType);
}

// Validates the optional artwork fields shared across submit, update, and group flows.
// Pass any object that may contain these optional fields.
export function validateOptionalArtworkFields(data: {
    title?: string;
    description?: string;
    f_name?: string;
    age?: number;
    country?: string;
    region?: string;
    submitter_relationship?: SubmitterRelationship;
    theme_family?: string;
    theme_instance?: string;
    group_id?: string;
}): string[] {
    const errors: string[] = [];

    if (data.title !== undefined) {
        if (typeof data.title !== 'string' || !data.title.trim()) {
            errors.push('title, if provided, must be a non-empty string');
        } else if (data.title.length > MAX_TITLE_LEN) {
            errors.push(`title must be ${MAX_TITLE_LEN} characters or less`);
        }
    }

    if (data.description !== undefined) {
        if (typeof data.description !== 'string') {
            errors.push('description must be a string');
        } else if (data.description.length > MAX_DESCRIPTION_LEN) {
            errors.push(`description must be ${MAX_DESCRIPTION_LEN} characters or less`);
        }
    }

    if (data.f_name !== undefined) {
        if (typeof data.f_name !== 'string' || !data.f_name.trim()) {
            errors.push('f_name, if provided, must be a non-empty string');
        } else if (data.f_name.length > MAX_STRING_LEN) {
            errors.push(`f_name must be ${MAX_STRING_LEN} characters or less`);
        }
    }

    if (data.age !== undefined) {
        if (!Number.isInteger(data.age) || data.age < 1 || data.age > 150) {
            errors.push('age, if provided, must be an integer between 1 and 150');
        }
    }

    if (data.country !== undefined) {
        if (typeof data.country !== 'string' || !data.country.trim()) {
            errors.push('country, if provided, must be a non-empty string');
        } else if (data.country.length > MAX_STRING_LEN) {
            errors.push(`country must be ${MAX_STRING_LEN} characters or less`);
        }
    }

    if (data.region !== undefined) {
        if (typeof data.region !== 'string' || data.region.length > MAX_STRING_LEN) {
            errors.push(`region must be a string of ${MAX_STRING_LEN} characters or less`);
        }
    }

    if (data.submitter_relationship !== undefined) {
        const valid: SubmitterRelationship[] = ['self', 'parent', 'guardian', 'teacher'];
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
        } else if (data.group_id.length > MAX_STRING_LEN) {
            errors.push(`group_id must be ${MAX_STRING_LEN} characters or less`);
        }
    }

    return errors;
}

export function validateSubmissionData(data: SubmitArtworkRequest): string[] {
    const errors: string[] = [];

    if (!data.file_type || !isValidUploadFileType(data.file_type as string)) {
        errors.push(`file_type must be one of: ${UPLOAD_FILE_TYPES.join(', ')}`);
    }

    if (typeof data.is_virtual !== 'boolean') {
        errors.push('is_virtual must be a boolean');
    }

    if (!data.legal_release_hash || !SHA256_HEX.test(data.legal_release_hash)) {
        errors.push('legal_release_hash must be a valid SHA-256 hex string');
    }

    return [...errors, ...validateOptionalArtworkFields(data)];
}

export function validateUpdateArtworkRequest(data: UpdateArtworkRequest): string[] {
    return validateOptionalArtworkFields(data);
}
