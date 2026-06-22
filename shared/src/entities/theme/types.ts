/**
 * Theme Types
 *
 * Types for THEME entities — the categories that artworks and groups belong to.
 *
 * DynamoDB THEME entity key structure:
 *   PK = 'THEME'
 *   SK = 'FAMILY#<theme_family>'
 *   SK = 'FAMILY#<theme_family>#<instance_type>#<theme_instance>'
 */

export type ThemeInstanceType = string;

interface ThemeBase {
    theme_family: string;       // e.g. 'CHERRY_BLOSSOM'
    description?: string;       // description of family or this individual instance
    featured_on: string[];      // surfaces where this theme is featured, e.g. ['gallery']
    start_date: number;         // date added to the theme list, stored as epoch milliseconds
    retired_at?: number;        // timestamp after which non-admin submissions are closed
    type: 'THEME';
}

export type ThemeFamilyEntity = ThemeBase & {
    instance_type?: never;
    theme_instance?: never;
};

export type ThemeInstanceEntity = ThemeBase & {
    instance_type: ThemeInstanceType; // currently 'year' or 'count', but extensible
    theme_instance: string;
};

// Full THEME entity as stored in DynamoDB
export type ThemeEntity = ThemeFamilyEntity | ThemeInstanceEntity;

export type ThemeEntityInput = ThemeBase & Partial<Pick<ThemeInstanceEntity, 'instance_type' | 'theme_instance'>>;

export type CreateThemeRequest = Omit<ThemeEntityInput, 'type'>;

export type PatchTheme = Partial<
    Pick<ThemeBase, "description" | "featured_on" | "start_date" | "retired_at">
>;

// API response shape for theme lists
export interface ThemeListItem {
    theme_sk: string;
    theme_family: string;
    instance_type?: ThemeInstanceType;
    theme_instance?: string;
    description?: string;
    featured_on: string[];
    start_date: number;
    retired_at?: number;
}

export interface ListThemesResponse {
    themes: ThemeListItem[];
    count: number;
}

export interface createThemeResponse {
    success: true;
    message: string;
}

export type ParsedThemeSk =
    | {
        theme_sk: string;
        theme_family: string;
        instance_type?: undefined;
        theme_instance?: undefined;
        kind: 'family';
    }
    | {
        theme_sk: string;
        theme_family: string;
        instance_type: string;
        theme_instance: string;
        kind: 'instance';
    };

export function buildThemeFamilySK(family: string): string {
    return `FAMILY#${family}`;
}

export function buildThemeInstanceSK(family: string, instanceType: string, instance: string): string {
    return `FAMILY#${family}#${instanceType}#${instance}`;
}

// Helper: build DynamoDB SK for a theme
export function buildThemeSK(theme: Pick<ThemeEntity, 'theme_family'> & Partial<Pick<ThemeInstanceEntity, 'instance_type' | 'theme_instance'>>): string {
    return theme.instance_type && theme.theme_instance
        ? buildThemeInstanceSK(theme.theme_family, theme.instance_type, theme.theme_instance)
        : buildThemeFamilySK(theme.theme_family);
}

export function parseThemeSK(themeSk: string): ParsedThemeSk | null {
    const parts = themeSk.split('#');
    if (parts.length === 2 && parts[0] === 'FAMILY' && parts[1]) {
        return {
            theme_sk: themeSk,
            theme_family: parts[1],
            kind: 'family',
        };
    }

    if (parts.length === 4 && parts[0] === 'FAMILY' && parts[1] && parts[2] && parts[3]) {
        return {
            theme_sk: themeSk,
            theme_family: parts[1],
            instance_type: parts[2],
            theme_instance: parts[3],
            kind: 'instance',
        };
    }

    return null;
}

const LOWERCASE_THEME_WORDS = new Set(['a', 'an', 'and', 'at', 'by', 'for', 'from', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);

function titleCaseThemeWord(word: string, index: number): string {
    const normalized = word.toLowerCase();
    if (index > 0 && LOWERCASE_THEME_WORDS.has(normalized)) return normalized;
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function ordinal(value: number): string {
    const mod100 = value % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
    switch (value % 10) {
        case 1:
            return `${value}st`;
        case 2:
            return `${value}nd`;
        case 3:
            return `${value}rd`;
        default:
            return `${value}th`;
    }
}

export function formatThemeFamilyName(family?: string): string {
    if (!family) return '';
    return family
        .replace(/_/g, ' ')
        .trim()
        .split(/\s+/)
        .map(titleCaseThemeWord)
        .join(' ');
}

export function formatThemeDisplayName(theme: Pick<ThemeListItem, 'theme_family'> & Partial<Pick<ThemeListItem, 'instance_type' | 'theme_instance'>>): string {
    const familyName = formatThemeFamilyName(theme.theme_family);
    if (!theme.instance_type || !theme.theme_instance) return familyName;

    if (theme.instance_type === 'year') return `${familyName} ${theme.theme_instance}`;
    if (theme.instance_type === 'count') {
        const count = Number(theme.theme_instance);
        return Number.isFinite(count) && count > 0
            ? `${ordinal(count)} ${familyName}`
            : `${theme.theme_instance} ${familyName}`;
    }

    return `${familyName} ${theme.theme_instance}`;
}

// Helper: build human-readable composite key for display/logging
export function themeKey(themeSk: string): string {
    const parsed = parseThemeSK(themeSk);
    if (!parsed) return themeSk;
    return parsed.kind === 'instance'
        ? `${parsed.theme_family}/${parsed.instance_type}/${parsed.theme_instance}`
        : parsed.theme_family;
}
