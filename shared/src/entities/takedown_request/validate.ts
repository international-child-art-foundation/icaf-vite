import { InitiateTakedownRequest, TakedownStatus } from './types.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const TAKEDOWN_STATUSES: TakedownStatus[] = ['requesting', 'disputing', 'executed', 'canceled'];

export function isValidTakedownStatus(s: string): s is TakedownStatus {
    return TAKEDOWN_STATUSES.includes(s as TakedownStatus);
}

export function validateInitiateTakedownRequest(data: InitiateTakedownRequest): string[] {
    const errors: string[] = [];

    if (!data.art_id && !data.group_id) {
        errors.push('at least one of art_id or group_id is required');
    }

    if (!data.requester_email?.trim() || !EMAIL_RE.test(data.requester_email)) {
        errors.push('requester_email must be a valid email address');
    }

    if (!data.requester_name?.trim()) {
        errors.push('requester_name is required');
    }

    if (!data.reason?.trim()) {
        errors.push('reason is required');
    }

    return errors;
}
