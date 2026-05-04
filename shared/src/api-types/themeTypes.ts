/**
 * Theme Types
 *
 * Types for THEME entities — the categories that artworks and groups belong to.
 *
 * DynamoDB THEME entity key structure:
 *   PK = 'THEME'
 *   SK = 'FAMILY#<theme_family>#INSTANCE#<theme_instance>'
 *
 * This allows:
 *   - Fetching ALL themes: PK='THEME'
 *   - Fetching all instances of a family: begins_with(SK, 'FAMILY#CHERRYBLOSSOM')
 *
 * theme_family: short uppercase identifier, e.g. 'CHERRYBLOSSOM', 'ARTSOLYMPIAD'
 * theme_instance: zero-padded 4-digit string; sometimes a year ('2025'), sometimes
 *   an arbitrary counter ('0007'). Never sorted — just for differentiation.
 *
 * Enforcement of valid theme_family/theme_instance values on submitted artwork is
 * primarily frontend-handled; backend does not enforce membership (would be cumbersome).
 */

// Full THEME entity as stored in DynamoDB
export interface ThemeEntity {
    // PK = 'THEME', SK = 'FAMILY#<theme_family>#INSTANCE#<theme_instance>'
    theme_family: string;       // e.g. 'CHERRYBLOSSOM'
    theme_instance: string;     // zero-padded 4 digits, e.g. '2025' or '0007'
    display_name: string;       // human-readable, e.g. 'Cherry Blossom 2025'
    description?: string;       // prompt / description shown on the theme page
    type: 'THEME';
}

// API response shape for theme lists
export interface ThemeListItem {
    theme_family: string;
    theme_instance: string;
    display_name: string;
    description?: string;
}

export interface ListThemesResponse {
    themes: ThemeListItem[];
    count: number;
}

// Helper: build DynamoDB SK for a theme
export function buildThemeSK(family: string, instance: string): string {
    return `FAMILY#${family}#INSTANCE#${instance}`;
}

// Helper: build human-readable composite key for display/logging
export function themeKey(family: string, instance: string): string {
    return `${family}/${instance}`;
}
