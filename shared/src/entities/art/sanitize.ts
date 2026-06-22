import { SubmitArtworkRequest } from './types.js';
import { cleanOptionalString } from '../../utils/string.js';

export function sanitizeSubmissionData(data: SubmitArtworkRequest): SubmitArtworkRequest {
    return {
        ...data,
        title: cleanOptionalString(data.title),
        description: cleanOptionalString(data.description),
        f_name: cleanOptionalString(data.f_name),
        l_name: cleanOptionalString(data.l_name),
        country: cleanOptionalString(data.country),
        region: cleanOptionalString(data.region),
        theme: cleanOptionalString(data.theme),
        digital_signature:
            typeof data.digital_signature === 'string'
                ? data.digital_signature.trim()
                : data.digital_signature,
    };
}
