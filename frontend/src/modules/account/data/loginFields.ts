import { MAX_EMAIL_LEN, MAX_PASSWORD_LEN } from '@icaf/shared';
import type { LoginTextFieldConfig } from '@/modules/account/types/loginForm';

export const loginTextFields: readonly LoginTextFieldConfig[] = [
  {
    autoComplete: 'email',
    label: 'Email',
    maxLength: MAX_EMAIL_LEN,
    name: 'email',
    required: true,
    type: 'email',
  },
  {
    autoComplete: 'current-password',
    label: 'Password',
    maxLength: MAX_PASSWORD_LEN,
    name: 'password',
    required: true,
    type: 'password',
  },
] as const;
