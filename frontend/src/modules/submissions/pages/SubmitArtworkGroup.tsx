import { useMemo, useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Bell, BookOpen, Globe2, Send, UserRound } from 'lucide-react';
import { createGroup, submitArtworkToGroup } from '@/api/guardian';
import { uploadToPresignedUrl } from '@/api/uploads';
import { AccountTextField } from '@/modules/account/components/AccountTextField';
import { ArtworkMuralWindow } from '@/modules/submissions/components/ArtworkMuralWindow';
import { CompactTextarea } from '@/modules/submissions/components/CompactTextarea';
import type {
  ArtworkDraft,
  ArtworkGroupInfo,
  ArtworkGroupSubmissionErrors,
} from '@/modules/submissions/types/artworkGroupSubmission';
import {
  ARTWORK_GROUP_DRAFT_KEY,
  createArtworkDraft,
  createReleaseHash,
  getUploadFileType,
  hasSubmissionErrors,
  initialArtworkGroupSubmissionDraft,
  toArtworkRequest,
  validateArtworkGroupSubmission,
} from '@/modules/submissions/utils/artworkGroupDraft';
import { createImagePreview } from '@/modules/submissions/utils/imagePreview';
import { Button } from '@/shared/components/ui/button';
import { useLocalStorageDraft } from '@/shared/hooks/useLocalStorageDraft';
import { GROUP_MAX_MEMBERS } from '@icaf/shared';
import { useLocation, useNavigate } from 'react-router-dom';

const groupFieldIcons = {
  class_name: <BookOpen aria-hidden="true" className="h-4 w-4" />,
  country: <Globe2 aria-hidden="true" className="h-4 w-4" />,
  guardian_display_name: <UserRound aria-hidden="true" className="h-4 w-4" />,
};

function getSubmitError(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Artwork group submission failed. Please try again.';
}

