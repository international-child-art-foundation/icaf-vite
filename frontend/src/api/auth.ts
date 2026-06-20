import type {
  AuthStatusResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ConfirmForgotPasswordRequest,
  ConfirmForgotPasswordResponse,
  CreateAndVerifyRequest,
  CreateAndVerifyResponse,
  CreateAndVerifyStatusResponse,
  DefaultRegistrationRequest,
  DefaultRegistrationResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RequestCreateAndVerifyRequest,
  RequestCreateAndVerifyResponse,
  RecoverCreateAndVerifyRequest,
  RecoverCreateAndVerifyResponse,
  ResendVerificationEmailRequest,
  ResendVerificationEmailResponse,
} from '@icaf/shared';

import {
  ApiError,
  apiRequest,
  hasApiMessage,
  hasStringProperty,
  isApiObject,
} from './client';
import { apiEndpoints } from './endpoints';

function isMessageResponse(response: unknown): response is { message: string } {
  return hasApiMessage(response);
}

function isDeliveryMessageResponse(response: unknown): boolean {
  return (
    isMessageResponse(response) &&
    hasStringProperty(response, 'delivery_medium')
  );
}

function isCreateAndVerifyResponse(
  response: unknown,
): response is CreateAndVerifyResponse {
  return (
    isMessageResponse(response) &&
    (!('already_verified' in response) ||
      typeof response.already_verified === 'boolean')
  );
}

function isCreateAndVerifyStatusResponse(
  response: unknown,
): response is CreateAndVerifyStatusResponse {
  return (
    isApiObject(response) &&
    typeof response.status === 'string' &&
    ['valid', 'expired', 'invalid', 'already_verified'].includes(
      response.status,
    ) &&
    (!('expires_at' in response) || typeof response.expires_at === 'number')
  );
}

function isAuthStatusResponse(response: unknown): response is AuthStatusResponse {
  if (!isApiObject(response) || typeof response.authenticated !== 'boolean') {
    return false;
  }

  if (!response.authenticated) return true;

  return (
    hasStringProperty(response, 'user_id') &&
    hasStringProperty(response, 'email') &&
    hasStringProperty(response, 'role')
  );
}

function isLoginResponse(response: unknown): response is LoginResponse {
  return (
    isMessageResponse(response) &&
    hasStringProperty(response, 'user_id') &&
    hasStringProperty(response, 'email') &&
    hasStringProperty(response, 'role')
  );
}

export function login(request: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse, LoginRequest>(apiEndpoints.auth.login, {
    body: request,
    method: 'POST',
    validate: isLoginResponse,
  });
}

export function logout(): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>(apiEndpoints.auth.logout, {
    method: 'POST',
    validate: isMessageResponse,
  });
}

function requestAuthStatus(): Promise<AuthStatusResponse> {
  return apiRequest<AuthStatusResponse>(apiEndpoints.auth.status, {
    validate: isAuthStatusResponse,
  });
}

export async function getAuthStatus(): Promise<AuthStatusResponse> {
  const auth = await requestAuthStatus();
  if (auth.authenticated) return auth;

  try {
    await apiRequest<{ message: string }>(apiEndpoints.auth.refresh, {
      method: 'POST',
      validate: isMessageResponse,
    });
  } catch (error) {
    // A missing, expired, or revoked refresh token means the user is simply
    // signed out. Surface other failures so an outage is not mistaken for one.
    if (error instanceof ApiError && error.status === 401) return auth;
    throw error;
  }

  return requestAuthStatus();
}

export function defaultRegistration(
  request: DefaultRegistrationRequest,
): Promise<DefaultRegistrationResponse> {
  return apiRequest<DefaultRegistrationResponse, DefaultRegistrationRequest>(
    apiEndpoints.auth.defaultRegistration,
    { body: request, method: 'POST', validate: isDeliveryMessageResponse },
  );
}

export function requestCreateAndVerify(
  request: RequestCreateAndVerifyRequest,
): Promise<RequestCreateAndVerifyResponse> {
  return apiRequest<RequestCreateAndVerifyResponse, RequestCreateAndVerifyRequest>(
    apiEndpoints.auth.requestCreateAndVerify,
    { body: request, method: 'POST', validate: isMessageResponse },
  );
}

export function createAndVerify(
  request: CreateAndVerifyRequest,
): Promise<CreateAndVerifyResponse> {
  return apiRequest<CreateAndVerifyResponse, CreateAndVerifyRequest>(
    apiEndpoints.auth.createAndVerify,
    { body: request, method: 'POST', validate: isCreateAndVerifyResponse },
  );
}

export function getCreateAndVerifyStatus(
  userId: string,
  authActionToken: string,
): Promise<CreateAndVerifyStatusResponse> {
  return apiRequest<CreateAndVerifyStatusResponse>(
    apiEndpoints.auth.createAndVerifyStatus,
    {
      cacheTtlMs: 2 * 60 * 1000,
      query: {
        user_id: userId,
        auth_action_token: authActionToken,
      },
      validate: isCreateAndVerifyStatusResponse,
    },
  );
}

export function recoverCreateAndVerify(
  request: RecoverCreateAndVerifyRequest,
): Promise<RecoverCreateAndVerifyResponse> {
  return apiRequest<RecoverCreateAndVerifyResponse, RecoverCreateAndVerifyRequest>(
    apiEndpoints.auth.createAndVerifyRecovery,
    { body: request, method: 'POST', validate: isDeliveryMessageResponse },
  );
}

export function forgotPassword(
  request: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  return apiRequest<ForgotPasswordResponse, ForgotPasswordRequest>(
    apiEndpoints.auth.forgotPassword,
    { body: request, method: 'POST', validate: isMessageResponse },
  );
}

export function confirmForgotPassword(
  request: ConfirmForgotPasswordRequest,
): Promise<ConfirmForgotPasswordResponse> {
  return apiRequest<ConfirmForgotPasswordResponse, ConfirmForgotPasswordRequest>(
    apiEndpoints.auth.confirmForgotPassword,
    { body: request, method: 'POST', validate: isMessageResponse },
  );
}

export function resendVerificationEmail(
  request: ResendVerificationEmailRequest,
): Promise<ResendVerificationEmailResponse> {
  return apiRequest<ResendVerificationEmailResponse, ResendVerificationEmailRequest>(
    apiEndpoints.auth.resendVerification,
    { body: request, method: 'POST', validate: isDeliveryMessageResponse },
  );
}

export function changePassword(
  request: ChangePasswordRequest,
): Promise<ChangePasswordResponse> {
  return apiRequest<ChangePasswordResponse, ChangePasswordRequest>(
    apiEndpoints.auth.changePassword,
    { body: request, method: 'POST', validate: isMessageResponse },
  );
}
