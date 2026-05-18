export function cleanOptionalString(s: unknown): string | undefined {
    if (typeof s !== 'string') return undefined;
    const cleaned = s.normalize('NFC').trim();
    return cleaned.length === 0 ? undefined : cleaned;
}

// Permissive email check — blocks obvious non-emails without being RFC-pedantic
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isValidEmail(email: string): boolean {
    return typeof email === 'string' && EMAIL_RE.test(email);
}
