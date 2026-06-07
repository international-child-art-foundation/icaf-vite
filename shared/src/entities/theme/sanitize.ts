import { PatchTheme, ThemeEntity } from './types.js';
import { cleanOptionalString } from '../../utils/string.js';

export function sanitizeThemeEntity(
    data: Pick<ThemeEntity, 'theme_family' | 'theme_instance' | 'display_name' | 'description' | 'featured_on' | 'start_date'>
): typeof data {
    const rawStartDate = data.start_date as unknown;
    const startDate = typeof rawStartDate === 'number'
        ? rawStartDate
        : typeof rawStartDate === 'string'
            ? Number(rawStartDate)
            : Number.NaN;

    return {
        ...data,
        theme_family: typeof data.theme_family === 'string' ? data.theme_family.normalize('NFC').trim().toUpperCase() : data.theme_family,
        theme_instance: typeof data.theme_instance === 'string' ? data.theme_instance.trim() : data.theme_instance,
        display_name: typeof data.display_name === 'string' ? data.display_name.normalize('NFC').trim() : data.display_name,
        description: cleanOptionalString(data.description),
        featured_on: Array.isArray(data.featured_on)
            ? data.featured_on.map((entry) => entry.normalize('NFC').trim()).filter(Boolean)
            : [],
        start_date: startDate,
    };
}

export function sanitizeThemePartial(
    data: PatchTheme
): PatchTheme {
    const sanitized: PatchTheme = {
        ...data,
    };

    if (Array.isArray(data.featured_on)) {
        sanitized.featured_on = data.featured_on.map((entry) => entry.normalize('NFC').trim()).filter(Boolean);
    } else {
        delete sanitized.featured_on;
    }

    const displayName = cleanOptionalString(data.display_name);
    if (displayName !== undefined) sanitized.display_name = displayName;
    else delete sanitized.display_name;

    const description = cleanOptionalString(data.description);
    if (description !== undefined) sanitized.description = description;
    else delete sanitized.description;

    if (data.start_date !== undefined) sanitized.start_date = Number(data.start_date);
    else delete sanitized.start_date;

    return sanitized;
}
