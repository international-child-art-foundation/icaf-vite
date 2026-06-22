import { PatchTheme, ThemeEntityInput } from "./types";

const THEME_FAMILY_RE = /^[A-Z0-9_]+$/;
const THEME_INSTANCE_TYPE_RE = /^[a-z][a-z0-9_]*$/;
const THEME_INSTANCE_RE = /^[^#/\s]+$/;
const THEME_FAMILY_SK_RE = /^FAMILY#[A-Z0-9_]+$/;
const THEME_INSTANCE_SK_RE = /^FAMILY#[A-Z0-9_]+#[a-z][a-z0-9_]*#[^#/\s]+$/;

function isFiniteOptionalTimestamp(value: unknown): boolean {
    return value === undefined || (typeof value === 'number' && Number.isFinite(value));
}

export function validateThemeEntity(data: ThemeEntityInput): string[] {
    const errors: string[] = [];

    if (!data.theme_family?.trim()) {
        errors.push('theme_family is required');
    } else if (!THEME_FAMILY_RE.test(data.theme_family)) {
        errors.push('theme_family must be uppercase alphanumeric (underscores allowed)');
    }

    const hasInstanceType = 'instance_type' in data && data.instance_type !== undefined;
    const hasThemeInstance = 'theme_instance' in data && data.theme_instance !== undefined;
    if (hasInstanceType !== hasThemeInstance) {
        errors.push('instance_type and theme_instance must be provided together');
    }
    if (hasInstanceType) {
        if (!data.instance_type || !THEME_INSTANCE_TYPE_RE.test(data.instance_type)) {
            errors.push('instance_type must be lowercase alphanumeric (underscores allowed)');
        }
        if (!data.theme_instance || !THEME_INSTANCE_RE.test(data.theme_instance)) {
            errors.push('theme_instance must be a non-empty string without #');
        }
    }

    if (!data.featured_on) {
        errors.push('featured_on is required (can be initialized to [])');
    }
    if (typeof data.start_date !== 'number' || !Number.isFinite(data.start_date)) {
        errors.push('start_date is required and must be a finite number');
    }
    if (!isFiniteOptionalTimestamp(data.retired_at)) {
        errors.push('retired_at, if provided, must be a finite number');
    }

    if (
        data.featured_on !== undefined &&
        (!Array.isArray(data.featured_on) ||
            data.featured_on.some((entry: unknown) => typeof entry !== 'string' || !entry.trim()))
    ) {
        errors.push('featured_on, if provided, must be an array of non-empty strings');
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

    if (data.start_date !== undefined && (typeof data.start_date !== 'number' || !Number.isFinite(data.start_date))) {
        errors.push('start_date, if provided, must be a finite number');
    }
    if (!isFiniteOptionalTimestamp(data.retired_at)) {
        errors.push('retired_at, if provided, must be a finite number');
    }

    return errors;
}

export function isValidThemeFamily(themeFamily: string): boolean {
    return THEME_FAMILY_RE.test(themeFamily);
}

export function isValidThemeInstance(themeInstance: string): boolean {
    return THEME_INSTANCE_RE.test(themeInstance);
}

export function isValidThemeInstanceType(instanceType: string): boolean {
    return THEME_INSTANCE_TYPE_RE.test(instanceType);
}

export function isValidThemeSk(themeSk: string): boolean {
  return THEME_FAMILY_SK_RE.test(themeSk) || THEME_INSTANCE_SK_RE.test(themeSk);
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
