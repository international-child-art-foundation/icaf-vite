export const MAX_TITLE_LEN = 200;
export const MAX_DESCRIPTION_LEN = 2000;
export const MAX_STRING_LEN = 200;
export const UPLOAD_FILE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'] as const;
export const SHA256_HEX = /^[a-f0-9]{64}$/i;
export const THEME_INSTANCE_FORMAT = /^\d{4}$/;
export const FORBIDDEN_CHARS_MULTILINE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u202A-\u202E\u2066-\u2069\u200B-\u200D\uFEFF]/;
export const FORBIDDEN_CHARS_SINGLELINE = /[\x00-\x1F\x7F\u202A-\u202E\u2066-\u2069\u200B-\u200D\uFEFF]/;