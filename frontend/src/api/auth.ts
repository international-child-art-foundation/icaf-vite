import type {
  AuthStatusResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ConfirmDefaultRegistrationRequest,
  ConfirmDefaultRegistrationResponse,
  ConfirmForgotPasswordRequest,
  ConfirmForgotPasswordResponse,
  CreateAndVerifyRequest,
  CreateAndVerifyResponse,
  DefaultRegistrationRequest,
  DefaultRegistrationResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RequestCreateAndVerifyRequest,
  RequestCreateAndVerifyResponse,
  ResendVerificationEmailRequest,
  ResendVerificationEmailResponse,
} from '@icaf/shared';

import { apiRequest } from './client';
import { apiEndpoints } from './endpoints';

export function login(request: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse, LoginRequest>(apiEndpoints.auth.login, {
    body: request,
    method: 'POST',
  });
}

export function logout(): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>(apiEndpoints.auth.logout, { method: 'POST' });
}

export function getAuthStatus(): Promise<AuthStatusResponse> {
  return apiRequest<AuthStatusResponse>(apiEndpoints.auth.status);
}

export function defaultRegistration(
  request: DefaultRegistrationRequest,
): Promise<DefaultRegistrationResponse> {
  return apiRequest<DefaultRegistrationResponse, DefaultRegistrationRequest>(
    apiEndpoints.auth.defaultRegistration,
    { body: request, method: 'POST' },
  );
}

export function confirmDefaultRegistration(
  request: ConfirmDefaultRegistrationRequest,
): Promise<ConfirmDefaultRegistrationResponse> {
  return apiRequest<ConfirmDefaultRegistrationResponse, ConfirmDefaultRegistrationRequest>(
    apiEndpoints.auth.confirmDefaultRegistration,
    { body: request, method: 'POST' },
  );
}

export function requestCreateAndVerify(
  request: RequestCreateAndVerifyRequest,
): Promise<RequestCreateAndVerifyResponse> {
  return apiRequest<RequestCreateAndVerifyResponse, RequestCreateAndVerifyRequest>(
    apiEndpoints.auth.requestCreateAndVerify,
    { body: request, method: 'POST' },
  );
}

export function createAndVerify(
  request: CreateAndVerifyRequest,
): Promise<CreateAndVerifyResponse> {
  return apiRequest<CreateAndVerifyResponse, CreateAndVerifyRequest>(
    apiEndpoints.auth.createAndVerify,
    { body: request, method: 'POST' },
  );
}

export function forgotPassword(
  request: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  return apiRequest<ForgotPasswordResponse, ForgotPasswordRequest>(
    apiEndpoints.auth.forgotPassword,
    { body: request, method: 'POST' },
  );
}

export function confirmForgotPassword(
  request: ConfirmForgotPasswordRequest,
): Promise<ConfirmForgotPasswordResponse> {
  return apiRequest<ConfirmForgotPasswordResponse, ConfirmForgotPasswordRequest>(
    apiEndpoints.auth.confirmForgotPassword,
    { body: request, method: 'POST' },
  );
}

export function resendVerificationEmail(
  request: ResendVerificationEmailRequest,
): Promise<ResendVerificationEmailResponse> {
  return apiRequest<ResendVerificationEmailResponse, ResendVerificationEmailRequest>(
    apiEndpoints.auth.resendVerification,
    { body: request, method: 'POST' },
  );
}

export function changePassword(
  request: ChangePasswordRequest,
): Promise<ChangePasswordResponse> {
  return apiRequest<ChangePasswordResponse, ChangePasswordRequest>(
    apiEndpoints.auth.changePassword,
    { body: request, method: 'POST' },
  );
}
