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

// Change Password types
export type ChangePasswordRequest = {
    access_token: string;
    old_password: string;
    new_password: string;
};

export type ChangePasswordResponse = {
    message: string;
};

// Magazine Subscription types
export type SubscribeMagazineRequest = {
    // TODO: Add payment fields after meeting decision
    // Possible fields:
    // - donation_amount_cents?: number;
    // - payment_method_id?: string; // Stripe payment method
    // - billing_address?: Address;
};

export type SubscribeMagazineResponse = {
    message: string;
    has_magazine_subscription: boolean;
    subscription_date: string;
    // TODO: Add after meeting decision
    // - subscription_id?: string;
    // - end_date?: string; // if subscription-based
    // - amount_paid_cents?: number;
};

export type UnsubscribeMagazineRequest = {
    // TODO: Add fields after meeting decision
    // Possible fields:
    // - reason?: string; // cancellation reason
};

export type UnsubscribeMagazineResponse = {
    message: string;
    has_magazine_subscription: boolean;
    unsubscription_date: string;
    // TODO: Add after meeting decision
    // - refund_amount_cents?: number;
    // - refund_id?: string;
};

// Resend Verification Email types
export type ResendVerificationEmailRequest = {
    email: string;
};

export type ResendVerificationEmailResponse = {
    message: string;
    delivery_medium: string; // e.g., "EMAIL"
    destination: string; // Masked email like "j***@example.com"
};

// Login types
export type LoginRequest = {
    email: string;
    password: string;
};

export type LoginResponse = {
    message: string;
    user_id: string;
    email: string;
    role: string;
};

// Logout types
export type LogoutRequest = {
    // Empty - accessToken read from Cookie header
};

export type LogoutResponse = {
    message: string;
};

// Forgot Password types
export type ForgotPasswordRequest = {
    email: string;
};

export type ForgotPasswordResponse = {
    message: string;
    delivery_medium: string; // e.g., "EMAIL"
    destination: string; // Masked email like "u***@e***.com"
};

// Confirm Forgot Password types
export type ConfirmForgotPasswordRequest = {
    email: string;
    code: string; // 6-digit verification code
    new_password: string;
};

export type ConfirmForgotPasswordResponse = {
    message: string;
};

// Get Auth Status types
export type GetAuthStatusRequest = {
    // Empty - accessToken read from Cookie header
};

export type GetAuthStatusResponse = {
    authenticated: boolean;
    user_id?: string;
    email?: string;
    role?: string;
}; 