export function SubmitArtworkGroup() {
  const location = useLocation();
  const navigate = useNavigate();
  const [draft, setDraft, clearDraft] = useLocalStorageDraft({
    initialValue: initialArtworkGroupSubmissionDraft,
    key: ARTWORK_GROUP_DRAFT_KEY,
  });
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [errors, setErrors] = useState<ArtworkGroupSubmissionErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>(
    'idle',
  );
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const isSubmitting = status === 'submitting';
  const artworkErrors = errors.artworks ?? {};
  const isArtworkWindowOpen = location.pathname === '/submit-artwork/artworks';

  const viewerError = useMemo(() => {
    if (errors.root) return errors.root;
    const firstArtworkError = draft.artworks
      .map((artwork) => artworkErrors[artwork.id]?.file)
      .find(Boolean);
    return firstArtworkError;
  }, [artworkErrors, draft.artworks, errors.root]);

  function updateGroupField<Name extends keyof ArtworkGroupInfo>(
    name: Name,
    value: ArtworkGroupInfo[Name],
  ) {
    setDraft((current) => ({
      ...current,
      group: {
        ...current.group,
        [name]: value,
      },
    }));
  }

  function handleGroupTextChange(event: ChangeEvent<HTMLInputElement>) {
    const name = event.target.name as keyof ArtworkGroupInfo;
    updateGroupField(name, event.target.value as ArtworkGroupInfo[typeof name]);
  }

  function updateArtwork<Name extends keyof ArtworkDraft>(
    artworkId: string,
    name: Name,
    value: ArtworkDraft[Name],
  ) {
    setDraft((current) => ({
      ...current,
      artworks: current.artworks.map((artwork) =>
        artwork.id === artworkId ? { ...artwork, [name]: value } : artwork,
      ),
    }));
  }

  async function attachFile(artworkId: string, file: File) {
    const previewDataUrl = await createImagePreview(file);
    const fileType = getUploadFileType(file);

    setFiles((current) => ({ ...current, [artworkId]: file }));
    setDraft((current) => ({
      ...current,
      artworks: current.artworks.map((artwork) =>
        artwork.id === artworkId
          ? {
              ...artwork,
              fileName: file.name,
              fileSize: file.size,
              fileType,
              previewDataUrl,
              restoredFromDraft: false,
            }
          : artwork,
      ),
    }));
  }

  function openArtworkWindow() {
    if (!isArtworkWindowOpen) void navigate('/submit-artwork/artworks');
  }

  function closeArtworkWindow() {
    void navigate('/submit-artwork');
  }

  function deleteArtwork(artworkId: string) {
    setFiles((current) => {
      const next = { ...current };
      delete next[artworkId];
      return next;
    });
    setDraft((current) => {
      const remainingArtworks = current.artworks.filter(
        (artwork) => artwork.id !== artworkId,
      );

      return {
        ...current,
        artworks:
          remainingArtworks.length > 0
            ? remainingArtworks
            : [createArtworkDraft()],
      };
    });
  }

  async function addFiles(filesToAdd: File[]) {
    if (filesToAdd.length === 0) return;

    let nextDraft = draft;
    const occupiedArtworkIds = new Set(
      nextDraft.artworks
        .filter((artwork) => files[artwork.id] || artwork.previewDataUrl)
        .map((artwork) => artwork.id),
    );
    const assignments: Array<{ artworkId: string; file: File }> = [];

    filesToAdd.forEach((file) => {
      const emptyArtwork = nextDraft.artworks.find(
        (artwork) => !occupiedArtworkIds.has(artwork.id),
      );
      const targetArtwork =
        emptyArtwork ??
        (nextDraft.artworks.length < GROUP_MAX_MEMBERS
          ? createArtworkDraft()
          : undefined);

      if (!targetArtwork) return;

      if (!emptyArtwork) {
        nextDraft = {
          ...nextDraft,
          artworks: [...nextDraft.artworks, targetArtwork],
        };
      }

      assignments.push({ artworkId: targetArtwork.id, file });
      occupiedArtworkIds.add(targetArtwork.id);
    });

    if (nextDraft !== draft) setDraft(nextDraft);
    await Promise.all(
      assignments.map(({ artworkId, file }) => attachFile(artworkId, file)),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitMessage(null);

    const nextErrors = validateArtworkGroupSubmission(draft, files);
    setErrors(nextErrors);

    if (hasSubmissionErrors(nextErrors)) return;

    setStatus('submitting');
    void handleAsyncSubmit();
  }

  async function handleAsyncSubmit() {
    try {
      const releaseHash = await createReleaseHash();
      const groupResponse = await createGroup({
        class_name: draft.group.class_name.trim() || undefined,
        country: draft.group.country.trim(),
        description: draft.group.description.trim() || undefined,
        group_type: draft.group.group_type.trim() || 'classroom',
        notifications: draft.group.notifications,
        region: draft.group.region.trim() || undefined,
        guardian_display_name:
          draft.group.guardian_display_name.trim() || undefined,
        title: draft.group.title.trim(),
      });

      for (const artwork of draft.artworks) {
        const file = files[artwork.id];
        if (!file) throw new Error('A selected image is missing.');

        const fileType = getUploadFileType(file);
        if (!fileType) throw new Error(`${file.name} is not supported.`);

        const artworkResponse = await submitArtworkToGroup(
          groupResponse.group_id,
          toArtworkRequest(artwork, file, releaseHash, draft.group),
        );
        await uploadToPresignedUrl({
          file,
          fileType,
          url: artworkResponse.presigned_url,
        });
      }

      setStatus('success');
      setSubmitMessage(
        `Submitted ${draft.artworks.length} artwork${draft.artworks.length === 1 ? '' : 's'} for review.`,
      );
      setFiles({});
      clearDraft();
    } catch (error) {
      setStatus('idle');
      setSubmitMessage(getSubmitError(error));
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
      <div className="content-w m-pad my-auto">
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
                Submit artwork for a group
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Create one group with individually annotated artwork images.
              </p>
            </div>

            {submitMessage && (
              <div
                className={
                  status === 'success'
                    ? 'text-secondary-green mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold'
                    : 'text-tertiary-red mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold'
                }
                role={status === 'success' ? 'status' : 'alert'}
              >
                {submitMessage}
              </div>
            )}

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <AccountTextField
                  error={errors.group?.title}
                  label="Group title"
                  maxLength={200}
                  name="title"
                  required
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
                error={errors.group?.guardian_display_name}
                label="Guardian display name"
                leadingIcon={groupFieldIcons.guardian_display_name}
                maxLength={200}
                name="guardian_display_name"
                value={draft.group.guardian_display_name}
                onChange={handleGroupTextChange}
              />
              <AccountTextField
                error={errors.group?.country}
                label="Country"
                leadingIcon={groupFieldIcons.country}
                maxLength={200}
                name="country"
                required
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
                  label="Group notes"
                  maxLength={2000}
                  name="description"
                  value={draft.group.description}
                  onChange={(event) =>
                    updateGroupField('description', event.target.value)
                  }
                />
              </div>
            </section>

            <section className="mt-6 flex flex-col gap-3">
              <div>
                <h2 className="font-montserrat text-xl font-semibold text-slate-950">
                  Artworks
                </h2>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  Tap the box to upload, review, and annotate up to{' '}
                  {GROUP_MAX_MEMBERS} artworks.
                </p>
              </div>
              <ArtworkMuralWindow
                artworks={draft.artworks}
                errors={artworkErrors}
                isOpen={isArtworkWindowOpen}
                maxCount={GROUP_MAX_MEMBERS}
                onArtworkChange={updateArtwork}
                onClose={closeArtworkWindow}
                onDeleteArtwork={deleteArtwork}
                onFilesSelected={(newFiles) => void addFiles(newFiles)}
                onOpen={openArtworkWindow}
              />
              {viewerError && (
                <p className="text-tertiary-red text-xs font-semibold">
                  {viewerError}
                </p>
              )}
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
                I certify that I have the right to submit these artworks to
                ICAF.
                {errors.certificationAccepted && (
                  <span className="text-tertiary-red mt-1 block text-xs font-semibold">
                    {errors.certificationAccepted}
                  </span>
                )}
              </span>
            </label>

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

            <Button
              className="mt-6 h-12 w-full rounded-full text-base font-bold"
              disabled={isSubmitting}
              type="submit"
            >
              <Send aria-hidden="true" className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit artwork group'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
