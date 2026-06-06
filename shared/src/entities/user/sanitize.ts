import { DefaultRegistrationRequest } from './types.js';
import { MAX_NAME_LEN } from './constants.js';
import { cleanOptionalString, normalizeEmail } from '../../utils/string.js';

export function sanitizeDefaultRegistrationRequest(data: DefaultRegistrationRequest): DefaultRegistrationRequest {
    return {
        ...data,
        email: normalizeEmail(data.email),
        f_name: (cleanOptionalString(data.f_name) ?? '').slice(0, MAX_NAME_LEN),
        l_name: (cleanOptionalString(data.l_name) ?? '').slice(0, MAX_NAME_LEN),
    };
}
