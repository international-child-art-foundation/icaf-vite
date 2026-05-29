import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { ChevronLeft, Globe2, Mail, Send } from 'lucide-react';
import { submitGuestArtwork } from '@/api/public';
import { uploadToPresignedUrl } from '@/api/uploads';
import { AccountTextField } from '@/modules/account/components/AccountTextField';
import { ArtworkMuralWindow } from '@/modules/submissions/components/ArtworkMuralWindow';
import type {
  ArtworkDraft,
  ArtworkGroupSubmissionErrors,
} from '@/modules/submissions/types/artworkGroupSubmission';
import {
  createArtworkDraft,
  createReleaseHash,
  formatFileSize,
  getUploadFileType,
} from '@/modules/submissions/utils/artworkGroupDraft';
import {
  createImagePreview,
  createRotatedImageFile,
} from '@/modules/submissions/utils/imagePreview';
import { Button } from '@/shared/components/ui/button';
import {
  MAX_DESCRIPTION_LEN,
  MAX_STRING_LEN,
  MAX_TITLE_LEN,
  S3_MAX_FILE_SIZE_BYTES,
  UPLOAD_FILE_TYPES,
} from '@icaf/shared';
import { useLocation, useNavigate } from 'react-router-dom';

type SubmissionStatus = 'idle' | 'submitting' | 'success';

type SubmitArtworkDraft = {
  artwork: ArtworkDraft;
  certificationAccepted: boolean;
  country: string;
  notifications: boolean;
  region: string;
  submitterEmail: string;
};

type SubmitArtworkErrors = ArtworkGroupSubmissionErrors & {
  country?: string;
  region?: string;
};

const SUBMIT_ARTWORK_DRAFT_KEY = 'icaf.submitArtworkDraft.v1';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 254;

const initialSubmitArtworkDraft: SubmitArtworkDraft = {
  artwork: createGuardianArtworkDraft(),
  certificationAccepted: false,
  country: '',
  notifications: true,
  region: '',
  submitterEmail: '',
};

function createGuardianArtworkDraft(): ArtworkDraft {
  return {
    ...createArtworkDraft(),
    submitter_relationship: 'guardian',
  };
}

function getSubmitError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Artwork submission failed. Please try again.';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object');
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function normalizeThemeFamily(value: string | null) {
  return (
    value
      ?.trim()
      .replace(/[^a-z0-9_]/gi, '')
      .toUpperCase() ?? ''
  );
}

function normalizeThemeInstance(value: string | null) {
  const trimmedValue = value?.trim() ?? '';
  return /^\d{1,4}$/.test(trimmedValue)
    ? trimmedValue.padStart(4, '0')
    : trimmedValue;
}

function formatThemeInstance(value: string) {
  if (!/^\d+$/.test(value)) return value;
  return String(Number(value));
}

function readThemeParams(search: string) {
  const params = new URLSearchParams(search);
  const themeFamily = normalizeThemeFamily(
    params.get('theme_family') ??
      params.get('themeFamily') ??
      params.get('family') ??
      params.get('theme'),
  );
  const themeInstance = normalizeThemeInstance(
    params.get('theme_instance') ??
      params.get('themeInstance') ??
      params.get('instance') ??
      params.get('id'),
  );

  return {
    theme_family: themeFamily,
    theme_instance: themeInstance,
  };
}

