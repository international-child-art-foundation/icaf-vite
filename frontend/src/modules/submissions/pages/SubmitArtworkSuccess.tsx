import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ImageIcon, MailCheck } from 'lucide-react';
import {
  ArtworkSubmissionPreview,
  type ArtworkWithPreview,
} from '@/modules/submissions/components/ArtworkMuralWindow';
import { Button } from '@/shared/components/ui/button';

export type SubmitArtworkSuccessState = {
  submission?: {
    artworkDetailsMode: 'basic' | 'full';
    artworks: ArtworkWithPreview[];
    email?: string;
    kind: 'single' | 'group';
  };
};

function isArtworkPreview(value: unknown): value is ArtworkWithPreview {
  if (!value || typeof value !== 'object') return false;

  const artwork = value as Partial<ArtworkWithPreview>;
  return (
    typeof artwork.id === 'string' && typeof artwork.previewDataUrl === 'string'
  );
}

function readSubmissionState(value: unknown) {
  if (!value || typeof value !== 'object' || !('submission' in value)) {
    return undefined;
  }

  const submission = (value as SubmitArtworkSuccessState).submission;
  if (!submission || typeof submission !== 'object') return undefined;
  if (!('artworks' in submission) || !Array.isArray(submission.artworks)) {
    return undefined;
  }

  const artworks = submission.artworks.filter(isArtworkPreview);
  if (artworks.length === 0) return undefined;

  return {
    artworkDetailsMode:
      'artworkDetailsMode' in submission &&
      submission.artworkDetailsMode === 'basic'
        ? 'basic'
        : 'full',
    artworks,
    email:
      'email' in submission && typeof submission.email === 'string'
        ? submission.email
        : undefined,
    kind:
      'kind' in submission && submission.kind === 'group' ? 'group' : 'single',
  } satisfies NonNullable<SubmitArtworkSuccessState['submission']>;
}

export function SubmitArtworkSuccess() {
  const location = useLocation();
  const submission = readSubmissionState(location.state);
  const artworkLabel = submission?.kind === 'group' ? 'artworks' : 'artwork';

  return (
    <div className="my-auto h-full flex-grow bg-slate-50 py-8 sm:py-12">
      <div className="content-w m-pad my-auto flex flex-col gap-5">
        <div className="mx-auto w-full max-w-4xl">
          <Button asChild variant="outline">
            <Link to="/gallery">
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Back to gallery
            </Link>
          </Button>
        </div>

        <section className="mx-auto grid w-full max-w-4xl gap-5 rounded-lg border border-slate-200 bg-white p-4 shadow-xl lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] lg:p-6">
          <div className="min-w-0">
            <p className="text-secondary-blue text-xs font-bold uppercase tracking-widest">
              Submission received
            </p>
            <h1 className="font-montserrat mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">
              Thank you for submitting your {artworkLabel}.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              ICAF has your submission for review. You do not need an account
              for this submission to continue.
            </p>
            <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-slate-700">
              <div className="flex gap-3">
                <MailCheck
                  aria-hidden="true"
                  className="text-secondary-green mt-0.5 h-5 w-5 shrink-0"
                />
                <p>
                  To update the {artworkLabel} later or receive notifications,
                  create an account by checking
                  {submission?.email
                    ? ` ${submission.email}`
                    : ' your inbox'}{' '}
                  and finishing setup from the email we sent.
                </p>
              </div>
            </div>
            <Button asChild className="mt-5 rounded-full">
              <Link to="/gallery">Return to the gallery</Link>
            </Button>
          </div>

          <div className="min-w-0">
            {submission ? (
              <ArtworkSubmissionPreview
                artworkDetailsMode={submission.artworkDetailsMode}
                artworks={submission.artworks}
              />
            ) : (
              <div className="grid min-h-[320px] place-items-center rounded-lg border border-slate-200 bg-slate-100/80 p-6 text-center">
                <div>
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm">
                    <ImageIcon aria-hidden="true" className="h-6 w-6" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    Artwork preview unavailable
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    The preview is only available right after submitting.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
