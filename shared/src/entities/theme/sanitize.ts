import { ThemeEntity } from './types.js';
import { cleanOptionalString } from '../../utils/string.js';

export function sanitizeThemeEntity(
    data: Pick<ThemeEntity, 'theme_family' | 'theme_instance' | 'display_name' | 'description'>
): typeof data {
    return {
        ...data,
        theme_family: data.theme_family.normalize('NFC').trim().toUpperCase(),
        theme_instance: data.theme_instance.trim(),
        display_name: data.display_name.normalize('NFC').trim(),
        description: cleanOptionalString(data.description),
    };
}
