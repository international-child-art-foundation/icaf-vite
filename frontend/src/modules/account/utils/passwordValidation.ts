import { MAX_PASSWORD_LEN } from '@icaf/shared';

export function getPasswordError(password: string): string | undefined {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (password.length > MAX_PASSWORD_LEN) {
    return `Password must be ${MAX_PASSWORD_LEN} characters or fewer.`;
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    return 'Use both uppercase and lowercase letters.';
  }
  if (!/\d/.test(password)) return 'Use at least one number.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Use at least one symbol.';
  return undefined;
}

export function getConfirmPasswordError(
  password: string,
  confirmPassword: string,
): string | undefined {
  if (!confirmPassword) return 'Please confirm your password.';
  if (confirmPassword !== password) return 'Passwords do not match.';
  return undefined;
}
