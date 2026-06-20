import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { ChevronLeft, Globe2, LogOut, Mail, Send } from 'lucide-react';
import type { AuthStatusResponse } from '@icaf/shared';
import { getAuthStatus, logout } from '@/api/auth';
import { createArtworkUpload, submitGuestArtwork } from '@/api/public';
import { uploadToPresignedUrl } from '@/api/uploads';
import { submitArtwork } from '@/api/user';
import { AccountTextField } from '@/modules/account/components/AccountTextField';
import { ArtworkMuralWindow } from '@/modules/submissions/components/ArtworkMuralWindow';
import { ArtworkConsent } from '@/modules/submissions/components/ArtworkConsent';
import { ThemePicker } from '@/modules/submissions/components/ThemePicker';
import {
  getSubmitArtworkPageCopy,
  type SubmitterFlow,
} from '@/modules/submissions/data/submitArtworkCopy';
import type {
  ArtworkDraft,
  ArtworkGroupSubmissionErrors,
} from '@/modules/submissions/types/artworkGroupSubmission';
import {
  createArtworkDraft,
  createDigitalSignature,
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
  MAX_ARTIST_AGE,
  MAX_NAME_LEN,
  MAX_STRING_LEN,
  MAX_TITLE_LEN,
  S3_MAX_FILE_SIZE_BYTES,
  isValidThemeSk,
  type SubmitterRelationship,
  UPLOAD_FILE_TYPES,
} from '@icaf/shared';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  buildLoginRedirectPath,
  clearLastKnownUser,
  getLastKnownUser,
  saveLastKnownUser,
} from '@/shared/utils/authSession';
import type { SubmitArtworkSuccessState } from './SubmitArtworkSuccess';

type SubmissionStatus = 'idle' | 'submitting';
type AuthenticatedSubmissionUser = AuthStatusResponse & { authenticated: true };

type SubmitArtworkDraft = {
  artwork: ArtworkDraft;
  certificationAccepted: boolean;
  country: string;
  digitalSignature: string;
  notifications: boolean;
  region: string;
  submitterEmail: string;
  submitterFirstName: string;
  submitterLastName: string;
};

type SubmitArtworkErrors = ArtworkGroupSubmissionErrors & {
  country?: string;
  digitalSignature?: string;
  region?: string;
};

const SUBMIT_ARTWORK_DRAFT_KEY = 'icaf.submitArtworkDraft.v1';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 254;

const initialSubmitArtworkDraft: SubmitArtworkDraft = {
  artwork: createDefaultArtworkDraft(),
  certificationAccepted: false,
  country: '',
  digitalSignature: '',
  notifications: true,
  region: '',
  submitterEmail: '',
  submitterFirstName: '',
  submitterLastName: '',
};

function createDefaultArtworkDraft(): ArtworkDraft {
  return {
    ...createArtworkDraft(),
    submitter_relationship: 'legal_guardian',
  };
}

function getSubmitError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Artwork submission failed. Please try again.';
}

