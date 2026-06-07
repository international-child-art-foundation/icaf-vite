import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, KeyRound } from 'lucide-react';
import { MAX_PASSWORD_LEN } from '@icaf/shared';
import { createAndVerify } from '@/api/auth';
import { getApiErrorMessage } from '@/api/client';
import { AccountTextField } from '@/modules/account/components/AccountTextField';
import {
  getConfirmPasswordError,
  getPasswordError,
} from '@/modules/account/utils/passwordValidation';
import { Button } from '@/shared/components/ui/button';

function getSubmitError(error: unknown): string {
  return getApiErrorMessage(
    error,
    'Account setup failed. Please contact us for help.',
  );
}

export const CreateAccount = () => {
  const [searchParams] = useSearchParams();
  const userId = useMemo(
    () => searchParams.get('id')?.trim() ?? '',
    [searchParams],
  );
  const token = useMemo(
    () => searchParams.get('token')?.trim() ?? '',
    [searchParams],
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>(
    'idle',
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSubmitting = status === 'submitting';
  const missingLinkData = !userId || !token;

  function validate() {
    const nextErrors = {
      password: getPasswordError(password),
      confirmPassword: getConfirmPasswordError(password, confirmPassword),
    };
    setErrors(nextErrors);
    return !nextErrors.password && !nextErrors.confirmPassword;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    if (missingLinkData) {
      setSubmitError('This account link is missing required information.');
      return;
    }
    if (!validate()) return;

    setStatus('submitting');
    void createAndVerify({
      auth_action_token: token,
      password,
      user_id: userId,
    })
      .then(() => setStatus('success'))
      .catch((error) => {
        setSubmitError(getSubmitError(error));
        setStatus('idle');
      });
  }

  if (status === 'success') {
    return (
      <div className="my-auto h-full flex-grow bg-slate-50 py-16">
        <div className="content-w m-pad">
          <div className="mx-auto w-full max-w-xl rounded-lg border border-green-200 bg-white p-8 shadow-xl">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-secondary-green">
              <CheckCircle2 aria-hidden="true" className="h-6 w-6" />
            </div>
            <h1 className="font-montserrat text-3xl font-semibold text-slate-950">
              Account created
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Your ICAF account is ready. You can now log in and manage your
              submissions.
            </p>
            <Button asChild className="mt-8 h-12 rounded-full px-7 text-base font-bold">
              <Link to="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-auto h-full flex-grow bg-slate-50 py-16">
      <div className="content-w m-pad">
        <form
          className="mx-auto w-full max-w-xl rounded-lg border border-slate-200 bg-white p-8 shadow-xl"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-secondary-blue">
            <KeyRound aria-hidden="true" className="h-6 w-6" />
          </div>
          <h1 className="font-montserrat text-3xl font-semibold text-slate-950">
            Create your account
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Set a password to activate your ICAF account and manage artwork
            submitted from this email address.
          </p>

          {(submitError || missingLinkData) && (
            <div
              className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-tertiary-red"
              role="alert"
            >
              <p>
                {submitError ??
                  'This account link is missing required information.'}
              </p>
              <Link className="mt-2 inline-block underline" to="/contact">
                Visit our contact page for help.
              </Link>
            </div>
          )}

          <div className="mt-6 space-y-5">
            <AccountTextField
              autoComplete="new-password"
              error={errors.password}
              helperText="Use at least 8 characters with upper/lowercase letters, a number, and a symbol."
              label="Password"
              maxLength={MAX_PASSWORD_LEN}
              name="password"
              required
              type="password"
              value={password}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setPassword(event.target.value)
              }
            />
            <AccountTextField
              autoComplete="new-password"
              error={errors.confirmPassword}
              label="Confirm password"
              maxLength={MAX_PASSWORD_LEN}
              name="confirmPassword"
              required
              type="password"
              value={confirmPassword}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setConfirmPassword(event.target.value)
              }
            />
          </div>

          <Button
            className="mt-8 h-12 w-full rounded-full text-base font-bold"
            disabled={isSubmitting || missingLinkData}
            type="submit"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </div>
    </div>
  );
};
