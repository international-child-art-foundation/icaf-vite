import { InitiateMagazineUploadRequest } from './types.js';

// Slugs must be URL-path-safe: letters, digits, &, +, -, _, .
// Matches the historical ICAF magazine folder naming convention.
const SLUG_PATTERN = /^[A-Za-z0-9&+\-_.]+$/;
const MAX_SLUG_LEN = 120;
const MAX_FIELD_LEN = 200;

function isReservedPathSegment(value: string): boolean {
    return value === '.' || value === '..';
}

export function validateInitiateMagazineUploadRequest(data: InitiateMagazineUploadRequest): string[] {
    const errors: string[] = [];

    if (!data.slug || typeof data.slug !== 'string') {
        errors.push('slug is required');
    } else if (data.slug.length > MAX_SLUG_LEN) {
        errors.push(`slug must be ${MAX_SLUG_LEN} characters or less`);
    } else if (isReservedPathSegment(data.slug)) {
        errors.push('slug cannot be . or ..');
    } else if (!SLUG_PATTERN.test(data.slug)) {
        errors.push('slug may only contain letters, digits, &, +, -, _, .');
    }

    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
        errors.push('name is required');
    } else if (data.name.length > MAX_FIELD_LEN) {
        errors.push(`name must be ${MAX_FIELD_LEN} characters or less`);
    }

    if (!data.period || typeof data.period !== 'string' || !data.period.trim()) {
        errors.push('period is required');
    } else if (data.period.length > MAX_FIELD_LEN) {
        errors.push(`period must be ${MAX_FIELD_LEN} characters or less`);
    }

    if (!data.volume || typeof data.volume !== 'string' || !data.volume.trim()) {
        errors.push('volume is required');
    } else if (data.volume.length > MAX_FIELD_LEN) {
        errors.push(`volume must be ${MAX_FIELD_LEN} characters or less`);
    }

    return errors;
}

export function isValidMagazineSlug(slug: string): boolean {
    return (
        typeof slug === 'string' &&
        slug.length > 0 &&
        slug.length <= MAX_SLUG_LEN &&
        !isReservedPathSegment(slug) &&
        SLUG_PATTERN.test(slug)
    );
}

export function validateMagazineSlug(slug: string): string[] {
    const errors: string[] = [];

    if (typeof slug !== 'string' || !slug.trim()) {
        errors.push('slug path parameter is required');
    } else if (slug.length > MAX_SLUG_LEN) {
        errors.push(`slug must be ${MAX_SLUG_LEN} characters or less`);
    } else if (isReservedPathSegment(slug)) {
        errors.push('slug cannot be . or ..');
    } else if (!isValidMagazineSlug(slug)) {
        errors.push('slug may only contain letters, digits, &, +, -, _, .');
    }

    return errors;
}
