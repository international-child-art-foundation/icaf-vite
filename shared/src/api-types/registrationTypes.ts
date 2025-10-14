import { Role } from './userTypes';

export type RegistrationBody = {
    email: string;
    password: string;
    f_name: string;
    l_name: string;
    birthdate: string;
    role?: Role;
};

export type RegistrationResponse = {
    UUID: string;
    message?: string;
};

export type RegistrationError = {
    message: string;
};

export function validateRegistrationBody(body: any): body is RegistrationBody {
    return (
        typeof body === 'object' &&
        typeof body.email === 'string' &&
        typeof body.password === 'string' &&
        typeof body.f_name === 'string' &&
        typeof body.l_name === 'string' &&
        typeof body.birthdate === 'string'
    );
}

export const DEFAULT_REGISTRATION_BODY: RegistrationBody = {
    email: '',
    password: '',
    f_name: '',
    l_name: '',
    birthdate: ''
};

// Verify Account types
export type VerifyAccountRequest = {
    email: string;
};

export type VerifyAccountResponse = {
    message: string;
    user_id: string;
    f_name: string;
    l_name: string;
    role: string;
}; 