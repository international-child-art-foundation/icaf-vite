import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link2, Mail, Send, UserRound } from 'lucide-react';
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
import { linkClasses } from '@/shared/data/linkClasses';

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
  path: '/takedown-request',
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
      <div className="content-gap overflow-hidden">
        <section className="content-w relative my-12 overflow-hidden py-12">
          <div className="m-pad grid max-w-[800px] items-center gap-8">
            <form
              className="rounded-[32px] border border-slate-200 bg-white/95 p-6 shadow-[0_5px_10px_rgba(15,23,42,0.12)] md:p-8"
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-montserrat mt-2 text-3xl font-bold text-slate-950">
                    Takedown Request Form
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                    Use this page to submit a takedown request for an artwork
                    active in the ICAF gallery. If you need help,{' '}
                    <Link to={'/contact'} className={linkClasses}>
                      contact us
                    </Link>{' '}
                    before submitting.
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
                  leadingIcon={
                    <UserRound aria-hidden="true" className="h-4 w-4" />
                  }
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
                  before you submit.
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
      </div>
    </>
  );
}
