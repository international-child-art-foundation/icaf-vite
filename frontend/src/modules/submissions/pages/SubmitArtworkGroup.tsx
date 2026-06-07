import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import {
  Bell,
  BookOpen,
  ChevronLeft,
  Globe2,
  Mail,
  Send,
  UserRound,
} from 'lucide-react';
import { createGuestGroup } from '@/api/public';
import { uploadToPresignedUrl } from '@/api/uploads';
import { AccountTextField } from '@/modules/account/components/AccountTextField';
import { ArtworkMuralWindow } from '@/modules/submissions/components/ArtworkMuralWindow';
import { CompactTextarea } from '@/modules/submissions/components/CompactTextarea';
import {
  getSubmitArtworkPageCopy,
  type SubmitArtworkPageCopy,
  type SubmitterFlow,
} from '@/modules/submissions/data/submitArtworkCopy';
import type {
  ArtworkDraft,
  ArtworkGroupInfo,
  ArtworkGroupSubmissionErrors,
  StoredArtworkGroupSubmissionDraft,
} from '@/modules/submissions/types/artworkGroupSubmission';
import {
  ARTWORK_GROUP_DRAFT_KEY,
  createArtworkDraft,
  createDigitalSignature,
  createReleaseHash,
  getUploadFileType,
  hasSubmissionErrors,
  initialArtworkGroupSubmissionDraft,
  toArtworkRequest,
  validateArtworkGroupSubmission,
} from '@/modules/submissions/utils/artworkGroupDraft';
import {
  createImagePreview,
  createRotatedImageFile,
} from '@/modules/submissions/utils/imagePreview';
import { Button } from '@/shared/components/ui/button';
import {
  GROUP_MAX_MEMBERS,
  MAX_ARTIST_AGE,
  type SubmitterRelationship,
} from '@icaf/shared';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArtworkDisclaimer } from '@/modules/submissions/components/ArtworkDisclaimer';

type SubmissionStatus = 'idle' | 'submitting' | 'success';

type GroupIconField = 'class_name' | 'country' | 'submitter_display_name';

export type SubmitArtworkGroupCopy = SubmitArtworkPageCopy;

type StringArtworkGroupField = {
  [Key in keyof ArtworkGroupInfo]: ArtworkGroupInfo[Key] extends string
    ? Key
    : never;
}[keyof ArtworkGroupInfo];

const textArtworkGroupFields = [
  'class_name',
  'country',
  'submitter_display_name',
  'region',
  'title',
] as const satisfies readonly StringArtworkGroupField[];

type TextArtworkGroupField = (typeof textArtworkGroupFields)[number];

const groupFieldIcons: Record<GroupIconField, ReactNode> = {
  class_name: <BookOpen aria-hidden="true" className="h-4 w-4" />,
  country: <Globe2 aria-hidden="true" className="h-4 w-4" />,
  submitter_display_name: <UserRound aria-hidden="true" className="h-4 w-4" />,
};

const initialPersistedDraft: StoredArtworkGroupSubmissionDraft = {
  certificationAccepted:
    initialArtworkGroupSubmissionDraft.certificationAccepted,
  digitalSignature: initialArtworkGroupSubmissionDraft.digitalSignature,
  group: initialArtworkGroupSubmissionDraft.group,
  promotionalUse: initialArtworkGroupSubmissionDraft.promotionalUse,
  submitterEmail: initialArtworkGroupSubmissionDraft.submitterEmail,
};

function getSubmitError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Artwork group submission failed. Please try again.';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object');
}

