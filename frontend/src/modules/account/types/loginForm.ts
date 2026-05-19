import type { LoginRequest } from '@icaf/shared';

export type LoginFieldName = keyof LoginRequest;

export type LoginFormValues = LoginRequest;

export type LoginFormErrors = Partial<Record<LoginFieldName, string>>;

export type LoginTextFieldConfig = {
  autoComplete?: string;
  helperText?: string;
  label: string;
  maxLength?: number;
  name: LoginFieldName;
  required?: boolean;
  type: 'email' | 'password';
};
