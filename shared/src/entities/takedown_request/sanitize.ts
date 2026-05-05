import { InitiateTakedownRequest } from './types.js';
import { cleanOptionalString } from '../../utils/string.js';

export function sanitizeInitiateTakedownRequest(data: InitiateTakedownRequest): InitiateTakedownRequest {
    return {
        ...data,
        art_id: cleanOptionalString(data.art_id),
        group_id: cleanOptionalString(data.group_id),
        requester_email: data.requester_email.normalize('NFC').trim().toLowerCase(),
        requester_name: data.requester_name.normalize('NFC').trim(),
        reason: data.reason.normalize('NFC').trim(),
    };
}
