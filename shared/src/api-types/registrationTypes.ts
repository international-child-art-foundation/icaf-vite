export type RegistrationBody = {
    email: string;
    password: string;
    f_name: string;
    l_name: string;
    birthdate: string;
    is_guardian?: boolean;
    access_level?: string;
    g_f_name?: string;
    g_l_name?: string;
};

export type RegistrationResponse = {
    UUID: string;
    message?: string;
};

export type RegistrationError = {
    message: string;
};

// Valid access levels in order of permissions (Admin > Contributor > Guardian > User)
export const ACCESS_LEVELS = ['admin', 'contributor', 'guardian', 'user'] as const;
export type AccessLevel = typeof ACCESS_LEVELS[number];

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