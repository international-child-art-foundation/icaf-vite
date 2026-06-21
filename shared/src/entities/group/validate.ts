import type { CreateGroupRequest, SubmitGroupRequest, UpdateGroupRequest } from './types.js';
import {
    GROUP_MAX_TITLE_LEN,
    GROUP_MAX_STRING_LEN,
    GROUP_MAX_REGION_LEN,
    GROUP_MAX_SUBMITTER_DISPLAY_NAME_LEN,
    GROUP_MAX_DESCRIPTION_LEN,
    GROUP_MAX_MEMBERS,
} from './constants.js';
import { isValidEmail, isValidUUID } from '../../utils/string.js';
import { UPLOAD_FILE_TYPES } from '../art/constants.js';
import { validateOptionalArtworkFields } from '../art/validate.js';
import { isValidThemeSk } from '../theme/validate.js';
import { MAX_NAME_LEN } from '../user/constants.js';

const MAX_EMAIL_LEN = 254;

export function validateSubmitGroupRequest(data: SubmitGroupRequest): string[] {
    const errors: string[] = [];

    if (!data.title?.trim()) {
        errors.push('title is required');
    } else if (data.title.length > GROUP_MAX_TITLE_LEN) {
        errors.push(`title must be ${GROUP_MAX_TITLE_LEN} characters or less`);
    }

    if (data.group_type !== undefined) {
        if (typeof data.group_type !== 'string' || !data.group_type.trim()) {
            errors.push('group_type, if provided, must be a non-empty string');
        } else if (data.group_type.length > GROUP_MAX_STRING_LEN) {
            errors.push(`group_type must be ${GROUP_MAX_STRING_LEN} characters or less`);
        }
    }

    if (!data.country?.trim()) {
        errors.push('country is required');
    } else if (data.country.length > GROUP_MAX_STRING_LEN) {
        errors.push(`country must be ${GROUP_MAX_STRING_LEN} characters or less`);
    }

    if (data.region !== undefined && typeof data.region === 'string' && data.region.length > GROUP_MAX_REGION_LEN) {
        errors.push(`region must be ${GROUP_MAX_REGION_LEN} characters or less`);
    }

    if (data.description !== undefined && typeof data.description === 'string' && data.description.length > GROUP_MAX_DESCRIPTION_LEN) {
        errors.push(`description must be ${GROUP_MAX_DESCRIPTION_LEN} characters or less`);
    }

    if (data.class_name !== undefined && typeof data.class_name === 'string' && data.class_name.length > GROUP_MAX_STRING_LEN) {
        errors.push(`class_name must be ${GROUP_MAX_STRING_LEN} characters or less`);
    }

    if (data.submitter_display_name !== undefined && typeof data.submitter_display_name === 'string' && data.submitter_display_name.length > GROUP_MAX_SUBMITTER_DISPLAY_NAME_LEN) {
        errors.push(`submitter_display_name must be ${GROUP_MAX_SUBMITTER_DISPLAY_NAME_LEN} characters or less`);
    }

    if (data.theme !== undefined) {
        if (typeof data.theme !== 'string' || !data.theme.trim()) {
            errors.push('theme, if provided, must be a non-empty string');
        } else if (data.theme.length > GROUP_MAX_STRING_LEN) {
            errors.push(`theme must be ${GROUP_MAX_STRING_LEN} characters or less`);
        } else if (!isValidThemeSk(data.theme)) {
            errors.push('theme must be a valid theme SK');
        }
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

        const identityData = data as {
            submitter_first_name?: unknown;
            submitter_last_name?: unknown;
        };
        for (const field of ['submitter_first_name', 'submitter_last_name'] as const) {
            const value = identityData[field];
            if (typeof value !== 'string' || !value.trim()) {
                errors.push(`${field} is required`);
            } else if (value.length > MAX_NAME_LEN) {
                errors.push(`${field} must be ${MAX_NAME_LEN} characters or less`);
            }
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
        if (!artwork.art_id || !isValidUUID(artwork.art_id)) {
            errors.push(`artworks[${index}].art_id must be a valid UUID`);
        }

        if (!artwork.file_type || !(UPLOAD_FILE_TYPES as readonly string[]).includes(artwork.file_type)) {
            errors.push(`artworks[${index}].file_type must be one of: ${UPLOAD_FILE_TYPES.join(', ')}`);
        }

        if (typeof artwork.digital_signature !== 'string' || !artwork.digital_signature.trim()) {
            errors.push(`artworks[${index}].digital_signature is required`);
        } else {
            if (artwork.digital_signature.length > GROUP_MAX_STRING_LEN) {
                errors.push(`artworks[${index}].digital_signature must be ${GROUP_MAX_STRING_LEN} characters or less`);
            }
        }
        if (artwork.promotional_use !== undefined && typeof artwork.promotional_use !== 'boolean') {
            errors.push(`artworks[${index}].promotional_use, if provided, must be a boolean`);
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

    if (data.submitter_display_name !== undefined && typeof data.submitter_display_name === 'string' && data.submitter_display_name.length > GROUP_MAX_SUBMITTER_DISPLAY_NAME_LEN) {
        errors.push(`submitter_display_name must be ${GROUP_MAX_SUBMITTER_DISPLAY_NAME_LEN} characters or less`);
    }

    if (data.country !== undefined) {
        if (!data.country.trim()) {
            errors.push('country, if provided, must be non-empty');
        } else if (data.country.length > GROUP_MAX_STRING_LEN) {
            errors.push(`country must be ${GROUP_MAX_STRING_LEN} characters or less`);
        }
    }

    if (data.region !== undefined && typeof data.region === 'string' && data.region.length > GROUP_MAX_REGION_LEN) {
        errors.push(`region must be ${GROUP_MAX_REGION_LEN} characters or less`);
    }

    if (data.theme !== undefined) {
        if (typeof data.theme !== 'string' || !data.theme.trim()) {
            errors.push('theme, if provided, must be a non-empty string');
        } else if (data.theme.length > GROUP_MAX_STRING_LEN) {
            errors.push(`theme must be ${GROUP_MAX_STRING_LEN} characters or less`);
        } else if (!isValidThemeSk(data.theme)) {
            errors.push('theme must be a valid theme SK');
        }
    }

    if (data.notifications !== undefined && typeof data.notifications !== 'boolean') {
        errors.push('notifications, if provided, must be a boolean');
    }

    return errors;
}

export function isValidGroupId(groupId: string): boolean {
    return isValidUUID(groupId);
}

export function validateGroupId(groupId: string): string[] {
    const errors: string[] = [];

    if (typeof groupId !== 'string' || !groupId.trim()) {
        errors.push('group_id path parameter is required');
    } else if (!isValidGroupId(groupId)) {
        errors.push('group_id is invalid');
    }

    return errors;
}
