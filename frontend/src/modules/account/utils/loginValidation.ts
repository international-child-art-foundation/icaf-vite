import { MAX_EMAIL_LEN, MAX_PASSWORD_LEN, normalizeEmail } from '@icaf/shared';
import type {
  LoginFieldName,
  LoginFormErrors,
  LoginFormValues,
} from '@/modules/account/types/loginForm';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const initialLoginFormValues: LoginFormValues = {
  email: '',
  password: '',
};

export function getLoginFieldError(
  name: LoginFieldName,
  values: LoginFormValues,
): string | undefined {
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
    if (values.password.length > MAX_PASSWORD_LEN) {
      return `Password must be ${MAX_PASSWORD_LEN} characters or fewer.`;
    }
  }

  return undefined;
}

export function validateLoginForm(values: LoginFormValues): LoginFormErrors {
  const fieldNames: LoginFieldName[] = ['email', 'password'];

  return fieldNames.reduce<LoginFormErrors>((errors, fieldName) => {
    const error = getLoginFieldError(fieldName, values);
    if (error) errors[fieldName] = error;
    return errors;
  }, {});
}

export function hasLoginErrors(errors: LoginFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function toLoginRequest(values: LoginFormValues) {
  return {
    email: normalizeEmail(values.email),
    password: values.password,
  };
}
