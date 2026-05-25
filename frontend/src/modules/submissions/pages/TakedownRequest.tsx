import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  Link2,
  Mail,
  Send,
  ShieldAlert,
  TriangleAlert,
  UserRound,
} from 'lucide-react';
import { initiateTakedown } from '@/api/public';
import { ApiError } from '@/api/client';
import { AccountTextField } from '@/modules/account/components/AccountTextField';
import { CompactTextarea } from '@/modules/submissions/components/CompactTextarea';
import { lookupArtworkIdFromInput } from '@/modules/submissions/utils/takedownRequest';
import { Button } from '@/shared/components/ui/button';
import {
  TDR_MAX_EMAIL_LEN,
  TDR_MAX_NAME_LEN,
  TDR_MAX_REASON_LEN,
} from '@icaf/shared';
import { Link } from 'react-router-dom';
import { Seo } from '@/modules/content/components/shared/Seo';
import { PageBottomSpacer } from '@/modules/content/components/shared/PageBottomSpacer';

type TakedownFormValues = {
  artworkUrl: string;
  requesterEmail: string;
  requesterName: string;
  reason: string;
};

type TakedownFormErrors = Partial<Record<keyof TakedownFormValues, string>> & {
  submit?: string;
};

type TakedownStatus = 'idle' | 'submitting' | 'success';

const initialFormValues: TakedownFormValues = {
  artworkUrl: '',
  requesterEmail: '',
  requesterName: '',
  reason: '',
};

const takedownMetadata = {
  description:
    'Request an artwork takedown by pasting the public artwork link or UUID.',
  noIndex: true,
  path: '/request-takedown',
  title: 'Request Artwork Takedown | ICAF',
};

function getSubmitError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Takedown request failed. Please try again.';
}

function validateValues(
  values: TakedownFormValues,
  artworkLookup: ReturnType<typeof lookupArtworkIdFromInput>,
): TakedownFormErrors {
  const nextErrors: TakedownFormErrors = {};

  if (!values.artworkUrl.trim()) {
    nextErrors.artworkUrl =
      'Paste the public artwork URL so we can find the artwork UUID.';
  } else if (artworkLookup.kind !== 'artwork') {
    nextErrors.artworkUrl = `${artworkLookup.message} Contact us if you need help finding it.`;
  }

  if (!values.requesterName.trim()) {
    nextErrors.requesterName = 'Your name is required.';
  } else if (values.requesterName.length > TDR_MAX_NAME_LEN) {
    nextErrors.requesterName = `Use ${TDR_MAX_NAME_LEN} characters or less.`;
  }

  const email = values.requesterEmail.trim();
  if (!email) {
    nextErrors.requesterEmail = 'Your email is required.';
  } else if (email.length > TDR_MAX_EMAIL_LEN) {
    nextErrors.requesterEmail = `Use ${TDR_MAX_EMAIL_LEN} characters or less.`;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    nextErrors.requesterEmail = 'Enter a valid email address.';
  }

  if (!values.reason.trim()) {
    nextErrors.reason = 'Tell us why this artwork should be taken down.';
  } else if (values.reason.length > TDR_MAX_REASON_LEN) {
    nextErrors.reason = `Use ${TDR_MAX_REASON_LEN} characters or less.`;
  }

  return nextErrors;
}

