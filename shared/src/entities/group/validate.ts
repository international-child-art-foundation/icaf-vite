import type { CreateGroupRequest, SubmitGroupRequest, UpdateGroupRequest } from './types.js';
import {
    GROUP_MAX_TITLE_LEN,
    GROUP_MAX_STRING_LEN,
    GROUP_MAX_DESCRIPTION_LEN,
    GROUP_MAX_MEMBERS,
} from './constants.js';
import { isValidEmail } from '../../utils/string.js';
import { SHA256_HEX, UPLOAD_FILE_TYPES } from '../art/constants.js';
import { validateOptionalArtworkFields } from '../art/validate.js';

const MAX_EMAIL_LEN = 254;

export function validateSubmitGroupRequest(data: SubmitGroupRequest): string[] {
    const errors: string[] = [];

    if (!data.title?.trim()) {
        errors.push('title is required');
    } else if (data.title.length > GROUP_MAX_TITLE_LEN) {
        errors.push(`title must be ${GROUP_MAX_TITLE_LEN} characters or less`);
    }

    if (!data.group_type?.trim()) {
        errors.push('group_type is required');
    } else if (data.group_type.length > GROUP_MAX_STRING_LEN) {
        errors.push(`group_type must be ${GROUP_MAX_STRING_LEN} characters or less`);
    }

    if (!data.country?.trim()) {
        errors.push('country is required');
    } else if (data.country.length > GROUP_MAX_STRING_LEN) {
        errors.push(`country must be ${GROUP_MAX_STRING_LEN} characters or less`);
    }

    if (data.region !== undefined && typeof data.region === 'string' && data.region.length > GROUP_MAX_STRING_LEN) {
        errors.push(`region must be ${GROUP_MAX_STRING_LEN} characters or less`);
    }

    if (data.description !== undefined && typeof data.description === 'string' && data.description.length > GROUP_MAX_DESCRIPTION_LEN) {
        errors.push(`description must be ${GROUP_MAX_DESCRIPTION_LEN} characters or less`);
    }

    if (data.class_name !== undefined && typeof data.class_name === 'string' && data.class_name.length > GROUP_MAX_STRING_LEN) {
        errors.push(`class_name must be ${GROUP_MAX_STRING_LEN} characters or less`);
    }

    if (data.guardian_display_name !== undefined && typeof data.guardian_display_name === 'string' && data.guardian_display_name.length > GROUP_MAX_STRING_LEN) {
        errors.push(`guardian_display_name must be ${GROUP_MAX_STRING_LEN} characters or less`);
    }

    if (data.theme_family !== undefined && typeof data.theme_family === 'string' && data.theme_family.length > GROUP_MAX_STRING_LEN) {
        errors.push(`theme_family must be ${GROUP_MAX_STRING_LEN} characters or less`);
    }

    if (data.theme_instance && !data.theme_family) {
        errors.push('theme_family is required when theme_instance is provided');
    }

    if (data.notifications !== undefined && typeof data.notifications !== 'boolean') {
        errors.push('notifications, if provided, must be a boolean');
    }

    return errors;
}

export function validateCreateGroupRequest(data: CreateGroupRequest, identityRequired: boolean): string[] {
    const errors = validateSubmitGroupRequest(data);
    const hasEmail = data.email !== undefined;

    if (identityRequired) {
        if (!hasEmail) {
            errors.push('email is required');
        }
    }

    if (hasEmail) {
        if (!isValidEmail(data.email!)) {
            errors.push('email must be a valid email address');
        } else if (data.email!.length > MAX_EMAIL_LEN) {
            errors.push(`email must be ${MAX_EMAIL_LEN} characters or less`);
        }
    }

    if (!Array.isArray(data.artworks)) {
        errors.push('artworks is required');
        return errors;
    }

    if (data.artworks.length < 1) {
        errors.push('artworks must include at least one artwork');
    }

    if (data.artworks.length > GROUP_MAX_MEMBERS) {
        errors.push(`artworks must include ${GROUP_MAX_MEMBERS} artworks or fewer`);
    }

    data.artworks.forEach((artwork, index) => {
        if (!artwork.file_type || !(UPLOAD_FILE_TYPES as readonly string[]).includes(artwork.file_type)) {
            errors.push(`artworks[${index}].file_type must be one of: ${UPLOAD_FILE_TYPES.join(', ')}`);
        }

        if (!artwork.release_hash?.trim() || !SHA256_HEX.test(artwork.release_hash)) {
            errors.push(`artworks[${index}].release_hash must be a valid SHA-256 hex string`);
        }

        const artworkErrors = validateOptionalArtworkFields(artwork);
        errors.push(...artworkErrors.map((error) => `artworks[${index}].${error}`));
    });

    return errors;
}

export function validateUpdateGroupRequest(data: UpdateGroupRequest): string[] {
    const errors: string[] = [];

    if (data.title !== undefined) {
        if (!data.title.trim()) {
            errors.push('title, if provided, must be non-empty');
        } else if (data.title.length > GROUP_MAX_TITLE_LEN) {
            errors.push(`title must be ${GROUP_MAX_TITLE_LEN} characters or less`);
        }
    }

    if (data.description !== undefined && typeof data.description === 'string' && data.description.length > GROUP_MAX_DESCRIPTION_LEN) {
        errors.push(`description must be ${GROUP_MAX_DESCRIPTION_LEN} characters or less`);
    }

    if (data.class_name !== undefined && typeof data.class_name === 'string' && data.class_name.length > GROUP_MAX_STRING_LEN) {
        errors.push(`class_name must be ${GROUP_MAX_STRING_LEN} characters or less`);
    }

    if (data.guardian_display_name !== undefined && typeof data.guardian_display_name === 'string' && data.guardian_display_name.length > GROUP_MAX_STRING_LEN) {
        errors.push(`guardian_display_name must be ${GROUP_MAX_STRING_LEN} characters or less`);
    }

    if (data.theme_family !== undefined && typeof data.theme_family === 'string' && data.theme_family.length > GROUP_MAX_STRING_LEN) {
        errors.push(`theme_family must be ${GROUP_MAX_STRING_LEN} characters or less`);
    }

    if (data.theme_instance && !data.theme_family) {
        errors.push('theme_family is required when theme_instance is provided');
    }

    if (data.notifications !== undefined && typeof data.notifications !== 'boolean') {
        errors.push('notifications, if provided, must be a boolean');
    }

    return errors;
}
