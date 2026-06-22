import { CreateThemeRequest, PatchTheme } from './types.js';
import { cleanOptionalString } from '../../utils/string.js';

function toOptionalNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    const numberValue = typeof value === 'number' ? value : Number(value);
    return numberValue;
}

export function sanitizeThemeEntity(
    data: CreateThemeRequest
): typeof data {
    const startDate = toOptionalNumber(data.start_date) ?? Number.NaN;
    const retiredAt = toOptionalNumber(data.retired_at);

    return {
        ...data,
        theme_family: typeof data.theme_family === 'string' ? data.theme_family.normalize('NFC').trim().toUpperCase() : data.theme_family,
        ...('instance_type' in data && {
            instance_type: typeof data.instance_type === 'string' ? data.instance_type.normalize('NFC').trim().toLowerCase() : data.instance_type,
        }),
        ...('theme_instance' in data && {
            theme_instance: typeof data.theme_instance === 'string' ? data.theme_instance.normalize('NFC').trim() : data.theme_instance,
        }),
        description: cleanOptionalString(data.description),
        featured_on: Array.isArray(data.featured_on)
            ? data.featured_on.map((entry) => entry.normalize('NFC').trim()).filter(Boolean)
            : [],
        start_date: startDate,
        ...(retiredAt !== undefined && { retired_at: retiredAt }),
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

    const description = cleanOptionalString(data.description);
    if (description !== undefined) sanitized.description = description;
    else delete sanitized.description;

    if (data.start_date !== undefined) sanitized.start_date = Number(data.start_date);
    else delete sanitized.start_date;

    if (data.retired_at !== undefined) sanitized.retired_at = Number(data.retired_at);
    else delete sanitized.retired_at;

    return sanitized;
}