export function TakedownRequest() {
  const [values, setValues] = useState<TakedownFormValues>(initialFormValues);
  const [errors, setErrors] = useState<TakedownFormErrors>({});
  const [status, setStatus] = useState<TakedownStatus>('idle');
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const artworkLookup = useMemo(
    () => lookupArtworkIdFromInput(values.artworkUrl),
    [values.artworkUrl],
  );
  const isSubmitting = status === 'submitting';

  function updateField<Name extends keyof TakedownFormValues>(
    name: Name,
    value: TakedownFormValues[Name],
  ) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setStatus('idle');
    setSubmitMessage(null);
  }

  function handleTextChange(event: ChangeEvent<HTMLInputElement>) {
    const name = event.target.name as keyof TakedownFormValues;
    updateField(name, event.target.value);
  }

  function handleReasonChange(event: ChangeEvent<HTMLTextAreaElement>) {
    updateField('reason', event.target.value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateValues(values, artworkLookup);
    setErrors(nextErrors);
    setSubmitMessage(null);

    if (Object.keys(nextErrors).length > 0 || !artworkLookup.artId) {
      return;
    }

    setStatus('submitting');
    void submitRequest(artworkLookup.artId);
  }

  async function submitRequest(artId: string) {
    try {
      const response = await initiateTakedown({
        art_id: artId,
        reason: values.reason.trim(),
        requester_email: values.requesterEmail.trim(),
        requester_name: values.requesterName.trim(),
      });

      setStatus('success');
      setSubmitMessage(
        `${response.message}. We will review the request and follow up by email.`,
      );
      setValues(initialFormValues);
      setErrors({});
    } catch (error) {
      setStatus('idle');
      setSubmitMessage(null);
      setErrors({
        submit: getSubmitError(error),
      });
    }
  }

  const urlHelper = artworkLookup.message;

  return (
    <>
      <Seo {...takedownMetadata} />
      <div className="content-gap overflow-hidden bg-[linear-gradient(180deg,rgba(255,247,236,0.95)_0%,rgba(255,255,255,1)_32%,rgba(255,255,255,1)_100%)]">
        <section className="relative overflow-hidden pt-12 md:pt-16">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-[-10%] top-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(251,178,46,0.28)_0%,rgba(251,178,46,0)_72%)] blur-3xl" />
            <div className="absolute right-[-8%] top-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(33,87,204,0.16)_0%,rgba(33,87,204,0)_70%)] blur-3xl" />
          </div>

          <div className="content-w m-pad grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-amber-800">
                  Artwork takedown
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                  <ShieldAlert aria-hidden="true" className="h-3.5 w-3.5" />
                  We can help if you cannot find the artwork
                </span>
              </div>

              <div className="max-w-2xl">
                <h1 className="font-montserrat text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Request a takedown for a public artwork
                </h1>
                <p className="mt-5 text-lg leading-8 text-slate-600">
                  Paste the artwork link and we&apos;ll look for the artwork UUID
                  inside it. If the link points to a group page, or we cannot
                  identify a valid artwork, we will stop before submitting.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Link2 aria-hidden="true" className="h-4 w-4 text-slate-500" />
                    Artwork-specific links only
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    We accept common gallery artwork URLs, including links with
                    an <code className="rounded bg-slate-100 px-1.5 py-0.5">id</code>{' '}
                    parameter.
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                  <p className="flex items-center gap-2 text-sm font-semibold text-amber-950">
                    <TriangleAlert
                      aria-hidden="true"
                      className="h-4 w-4 text-amber-700"
                    />
                    Need help finding it?
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-900/80">
                    Contact us and we can help identify the artwork before you
                    submit a request.
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur">
                <p className="text-secondary-blue text-sm font-bold uppercase tracking-[0.24em]">
                  What happens next
                </p>
                <div className="mt-4 grid gap-4 text-sm leading-6 text-slate-600 md:grid-cols-2">
                  <p>
                    We extract the artwork UUID from the URL, verify it matches
                    a public artwork, and then create the request.
                  </p>
                  <p>
                    If the URL is for a group or does not contain a valid
                    artwork UUID, we will not submit anything and will point you
                    to contact help.
                  </p>
                </div>
              </div>
            </div>

            <form
              className="rounded-[32px] border border-slate-200 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur md:p-8"
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-secondary-blue text-sm font-bold uppercase tracking-[0.24em]">
                    Request form
                  </p>
                  <h2 className="mt-2 font-montserrat text-3xl font-bold text-slate-950">
                    Send the takedown request
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                    We will only send the request after we find a valid artwork
                    UUID. If you need help, contact us before submitting.
                  </p>
                </div>
              </div>

              {errors.submit && (
                <div
                  className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
                  role="alert"
                >
                  {errors.submit}
                </div>
              )}

              {submitMessage && status === 'success' && (
                <div
                  className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800"
                  role="status"
                >
                  {submitMessage}
                </div>
              )}

              <div className="mt-6 grid gap-5">
                <AccountTextField
                  error={errors.artworkUrl}
                  helperText={urlHelper}
                  label="Artwork URL"
                  leadingIcon={<Link2 aria-hidden="true" className="h-4 w-4" />}
                  name="artworkUrl"
                  placeholder="https://example.com/gallery?id=..."
                  required
                  value={values.artworkUrl}
                  onChange={handleTextChange}
                />

                {artworkLookup.kind === 'artwork' && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    <span className="font-semibold">Artwork found:</span>{' '}
                    {artworkLookup.artId}
                  </div>
                )}

                <AccountTextField
                  autoComplete="name"
                  error={errors.requesterName}
                  helperText="The person requesting the takedown."
                  label="Your name"
                  leadingIcon={<UserRound aria-hidden="true" className="h-4 w-4" />}
                  maxLength={TDR_MAX_NAME_LEN}
                  name="requesterName"
                  required
                  value={values.requesterName}
                  onChange={handleTextChange}
                />

                <AccountTextField
                  autoComplete="email"
                  error={errors.requesterEmail}
                  helperText="We will use this email to follow up on the request."
                  label="Email address"
                  leadingIcon={<Mail aria-hidden="true" className="h-4 w-4" />}
                  maxLength={TDR_MAX_EMAIL_LEN}
                  name="requesterEmail"
                  required
                  type="email"
                  value={values.requesterEmail}
                  onChange={handleTextChange}
                />

                <CompactTextarea
                  error={errors.reason}
                  helperText="Give us enough context to review the request."
                  label="Why should this artwork be taken down?"
                  maxLength={TDR_MAX_REASON_LEN}
                  name="reason"
                  required
                  value={values.reason}
                  onChange={handleReasonChange}
                />
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                <p className="font-semibold text-slate-900">
                  Need help finding the artwork?
                </p>
                <p className="mt-1">
                  Contact us and we can help track down the correct artwork
                  before you submit. If the link is for a group page, we will
                  ask you to use the artwork link instead.
                </p>
                <Link
                  to="/contact"
                  className="text-secondary-blue mt-2 inline-flex items-center gap-2 font-semibold hover:underline"
                >
                  Contact us
                  <Send aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>

              <Button
                className="mt-6 h-12 w-full rounded-full text-base font-bold"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Sending request...' : 'Send takedown request'}
              </Button>
            </form>
          </div>
        </section>
        <PageBottomSpacer />
      </div>
    </>
  );
}
