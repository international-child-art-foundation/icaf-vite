/**
 * Auth API Types
 *
 * Shared request and response shapes for cookie-based Cognito auth endpoints.
 */

import { Role } from "../entities/user/types.js";

export interface MessageResponse {
    message: string;
}

export interface DeliveryMessageResponse extends MessageResponse {
    delivery_medium: string;
    destination?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthenticatedUserSummary {
    user_id: string;
    email: string;
    role: Role;
}

export interface LoginResponse extends MessageResponse, AuthenticatedUserSummary {}

export type AuthStatusResponse =
    | ({ authenticated: true } & AuthenticatedUserSummary)
    | { authenticated: false };

export type LogoutResponse = MessageResponse;

export interface ForgotPasswordRequest {
    email: string;
}

export type ForgotPasswordResponse = DeliveryMessageResponse | MessageResponse;

export interface ConfirmForgotPasswordRequest {
    email: string;
    code: string;
    new_password: string;
}

export type ConfirmForgotPasswordResponse = MessageResponse;

export interface ResendVerificationEmailRequest {
    email: string;
}

export type ResendVerificationEmailResponse = DeliveryMessageResponse;

export interface RequestCreateAndVerifyRequest {
    email: string;
}

export type RequestCreateAndVerifyResponse = MessageResponse;

export type CreateAndVerifyResponse = MessageResponse;

export interface DefaultRegistrationResponse extends DeliveryMessageResponse {
    user_id?: string;
}

export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
}

export type ChangePasswordResponse = MessageResponse;