function readPersistedDraft(): SubmitArtworkDraft {
  if (typeof window === 'undefined') return initialSubmitArtworkDraft;

  try {
    const storedValue = window.localStorage.getItem(SUBMIT_ARTWORK_DRAFT_KEY);
    const parsedDraft: unknown = storedValue ? JSON.parse(storedValue) : {};
    const storedDraft = isRecord(parsedDraft) ? parsedDraft : {};
    const artwork = isRecord(storedDraft.artwork) ? storedDraft.artwork : {};

    return {
      artwork: {
        age: readString(artwork.age),
        description: readString(artwork.description),
        f_name: readString(artwork.f_name),
        id: createGuardianArtworkDraft().id,
        submitter_relationship: 'guardian',
        title: readString(artwork.title),
      },
      certificationAccepted:
        typeof storedDraft.certificationAccepted === 'boolean'
          ? storedDraft.certificationAccepted
          : initialSubmitArtworkDraft.certificationAccepted,
      country: readString(storedDraft.country),
      notifications:
        typeof storedDraft.notifications === 'boolean'
          ? storedDraft.notifications
          : initialSubmitArtworkDraft.notifications,
      region: readString(storedDraft.region),
      submitterEmail: readString(storedDraft.submitterEmail),
    };
  } catch {
    return initialSubmitArtworkDraft;
  }
}

function hasSubmissionErrors(errors: SubmitArtworkErrors) {
  return Boolean(
    errors.root ||
    errors.submitterEmail ||
    errors.certificationAccepted ||
    errors.country ||
    errors.region ||
    (errors.artworks && Object.keys(errors.artworks).length > 0),
  );
}

function validateSubmitArtwork(
  draft: SubmitArtworkDraft,
  file: File | undefined,
): SubmitArtworkErrors {
  const errors: SubmitArtworkErrors = {};
  const artworkErrors: NonNullable<SubmitArtworkErrors['artworks']> = {};
  const itemErrors: Partial<Record<keyof ArtworkDraft | 'file', string>> = {};
  const submitterEmail = draft.submitterEmail.trim();

  if (!submitterEmail) {
    errors.submitterEmail = 'Email is required.';
  } else if (submitterEmail.length > MAX_EMAIL_LEN) {
    errors.submitterEmail = `Use ${MAX_EMAIL_LEN} characters or less.`;
  } else if (!EMAIL_PATTERN.test(submitterEmail)) {
    errors.submitterEmail = 'Enter a valid email address.';
  }

  if (!draft.country.trim()) {
    errors.country = 'Country is required.';
  } else if (draft.country.length > MAX_STRING_LEN) {
    errors.country = `Use ${MAX_STRING_LEN} characters or less.`;
  }

  if (draft.region.length > MAX_STRING_LEN) {
    errors.region = `Use ${MAX_STRING_LEN} characters or less.`;
  }

  if (!file) {
    itemErrors.file = 'Add an image to submit.';
  } else {
    const fileType = getUploadFileType(file);
    if (!fileType) {
      itemErrors.file = `Use ${UPLOAD_FILE_TYPES.join(', ')}.`;
    } else if (file.size > S3_MAX_FILE_SIZE_BYTES) {
      itemErrors.file = `File must be ${formatFileSize(S3_MAX_FILE_SIZE_BYTES)} or less.`;
    }
  }

  if (draft.artwork.title.length > MAX_TITLE_LEN) {
    itemErrors.title = `Use ${MAX_TITLE_LEN} characters or less.`;
  }

  if (draft.artwork.f_name.length > MAX_STRING_LEN) {
    itemErrors.f_name = `Use ${MAX_STRING_LEN} characters or less.`;
  }

  if (draft.artwork.age.trim()) {
    const age = Number(draft.artwork.age);
    if (!Number.isInteger(age) || age < 1 || age > 120) {
      itemErrors.age = 'Enter a whole number from 1 to 120.';
    }
  }

  if (
    draft.artwork.description.trim() &&
    draft.artwork.description.length > MAX_DESCRIPTION_LEN
  ) {
    itemErrors.description = `Use ${MAX_DESCRIPTION_LEN} characters or less.`;
  }

  if (!draft.certificationAccepted) {
    errors.certificationAccepted = 'Certification is required.';
  }

  if (Object.keys(itemErrors).length > 0) {
    artworkErrors[draft.artwork.id] = itemErrors;
    errors.artworks = artworkErrors;
  }

  return errors;
}

