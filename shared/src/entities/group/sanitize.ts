import { SubmitGroupRequest, UpdateGroupRequest } from './types.js';
import { cleanOptionalString } from '../../utils/string.js';

export function sanitizeSubmitGroupRequest(data: SubmitGroupRequest): SubmitGroupRequest {
    return {
        ...data,
        title: data.title.normalize('NFC').trim(),
        class_name: cleanOptionalString(data.class_name),
        guardian_display_name: cleanOptionalString(data.guardian_display_name),
        country: data.country?.normalize('NFC').trim(),
        region: cleanOptionalString(data.region),
        description: cleanOptionalString(data.description),
        theme_family: cleanOptionalString(data.theme_family),
        theme_instance: cleanOptionalString(data.theme_instance),
    };
}

export function sanitizeUpdateGroupRequest(data: UpdateGroupRequest): UpdateGroupRequest {
    return {
        ...data,
        title: cleanOptionalString(data.title),
        description: cleanOptionalString(data.description),
        class_name: cleanOptionalString(data.class_name),
        guardian_display_name: cleanOptionalString(data.guardian_display_name),
        theme_family: cleanOptionalString(data.theme_family),
        theme_instance: cleanOptionalString(data.theme_instance),
    };
}
