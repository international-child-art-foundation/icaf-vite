export function cleanOptionalString(s: unknown): string | undefined {
    if (typeof s !== 'string') return undefined;
    const cleaned = s.normalize('NFC').trim();
    return cleaned.length === 0 ? undefined : cleaned;
}
