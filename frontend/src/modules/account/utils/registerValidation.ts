import {
  MAX_EMAIL_LEN,
  MAX_NAME_LEN,
  MAX_PASSWORD_LEN,
  normalizeEmail,
} from '@icaf/shared';
import type {
  RegisterFieldName,
  RegisterFormErrors,
  RegisterFormValues,
} from '@/modules/account/types/registerForm';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const initialRegisterFormValues: RegisterFormValues = {
  confirmPassword: '',
  dob: '',
  email: '',
  f_name: '',
  has_newsletter_subscription: true,
  l_name: '',
  password: '',
};

function isRealDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isFutureDate(value: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const input = new Date(`${value}T00:00:00`);
  return input.getTime() > today.getTime();
}

export function getRegisterFieldError(
  name: RegisterFieldName,
  values: RegisterFormValues,
): string | undefined {
  const value = values[name];

  if (name === 'f_name' || name === 'l_name') {
    const label = name === 'f_name' ? 'First name' : 'Last name';
    const normalizedValue = String(value).trim();

    if (!normalizedValue) return `${label} is required.`;
    if (normalizedValue.length > MAX_NAME_LEN) {
      return `${label} must be ${MAX_NAME_LEN} characters or fewer.`;
    }
  }

  if (name === 'email') {
    const email = values.email.trim();

    if (!email) return 'Email is required.';
    if (email.length > MAX_EMAIL_LEN) {
      return `Email must be ${MAX_EMAIL_LEN} characters or fewer.`;
    }
    if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.';
  }

  if (name === 'password') {
    if (!values.password) return 'Password is required.';
    if (values.password.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    if (values.password.length > MAX_PASSWORD_LEN) {
      return `Password must be ${MAX_PASSWORD_LEN} characters or fewer.`;
    }
    if (!/[a-z]/.test(values.password) || !/[A-Z]/.test(values.password)) {
      return 'Use both uppercase and lowercase letters.';
    }
    if (!/\d/.test(values.password)) return 'Use at least one number.';
    if (!/[^A-Za-z0-9]/.test(values.password)) {
      return 'Use at least one symbol.';
    }
  }

  if (name === 'confirmPassword') {
    if (!values.confirmPassword) return 'Please confirm your password.';
    if (values.confirmPassword !== values.password) {
      return 'Passwords do not match.';
    }
  }

  if (name === 'dob') {
    if (!values.dob) return 'Date of birth is required.';
    if (!isRealDate(values.dob)) return 'Enter a valid date.';
    if (isFutureDate(values.dob))
      return 'Date of birth cannot be in the future.';
  }

  return undefined;
}

export function validateRegisterForm(
  values: RegisterFormValues,
): RegisterFormErrors {
  const fieldNames: RegisterFieldName[] = [
    'f_name',
    'l_name',
    'email',
    'password',
    'confirmPassword',
    'dob',
  ];

  return fieldNames.reduce<RegisterFormErrors>((errors, fieldName) => {
    const error = getRegisterFieldError(fieldName, values);
    if (error) errors[fieldName] = error;
    return errors;
  }, {});
}

export function hasRegisterErrors(errors: RegisterFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function toDefaultRegistrationRequest(values: RegisterFormValues) {
  return {
    dob: values.dob,
    email: normalizeEmail(values.email),
    f_name: values.f_name.trim(),
    has_newsletter_subscription: values.has_newsletter_subscription,
    l_name: values.l_name.trim(),
    password: values.password,
  };
}
