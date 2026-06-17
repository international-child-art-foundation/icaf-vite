import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ArtworkListItem,
  ArtworkStatus,
  SubmitterRelationship,
} from '@icaf/shared';
import { adminUpdateArtwork } from '@/api/admin';
import {
  changeArtworkStatus,
  fetchHiddenArtworks,
  fetchPendingArtworks,
  fetchRejectedArtworks,
} from '@/api/contributor';
import { listGalleryArtworks } from '@/api/public';
import ArtworkCard from '@/modules/content/components/gallery/ArtworkCard';
import ArtworkModal from '@/modules/content/components/gallery/ArtworkModal';
import { resolveApiArtwork } from '@/utils/galleryProcessing';
import { artworkLabel, formatDate } from '../utils/dashboardFormat';
import { DashboardModule, ModuleState } from './DashboardModule';

type QueueMode = 'approved' | 'pending' | 'hidden' | 'rejected';
type ReviewStatus = Extract<ArtworkStatus, 'approved' | 'hidden' | 'rejected'>;

type ArtworkEdits = {
  age: string;
  country: string;
  description: string;
  f_name: string;
  notifications: boolean;
  region: string;
  submitter_relationship: SubmitterRelationship | '';
  theme: string;
  title: string;
};

const RELATIONSHIPS: SubmitterRelationship[] = [
  'parent',
  'guardian',
  'teacher',
];

function modeToStatus(mode: QueueMode): ArtworkStatus {
  return mode === 'pending' ? 'pending_review' : mode;
}

function toEdits(artwork: ArtworkListItem): ArtworkEdits {
  return {
    age: artwork.age == null ? '' : String(artwork.age),
    country: artwork.country ?? '',
    description: artwork.description ?? '',
    f_name: artwork.f_name ?? '',
    notifications: artwork.notifications ?? false,
    region: artwork.region ?? '',
    submitter_relationship: artwork.submitter_relationship ?? '',
    theme: artwork.theme ?? '',
    title: artwork.title ?? '',
  };
}

function textOrClear(value: string, original: string | undefined) {
  const trimmed = value.trim();
  if (trimmed) return trimmed;
  return original ? '' : undefined;
}

function useMediaQuery(query: string, fallback = false) {
  const getMatches = useCallback(() => {
    if (typeof window === 'undefined') return fallback;
    return window.matchMedia(query).matches;
  }, [fallback, query]);

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const updateMatches = () => setMatches(mediaQueryList.matches);

    updateMatches();
    mediaQueryList.addEventListener('change', updateMatches);
    return () => {
      mediaQueryList.removeEventListener('change', updateMatches);
    };
  }, [query]);

  return matches;
}

