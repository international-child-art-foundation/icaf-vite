import { SubmitGroupRequest } from './types.js';
import { GROUP_MAX_TITLE_LEN } from './constants.js';

export function validateSubmitGroupRequest(data: SubmitGroupRequest): string[] {
    const errors: string[] = [];

    if (!data.title?.trim()) {
        errors.push('title is required');
    } else if (data.title.length > GROUP_MAX_TITLE_LEN) {
        errors.push(`title must be ${GROUP_MAX_TITLE_LEN} characters or less`);
    }

    if (!data.group_type?.trim()) {
        errors.push('group_type is required');
    }

    if (!data.country?.trim()) {
        errors.push('country is required');
    }

    if (data.theme_instance && !data.theme_family) {
        errors.push('theme_family is required when theme_instance is provided');
    }

    return errors;
}
