import { SubmitGroupRequest, UpdateGroupRequest } from './types.js';
import {
    GROUP_MAX_TITLE_LEN,
    GROUP_MAX_STRING_LEN,
    GROUP_MAX_DESCRIPTION_LEN,
} from './constants.js';

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

    if (data.teacher_display_name !== undefined && typeof data.teacher_display_name === 'string' && data.teacher_display_name.length > GROUP_MAX_STRING_LEN) {
        errors.push(`teacher_display_name must be ${GROUP_MAX_STRING_LEN} characters or less`);
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

    if (data.teacher_display_name !== undefined && typeof data.teacher_display_name === 'string' && data.teacher_display_name.length > GROUP_MAX_STRING_LEN) {
        errors.push(`teacher_display_name must be ${GROUP_MAX_STRING_LEN} characters or less`);
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