function isTextArtworkGroupField(
  value: string,
): value is TextArtworkGroupField {
  return (textArtworkGroupFields as readonly string[]).includes(value);
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function readStoredGroupType(value: unknown): ArtworkGroupInfo['group_type'] {
  return typeof value === 'string'
    ? value
    : initialPersistedDraft.group.group_type;
}

function readStoredGroup(value: unknown): ArtworkGroupInfo {
  const group = isRecord(value) ? value : {};

  return {
    class_name: readString(
      group.class_name,
      initialPersistedDraft.group.class_name,
    ),
    country: readString(group.country, initialPersistedDraft.group.country),
    description: readString(
      group.description,
      initialPersistedDraft.group.description,
    ),
    group_type: readStoredGroupType(group.group_type),
    submitter_display_name: readString(
      group.submitter_display_name,
      initialPersistedDraft.group.submitter_display_name,
    ),
    notifications:
      typeof group.notifications === 'boolean'
        ? group.notifications
        : initialPersistedDraft.group.notifications,
    region: readString(group.region, initialPersistedDraft.group.region),
    theme_family: readString(
      group.theme_family,
      initialPersistedDraft.group.theme_family,
    ),
    theme_instance: readString(
      group.theme_instance,
      initialPersistedDraft.group.theme_instance,
    ),
    title: readString(group.title, initialPersistedDraft.group.title),
  };
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

async function createFileFingerprint(file: File) {
  if (!globalThis.crypto?.subtle) {
    return `${file.size}:${file.lastModified}`;
  }

  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    await file.arrayBuffer(),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function readPersistedDraft(): StoredArtworkGroupSubmissionDraft {
  if (typeof window === 'undefined') return initialPersistedDraft;

  try {
    const storedValue = window.localStorage.getItem(ARTWORK_GROUP_DRAFT_KEY);
    const parsedDraft: unknown = storedValue ? JSON.parse(storedValue) : {};
    const storedDraft = isRecord(parsedDraft) ? parsedDraft : {};

    return {
      certificationAccepted:
        typeof storedDraft.certificationAccepted === 'boolean'
          ? storedDraft.certificationAccepted
          : initialPersistedDraft.certificationAccepted,
      digitalSignature: '',
      group: readStoredGroup(storedDraft.group),
      promotionalUse:
        typeof storedDraft.promotionalUse === 'boolean'
          ? storedDraft.promotionalUse
          : initialPersistedDraft.promotionalUse,
      submitterEmail: readString(
        storedDraft.submitterEmail,
        initialPersistedDraft.submitterEmail,
      ),
    };
  } catch {
    return initialPersistedDraft;
  }
}

function getSubmitterFlow(value: string | undefined): SubmitterFlow {
  return value === 'parent' ? 'parent' : 'educator';
}

function getFlowPath(flow: SubmitterFlow, nested = false) {
  return `/submit-artwork/group/${flow}${nested ? '/artworks' : ''}`;
}

export function SubmitArtworkGroup({
  copy: copyOverrides,
}: {
  copy?: Partial<SubmitArtworkGroupCopy>;
} = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const submitterFlow = getSubmitterFlow(params.submitterFlow);
  const isEducatorFlow = submitterFlow === 'educator';
  const copy = {
    ...getSubmitArtworkPageCopy(submitterFlow, 'group'),
    ...copyOverrides,
  };
  const artworkDetailsMode = isEducatorFlow ? 'basic' : 'full';
  const submitterRelationship: SubmitterRelationship = isEducatorFlow
    ? 'teacher'
    : 'guardian';
  const artworkSectionRef = useRef<HTMLElement | null>(null);
  const [draft, setDraft] = useState(readPersistedDraft);
  const [artworks, setArtworks] = useState<ArtworkDraft[]>([
    createArtworkDraft(),
  ]);
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [fileFingerprints, setFileFingerprints] = useState<
    Record<string, string | undefined>
  >({});
  const [previewDataUrls, setPreviewDataUrls] = useState<
    Record<string, string | undefined>
  >({});
  const [imageRotations, setImageRotations] = useState<
    Record<string, number | undefined>
  >({});
  const [errors, setErrors] = useState<ArtworkGroupSubmissionErrors>({});
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const isSubmitting = status === 'submitting';
  const artworkErrors = errors.artworks ?? {};
  const isArtworkWindowOpen = location.pathname.endsWith('/artworks');
  const themeParams = useMemo(
    () => readThemeParams(location.search),
    [location.search],
  );
  const activeTheme = {
    theme_family: themeParams.theme_family || draft.group.theme_family,
    theme_instance: themeParams.theme_instance || draft.group.theme_instance,
  };
  const effectiveGroup = useMemo(
    () => ({
      ...draft.group,
      theme_family: activeTheme.theme_family,
      theme_instance: activeTheme.theme_family
        ? activeTheme.theme_instance
        : '',
    }),
    [activeTheme.theme_family, activeTheme.theme_instance, draft.group],
  );
  const submissionDraft = useMemo(
    () => ({ ...draft, group: effectiveGroup, artworks }),
    [artworks, draft, effectiveGroup],
  );
  const displayArtworks = useMemo(
    () =>
      artworks.map((artwork) => {
        const liveFile = files[artwork.id];

        return {
          ...artwork,
          fileName: liveFile?.name,
          previewDataUrl: liveFile ? previewDataUrls[artwork.id] : undefined,
        };
      }),
    [artworks, files, previewDataUrls],
  );
  const overageArtworks = useMemo(
    () =>
      artworkDetailsMode === 'full'
        ? displayArtworks
            .map((artwork, index) => ({
              artwork,
              age: Number(artwork.age),
              index,
            }))
            .filter(
              ({ age, artwork }) =>
                artwork.age.trim() !== '' &&
                !Number.isNaN(age) &&
                age > MAX_ARTIST_AGE,
            )
        : [],
    [artworkDetailsMode, displayArtworks],
  );
  const displayedArtworkErrors = useMemo(() => {
    const nextErrors = { ...artworkErrors };

    displayArtworks.forEach((artwork) => {
      const age = Number(artwork.age);
      const currentArtworkErrors = { ...nextErrors[artwork.id] };
      delete currentArtworkErrors.age;

      const liveAgeError =
        artworkDetailsMode === 'full' && artwork.age.trim()
          ? !Number.isInteger(age) || age < 1
            ? `Enter a whole number from 1 to ${MAX_ARTIST_AGE}.`
            : age > MAX_ARTIST_AGE
              ? `Artist age must be ${MAX_ARTIST_AGE} or younger.`
              : undefined
          : undefined;

      if (liveAgeError) {
        nextErrors[artwork.id] = {
          ...currentArtworkErrors,
          age: liveAgeError,
        };
      } else if (Object.keys(currentArtworkErrors).length > 0) {
        nextErrors[artwork.id] = currentArtworkErrors;
      } else {
        delete nextErrors[artwork.id];
      }
    });

    return nextErrors;
  }, [artworkDetailsMode, artworkErrors, displayArtworks]);
  const firstOverageArtwork = overageArtworks[0]?.artwork;

  const viewerError = useMemo(() => {
    if (errors.root) return errors.root;
    const firstArtworkError = artworks
      .map((artwork) => artworkErrors[artwork.id]?.file)
      .find(Boolean);
    return firstArtworkError;
  }, [artworkErrors, artworks, errors.root]);

  function updateGroupField<Name extends keyof ArtworkGroupInfo>(
    name: Name,
    value: ArtworkGroupInfo[Name],
  ) {
    setDraft((current) => ({
      certificationAccepted: current.certificationAccepted,
      digitalSignature: current.digitalSignature,
      group: {
        ...current.group,
        [name]: value,
      },
      promotionalUse: current.promotionalUse,
      submitterEmail: current.submitterEmail,
    }));
  }

  function updateSubmitterEmail(value: string) {
    setDraft((current) => ({
      ...current,
      submitterEmail: value,
    }));
  }

  function handleGroupTextChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    if (!isTextArtworkGroupField(name)) return;
    updateGroupField(name, value);
  }

  function updateArtwork<Name extends keyof ArtworkDraft>(
    artworkId: string,
    name: Name,
    value: ArtworkDraft[Name],
  ) {
    setArtworks((current) =>
      current.map((artwork) =>
        artwork.id === artworkId ? { ...artwork, [name]: value } : artwork,
      ),
    );
  }

  async function attachFile(artworkId: string, file: File) {
    const previewDataUrl = await createImagePreview(file);

    setFiles((current) => ({ ...current, [artworkId]: file }));
    setImageRotations((current) => ({ ...current, [artworkId]: 0 }));
    setPreviewDataUrls((current) => ({
      ...current,
      [artworkId]: previewDataUrl,
    }));
  }

  async function rotateArtwork(artworkId: string) {
    const file = files[artworkId];
    if (!file) return;

    const nextRotation = ((imageRotations[artworkId] ?? 0) + 90) % 360;
    const previewDataUrl = await createImagePreview(file, nextRotation);

    setImageRotations((current) => ({
      ...current,
      [artworkId]: nextRotation,
    }));
    setPreviewDataUrls((current) => ({
      ...current,
      [artworkId]: previewDataUrl,
    }));
  }

  function openArtworkWindow() {
    if (!isArtworkWindowOpen)
      void navigate(`${getFlowPath(submitterFlow, true)}${location.search}`);
  }

  function closeArtworkWindow() {
    void navigate(`${getFlowPath(submitterFlow)}${location.search}`);
  }

  function selectArtworkInWindow() {
    artworkSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    if (!isArtworkWindowOpen) {
      void navigate(`${getFlowPath(submitterFlow, true)}${location.search}`);
    }
  }

  function deleteArtwork(artworkId: string) {
    setFiles((current) => {
      const next = { ...current };
      delete next[artworkId];
      return next;
    });
    setFileFingerprints((current) => {
      const next = { ...current };
      delete next[artworkId];
      return next;
    });
    setImageRotations((current) => {
      const next = { ...current };
      delete next[artworkId];
      return next;
    });
    setPreviewDataUrls((current) => {
      const next = { ...current };
      delete next[artworkId];
      return next;
    });
    setArtworks((current) => {
      const remainingArtworks = current.filter(
        (artwork) => artwork.id !== artworkId,
      );

      return remainingArtworks.length > 0
        ? remainingArtworks
        : [createArtworkDraft()];
    });
  }

  async function addFiles(filesToAdd: File[]) {
    if (filesToAdd.length === 0) return;

    let nextArtworks = artworks;
    const nextFingerprints = { ...fileFingerprints };
    const existingFingerprints = new Set(
      Object.values(nextFingerprints).filter(Boolean),
    );
    const occupiedArtworkIds = new Set(
      nextArtworks
        .filter((artwork) => files[artwork.id])
        .map((artwork) => artwork.id),
    );
    const assignments: Array<{ artworkId: string; file: File }> = [];

    for (const file of filesToAdd) {
      const fingerprint = await createFileFingerprint(file);
      if (existingFingerprints.has(fingerprint)) continue;

      const emptyArtwork = nextArtworks.find(
        (artwork) => !occupiedArtworkIds.has(artwork.id),
      );
      const targetArtwork =
        emptyArtwork ??
        (nextArtworks.length < GROUP_MAX_MEMBERS
          ? createArtworkDraft()
          : undefined);

      if (!targetArtwork) break;

      if (!emptyArtwork) {
        nextArtworks = [...nextArtworks, targetArtwork];
      }

      assignments.push({ artworkId: targetArtwork.id, file });
      occupiedArtworkIds.add(targetArtwork.id);
      existingFingerprints.add(fingerprint);
      nextFingerprints[targetArtwork.id] = fingerprint;
    }

    if (nextArtworks !== artworks) setArtworks(nextArtworks);
    setFileFingerprints(nextFingerprints);
    await Promise.all(
      assignments.map(({ artworkId, file }) => attachFile(artworkId, file)),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitMessage(null);

    if (overageArtworks.length > 0) return;

    const nextErrors = validateArtworkGroupSubmission(submissionDraft, files, {
      artworkDetailsMode,
      requiresDigitalSignature: !isEducatorFlow,
    });
    setErrors(nextErrors);

    if (hasSubmissionErrors(nextErrors)) return;

    setStatus('submitting');
    void handleAsyncSubmit();
  }

  async function handleAsyncSubmit() {
    try {
      const releaseHash = await createReleaseHash();
      const digitalSignature = isEducatorFlow
        ? undefined
        : createDigitalSignature(draft.digitalSignature);
      const uploadFiles = await Promise.all(
        artworks.map((artwork) => {
          const file = files[artwork.id];
          if (!file) throw new Error('A selected image is missing.');
          return createRotatedImageFile(file, imageRotations[artwork.id] ?? 0);
        }),
      );
      const artworkRequests = artworks.map((artwork, index) => {
        const file = uploadFiles[index];
        if (!file) throw new Error('A selected image is missing.');
        if (!getUploadFileType(file))
          throw new Error(`${file.name} is not supported.`);
        return toArtworkRequest(
          artwork,
          file,
          releaseHash,
          digitalSignature,
          effectiveGroup,
          isEducatorFlow ? false : draft.promotionalUse,
          {
            artworkDetailsMode,
            submitterRelationship,
          },
        );
      });
      const groupResponse = await createGuestGroup({
        email: draft.submitterEmail.trim(),
        artworks: artworkRequests,
        class_name: effectiveGroup.class_name.trim() || undefined,
        country: effectiveGroup.country.trim(),
        description: effectiveGroup.description.trim() || undefined,
        group_type: effectiveGroup.group_type,
        notifications: effectiveGroup.notifications,
        region: effectiveGroup.region.trim() || undefined,
        submitter_display_name:
          effectiveGroup.submitter_display_name.trim() || undefined,
        theme_family: effectiveGroup.theme_family.trim() || undefined,
        theme_instance: effectiveGroup.theme_instance.trim() || undefined,
        title: effectiveGroup.title.trim(),
      });

      if (groupResponse.art_uploads?.length !== artworks.length) {
        throw new Error(
          'The server did not return upload URLs for every artwork.',
        );
      }

      for (const [index] of artworks.entries()) {
        const file = uploadFiles[index];
        if (!file) throw new Error('A selected image is missing.');

        const fileType = getUploadFileType(file);
        if (!fileType) throw new Error(`${file.name} is not supported.`);

        const artworkResponse = groupResponse.art_uploads[index];
        await uploadToPresignedUrl({
          file,
          fileType,
          url: artworkResponse.presigned_url,
        });
      }

      setStatus('success');
      setSubmitMessage(
        `Thank you for submitting ${artworks.length} artwork${artworks.length === 1 ? '' : 's'} for review! Check your email to create an account and receive updates.`,
      );
      setFiles({});
      setFileFingerprints({});
      setImageRotations({});
      setPreviewDataUrls({});
      setArtworks([createArtworkDraft()]);
      setDraft(initialPersistedDraft);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(ARTWORK_GROUP_DRAFT_KEY);
      }
    } catch (error) {
      setStatus('idle');
      setSubmitMessage(getSubmitError(error));
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      ARTWORK_GROUP_DRAFT_KEY,
      JSON.stringify({ ...draft, digitalSignature: '' }),
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
                {copy.kicker}
              </p>
              <h1 className="font-montserrat text-2xl font-semibold text-slate-950 sm:text-3xl">
                {copy.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {copy.description}
              </p>
            </div>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <AccountTextField
                  error={errors.submitterEmail}
                  label="Submitter email"
                  leadingIcon={<Mail aria-hidden="true" className="h-4 w-4" />}
                  maxLength={254}
                  name="submitterEmail"
                  type="email"
                  value={draft.submitterEmail}
                  onChange={(event) => updateSubmitterEmail(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <AccountTextField
                  error={errors.group?.title}
                  label="Group title"
                  maxLength={200}
                  name="title"
                  value={draft.group.title}
                  onChange={handleGroupTextChange}
                />
              </div>
              <AccountTextField
                error={errors.group?.class_name}
                label="Class or group name"
                leadingIcon={groupFieldIcons.class_name}
                maxLength={200}
                name="class_name"
                value={draft.group.class_name}
                onChange={handleGroupTextChange}
              />
              <AccountTextField
                error={errors.group?.submitter_display_name}
                label="Submitter display name"
                leadingIcon={groupFieldIcons.submitter_display_name}
                maxLength={200}
                name="submitter_display_name"
                value={draft.group.submitter_display_name}
                onChange={handleGroupTextChange}
              />
              <AccountTextField
                error={errors.group?.country}
                label="Country"
                leadingIcon={groupFieldIcons.country}
                maxLength={200}
                name="country"
                value={draft.group.country}
                onChange={handleGroupTextChange}
              />
              <AccountTextField
                error={errors.group?.region}
                label="State, province, or region"
                maxLength={200}
                name="region"
                value={draft.group.region}
                onChange={handleGroupTextChange}
              />
              <div className="sm:col-span-2">
                <CompactTextarea
                  error={errors.group?.description}
                  label="Describe your group!"
                  maxLength={2000}
                  name="description"
                  value={draft.group.description}
                  onChange={(event) =>
                    updateGroupField('description', event.target.value)
                  }
                />
              </div>
            </section>

            <section
              ref={artworkSectionRef}
              className="mt-6 flex flex-col gap-3"
            >
              <div>
                <h2 className="font-montserrat text-xl font-semibold text-slate-950">
                  Artworks
                </h2>
                {activeTheme.theme_family && (
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Theme: {activeTheme.theme_family}
                    {activeTheme.theme_instance
                      ? ` ${formatThemeInstance(activeTheme.theme_instance)}`
                      : ''}
                  </p>
                )}
                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  {copy.artworkHelpText}
                </p>
              </div>
              <ArtworkMuralWindow
                artworkDetailsMode={artworkDetailsMode}
                artworks={displayArtworks}
                errors={displayedArtworkErrors}
                focusedArtworkId={firstOverageArtwork?.id}
                isOpen={isArtworkWindowOpen}
                maxCount={GROUP_MAX_MEMBERS}
                onArtworkChange={updateArtwork}
                onClose={closeArtworkWindow}
                onDeleteArtwork={deleteArtwork}
                onFilesSelected={(newFiles) => void addFiles(newFiles)}
                onOpen={openArtworkWindow}
                onRotateArtwork={(artworkId) => void rotateArtwork(artworkId)}
              />
            </section>
            {!isEducatorFlow && <ArtworkDisclaimer />}

            <label className="mt-5 flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              <input
                checked={draft.certificationAccepted}
                className="accent-secondary-blue mt-1 h-4 w-4"
                name="certificationAccepted"
                type="checkbox"
                onChange={(event) =>
                  setDraft((current) => ({
                    certificationAccepted: event.target.checked,
                    digitalSignature: current.digitalSignature,
                    group: current.group,
                    promotionalUse: current.promotionalUse,
                    submitterEmail: current.submitterEmail,
                  }))
                }
              />
              <span>
                I certify that I have the right to submit these artworks to ICAF
                on behalf of their creators.
                {errors.certificationAccepted && (
                  <span className="text-tertiary-red mt-1 block text-xs font-semibold">
                    {errors.certificationAccepted}
                  </span>
                )}
              </span>
            </label>

            {!isEducatorFlow && (
              <>
                <div className="mt-3">
                  <AccountTextField
                    error={errors.digitalSignature}
                    label="Digital signature"
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
                </div>

                <label className="mt-3 flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  <input
                    checked={draft.promotionalUse}
                    className="accent-secondary-blue mt-1 h-4 w-4"
                    name="promotionalUse"
                    type="checkbox"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        promotionalUse: event.target.checked,
                      }))
                    }
                  />
                  <span>
                    I allow ICAF to use these artworks for promotional purposes.
                  </span>
                </label>
              </>
            )}

            <label className="mt-3 flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              <input
                checked={draft.group.notifications}
                className="accent-secondary-blue mt-1 h-4 w-4"
                name="notifications"
                type="checkbox"
                onChange={(event) =>
                  updateGroupField('notifications', event.target.checked)
                }
              />
              <span className="flex gap-2">
                <Bell
                  aria-hidden="true"
                  className="mt-1 h-4 w-4 shrink-0 text-slate-500"
                />
                Send submission notifications for this group.
              </span>
            </label>

            {overageArtworks.length > 0 && (
              <div
                className="text-tertiary-red mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold"
                role="alert"
              >
                <p>
                  Submit is disabled because{' '}
                  {overageArtworks.length === 1
                    ? 'an artwork is'
                    : `${overageArtworks.length} artworks are`}{' '}
                  for artists over age {MAX_ARTIST_AGE}.
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {overageArtworks.map(({ age, artwork, index }) => (
                    <button
                      key={artwork.id}
                      className="inline-flex min-h-10 items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-left text-xs font-bold text-red-700 shadow-sm"
                      type="button"
                      onClick={() => selectArtworkInWindow()}
                    >
                      <span>
                        Artwork {index + 1}: {artwork.title || 'Untitled'}, age{' '}
                        {age}
                        {artwork.f_name ? `, artist ${artwork.f_name}` : ''}
                        {artwork.fileName ? `, file ${artwork.fileName}` : ''}
                      </span>
                      <span className="shrink-0 text-sm">Select</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="mt-6 h-12 w-full rounded-full text-base font-bold"
              disabled={isSubmitting || overageArtworks.length > 0}
              type="submit"
            >
              <Send aria-hidden="true" className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : copy.submitLabel}
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
