import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Mail, UserPlus } from 'lucide-react';
import { MAX_EMAIL_LEN, normalizeEmail } from '@icaf/shared';
import { forgotPassword, requestCreateAndVerify } from '@/api/auth';
import { getApiErrorMessage } from '@/api/client';
import { AccountTextField } from '@/modules/account/components/AccountTextField';
import { Button } from '@/shared/components/ui/button';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getEmailError(emailValue: string): string | undefined {
  const email = emailValue.trim();
  if (!email) return 'Email is required.';
  if (email.length > MAX_EMAIL_LEN) {
    return `Email must be ${MAX_EMAIL_LEN} characters or fewer.`;
  }
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.';
  return undefined;
}

function getSubmitError(error: unknown): string {
  return getApiErrorMessage(
    error,
    'We could not send the email link. Please try again.',
  );
}

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'emailSent' | 'virtualFound' | 'requestingAccount'
  >('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createAccountError, setCreateAccountError] = useState<string | null>(
    null,
  );

  const isSubmitting = status === 'submitting';
  const isRequestingAccount = status === 'requestingAccount';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextEmailError = getEmailError(email);
    setEmailError(nextEmailError);
    setSubmitError(null);
    if (nextEmailError) return;

    const normalizedEmail = normalizeEmail(email);
    setStatus('submitting');
    void forgotPassword({ email: normalizedEmail })
      .then((response) => {
        setStatus(
          'account_status' in response && response.account_status === 'virtual'
            ? 'virtualFound'
            : 'emailSent',
        );
      })
      .catch((error) => {
        setSubmitError(getSubmitError(error));
        setStatus('idle');
      });
  }

  function handleCreateAccountRequest() {
    setCreateAccountError(null);
    setStatus('requestingAccount');
    void requestCreateAndVerify({ email: normalizeEmail(email) })
      .then(() => setStatus('emailSent'))
      .catch((error) => {
        setCreateAccountError(getSubmitError(error));
        setStatus('virtualFound');
      });
  }

  if (status === 'virtualFound' || status === 'requestingAccount') {
    return (
      <div className="my-auto h-full flex-grow bg-slate-50 py-16">
        <div className="content-w m-pad">
          <div className="mx-auto w-full max-w-xl rounded-lg border border-slate-200 bg-white p-8 shadow-xl">
            <div className="text-secondary-blue mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <UserPlus aria-hidden="true" className="h-6 w-6" />
            </div>
            <h1 className="font-montserrat text-3xl font-semibold text-slate-950">
              Create your ICAF account
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              We found your email in our system, but you do not yet have an
              account. Create your ICAF account to manage submissions connected
              to this email address.
            </p>
            {createAccountError && (
              <div
                className="text-tertiary-red mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold"
                role="alert"
              >
                <p>{createAccountError}</p>
                <Link className="mt-2 inline-block underline" to="/contact">
                  Visit our contact page for help.
                </Link>
              </div>
            )}
            <Button
              className="mt-8 h-12 rounded-full px-7 text-base font-bold"
              disabled={isRequestingAccount}
              type="button"
              onClick={handleCreateAccountRequest}
            >
              {isRequestingAccount
                ? 'Sending account link...'
                : 'Create your ICAF account'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'emailSent') {
    return (
      <div className="my-auto h-full flex-grow bg-slate-50 py-16">
        <div className="content-w m-pad">
          <div className="mx-auto w-full max-w-xl rounded-lg border border-green-200 bg-white p-8 shadow-xl">
            <div className="text-secondary-green mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 aria-hidden="true" className="h-6 w-6" />
            </div>
            <h1 className="font-montserrat text-3xl font-semibold text-slate-950">
              Check your email
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              If this email is registered, we sent instructions to continue.
            </p>
            <Button
              asChild
              className="mt-8 h-12 rounded-full px-7 text-base font-bold"
            >
              <Link to="/login">Back to login</Link>
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
          <div className="text-secondary-blue mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Mail aria-hidden="true" className="h-6 w-6" />
          </div>
          <h1 className="font-montserrat text-3xl font-semibold text-slate-950">
            Forgot password
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Enter your email address and we will send the right next step for
            your ICAF account.
          </p>

          {submitError && (
            <div
              className="text-tertiary-red mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold"
              role="alert"
            >
              <p>{submitError}</p>
              <Link className="mt-2 inline-block underline" to="/contact">
                Visit our contact page for help.
              </Link>
            </div>
          )}

          <div className="mt-6">
            <AccountTextField
              autoComplete="email"
              error={emailError}
              label="Email"
              leadingIcon={<Mail aria-hidden="true" className="h-4 w-4" />}
              maxLength={MAX_EMAIL_LEN}
              name="email"
              required
              type="email"
              value={email}
              onBlur={() => setEmailError(getEmailError(email))}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setEmail(event.target.value);
                if (emailError)
                  setEmailError(getEmailError(event.target.value));
              }}
            />
          </div>

          <Button
            className="mt-8 h-12 w-full rounded-full text-base font-bold"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
      </div>
    </div>
  );
};