function isExistingAccountError(message: string) {
  const normalizedMessage = message.toLowerCase();
  return (
    normalizedMessage.includes('account') &&
    (normalizedMessage.includes('already exists') ||
      normalizedMessage.includes('log in'))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object');
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function readThemeParams(search: string) {
  const params = new URLSearchParams(search);
  const theme = params.get('theme')?.trim() ?? '';

  return {
    theme: isValidThemeSk(theme) ? theme : '',
  };
}

function readPersistedDraft(): SubmitArtworkDraft {
  if (typeof window === 'undefined') return initialSubmitArtworkDraft;

  try {
    const lastKnownUser = getLastKnownUser();
    const storedValue = window.localStorage.getItem(SUBMIT_ARTWORK_DRAFT_KEY);
    const parsedDraft: unknown = storedValue ? JSON.parse(storedValue) : {};
    const storedDraft = isRecord(parsedDraft) ? parsedDraft : {};
    const artwork = isRecord(storedDraft.artwork) ? storedDraft.artwork : {};

    return {
      artwork: {
        age: readString(artwork.age),
        description: readString(artwork.description),
        f_name: readString(artwork.f_name),
        id: createDefaultArtworkDraft().id,
        submitter_relationship: 'legal_guardian',
        title: readString(artwork.title),
      },
      certificationAccepted:
        typeof storedDraft.certificationAccepted === 'boolean'
          ? storedDraft.certificationAccepted
          : initialSubmitArtworkDraft.certificationAccepted,
      country: readString(storedDraft.country),
      digitalSignature: '',
      notifications:
        typeof storedDraft.notifications === 'boolean'
          ? storedDraft.notifications
          : initialSubmitArtworkDraft.notifications,
      region: readString(storedDraft.region),
      submitterEmail: readString(storedDraft.submitterEmail),
      submitterFirstName: readString(
        storedDraft.submitterFirstName,
        lastKnownUser?.f_name ?? '',
      ),
      submitterLastName: readString(
        storedDraft.submitterLastName,
        lastKnownUser?.l_name ?? '',
      ),
    };
  } catch {
    return initialSubmitArtworkDraft;
  }
}

function hasSubmissionErrors(errors: SubmitArtworkErrors) {
  return Boolean(
    errors.root ||
    errors.submitterEmail ||
    errors.submitterFirstName ||
    errors.submitterLastName ||
    errors.certificationAccepted ||
    errors.digitalSignature ||
    errors.country ||
    errors.region ||
    (errors.artworks && Object.keys(errors.artworks).length > 0),
  );
}

function validateSubmitArtwork(
  draft: SubmitArtworkDraft,
  file: File | undefined,
  options: {
    artworkDetailsMode: 'basic' | 'full';
    requiresDigitalSignature: boolean;
  },
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

  for (const [field, label] of [
    ['submitterFirstName', 'First name'],
    ['submitterLastName', 'Last name'],
  ] as const) {
    const value = draft[field].trim();
    if (!value) {
      errors[field] = `${label} is required.`;
    } else if (value.length > MAX_NAME_LEN) {
      errors[field] = `Use ${MAX_NAME_LEN} characters or less.`;
    }
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

  if (options.artworkDetailsMode === 'full') {
    if (draft.artwork.f_name.length > MAX_STRING_LEN) {
      itemErrors.f_name = `Use ${MAX_STRING_LEN} characters or less.`;
    }

    if (draft.artwork.age.trim()) {
      const age = Number(draft.artwork.age);
      if (!Number.isInteger(age) || age < 1 || age > MAX_ARTIST_AGE) {
        itemErrors.age = `Enter a whole number from 1 to ${MAX_ARTIST_AGE}.`;
      }
    }
  }

  if (
    draft.artwork.description.trim() &&
    draft.artwork.description.length > MAX_DESCRIPTION_LEN
  ) {
    itemErrors.description = `Use ${MAX_DESCRIPTION_LEN} characters or less.`;
  }

  if (!draft.certificationAccepted) {
    errors.certificationAccepted =
      'Permissions and acknowledgements checkbox must be checked.';
  }
  if (options.requiresDigitalSignature) {
    if (!draft.digitalSignature.trim()) {
      errors.digitalSignature = 'Digital signature is required.';
    } else if (draft.digitalSignature.length > MAX_STRING_LEN) {
      errors.digitalSignature = `Use ${MAX_STRING_LEN} characters or less.`;
    }
  }

  if (Object.keys(itemErrors).length > 0) {
    artworkErrors[draft.artwork.id] = itemErrors;
    errors.artworks = artworkErrors;
  }

  return errors;
}

function getSubmitterFlow(value: string | undefined): SubmitterFlow {
  return value === 'adult_facilitator' ? 'adult_facilitator' : 'legal_guardian';
}

function getFlowPath(flow: SubmitterFlow, nested = false) {
  return `/submit-artwork/single/${flow}${nested ? '/artworks' : ''}`;
}

function updateThemeSearch(
  search: string,
  theme: ReturnType<typeof readThemeParams>,
) {
  const params = new URLSearchParams(search);
  params.delete('theme');
  if (theme.theme) params.set('theme', theme.theme);
  const nextSearch = params.toString();
  return nextSearch ? `?${nextSearch}` : '';
}

export function SubmitArtwork() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const submitterFlow = getSubmitterFlow(params.submitterFlow);
  const isAdultFacilitatorFlow = submitterFlow === 'adult_facilitator';
  const copy = getSubmitArtworkPageCopy(submitterFlow, 'single');
  const artworkDetailsMode = isAdultFacilitatorFlow ? 'basic' : 'full';
  const submitterRelationship: SubmitterRelationship = isAdultFacilitatorFlow
    ? 'adult_facilitator'
    : 'legal_guardian';
  const artworkSectionRef = useRef<HTMLElement | null>(null);
  const [draft, setDraft] = useState(readPersistedDraft);
  const [file, setFile] = useState<File | undefined>();
  const [previewDataUrl, setPreviewDataUrl] = useState<string | undefined>();
  const [imageRotation, setImageRotation] = useState(0);
  const [errors, setErrors] = useState<SubmitArtworkErrors>({});
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] =
    useState<AuthenticatedSubmissionUser | null>(null);

  const isSubmitting = status === 'submitting';
  const currentPath = `${location.pathname}${location.search}${location.hash}`;
  const loginPath = useMemo(
    () => buildLoginRedirectPath(currentPath, 'auth-required'),
    [currentPath],
  );
  const isArtworkWindowOpen = location.pathname.endsWith('/artworks');
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
  const artworkAge = Number(draft.artwork.age);
  const hasOverageArtwork =
    artworkDetailsMode === 'full' &&
    draft.artwork.age.trim() !== '' &&
    !Number.isNaN(artworkAge) &&
    artworkAge > MAX_ARTIST_AGE;
  const liveAgeError =
    artworkDetailsMode === 'full' && draft.artwork.age.trim()
      ? !Number.isInteger(artworkAge) || artworkAge < 1
        ? `Enter a whole number from 1 to ${MAX_ARTIST_AGE}.`
        : artworkAge > MAX_ARTIST_AGE
          ? `Artist age must be ${MAX_ARTIST_AGE} or younger.`
          : undefined
      : undefined;
  const displayedArtworkErrors = useMemo(() => {
    const nextErrors = { ...(errors.artworks ?? {}) };
    const currentArtworkErrors = { ...nextErrors[draft.artwork.id] };
    delete currentArtworkErrors.age;

    if (liveAgeError) {
      nextErrors[draft.artwork.id] = {
        ...currentArtworkErrors,
        age: liveAgeError,
      };
    } else if (Object.keys(currentArtworkErrors).length > 0) {
      nextErrors[draft.artwork.id] = currentArtworkErrors;
    } else {
      delete nextErrors[draft.artwork.id];
    }

    return Object.keys(nextErrors).length > 0 ? nextErrors : undefined;
  }, [draft.artwork.id, errors.artworks, liveAgeError]);

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
        submitter_relationship: submitterRelationship,
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

    if (hasOverageArtwork) return;

    const nextErrors = validateSubmitArtwork(draft, file, {
      artworkDetailsMode,
      requiresDigitalSignature: true,
    });
    setErrors(nextErrors);

    if (hasSubmissionErrors(nextErrors)) return;

    setStatus('submitting');
    void handleAsyncSubmit();
  }

  function selectTheme(theme: ReturnType<typeof readThemeParams>) {
    void navigate(
      `${location.pathname}${updateThemeSearch(location.search, theme)}`,
      { replace: true },
    );
  }

  async function handleAsyncSubmit() {
    try {
      if (!file) throw new Error('A selected image is missing.');

      const digitalSignature = createDigitalSignature(draft.digitalSignature);
      const uploadFile = await createRotatedImageFile(file, imageRotation);
      const fileType = getUploadFileType(uploadFile);
      if (!fileType) throw new Error(`${uploadFile.name} is not supported.`);

      const upload = await createArtworkUpload({ file_type: fileType });

      await uploadToPresignedUrl({
        file: uploadFile,
        fileType,
        url: upload.presigned_url,
      });

      const artworkRequest = {
        art_id: upload.art_id,
        age:
          artworkDetailsMode === 'full' && draft.artwork.age.trim()
            ? Number(draft.artwork.age)
            : undefined,
        country: draft.country.trim(),
        description: draft.artwork.description.trim() || undefined,
        f_name:
          artworkDetailsMode === 'full'
            ? draft.artwork.f_name.trim() || undefined
            : undefined,
        file_type: fileType,
        notifications: draft.notifications,
        promotional_use: !isAdultFacilitatorFlow,
        region: draft.region.trim() || undefined,
        digital_signature: digitalSignature,
        submitter_relationship: submitterRelationship,
        theme: themeParams.theme || undefined,
        title: draft.artwork.title.trim() || undefined,
      };

      if (authenticatedUser) {
        await submitArtwork(artworkRequest);
      } else {
        await submitGuestArtwork({
          ...artworkRequest,
          email: draft.submitterEmail.trim(),
          submitter_first_name: draft.submitterFirstName.trim(),
          submitter_last_name: draft.submitterLastName.trim(),
        });
      }

      const successState: SubmitArtworkSuccessState = {
        submission: {
          artworkDetailsMode,
          artworks: [
            {
              ...draft.artwork,
              fileName: file.name,
              previewDataUrl,
            },
          ],
          email: draft.submitterEmail.trim(),
          kind: 'single',
        },
      };
      setDraft(initialSubmitArtworkDraft);
      deleteArtwork();
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(SUBMIT_ARTWORK_DRAFT_KEY);
      }
      void navigate('/submit-artwork/success', {
        replace: true,
        state: successState,
      });
    } catch (error) {
      setStatus('idle');
      setSubmitMessage(getSubmitError(error));
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      SUBMIT_ARTWORK_DRAFT_KEY,
      JSON.stringify({ ...draft, digitalSignature: '' }),
    );
  }, [draft]);

  useEffect(() => {
    let active = true;

    void getAuthStatus()
      .then((auth) => {
        if (!active) return;

        if (auth.authenticated) {
          saveLastKnownUser(auth);
          setAuthenticatedUser(auth);
          setDraft((current) => ({
            ...current,
            submitterEmail: auth.email,
            submitterFirstName: auth.f_name ?? '',
            submitterLastName: auth.l_name ?? '',
          }));
          return;
        }

        setAuthenticatedUser(null);
      })
      .catch(() => {
        if (!active) return;
        setAuthenticatedUser(null);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      clearLastKnownUser();
      setAuthenticatedUser(null);
    }
  }

  useEffect(() => {
    document.body.style.overflow = isArtworkWindowOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isArtworkWindowOpen]);

  return (
    <div className="my-auto h-full flex-grow bg-slate-50 py-8 sm:py-12">
      <div className="content-w m-pad my-auto flex flex-col gap-4">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
          <Button onClick={() => void navigate(-1)}>
            <ChevronLeft />
            Go back
          </Button>
          {authenticatedUser && (
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleLogout()}
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Logout
            </Button>
          )}
        </div>
        <form
          className="mx-auto w-full max-w-3xl"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-6 rounded-lg border border-slate-200 bg-white p-4 shadow-xl sm:p-6">
            <div className="flex flex-col gap-2">
              <p className="text-secondary-blue text-xs font-bold uppercase tracking-widest">
                {copy.kicker}
              </p>
              <div>
                <h1 className="font-montserrat text-2xl font-semibold text-slate-950 sm:text-3xl">
                  {copy.title}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                  {copy.description}
                </p>
              </div>
            </div>

            <section className="grid gap-4 sm:grid-cols-2">
              <AccountTextField
                error={errors.submitterFirstName}
                label="Your first name"
                maxLength={MAX_NAME_LEN}
                name="submitterFirstName"
                value={draft.submitterFirstName}
                disabled={Boolean(authenticatedUser)}
                className={
                  authenticatedUser
                    ? 'border-slate-300 bg-slate-100 text-slate-700 opacity-100'
                    : undefined
                }
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    submitterFirstName: event.target.value,
                  }))
                }
              />
              <AccountTextField
                error={errors.submitterLastName}
                label="Your last name"
                maxLength={MAX_NAME_LEN}
                name="submitterLastName"
                value={draft.submitterLastName}
                disabled={Boolean(authenticatedUser)}
                className={
                  authenticatedUser
                    ? 'border-slate-300 bg-slate-100 text-slate-700 opacity-100'
                    : undefined
                }
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    submitterLastName: event.target.value,
                  }))
                }
              />
              <div className="sm:col-span-2">
                <AccountTextField
                  error={errors.submitterEmail}
                  label="Your email address"
                  leadingIcon={<Mail aria-hidden="true" className="h-4 w-4" />}
                  maxLength={254}
                  name="submitterEmail"
                  type="email"
                  value={draft.submitterEmail}
                  disabled={Boolean(authenticatedUser)}
                  className={
                    authenticatedUser
                      ? 'border-slate-300 bg-slate-100 text-slate-700 opacity-100'
                      : undefined
                  }
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setDraft((current) => ({
                      ...current,
                      submitterEmail: event.target.value,
                    }))
                  }
                />
                {authenticatedUser ? (
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    You are logged in with this email address.{' '}
                    <button
                      type="button"
                      className="text-secondary-blue font-semibold underline-offset-4 hover:underline"
                      onClick={() => void handleLogout()}
                    >
                      Logout
                    </button>{' '}
                    to submit under another email.
                  </p>
                ) : (
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    If you have an ICAF account, please{' '}
                    <Link
                      to={loginPath}
                      className="text-secondary-blue font-semibold underline-offset-4 hover:underline"
                    >
                      Log In
                    </Link>{' '}
                    before submitting artwork.
                  </p>
                )}
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

            <ThemePicker value={themeParams} onChange={selectTheme} />

            <section ref={artworkSectionRef} className="flex flex-col gap-3">
              <div>
                <h2 className="font-montserrat text-xl font-semibold text-slate-950">
                  Artwork
                </h2>
                <p className="text-xs leading-5 text-slate-500">
                  {copy.artworkHelpText}
                </p>
              </div>
              <ArtworkMuralWindow
                artworkDetailsMode={artworkDetailsMode}
                artworks={[displayedArtwork]}
                errors={displayedArtworkErrors}
                focusedArtworkId={
                  hasOverageArtwork ? draft.artwork.id : undefined
                }
                isOpen={isArtworkWindowOpen}
                maxCount={1}
                onArtworkChange={updateArtwork}
                onClose={() =>
                  void navigate(
                    `${getFlowPath(submitterFlow)}${location.search}`,
                  )
                }
                onDeleteArtwork={deleteArtwork}
                onFilesSelected={(newFiles) => {
                  const nextFile = newFiles[0];
                  if (nextFile) void attachFile(nextFile);
                }}
                onOpen={() =>
                  void navigate(
                    `${getFlowPath(submitterFlow, true)}${location.search}`,
                  )
                }
                onRotateArtwork={() => void rotateArtwork()}
              />
            </section>

            <ArtworkConsent
              checked={draft.certificationAccepted}
              error={errors.certificationAccepted}
              flow={submitterFlow}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  certificationAccepted: event.target.checked,
                }))
              }
            />

            <AccountTextField
              error={errors.digitalSignature}
              label="Digital signature"
              placeholder="Your full legal name"
              maxLength={200}
              name="digitalSignature"
              value={draft.digitalSignature}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  digitalSignature: event.target.value,
                }))
              }
            />

            {hasOverageArtwork && (
              <div
                className="text-tertiary-red rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold"
                role="alert"
              >
                <p>
                  Submit is disabled because one or more artworks are for an
                  artist of age {artworkAge}. Artwork submissions must be for
                  artists age {MAX_ARTIST_AGE} or younger.
                </p>
                <p className="mt-1 text-xs leading-5 text-red-700">
                  Artwork details: {draft.artwork.title || 'Untitled'}
                  {draft.artwork.f_name ? ` by ${draft.artwork.f_name}` : ''}
                  {file?.name ? `, file ${file.name}` : ''}
                </p>
              </div>
            )}

            <Button
              className="h-12 w-full rounded-full text-base font-bold"
              disabled={isSubmitting || hasOverageArtwork}
              type="submit"
            >
              <Send aria-hidden="true" className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : copy.submitLabel}
            </Button>
            {viewerError && (
              <p className="text-tertiary-red text-xs font-semibold">
                {viewerError}
              </p>
            )}
            {submitMessage && (
              <div
                className="text-tertiary-red rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold"
                role="alert"
              >
                <p>{submitMessage}</p>
                {isExistingAccountError(submitMessage) && (
                  <Button
                    asChild
                    className="mt-3 rounded-full"
                    variant="secondary"
                  >
                    <Link to={loginPath}>Log In</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
