import { PatchTheme, ThemeEntity } from './types.js';
import { cleanOptionalString } from '../../utils/string.js';

export function sanitizeThemeEntity(
    data: Pick<ThemeEntity, 'theme_family' | 'theme_instance' | 'display_name' | 'description' | 'featured_on' | 'colors' | 'image_url'>
): typeof data {
    return {
        ...data,
        theme_family: data.theme_family.normalize('NFC').trim().toUpperCase(),
        theme_instance: data.theme_instance.trim(),
        display_name: data.display_name.normalize('NFC').trim(),
        description: cleanOptionalString(data.description),
        featured_on: Array.isArray(data.featured_on)
            ? data.featured_on.map((entry) => entry.normalize('NFC').trim()).filter(Boolean)
            : [],
        colors: data.colors,
        image_url: cleanOptionalString(data.image_url),
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

    if (data.colors !== undefined) sanitized.colors = data.colors;
    else delete sanitized.colors;

    const displayName = cleanOptionalString(data.display_name);
    if (displayName !== undefined) sanitized.display_name = displayName;
    else delete sanitized.display_name;

    const description = cleanOptionalString(data.description);
    if (description !== undefined) sanitized.description = description;
    else delete sanitized.description;

    const imageUrl = cleanOptionalString(data.image_url);
    if (imageUrl !== undefined) sanitized.image_url = imageUrl;
    else delete sanitized.image_url;

    return sanitized;
}