export function ReviewArtworkQueue({
  admin = false,
  defaultMode,
}: {
  admin?: boolean;
  defaultMode?: QueueMode;
}) {
  const [mode, setMode] = useState<QueueMode>(
    defaultMode ?? (admin ? 'approved' : 'pending'),
  );
  const [artworks, setArtworks] = useState<ArtworkListItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edits, setEdits] = useState<ArtworkEdits | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [activeArtworkId, setActiveArtworkId] = useState('');
  const isHorizontal = useMediaQuery('(orientation: landscape)', true);

  const selectedIds = useMemo(() => [...selected], [selected]);
  const resolvedArtworks = useMemo(
    () => artworks.map((artwork) => resolveApiArtwork(artwork)),
    [artworks],
  );
  const editingArtwork = useMemo(
    () => artworks.find((artwork) => artwork.art_id === editingId) ?? null,
    [artworks, editingId],
  );

  const loadQueue = useCallback(() => {
    setLoading(true);
    setError(null);

    const request =
      mode === 'approved'
        ? listGalleryArtworks(
            { limit: 48, sort: 'newest' },
            { bypassCache: true },
          )
        : mode === 'pending'
          ? fetchPendingArtworks({ limit: 48 })
          : mode === 'hidden'
            ? fetchHiddenArtworks({ limit: 48 })
            : fetchRejectedArtworks({ limit: 48 });

    request
      .then((response) => {
        setArtworks(response.artworks);
        setHasMore(response.has_more);
        setSelected(new Set());
        setEditingId((current) =>
          current && response.artworks.some((art) => art.art_id === current)
            ? current
            : null,
        );
      })
      .catch((err: unknown) => {
        setArtworks([]);
        setHasMore(false);
        setError(
          err instanceof Error ? err.message : 'Failed to load artworks',
        );
      })
      .finally(() => setLoading(false));
  }, [mode]);

  useEffect(loadQueue, [loadQueue]);

  useEffect(() => {
    setEdits(editingArtwork ? toEdits(editingArtwork) : null);
  }, [editingArtwork]);

  const mutateStatus = async (ids: string[], status: ReviewStatus) => {
    if (ids.length === 0) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await Promise.all(ids.map((id) => changeArtworkStatus(id, { status })));
      setMessage(
        `${ids.length} artwork${ids.length === 1 ? '' : 's'} updated.`,
      );
      loadQueue();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update artwork status',
      );
    } finally {
      setBusy(false);
    }
  };

  const saveArtworkEdits = async () => {
    if (!admin || !editingArtwork || !edits) return;

    const payload: Record<string, unknown> = {};
    const textFields = [
      'title',
      'description',
      'f_name',
      'country',
      'region',
      'theme',
    ] as const;

    textFields.forEach((field) => {
      const value = textOrClear(edits[field], editingArtwork[field]);
      if (value !== undefined && value !== (editingArtwork[field] ?? '')) {
        payload[field] = value;
      }
    });

    const ageText = edits.age.trim();
    if (ageText) {
      const parsedAge = Number(ageText);
      if (!Number.isInteger(parsedAge)) {
        setError('Age must be a whole number.');
        return;
      }
      if (parsedAge !== editingArtwork.age) payload.age = parsedAge;
    } else if (editingArtwork.age !== undefined) {
      payload.age = null;
    }

    if (
      edits.submitter_relationship !==
      (editingArtwork.submitter_relationship ?? '')
    ) {
      payload.submitter_relationship = edits.submitter_relationship || '';
    }

    if (
      !editingArtwork.group_id &&
      edits.notifications !== (editingArtwork.notifications ?? false)
    ) {
      payload.notifications = edits.notifications;
    }

    if (Object.keys(payload).length === 0) {
      setMessage('No artwork changes to save.');
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await adminUpdateArtwork(editingArtwork.art_id, payload);
      setMessage('Artwork details updated.');
      loadQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update artwork');
    } finally {
      setBusy(false);
    }
  };

  const title = admin ? 'Artwork admin' : 'Artwork review';
  const statusLabel = modeToStatus(mode).replace(/_/g, ' ');

  return (
    <DashboardModule
      title={title}
      description={
        admin
          ? 'Switch between status views. Approved artwork is the default and uses the public gallery index; hidden, pending, and rejected use review indexes.'
          : 'Approval is the normal path. Rejection and hiding are moderation decisions.'
      }
      aside={
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={mode}
            onChange={(event) => {
              setMode(event.target.value as QueueMode);
              setEditingId(null);
            }}
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm"
          >
            {admin && <option value="approved">Approved</option>}
            <option value="pending">Pending review</option>
            <option value="hidden">Hidden</option>
            {admin && <option value="rejected">Rejected</option>}
          </select>
          <button
            type="button"
            disabled={loading || busy}
            onClick={() => loadQueue()}
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm font-semibold disabled:opacity-40"
          >
            Update
          </button>
        </div>
      }
    >
      <ArtworkModal
        id={activeArtworkId}
        artworks={resolvedArtworks}
        navigationList={resolvedArtworks}
        onNavigate={setActiveArtworkId}
        closeModal={() => setActiveArtworkId('')}
        isHorizontal={isHorizontal}
        modalState={Boolean(activeArtworkId)}
        getShareUrl={() => window.location.href}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || selectedIds.length === 0}
          onClick={() => void mutateStatus(selectedIds, 'approved')}
          className="rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Approve selected
        </button>
        <button
          type="button"
          disabled={busy || selectedIds.length === 0}
          onClick={() => void mutateStatus(selectedIds, 'hidden')}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Hide selected
        </button>
        <button
          type="button"
          disabled={busy || selectedIds.length === 0}
          onClick={() => void mutateStatus(selectedIds, 'rejected')}
          className="rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-40"
        >
          Reject selected
        </button>
      </div>

      {message && <ModuleState tone="success">{message}</ModuleState>}
      {error && <ModuleState tone="error">{error}</ModuleState>}
      {hasMore && (
        <ModuleState>
          Showing the newest {statusLabel} artwork. Pagination can be added if
          older artwork needs to be managed here.
        </ModuleState>
      )}
      {loading ? (
        <ModuleState>Loading artwork...</ModuleState>
      ) : artworks.length === 0 ? (
        <ModuleState>No {statusLabel} artwork found.</ModuleState>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {artworks.map((artwork) => {
              const resolvedArtwork =
                resolvedArtworks.find(
                  (resolved) => resolved.art_id === artwork.art_id,
                ) ?? resolveApiArtwork(artwork);
              const isEditing = editingId === artwork.art_id;

              return (
                <div
                  key={artwork.art_id}
                  className={
                    isEditing
                      ? 'rounded-lg ring-2 ring-primary ring-offset-2'
                      : 'rounded-lg'
                  }
                >
                  <ArtworkCard
                    artwork={resolvedArtwork}
                    openModal={setActiveArtworkId}
                    actionSlot={
                      <div className="space-y-3 text-sm">
                        <label className="flex items-center gap-2 font-semibold">
                          <input
                            type="checkbox"
                            checked={selected.has(artwork.art_id)}
                            onChange={(event) =>
                              setSelected((current) => {
                                const next = new Set(current);
                                if (event.target.checked) {
                                  next.add(artwork.art_id);
                                } else {
                                  next.delete(artwork.art_id);
                                }
                                return next;
                              })
                            }
                          />
                          Select
                        </label>
                        {admin && (
                          <button
                            type="button"
                            onClick={() => setEditingId(artwork.art_id)}
                            className="w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white"
                          >
                            {isEditing ? 'Editing' : 'Edit details'}
                          </button>
                        )}
                        <p className="text-xs text-neutral-500">
                          {artworkLabel(artwork)} · {artwork.status} ·{' '}
                          {formatDate(artwork.ts)}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void mutateStatus([artwork.art_id], 'approved')
                            }
                            className="rounded bg-green-700 px-2 py-2 text-xs font-semibold text-white disabled:opacity-40"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void mutateStatus([artwork.art_id], 'hidden')
                            }
                            className="rounded border px-2 py-2 text-xs font-semibold disabled:opacity-40"
                          >
                            Hide
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void mutateStatus([artwork.art_id], 'rejected')
                            }
                            className="rounded border border-red-300 px-2 py-2 text-xs font-semibold text-red-700 disabled:opacity-40"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    }
                  />
                </div>
              );
            })}
          </div>

          {admin && (
            <aside className="xl:sticky xl:top-28 xl:self-start">
              {!editingArtwork || !edits ? (
                <ModuleState>Select an artwork to edit details.</ModuleState>
              ) : (
                <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Selected artwork
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-neutral-950">
                      {editingArtwork.art_id}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {editingArtwork.status} ·{' '}
                      {formatDate(editingArtwork.ts)}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <EditInput label="Title" value={edits.title} onChange={(title) => setEdits({ ...edits, title })} />
                    <EditInput label="Artist first name" value={edits.f_name} onChange={(f_name) => setEdits({ ...edits, f_name })} />
                    <EditInput label="Age" inputMode="numeric" value={edits.age} onChange={(age) => setEdits({ ...edits, age })} />
                    <EditInput label="Country" value={edits.country} onChange={(country) => setEdits({ ...edits, country })} />
                    <EditInput label="Region" value={edits.region} onChange={(region) => setEdits({ ...edits, region })} />
                    <EditInput label="Theme SK" value={edits.theme} onChange={(theme) => setEdits({ ...edits, theme })} />
                    <label className="text-xs font-semibold uppercase text-neutral-600">
                      Relationship
                      <select
                        value={edits.submitter_relationship}
                        onChange={(event) =>
                          setEdits({
                            ...edits,
                            submitter_relationship: event.target.value as
                              | SubmitterRelationship
                              | '',
                          })
                        }
                        className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm font-normal normal-case"
                      >
                        <option value="">None</option>
                        {RELATIONSHIPS.map((relationship) => (
                          <option key={relationship} value={relationship}>
                            {relationship}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs font-semibold uppercase text-neutral-600">
                      Description
                      <textarea
                        value={edits.description}
                        onChange={(event) =>
                          setEdits({
                            ...edits,
                            description: event.target.value,
                          })
                        }
                        className="mt-1 min-h-24 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-normal normal-case"
                      />
                    </label>
                    {!editingArtwork.group_id && (
                      <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                        <input
                          type="checkbox"
                          checked={edits.notifications}
                          onChange={(event) =>
                            setEdits({
                              ...edits,
                              notifications: event.target.checked,
                            })
                          }
                          className="accent-primary"
                        />
                        Send artwork notifications
                      </label>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void saveArtworkEdits()}
                    className="mt-4 w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    {busy ? 'Saving...' : 'Save artwork details'}
                  </button>
                </div>
              )}
            </aside>
          )}
        </div>
      )}
    </DashboardModule>
  );
}

function EditInput({
  inputMode,
  label,
  value,
  onChange,
}: {
  inputMode?: 'numeric';
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-xs font-semibold uppercase text-neutral-600">
      {label}
      <input
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm font-normal normal-case"
      />
    </label>
  );
}
