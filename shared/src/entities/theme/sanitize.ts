import { PatchTheme, ThemeEntity } from './types.js';
import { cleanOptionalString } from '../../utils/string.js';

export function sanitizeThemeEntity(
    data: Pick<ThemeEntity, 'theme_family' | 'theme_instance' | 'display_name' | 'description' | 'featured_on' | 'colors' | 'f_img_url' | 'i_img_url'>
): typeof data {
    return {
        ...data,
        theme_family: typeof data.theme_family === 'string' ? data.theme_family.normalize('NFC').trim().toUpperCase() : data.theme_family,
        theme_instance: typeof data.theme_instance === 'string' ? data.theme_instance.trim() : data.theme_instance,
        display_name: typeof data.display_name === 'string' ? data.display_name.normalize('NFC').trim() : data.display_name,
        description: cleanOptionalString(data.description),
        featured_on: Array.isArray(data.featured_on)
            ? data.featured_on.map((entry) => entry.normalize('NFC').trim()).filter(Boolean)
            : [],
        colors: data.colors,
        f_img_url: cleanOptionalString(data.f_img_url) ?? '',
        i_img_url: cleanOptionalString(data.i_img_url),
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

    const familyImageUrl = cleanOptionalString(data.f_img_url);
    if (familyImageUrl !== undefined) sanitized.f_img_url = familyImageUrl;
    else delete sanitized.f_img_url;

    const instanceImageUrl = cleanOptionalString(data.i_img_url);
    if (instanceImageUrl !== undefined) sanitized.i_img_url = instanceImageUrl;
    else delete sanitized.i_img_url;

    return sanitized;
}
