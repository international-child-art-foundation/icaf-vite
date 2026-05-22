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

export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}