export function SubmitArtwork() {
  const location = useLocation();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(readPersistedDraft);
  const [file, setFile] = useState<File | undefined>();
  const [previewDataUrl, setPreviewDataUrl] = useState<string | undefined>();
  const [imageRotation, setImageRotation] = useState(0);
  const [errors, setErrors] = useState<SubmitArtworkErrors>({});
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const isSubmitting = status === 'submitting';
  const isArtworkWindowOpen = location.pathname === '/submit-artwork/artworks';
  const themeParams = useMemo(
    () => readThemeParams(location.search),
    [location.search],
  );
  const displayedArtwork = useMemo(
    () => ({
      ...draft.artwork,
      fileName: file?.name,
      previewDataUrl,
    }),
    [draft.artwork, file?.name, previewDataUrl],
  );
  const viewerError =
    errors.root ?? errors.artworks?.[draft.artwork.id]?.file ?? null;

  function updateArtwork<Name extends keyof ArtworkDraft>(
    artworkId: string,
    name: Name,
    value: ArtworkDraft[Name],
  ) {
    if (artworkId !== draft.artwork.id) return;
    setDraft((current) => ({
      ...current,
      artwork: {
        ...current.artwork,
        [name]: value,
        submitter_relationship: 'guardian',
      },
    }));
  }

  async function attachFile(nextFile: File) {
    setFile(nextFile);
    setImageRotation(0);
    setPreviewDataUrl(await createImagePreview(nextFile));
  }

  async function rotateArtwork() {
    if (!file) return;

    const nextRotation = (imageRotation + 90) % 360;
    setImageRotation(nextRotation);
    setPreviewDataUrl(await createImagePreview(file, nextRotation));
  }

  function deleteArtwork() {
    setFile(undefined);
    setImageRotation(0);
    setPreviewDataUrl(undefined);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitMessage(null);

    const nextErrors = validateSubmitArtwork(draft, file);
    setErrors(nextErrors);

    if (hasSubmissionErrors(nextErrors)) return;

    setStatus('submitting');
    void handleAsyncSubmit();
  }

  async function handleAsyncSubmit() {
    try {
      if (!file) throw new Error('A selected image is missing.');

      const releaseHash = await createReleaseHash();
      const uploadFile = await createRotatedImageFile(file, imageRotation);
      const fileType = getUploadFileType(uploadFile);
      if (!fileType) throw new Error(`${uploadFile.name} is not supported.`);

      const response = await submitGuestArtwork({
        age: draft.artwork.age.trim() ? Number(draft.artwork.age) : undefined,
        country: draft.country.trim(),
        description: draft.artwork.description.trim() || undefined,
        email: draft.submitterEmail.trim(),
        f_name: draft.artwork.f_name.trim() || undefined,
        file_type: fileType,
        is_virtual: true,
        notifications: draft.notifications,
        region: draft.region.trim() || undefined,
        release_hash: releaseHash,
        submitter_relationship: 'guardian',
        theme_family: themeParams.theme_family || undefined,
        theme_instance: themeParams.theme_family
          ? themeParams.theme_instance || undefined
          : undefined,
        title: draft.artwork.title.trim() || undefined,
      });

      await uploadToPresignedUrl({
        file: uploadFile,
        fileType,
        url: response.presigned_url,
      });

      setStatus('success');
      setSubmitMessage(
        'Thank you for submitting this artwork for review! Check your email to create an account and receive updates.',
      );
      setDraft(initialSubmitArtworkDraft);
      deleteArtwork();
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(SUBMIT_ARTWORK_DRAFT_KEY);
      }
    } catch (error) {
      setStatus('idle');
      setSubmitMessage(getSubmitError(error));
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      SUBMIT_ARTWORK_DRAFT_KEY,
      JSON.stringify(draft),
    );
  }, [draft]);

  useEffect(() => {
    document.body.style.overflow = isArtworkWindowOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isArtworkWindowOpen]);

  return (
    <div className="my-auto h-full flex-grow bg-slate-50 py-8 sm:py-12">
      <div className="content-w m-pad my-auto flex flex-col gap-2">
        <div className="mx-auto w-full max-w-3xl">
          <Button onClick={() => void navigate(-1)}>
            <ChevronLeft />
            Go back
          </Button>
        </div>
        <form
          className="mx-auto w-full max-w-3xl"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl sm:p-6">
            <div className="mb-5">
              <p className="text-secondary-blue mb-2 text-xs font-bold uppercase tracking-widest">
                Artwork submission
              </p>
              <h1 className="font-montserrat text-2xl font-semibold text-slate-950 sm:text-3xl">
                Submit artwork
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Submit one child&apos;s artwork with its image and artwork
                details.
              </p>
            </div>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <AccountTextField
                  error={errors.submitterEmail}
                  label="Guardian email"
                  leadingIcon={<Mail aria-hidden="true" className="h-4 w-4" />}
                  maxLength={254}
                  name="submitterEmail"
                  type="email"
                  value={draft.submitterEmail}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setDraft((current) => ({
                      ...current,
                      submitterEmail: event.target.value,
                    }))
                  }
                />
              </div>
              <AccountTextField
                error={errors.country}
                label="Artwork country"
                leadingIcon={<Globe2 aria-hidden="true" className="h-4 w-4" />}
                maxLength={200}
                name="country"
                value={draft.country}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    country: event.target.value,
                  }))
                }
              />
              <AccountTextField
                error={errors.region}
                label="State, province, or region"
                maxLength={200}
                name="region"
                value={draft.region}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    region: event.target.value,
                  }))
                }
              />
            </section>

            <section className="mt-6 flex flex-col gap-3">
              <div>
                <h2 className="font-montserrat text-xl font-semibold text-slate-950">
                  Artwork
                </h2>
                {themeParams.theme_family && (
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Theme: {themeParams.theme_family}
                    {themeParams.theme_instance
                      ? ` ${formatThemeInstance(themeParams.theme_instance)}`
                      : ''}
                  </p>
                )}
                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  Click or tap the box to upload, review, and annotate one
                  artwork.
                </p>
              </div>
              <ArtworkMuralWindow
                artworks={[displayedArtwork]}
                errors={errors.artworks}
                isOpen={isArtworkWindowOpen}
                maxCount={1}
                onArtworkChange={updateArtwork}
                onClose={() =>
                  void navigate(`/submit-artwork${location.search}`)
                }
                onDeleteArtwork={deleteArtwork}
                onFilesSelected={(newFiles) => {
                  const nextFile = newFiles[0];
                  if (nextFile) void attachFile(nextFile);
                }}
                onOpen={() =>
                  void navigate(`/submit-artwork/artworks${location.search}`)
                }
                onRotateArtwork={() => void rotateArtwork()}
              />
            </section>

            <label className="mt-5 flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              <input
                checked={draft.certificationAccepted}
                className="accent-secondary-blue mt-1 h-4 w-4"
                name="certificationAccepted"
                type="checkbox"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    certificationAccepted: event.target.checked,
                  }))
                }
              />
              <span>
                I certify that I have the right to submit this artwork to ICAF
                on behalf of its creator.
                {errors.certificationAccepted && (
                  <span className="text-tertiary-red mt-1 block text-xs font-semibold">
                    {errors.certificationAccepted}
                  </span>
                )}
              </span>
            </label>

            <Button
              className="mt-6 h-12 w-full rounded-full text-base font-bold"
              disabled={isSubmitting}
              type="submit"
            >
              <Send aria-hidden="true" className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit artwork'}
            </Button>
            {viewerError && (
              <p className="text-tertiary-red mt-2 text-xs font-semibold">
                {viewerError}
              </p>
            )}
            {submitMessage && (
              <div
                className={
                  status === 'success'
                    ? 'text-secondary-green mb-5 mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold'
                    : 'text-tertiary-red mb-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold'
                }
                role={status === 'success' ? 'status' : 'alert'}
              >
                {submitMessage}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
