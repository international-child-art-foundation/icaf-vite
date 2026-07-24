import type { ChangeEvent, DragEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MagazineListItem } from '@icaf/shared';
import {
  Eye,
  Pencil,
  RefreshCw,
  Save,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  deleteMagazine,
  listAdminMagazines,
  updateMagazine,
  updateMagazineStatus,
  uploadMagazineZip,
} from '@/api/admin';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { DashboardModule, ModuleState } from './DashboardModule';
import { magazineUploadHints } from '@/modules/dashboard/data/magazineUploadHints';

type UploadStatus = 'ready' | 'uploading' | 'uploaded' | 'error';

type MagazineUploadDraft = {
  id: string;
  file: File;
  slug: string;
  name: string;
  period: string;
  volume: string;
  status: UploadStatus;
  error?: string;
};

type MagazineEditDraft = {
  slug: string;
  name: string;
  period: string;
  volume: string;
};

const slugPattern = /^[A-Za-z0-9&+\-_.]+$/;

function magazineStatusClass(magazine: MagazineListItem): string {
  if (magazine.status === 'processing') return 'bg-amber-100 text-amber-800';
  if (magazine.status === 'unpublished') return 'bg-neutral-100 text-neutral-700';
  return 'bg-green-100 text-green-800';
}

function fileId(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function slugFromFilename(filename: string): string {
  return filename.replace(/\.zip$/i, '').trim();
}

function titleFromSlug(slug: string): string {
  return slug
    .replace(/[_.+-]+/g, ' ')
    .replace(/&/g, ' & ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

function draftFromFile(file: File): MagazineUploadDraft {
  const slug = slugFromFilename(file.name);
  const hint = magazineUploadHints.find((item) => item.slug === slug);

  return {
    id: fileId(file),
    file,
    slug,
    name: hint?.name ?? titleFromSlug(slug),
    period: hint?.period ?? 'Unknown period',
    volume: hint?.volume ?? 'Unknown volume',
    status: 'ready',
  };
}

function isZipFile(file: File): boolean {
  return /\.zip$/i.test(file.name);
}

function validateDraft(draft: MagazineUploadDraft): string | null {
  if (!draft.slug.trim()) return 'Slug is required.';
  if (!slugPattern.test(draft.slug)) {
    return 'Slug may only contain letters, digits, &, +, -, _, and dot.';
  }
  if (!draft.name.trim()) return 'Title is required.';
  if (!draft.period.trim()) return 'Period is required.';
  if (!draft.volume.trim()) return 'Volume is required.';
  return null;
}

function validateEditDraft(draft: MagazineEditDraft): string | null {
  if (!draft.name.trim()) return 'Title is required.';
  if (!draft.period.trim()) return 'Period is required.';
  if (!draft.volume.trim()) return 'Volume is required.';
  return null;
}

function formatTimestamp(ts: number): string {
  if (!Number.isFinite(ts)) return '-';
  return new Date(ts * 1000).toLocaleString();
}

export function MagazineAdminPanel() {
  const [drafts, setDrafts] = useState<MagazineUploadDraft[]>([]);
  const [magazines, setMagazines] = useState<MagazineListItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingMagazine, setEditingMagazine] =
    useState<MagazineEditDraft | null>(null);
  const [pendingDelete, setPendingDelete] =
    useState<MagazineListItem | null>(null);
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const invalidCount = useMemo(
    () => drafts.filter((draft) => validateDraft(draft)).length,
    [drafts],
  );

  const loadMagazines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listAdminMagazines({ bypassCache: true });
      setMagazines(response.magazines);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load magazines.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMagazines();
  }, [loadMagazines]);

  const addFiles = (files: File[]) => {
    const zipFiles = files.filter(isZipFile);
    if (zipFiles.length === 0) {
      setError('Choose one or more .zip files.');
      return;
    }

    setError(null);
    setMessage(null);
    setDrafts((current) => {
      const existingIds = new Set(current.map((draft) => draft.id));
      const incoming = zipFiles
        .filter((file) => !existingIds.has(fileId(file)))
        .map(draftFromFile);
      return [...current, ...incoming];
    });
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.currentTarget.files ?? []));
    event.currentTarget.value = '';
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    addFiles(Array.from(event.dataTransfer.files));
  };

  const updateDraft = (
    id: string,
    field: keyof Pick<MagazineUploadDraft, 'slug' | 'name' | 'period' | 'volume'>,
    value: string,
  ) => {
    setDrafts((current) =>
      current.map((draft) =>
        draft.id === id
          ? { ...draft, [field]: value, status: 'ready', error: undefined }
          : draft,
      ),
    );
  };

  const removeDraft = (id: string) => {
    setDrafts((current) => current.filter((draft) => draft.id !== id));
  };

  const closeDeleteDialog = () => {
    if (deleting) return;
    setPendingDelete(null);
    setDeleteAcknowledged(false);
  };

  const startEditingMagazine = (magazine: MagazineListItem) => {
    setEditingMagazine({
      slug: magazine.slug,
      name: magazine.name,
      period: magazine.period,
      volume: magazine.volume,
    });
    setError(null);
    setMessage(null);
  };

  const updateEditingMagazine = (
    field: keyof Pick<MagazineEditDraft, 'name' | 'period' | 'volume'>,
    value: string,
  ) => {
    setEditingMagazine((current) =>
      current ? { ...current, [field]: value } : current,
    );
  };

  const saveEditingMagazine = async () => {
    if (!editingMagazine) return;

    const validationError = validateEditDraft(editingMagazine);
    if (validationError) {
      setError(validationError);
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      await updateMagazine(editingMagazine.slug, {
        name: editingMagazine.name.trim(),
        period: editingMagazine.period.trim(),
        volume: editingMagazine.volume.trim(),
      });
      setMessage(`${editingMagazine.slug} updated.`);
      setEditingMagazine(null);
      await loadMagazines();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update magazine.');
    } finally {
      setBusy(false);
    }
  };

  const confirmDeleteMagazine = async () => {
    if (!pendingDelete || !deleteAcknowledged || deleting) return;

    const slug = pendingDelete.slug;
    setDeleting(true);
    setError(null);
    setMessage(null);

    try {
      await deleteMagazine(slug);
      setMagazines((current) =>
        current.filter((magazine) => magazine.slug !== slug),
      );
      if (editingMagazine?.slug === slug) setEditingMagazine(null);
      setPendingDelete(null);
      setDeleteAcknowledged(false);
      setMessage(`${slug} deleted.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete magazine.');
    } finally {
      setDeleting(false);
    }
  };

  const updateRemoteMagazine = async (
    slug: string,
    request: { status: 'published' | 'unpublished' },
  ) => {
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      await updateMagazineStatus(slug, request);
      setMessage(`${slug} updated.`);
      await loadMagazines();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update magazine.');
    } finally {
      setBusy(false);
    }
  };

  const uploadAll = async () => {
    const firstInvalid = drafts.find(validateDraft);
    if (firstInvalid) {
      setError(`${firstInvalid.file.name}: ${validateDraft(firstInvalid)}`);
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);

    let uploaded = 0;
    for (const draft of drafts) {
      setDrafts((current) =>
        current.map((item) =>
          item.id === draft.id ? { ...item, status: 'uploading' } : item,
        ),
      );

      try {
        await uploadMagazineZip(
          {
            slug: draft.slug.trim(),
            name: draft.name.trim(),
            period: draft.period.trim(),
            volume: draft.volume.trim(),
            replace: true,
          },
          draft.file,
        );
        uploaded += 1;
        setDrafts((current) =>
          current.map((item) =>
            item.id === draft.id
              ? { ...item, status: 'uploaded', error: undefined }
              : item,
          ),
        );
      } catch (err) {
        setDrafts((current) =>
          current.map((item) =>
            item.id === draft.id
              ? {
                  ...item,
                  status: 'error',
                  error:
                    err instanceof Error ? err.message : 'Upload failed.',
                }
              : item,
          ),
        );
      }
    }

    setMessage(
      `${uploaded} magazine${uploaded === 1 ? '' : 's'} sent for processing.`,
    );
    setBusy(false);
    void loadMagazines();
  };

  return (
    <DashboardModule
      title="Magazine uploads"
      description="Upload one or more magazine zip files. Each successful upload replaces the existing remote issue for that slug."
      aside={
        <Button
          type="button"
          variant="outline"
          onClick={() => void loadMagazines()}
          disabled={busy || loading}
        >
          <RefreshCw />
          Refresh
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <Dialog
          open={Boolean(pendingDelete)}
          onOpenChange={(open) => {
            if (!open) closeDeleteDialog();
          }}
        >
          {pendingDelete && (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete magazine?</DialogTitle>
                <DialogDescription>
                  This will permanently delete {pendingDelete.name} and its S3
                  files.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 rounded-md border border-neutral-200 bg-white p-3 sm:grid-cols-[72px_1fr]">
                {pendingDelete.thumbnail_url ? (
                  <img
                    src={pendingDelete.thumbnail_url}
                    alt=""
                    className="h-24 w-full rounded-sm object-cover sm:h-28"
                  />
                ) : (
                  <div className="flex h-24 w-full items-center justify-center rounded-sm bg-neutral-100 text-[10px] font-semibold uppercase text-neutral-500 sm:h-28">
                    No cover
                  </div>
                )}
                <dl className="grid content-start gap-2 text-sm">
                  {[
                    ['Title', pendingDelete.name],
                    ['Slug', pendingDelete.slug],
                    ['Period', pendingDelete.period],
                    ['Volume', pendingDelete.volume],
                    ['Status', pendingDelete.status],
                    ['Uploaded', formatTimestamp(pendingDelete.ts)],
                  ].map(([label, value]) => (
                    <div key={label} className="grid gap-0.5">
                      <dt className="text-xs font-semibold uppercase text-neutral-500">
                        {label}
                      </dt>
                      <dd className="break-words text-neutral-800">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <label className="flex gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm leading-6 text-neutral-700">
                <input
                  type="checkbox"
                  checked={deleteAcknowledged}
                  onChange={(event) =>
                    setDeleteAcknowledged(event.target.checked)
                  }
                  disabled={deleting}
                  className="mt-1 h-4 w-4 rounded border-neutral-300"
                />
                <span>
                  I understand this permanently deletes the magazine record and
                  all files under its S3 folder.
                </span>
              </label>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDeleteDialog}
                  disabled={deleting}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => void confirmDeleteMagazine()}
                  disabled={!deleteAcknowledged || deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>

        {error && <ModuleState tone="error">{error}</ModuleState>}
        {message && <ModuleState tone="success">{message}</ModuleState>}

        <div
          className={`rounded-md border border-dashed p-6 transition ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-neutral-300 bg-neutral-50'
          }`}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <UploadCloud className="mt-1 text-primary" />
              <div>
                <p className="font-semibold text-neutral-950">
                  Drop magazine zip files here
                </p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  The file name becomes the slug. For example, Happiness.zip
                  uploads to the remote Happiness issue.
                </p>
              </div>
            </div>
            <label className="inline-flex">
              <Input
                type="file"
                accept="application/zip,.zip"
                multiple
                className="max-w-sm"
                onChange={onFileChange}
                disabled={busy}
              />
            </label>
          </div>
        </div>

        {drafts.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-neutral-700">
                {drafts.length} queued. {invalidCount} need attention.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => void uploadAll()}
                  disabled={busy || drafts.length === 0 || invalidCount > 0}
                >
                  Upload queued zips
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDrafts([])}
                  disabled={busy}
                >
                  Clear queue
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-md border border-black/10">
              <table className="min-w-[920px] w-full border-collapse text-sm">
                <thead className="bg-neutral-50 text-left text-neutral-600">
                  <tr>
                    <th className="px-3 py-2 font-semibold">File</th>
                    <th className="px-3 py-2 font-semibold">Slug</th>
                    <th className="px-3 py-2 font-semibold">Title</th>
                    <th className="px-3 py-2 font-semibold">Period</th>
                    <th className="px-3 py-2 font-semibold">Volume</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="w-10 px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {drafts.map((draft) => {
                    const validationError = validateDraft(draft);
                    return (
                      <tr key={draft.id} className="border-t border-black/10">
                        <td className="max-w-[180px] px-3 py-2 align-top">
                          <span className="block truncate font-medium text-neutral-950">
                            {draft.file.name}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {Math.ceil(draft.file.size / 1024 / 1024)} MB
                          </span>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <Input
                            value={draft.slug}
                            onChange={(event) =>
                              updateDraft(draft.id, 'slug', event.target.value)
                            }
                            disabled={busy}
                          />
                        </td>
                        <td className="px-3 py-2 align-top">
                          <Input
                            value={draft.name}
                            onChange={(event) =>
                              updateDraft(draft.id, 'name', event.target.value)
                            }
                            disabled={busy}
                          />
                        </td>
                        <td className="px-3 py-2 align-top">
                          <Input
                            value={draft.period}
                            onChange={(event) =>
                              updateDraft(
                                draft.id,
                                'period',
                                event.target.value,
                              )
                            }
                            disabled={busy}
                          />
                        </td>
                        <td className="px-3 py-2 align-top">
                          <Input
                            value={draft.volume}
                            onChange={(event) =>
                              updateDraft(
                                draft.id,
                                'volume',
                                event.target.value,
                              )
                            }
                            disabled={busy}
                          />
                        </td>
                        <td className="px-3 py-2 align-top">
                          <span className="font-semibold capitalize">
                            {draft.status}
                          </span>
                          {(validationError || draft.error) && (
                            <span className="mt-1 block text-xs text-red-700">
                              {draft.error ?? validationError}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 align-top">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDraft(draft.id)}
                            disabled={busy}
                            aria-label={`Remove ${draft.file.name}`}
                          >
                            <X />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <section className="border-t border-black/10 pt-4">
          <h3 className="font-montserrat text-lg font-bold text-neutral-950">
            Remote magazines
          </h3>
          {loading ? (
            <ModuleState>Loading magazines...</ModuleState>
          ) : magazines.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-600">
              No remote magazines loaded yet.
            </p>
          ) : (
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {magazines.map((magazine) => {
                const editDraft =
                  editingMagazine?.slug === magazine.slug
                    ? editingMagazine
                    : null;

                return (
                  <div
                    key={magazine.slug}
                    className="flex gap-3 rounded-md border border-black/10 p-3"
                  >
                    {magazine.thumbnail_url ? (
                      <img
                        src={magazine.thumbnail_url}
                        alt=""
                        className="h-20 w-14 flex-none rounded-sm object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-14 flex-none items-center justify-center rounded-sm bg-neutral-100 text-[10px] font-semibold uppercase text-neutral-500">
                        No cover
                      </div>
                    )}
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          {editDraft ? (
                            <Input
                              value={editDraft.name}
                              onChange={(event) =>
                                updateEditingMagazine('name', event.target.value)
                              }
                              disabled={busy}
                              aria-label={`Title for ${magazine.slug}`}
                            />
                          ) : (
                            <span className="min-w-0 truncate font-semibold text-neutral-950">
                              {magazine.name}
                            </span>
                          )}
                          <span
                            className={`flex-none rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${magazineStatusClass(magazine)}`}
                          >
                            {magazine.status}
                          </span>
                        </div>
                        {editDraft ? (
                          <div className="mt-2 flex flex-col gap-2">
                            <Input
                              value={editDraft.period}
                              onChange={(event) =>
                                updateEditingMagazine('period', event.target.value)
                              }
                              disabled={busy}
                              aria-label={`Period for ${magazine.slug}`}
                            />
                            <Input
                              value={editDraft.volume}
                              onChange={(event) =>
                                updateEditingMagazine('volume', event.target.value)
                              }
                              disabled={busy}
                              aria-label={`Volume for ${magazine.slug}`}
                            />
                          </div>
                        ) : (
                          <>
                            <span className="block truncate text-xs text-neutral-600">
                              {magazine.period}
                            </span>
                            <span className="block truncate text-xs text-neutral-600">
                              {magazine.volume}
                            </span>
                          </>
                        )}
                        <span className="block truncate text-xs text-neutral-500">
                          Slug: {magazine.slug}
                        </span>
                        <span className="block truncate text-xs text-neutral-500">
                          Uploaded: {formatTimestamp(magazine.ts)}
                        </span>
                        <span className="block truncate text-xs text-neutral-500">
                          URL: {magazine.link_url}
                        </span>
                        {magazine.thumbnail_url && (
                          <span className="block truncate text-xs text-neutral-500">
                            Cover: {magazine.thumbnail_url}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={magazine.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye />
                            View
                          </a>
                        </Button>
                        {editDraft ? (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => void saveEditingMagazine()}
                              disabled={busy}
                            >
                              <Save />
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingMagazine(null)}
                              disabled={busy}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => startEditingMagazine(magazine)}
                            disabled={busy}
                          >
                            <Pencil />
                            Edit
                          </Button>
                        )}
                        {magazine.status === 'published' ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              void updateRemoteMagazine(magazine.slug, {
                                status: 'unpublished',
                              })
                            }
                            disabled={busy}
                          >
                            Unpublish
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              void updateRemoteMagazine(magazine.slug, {
                                status: 'published',
                              })
                            }
                            disabled={busy || magazine.status === 'processing'}
                          >
                            Publish
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setPendingDelete(magazine);
                            setDeleteAcknowledged(false);
                            setError(null);
                            setMessage(null);
                          }}
                          disabled={busy || deleting}
                        >
                          <Trash2 />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardModule>
  );
}
