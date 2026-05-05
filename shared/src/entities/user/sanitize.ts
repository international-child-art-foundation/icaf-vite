import { RegisterRequest } from './types.js';
import { MAX_NAME_LEN } from './constants.js';
import { cleanOptionalString } from '../../utils/string.js';

export function sanitizeRegisterRequest(data: RegisterRequest): RegisterRequest {
    return {
        ...data,
        email: data.email.normalize('NFC').trim().toLowerCase(),
        f_name: (cleanOptionalString(data.f_name) ?? '').slice(0, MAX_NAME_LEN),
        l_name: (cleanOptionalString(data.l_name) ?? '').slice(0, MAX_NAME_LEN),
    };
}
