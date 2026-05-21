
const THEME_INSTANCE_RE = /^\d{4}$/;
const THEME_FAMILY_RE = /^[A-Z0-9_]+$/;

export function validateThemeEntity(data: any): string[] {
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
