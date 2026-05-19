import { MAX_EMAIL_LEN, MAX_NAME_LEN, MAX_PASSWORD_LEN } from '@icaf/shared';
import type { RegisterTextFieldConfig } from '@/modules/account/types/registerForm';

export const registerTextFields: readonly RegisterTextFieldConfig[] = [
  {
    autoComplete: 'given-name',
    label: 'First name',
    maxLength: MAX_NAME_LEN,
    name: 'f_name',
    required: true,
    type: 'text',
  },
  {
    autoComplete: 'family-name',
    label: 'Last name',
    maxLength: MAX_NAME_LEN,
    name: 'l_name',
    required: true,
    type: 'text',
  },
  {
    autoComplete: 'email',
    label: 'Email',
    maxLength: MAX_EMAIL_LEN,
    name: 'email',
    required: true,
    type: 'email',
  },
  {
    autoComplete: 'new-password',
    helperText:
      'Use at least 8 characters with upper/lowercase letters and a number.',
    label: 'Password',
    maxLength: MAX_PASSWORD_LEN,
    name: 'password',
    required: true,
    type: 'password',
  },
  {
    autoComplete: 'new-password',
    label: 'Confirm password',
    maxLength: MAX_PASSWORD_LEN,
    name: 'confirmPassword',
    required: true,
    type: 'password',
  },
  {
    autoComplete: 'bday',
    label: 'Date of birth',
    name: 'dob',
    required: true,
    type: 'date',
  },
] as const;
