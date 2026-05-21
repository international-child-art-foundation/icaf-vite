import { ThemeEntity } from './types.js';
import { cleanOptionalString } from '../../utils/string.js';

export function sanitizeThemeEntity(
    data: Pick<ThemeEntity, 'theme_family' | 'theme_instance' | 'display_name' | 'description' | 'featured_on' | 'colors' | 'image_url' | 'card_image_url' | 'style'>
): typeof data {
    return {
        ...data,
        theme_family: data.theme_family.normalize('NFC').trim().toUpperCase(),
        theme_instance: data.theme_instance.trim(),
        display_name: data.display_name.normalize('NFC').trim(),
        description: cleanOptionalString(data.description),
        featured_on: Array.isArray(data.featured_on)
            ? data.featured_on.map((entry) => entry.normalize('NFC').trim()).filter(Boolean)
            : undefined,
        colors: data.colors,
        image_url: cleanOptionalString(data.image_url),
        card_image_url: cleanOptionalString(data.card_image_url),
        style: cleanOptionalString(data.style),
    };
}
