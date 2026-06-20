import { SubmitGroupRequest, UpdateGroupRequest } from './types.js';
import { cleanOptionalString } from '../../utils/string.js';

export function sanitizeSubmitGroupRequest(data: SubmitGroupRequest): SubmitGroupRequest {
    return {
        ...data,
        title: data.title.normalize('NFC').trim(),
        group_type: cleanOptionalString(data.group_type),
        class_name: cleanOptionalString(data.class_name),
        submitter_display_name: cleanOptionalString(data.submitter_display_name),
        country: data.country?.normalize('NFC').trim(),
        region: cleanOptionalString(data.region),
        description: cleanOptionalString(data.description),
        theme: cleanOptionalString(data.theme),
    };
}

export function sanitizeUpdateGroupRequest(data: UpdateGroupRequest): UpdateGroupRequest {
    return {
        ...data,
        title: cleanOptionalString(data.title),
        description: cleanOptionalString(data.description),
        class_name: cleanOptionalString(data.class_name),
        submitter_display_name: cleanOptionalString(data.submitter_display_name),
        country: cleanOptionalString(data.country),
        region: cleanOptionalString(data.region),
        theme: cleanOptionalString(data.theme),
    };
}
