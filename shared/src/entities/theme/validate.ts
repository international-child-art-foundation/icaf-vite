
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

    return errors;
}
