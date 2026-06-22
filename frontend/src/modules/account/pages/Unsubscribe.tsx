import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Home, Loader2, Mail, MailWarning } from 'lucide-react';

import { buildApiUrl } from '@/api/client';
import { apiEndpoints } from '@/api/endpoints';
import { Seo } from '@/modules/content/components/shared/Seo';
import { Button } from '@/shared/components/ui/button';

type UnsubscribeStatus = 'loading' | 'success' | 'error';

const metadata = {
  title: 'Unsubscribe | ICAF',
  description: 'Manage ICAF artwork notification emails.',
  path: '/unsubscribe',
  noIndex: true,
};

export function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<UnsubscribeStatus>('loading');

  useEffect(() => {
    const userId = searchParams.get('u');
    const token = searchParams.get('t');

    if (!userId || !token) {
      setStatus('error');
      return;
    }

    const controller = new AbortController();
    const url = buildApiUrl(apiEndpoints.public.unsubscribeArtwork, {
      u: userId,
      t: token,
    });

    void fetch(url, {
      method: 'GET',
      signal: controller.signal,
    })
      .then((response) => {
        setStatus(response.ok ? 'success' : 'error');
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setStatus('error');
      });

    return () => controller.abort();
  }, [searchParams]);

  const isSuccess = status === 'success';
  const title = isSuccess
    ? 'You have been unsubscribed'
    : status === 'error'
      ? 'We could not unsubscribe you'
      : 'Updating your email preferences';

  return (
    <>
      <Seo {...metadata} />
      <section className="my-auto h-full flex-grow bg-slate-50 py-16">
        <div className="content-w m-pad">
          <div className="mx-auto w-full max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-secondary-blue">
              {status === 'loading' ? (
                <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin" />
              ) : isSuccess ? (
                <CheckCircle2 aria-hidden="true" className="h-6 w-6" />
              ) : (
                <MailWarning aria-hidden="true" className="h-6 w-6" />
              )}
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-blue">
              Email preferences
            </p>
            <h1 className="mt-4 font-montserrat text-3xl font-semibold text-slate-950 md:text-4xl">
              {title}
            </h1>
            {status === 'loading' ? (
              <p className="mt-5 text-base leading-7 text-slate-600">
                Please wait while we update your email preferences.
              </p>
            ) : isSuccess ? (
              <p className="mt-5 text-base leading-7 text-slate-600">
                You have been unsubscribed from all notification emails.
              </p>
            ) : (
              <p className="mt-5 text-base leading-7 text-slate-600">
                We could not update your email preferences. Please contact us
                so we can help.
              </p>
            )}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild className="h-12 rounded-full px-7 text-base">
                <Link to="/">
                  <Home aria-hidden="true" className="h-4 w-4" />
                  Return Home
                </Link>
              </Button>
              {status === 'error' && (
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full px-7 text-base"
                >
                  <Link to="/contact">
                    <Mail aria-hidden="true" className="h-4 w-4" />
                    Contact Us
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
