import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, MailWarning } from 'lucide-react';
import { createAndVerify } from '@/api/auth';
import { getApiErrorMessage } from '@/api/client';
import { Button } from '@/shared/components/ui/button';

type VerifyStatus = 'idle' | 'verifying' | 'success' | 'error';

function getErrorMessage(error: unknown): string {
  return getApiErrorMessage(
    error,
    'Sorry, we could not verify this account link. Please contact us for help.',
  );
}

export const VerifyAccount = () => {
  const [searchParams] = useSearchParams();
  const userId = useMemo(
    () => searchParams.get('id')?.trim() ?? '',
    [searchParams],
  );
  const token = useMemo(
    () => searchParams.get('token')?.trim() ?? '',
    [searchParams],
  );
  const [status, setStatus] = useState<VerifyStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !token) {
      setStatus('error');
      setMessage('This verification link is missing required information.');
      return;
    }

    let cancelled = false;
    setStatus('verifying');
    void createAndVerify({
      auth_action_token: token,
      user_id: userId,
    })
      .then((response) => {
        if (cancelled) return;
        setStatus('success');
        setMessage(
          response.already_verified
            ? 'This account is already verified. You can log in.'
            : 'Your account has been verified. You can now log in.',
        );
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus('error');
        setMessage(getErrorMessage(error));
      });

    return () => {
      cancelled = true;
    };
  }, [token, userId]);

  const isWorking = status === 'idle' || status === 'verifying';
  const isSuccess = status === 'success';

  return (
    <div className="my-auto h-full flex-grow bg-slate-50 py-16">
      <div className="content-w m-pad">
        <div className="mx-auto w-full max-w-xl rounded-lg border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-secondary-blue">
            {isWorking ? (
              <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin" />
            ) : isSuccess ? (
              <CheckCircle2 aria-hidden="true" className="h-6 w-6" />
            ) : (
              <MailWarning aria-hidden="true" className="h-6 w-6" />
            )}
          </div>
          <h1 className="font-montserrat text-3xl font-semibold text-slate-950">
            {isWorking
              ? 'Verifying your account'
              : isSuccess
                ? 'Account verified'
                : 'Verification link issue'}
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            {message ?? 'Please wait while we activate your ICAF account.'}
          </p>
          {!isWorking && !isSuccess && (
            <div className="mt-3">
              <Link
                className="text-secondary-blue inline-block text-sm font-semibold underline-offset-4 hover:underline"
                to="/contact"
              >
                Visit our contact page for help.
              </Link>
            </div>
          )}
          <Button
            asChild
            className="mt-8 h-12 rounded-full px-7 text-base font-bold"
          >
            <Link to={isSuccess ? '/login' : '/register'}>
              {isSuccess ? 'Log in' : 'Register'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
