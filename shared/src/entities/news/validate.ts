import { CreateNewsRequest, UpdateNewsRequest, NewsKind } from './types.js';

const MAX_SOURCE_LEN = 200;
const MAX_BODY_LEN = 1000;
const MAX_DATE_LEN = 100;
const MAX_PLACE_LEN = 200;
const MAX_URL_LEN = 2000;
const VALID_KINDS: NewsKind[] = ['article', 'audio'];

function validateNewsFields(data: Partial<CreateNewsRequest>): string[] {
    const errors: string[] = [];

    if (data.source !== undefined) {
        if (typeof data.source !== 'string' || !data.source.trim()) {
            errors.push('source must be a non-empty string');
        } else if (data.source.length > MAX_SOURCE_LEN) {
            errors.push(`source must be ${MAX_SOURCE_LEN} characters or less`);
        }
    }

    if (data.body !== undefined) {
        if (typeof data.body !== 'string' || !data.body.trim()) {
            errors.push('body must be a non-empty string');
        } else if (data.body.length > MAX_BODY_LEN) {
            errors.push(`body must be ${MAX_BODY_LEN} characters or less`);
        }
    }

    if (data.date !== undefined) {
        if (typeof data.date !== 'string' || !data.date.trim()) {
            errors.push('date must be a non-empty string');
        } else if (data.date.length > MAX_DATE_LEN) {
            errors.push(`date must be ${MAX_DATE_LEN} characters or less`);
        }
    }

    if (data.timestamp !== undefined) {
        if (!Number.isInteger(data.timestamp) || data.timestamp < 0) {
            errors.push('timestamp must be a non-negative integer (Unix seconds)');
        }
    }

    if (data.kind !== undefined && !VALID_KINDS.includes(data.kind)) {
        errors.push(`kind must be one of: ${VALID_KINDS.join(', ')}`);
    }

    if (data.place !== undefined) {
        if (typeof data.place !== 'string') {
            errors.push('place must be a string');
        } else if (data.place.length > MAX_PLACE_LEN) {
            errors.push(`place must be ${MAX_PLACE_LEN} characters or less`);
        }
    }

    if (data.link !== undefined) {
        if (typeof data.link !== 'string') {
            errors.push('link must be a string');
        } else if (data.link.length > MAX_URL_LEN) {
            errors.push(`link must be ${MAX_URL_LEN} characters or less`);
        }
    }

    if (data.src !== undefined) {
        if (typeof data.src !== 'string') {
            errors.push('src must be a string');
        } else if (data.src.length > MAX_URL_LEN) {
            errors.push(`src must be ${MAX_URL_LEN} characters or less`);
        }
    }

    return errors;
}

export function validateCreateNewsRequest(data: CreateNewsRequest): string[] {
    const errors: string[] = [];

    if (!data.source || typeof data.source !== 'string' || !data.source.trim()) {
        errors.push('source is required');
    }
    if (data.timestamp === undefined || data.timestamp === null) {
        errors.push('timestamp is required');
    }

    return [...errors, ...validateNewsFields(data)];
}

export function validateUpdateNewsRequest(data: UpdateNewsRequest): string[] {
    if (Object.keys(data).length === 0) {
        return ['at least one field must be provided'];
    }
    return validateNewsFields(data);
}
