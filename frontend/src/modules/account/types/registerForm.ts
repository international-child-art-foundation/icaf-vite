import type { DefaultRegistrationRequest } from '@icaf/shared';

export type RegisterFieldName =
  | keyof DefaultRegistrationRequest
  | 'confirmPassword';

export type RegisterFormValues = DefaultRegistrationRequest & {
  confirmPassword: string;
};

export type RegisterFormErrors = Partial<Record<RegisterFieldName, string>>;

export type RegisterTextFieldName = Exclude<
  RegisterFieldName,
  'has_newsletter_subscription'
>;

export type RegisterTextFieldConfig = {
  autoComplete?: string;
  helperText?: string;
  label: string;
  maxLength?: number;
  name: RegisterTextFieldName;
  required?: boolean;
  type: 'date' | 'email' | 'password' | 'text';
};
