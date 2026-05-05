import { SubmitArtworkRequest } from './types.js';
import { cleanOptionalString } from '../../utils/string.js';

export function sanitizeSubmissionData(data: SubmitArtworkRequest): SubmitArtworkRequest {
    return {
        ...data,
        title: cleanOptionalString(data.title),
        description: cleanOptionalString(data.description),
        f_name: cleanOptionalString(data.f_name),
        country: cleanOptionalString(data.country),
        region: cleanOptionalString(data.region),
        theme_family: cleanOptionalString(data.theme_family),
        theme_instance: cleanOptionalString(data.theme_instance),
        group_id: cleanOptionalString(data.group_id),
        legal_release_hash:
            typeof data.legal_release_hash === 'string'
                ? data.legal_release_hash.trim().toLowerCase()
                : data.legal_release_hash,
    };
}
