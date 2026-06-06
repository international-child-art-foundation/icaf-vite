import { useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LockKeyhole, Mail } from 'lucide-react';
import type { LoginResponse } from '@icaf/shared';
import { login } from '@/api/auth';
import { getApiErrorMessage } from '@/api/client';
import { AccountTextField } from '@/modules/account/components/AccountTextField';
import { loginTextFields } from '@/modules/account/data/loginFields';
import type {
  LoginFieldName,
  LoginFormErrors,
  LoginFormValues,
} from '@/modules/account/types/loginForm';
import {
  getLoginFieldError,
  hasLoginErrors,
  initialLoginFormValues,
  toLoginRequest,
  validateLoginForm,
} from '@/modules/account/utils/loginValidation';
import { Button } from '@/shared/components/ui/button';

type LoginFormProps = {
  initialEmail?: string;
  onSuccess?: (response: LoginResponse) => void;
};

const fieldIcons: Record<LoginFieldName, ReactNode> = {
  email: <Mail aria-hidden="true" className="h-4 w-4" />,
  password: <LockKeyhole aria-hidden="true" className="h-4 w-4" />,
};

function getSubmitError(error: unknown): string {
  return getApiErrorMessage(error, 'Login failed. Please try again.');
}

export const LoginForm = ({ initialEmail = '', onSuccess }: LoginFormProps) => {
  const [values, setValues] = useState<LoginFormValues>(() => ({
    ...initialLoginFormValues,
    email: initialEmail.trim(),
  }));
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<LoginFieldName, boolean>>
  >({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>(
    'idle',
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSubmitting = status === 'submitting';

  function updateField<Name extends LoginFieldName>(
    name: Name,
    value: LoginFormValues[Name],
  ) {
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);

    if (touched[name]) {
      setErrors((current) => ({
        ...current,
        [name]: getLoginFieldError(name, nextValues),
      }));
    }
  }

  function handleTextChange(event: ChangeEvent<HTMLInputElement>) {
    const name = event.target.name as LoginFieldName;
    updateField(name, event.target.value);
  }

  function handleBlur(name: LoginFieldName) {
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors((current) => ({
      ...current,
      [name]: getLoginFieldError(name, values),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateLoginForm(values);
    setTouched({ email: true, password: true });
    setErrors(nextErrors);
    setSubmitError(null);

    if (hasLoginErrors(nextErrors)) return;

    setStatus('submitting');
    void submitLogin();
  }

  async function submitLogin() {
    try {
      const response = await login(toLoginRequest(values));
      setStatus('success');
      onSuccess?.(response);
    } catch (error) {
      setSubmitError(getSubmitError(error));
      setStatus('idle');
    }
  }

  return (
    <form
      className="mx-auto w-full max-w-xl"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-xl sm:p-8">
        <div className="mb-8">
          <p className="text-secondary-blue mb-2 text-sm font-bold uppercase tracking-widest">
            Have an account already?
          </p>
          <h1 className="font-montserrat text-3xl font-semibold text-slate-950 sm:text-4xl">
            Log into your account
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Log in to manage participation, submissions, and account details.
          </p>
        </div>

        {submitError && (
          <div
            className="text-tertiary-red mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold"
            role="alert"
          >
            {submitError}
          </div>
        )}

        {status === 'success' && (
          <div
            className="text-secondary-green mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold"
            role="status"
          >
            Login successful.
          </div>
        )}

        <div className="grid gap-5">
          {loginTextFields.map((field) => (
            <AccountTextField
              key={field.name}
              autoComplete={field.autoComplete}
              error={errors[field.name]}
              helperText={field.helperText}
              label={field.label}
              leadingIcon={fieldIcons[field.name]}
              maxLength={field.maxLength}
              name={field.name}
              required={field.required}
              type={field.type}
              value={values[field.name]}
              onBlur={() => handleBlur(field.name)}
              onChange={handleTextChange}
            />
          ))}
        </div>

        <Button
          className="mt-8 h-12 w-full rounded-full text-base font-bold"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </Button>
        <div className="mt-4 text-center text-sm font-semibold">
          <Link
            to="/forgot-password"
            className="text-secondary-blue underline-offset-4 transition hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </form>
  );
};
