import { PatchTheme, ThemeEntity } from "./types";

const THEME_INSTANCE_RE = /^\d{4}$/;
const THEME_FAMILY_RE = /^[A-Z0-9_]+$/;

export function validateThemeEntity(data: ThemeEntity): string[] {
    const errors: string[] = [];

    if (!data.theme_family?.trim()) {
        errors.push('theme_family is required');
    } else if (!THEME_FAMILY_RE.test(data.theme_family)) {
        errors.push('theme_family must be uppercase alphanumeric (underscores allowed)');
    }

    if (!data.theme_instance) {
        errors.push('theme_instance is required');
    } else if (!THEME_INSTANCE_RE.test(data.theme_instance)) {
        errors.push('theme_instance must be a zero-padded 4-digit string');
    }

    if (!data.display_name?.trim()) {
        errors.push('display_name is required');
    }
    if (!data.featured_on) {
        errors.push('featured_on is required (can be initialized to [""]');
    }
    if (!data.colors) {
        errors.push('colors object is required (can be empty object)');
    }

    if (
        data.featured_on !== undefined &&
        (!Array.isArray(data.featured_on) ||
            data.featured_on.some((entry: unknown) => typeof entry !== 'string' || !entry.trim()))
    ) {
        errors.push('featured_on, if provided, must be an array of non-empty strings');
    }

    if (data.colors !== undefined && (typeof data.colors !== 'object' || data.colors === null || Array.isArray(data.colors))) {
        errors.push('colors, if provided, must be an object');
    }

    return errors;
}

export function validateThemePartial(data: PatchTheme): string[] {
    const errors: string[] = [];

    if (
        data.featured_on !== undefined &&
        (!Array.isArray(data.featured_on) ||
            data.featured_on.some((entry: unknown) => typeof entry !== 'string' || !entry.trim()))
    ) {
        errors.push('featured_on, if provided, must be an array of non-empty strings');
    }

    if (data.colors !== undefined && (typeof data.colors !== 'object' || data.colors === null || Array.isArray(data.colors))) {
        errors.push('colors, if provided, must be an object');
    }

    return errors;
}

export function isValidThemeFamily(themeFamily: string): boolean {
    return THEME_FAMILY_RE.test(themeFamily);
}

export function isValidThemeInstance(themeInstance: string): boolean {
    return THEME_INSTANCE_RE.test(themeInstance);
}

export function isValidThemeSk(themeSk: string): boolean {
  return /^FAMILY#[A-Z0-9_]+#INSTANCE#\d{4}$/.test(themeSk);
}

export function validateThemeSk(themeSk: string): string[] {
    const errors: string[] = [];

    if (typeof themeSk !== 'string' || !themeSk.trim()) {
        errors.push('theme_sk path parameter is required');
    } else if (!isValidThemeSk(themeSk)) {
        errors.push('theme_sk is invalid');
    }

    return errors;
}
