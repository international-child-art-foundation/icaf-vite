import type { ChangeEvent, DragEvent } from 'react';
import { useMemo, useState } from 'react';
import type { MagazineListItem } from '@icaf/shared';
import { RefreshCw, UploadCloud, X } from 'lucide-react';
import { uploadMagazineZip } from '@/api/admin';
import { listMagazines } from '@/api/public';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { DashboardModule, ModuleState } from './DashboardModule';
import { childArtMagazineHints } from '@/modules/content/data/childArtMagazineHints';

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

const slugPattern = /^[A-Za-z0-9&+\-_.]+$/;

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
  const hint = childArtMagazineHints.find((item) => item.slug === slug);

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

export function MagazineAdminPanel() {
  const [drafts, setDrafts] = useState<MagazineUploadDraft[]>([]);
  const [magazines, setMagazines] = useState<MagazineListItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const invalidCount = useMemo(
    () => drafts.filter((draft) => validateDraft(draft)).length,
    [drafts],
  );

  const loadMagazines = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listMagazines({ bypassCache: true });
      setMagazines(response.magazines);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load magazines.');
    } finally {
      setLoading(false);
    }
  };

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
                  onClick={uploadAll}
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
            Published magazines
          </h3>
          {loading ? (
            <ModuleState>Loading magazines...</ModuleState>
          ) : magazines.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-600">
              No published magazines loaded yet.
            </p>
          ) : (
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {magazines.slice(0, 12).map((magazine) => (
                <a
                  key={magazine.slug}
                  href={magazine.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 rounded-md border border-black/10 p-3 transition hover:bg-neutral-50"
                >
                  <img
                    src={magazine.thumbnail_url}
                    alt=""
                    className="h-16 w-12 flex-none rounded-sm object-cover"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-neutral-950">
                      {magazine.name}
                    </span>
                    <span className="block truncate text-xs text-neutral-600">
                      {magazine.period}
                    </span>
                    <span className="block truncate text-xs text-neutral-500">
                      {magazine.slug}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardModule>
  );
}
