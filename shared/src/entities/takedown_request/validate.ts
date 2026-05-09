import { InitiateTakedownRequest, TakedownStatus } from './types.js';
import { TDR_MAX_REASON_LEN, TDR_MAX_NAME_LEN, TDR_MAX_EMAIL_LEN, TDR_MAX_REVIEW_NOTES_LEN } from './constants.js';

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
    } else if (data.requester_email.length > TDR_MAX_EMAIL_LEN) {
        errors.push(`requester_email must be ${TDR_MAX_EMAIL_LEN} characters or less`);
    }

    if (!data.requester_name?.trim()) {
        errors.push('requester_name is required');
    } else if (data.requester_name.length > TDR_MAX_NAME_LEN) {
        errors.push(`requester_name must be ${TDR_MAX_NAME_LEN} characters or less`);
    }

    if (!data.reason?.trim()) {
        errors.push('reason is required');
    } else if (data.reason.length > TDR_MAX_REASON_LEN) {
        errors.push(`reason must be ${TDR_MAX_REASON_LEN} characters or less`);
    }

    return errors;
}

export function validateReviewTakedownRequest(data: { review_notes?: string }): string[] {
    const errors: string[] = [];

    if (data.review_notes !== undefined && data.review_notes.length > TDR_MAX_REVIEW_NOTES_LEN) {
        errors.push(`review_notes must be ${TDR_MAX_REVIEW_NOTES_LEN} characters or less`);
    }

    return errors;
}
