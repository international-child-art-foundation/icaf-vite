import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ArtworkListItem,
  ArtworkStatus,
  ReviewArtworkQueueResponse,
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
import { GallerySlideshowEntry } from '@/modules/content/components/gallery/GallerySlideshowEntry';
import { resolveApiArtwork } from '@/utils/galleryProcessing';
import { mapWithConcurrency } from '@/shared/utils/concurrency';
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
  'legal_guardian',
  'adult_facilitator',
];

const LOAD_ALL_PAGE_DELAY_MS = 1_500;

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function artworkMatchesSearch(
  artwork: ArtworkListItem,
  normalizedSearch: string,
): boolean {
  if (!normalizedSearch) return true;

  const searchableText = [
    artwork.f_name && artwork.age != null
      ? `${artwork.f_name}, ${artwork.age}`
      : undefined,
    artwork.f_name,
    artwork.l_name,
    artwork.age,
    artwork.title,
    artwork.description,
    artwork.country,
    artwork.region,
    artwork.theme,
    artwork.art_id,
  ]
    .filter((value) => value !== undefined && value !== null)
    .join(' ');

  return normalizeSearchText(searchableText).includes(normalizedSearch);
}

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
  const [lastKey, setLastKey] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArtworkId, setActiveArtworkId] = useState('');
  const [exhibitionArtworkId, setExhibitionArtworkId] = useState('');
  const requestRunRef = useRef(0);
  const isHorizontal = useMediaQuery('(orientation: landscape)', true);

  const selectedIds = useMemo(() => [...selected], [selected]);
  const normalizedSearch = useMemo(
    () => normalizeSearchText(searchQuery),
    [searchQuery],
  );
  const visibleArtworks = useMemo(
    () =>
      artworks.filter((artwork) =>
        artworkMatchesSearch(artwork, normalizedSearch),
      ),
    [artworks, normalizedSearch],
  );
  const resolvedArtworks = useMemo(
    () => visibleArtworks.map((artwork) => resolveApiArtwork(artwork)),
    [visibleArtworks],
  );
  const editingArtwork = useMemo(
    () => artworks.find((artwork) => artwork.art_id === editingId) ?? null,
    [artworks, editingId],
  );

  const requestPage = useCallback(
    (cursor?: string): Promise<ReviewArtworkQueueResponse> => {
      const query = {
        limit: 48,
        ...(cursor ? { last_key: cursor } : {}),
      };

      return mode === 'approved'
        ? listGalleryArtworks(
            { ...query, sort: 'newest' },
            { bypassCache: true },
          )
        : mode === 'pending'
          ? fetchPendingArtworks(query)
          : mode === 'hidden'
            ? fetchHiddenArtworks(query)
            : fetchRejectedArtworks(query);
    },
    [mode],
  );

  const loadQueue = useCallback(
    (cursor?: string) => {
      const runId = ++requestRunRef.current;
      const append = Boolean(cursor);
      if (append) setLoadingMore(true);
      else setLoading(true);
      setLoadingAll(false);
      setError(null);

      requestPage(cursor)
        .then((response) => {
          if (requestRunRef.current !== runId) return;
          setArtworks((current) =>
            append ? [...current, ...response.artworks] : response.artworks,
          );
          setHasMore(Boolean(response.has_more && response.last_key));
          setLastKey(response.last_key);
          if (!append) {
            setSelected(new Set());
            setEditingId((current) =>
              current && response.artworks.some((art) => art.art_id === current)
                ? current
                : null,
            );
          }
        })
        .catch((err: unknown) => {
          if (requestRunRef.current !== runId) return;
          if (!append) {
            setArtworks([]);
            setHasMore(false);
            setLastKey(undefined);
          }
          setError(
            err instanceof Error ? err.message : 'Failed to load artworks',
          );
        })
        .finally(() => {
          if (requestRunRef.current !== runId) return;
          setLoading(false);
          setLoadingMore(false);
        });
    },
    [requestPage],
  );

  const loadAllArtworks = async () => {
    if (!lastKey || !hasMore || loadingAll) return;

    const runId = ++requestRunRef.current;
    let cursor: string | undefined = lastKey;
    let loadedCount = artworks.length;

    setLoadingAll(true);
    setLoadingMore(false);
    setError(null);
    setMessage(null);

    try {
      while (cursor) {
        const response = await requestPage(cursor);
        if (requestRunRef.current !== runId) return;

        loadedCount += response.artworks.length;
        setArtworks((current) => [...current, ...response.artworks]);

        cursor =
          response.has_more && response.last_key
            ? response.last_key
            : undefined;
        setHasMore(Boolean(cursor));
        setLastKey(cursor);

        if (cursor) {
          await wait(LOAD_ALL_PAGE_DELAY_MS);
          if (requestRunRef.current !== runId) return;
        }
      }

      const loadedStatus = modeToStatus(mode).replace(/_/g, ' ');
      setMessage(
        `All ${loadedCount} ${loadedStatus} artwork${loadedCount === 1 ? '' : 's'} loaded.`,
      );
    } catch (err) {
      if (requestRunRef.current !== runId) return;
      setError(
        err instanceof Error
          ? `Stopped after loading ${loadedCount} artworks: ${err.message}`
          : `Stopped after loading ${loadedCount} artworks.`,
      );
    } finally {
      if (requestRunRef.current === runId) setLoadingAll(false);
    }
  };

  useEffect(() => {
    loadQueue();
    return () => {
      requestRunRef.current += 1;
    };
  }, [loadQueue]);

  useEffect(() => {
    setEdits(editingArtwork ? toEdits(editingArtwork) : null);
  }, [editingArtwork]);

  const mutateStatus = async (ids: string[], status: ReviewStatus) => {
    if (ids.length === 0) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await mapWithConcurrency(ids, 3, (id) =>
        changeArtworkStatus(id, {
          status,
          rev_num:
            artworks.find((artwork) => artwork.art_id === id)?.rev_num ?? 1,
        }),
      );
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
          ? 'A tool for finding and updating artworks.'
          : 'Approval is the normal path. Rejection and hiding are moderation decisions.'
      }
      aside={
        <div className="flex flex-col gap-2 md:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={mode}
              onChange={(event) => {
                setMode(event.target.value as QueueMode);
                setEditingId(null);
                setSearchQuery('');
                setMessage(null);
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
              disabled={loading || loadingAll || busy}
              onClick={() => loadQueue()}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm font-semibold disabled:opacity-40"
            >
              Update
            </button>
          </div>
          {admin && (
            <div className="w-full">
              <button
                type="button"
                disabled={loading || loadingAll || busy || !hasMore}
                onClick={() => void loadAllArtworks()}
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm font-semibold disabled:opacity-40"
              >
                {loading
                  ? 'Loading artworks…'
                  : loadingAll
                    ? `Loading all… ${artworks.length} loaded`
                    : hasMore
                      ? 'Load all artworks'
                      : artworks.length > 0
                        ? 'All artworks loaded'
                        : 'No artworks to load'}
              </button>
              {(hasMore || loadingAll) && (
                <p className="mt-1 text-center text-xs text-neutral-500 md:text-right">
                  48 artworks per page, with a 1.5-second pause between pages.
                </p>
              )}
            </div>
          )}
        </div>
      }
    >
      {exhibitionArtworkId && (
        <GallerySlideshowEntry
          context={{
            artworks: resolvedArtworks,
            initialArtworkId: exhibitionArtworkId,
          }}
          onClose={() => setExhibitionArtworkId('')}
        />
      )}
      <ArtworkModal
        id={activeArtworkId}
        artworks={resolvedArtworks}
        artworksLoading={loading}
        navigationList={resolvedArtworks}
        onNavigate={setActiveArtworkId}
        closeModal={() => setActiveArtworkId('')}
        isHorizontal={isHorizontal}
        modalState={Boolean(activeArtworkId)}
        getShareUrl={() => window.location.href}
        onEnterExhibition={(id) => {
          setExhibitionArtworkId(id);
          setActiveArtworkId('');
        }}
      />
      {admin && (
        <div className="mb-4">
          <label
            htmlFor="artwork-admin-search"
            className="text-sm font-semibold text-neutral-800"
          >
            Search loaded artwork
          </label>
          <input
            id="artwork-admin-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Artist name, title, description, age, or location"
            className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
          />
          <p className="mt-1 text-xs text-neutral-500" aria-live="polite">
            Showing {visibleArtworks.length} of {artworks.length} loaded{' '}
            {statusLabel} artwork{artworks.length === 1 ? '' : 's'}.
            {hasMore && ' Load all artworks to search the complete status.'}
          </p>
        </div>
      )}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || loadingAll || selectedIds.length === 0}
          onClick={() => void mutateStatus(selectedIds, 'approved')}
          className="rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Approve selected
        </button>
        <button
          type="button"
          disabled={busy || loadingAll || selectedIds.length === 0}
          onClick={() => void mutateStatus(selectedIds, 'hidden')}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Hide selected
        </button>
        <button
          type="button"
          disabled={busy || loadingAll || selectedIds.length === 0}
          onClick={() => void mutateStatus(selectedIds, 'rejected')}
          className="rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-40"
        >
          Reject selected
        </button>
      </div>

      {message && <ModuleState tone="success">{message}</ModuleState>}
      {error && <ModuleState tone="error">{error}</ModuleState>}
      {loading ? (
        <ModuleState>Loading artwork...</ModuleState>
      ) : artworks.length === 0 ? (
        <ModuleState>No {statusLabel} artwork found.</ModuleState>
      ) : visibleArtworks.length === 0 ? (
        <ModuleState>
          No loaded artwork matches “{searchQuery.trim()}”.
        </ModuleState>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {visibleArtworks.map((artwork, index) => {
              const resolvedArtwork = resolvedArtworks[index];
              const isEditing = editingId === artwork.art_id;

              return (
                <div
                  key={artwork.art_id}
                  className={
                    isEditing
                      ? 'ring-primary rounded-lg ring-2 ring-offset-2'
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
                            className="bg-primary w-full rounded-md px-3 py-2 text-sm font-semibold text-white"
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
                            disabled={busy || loadingAll}
                            onClick={() =>
                              void mutateStatus([artwork.art_id], 'approved')
                            }
                            className="rounded bg-green-700 px-2 py-2 text-xs font-semibold text-white disabled:opacity-40"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={busy || loadingAll}
                            onClick={() =>
                              void mutateStatus([artwork.art_id], 'hidden')
                            }
                            className="rounded border px-2 py-2 text-xs font-semibold disabled:opacity-40"
                          >
                            Hide
                          </button>
                          <button
                            type="button"
                            disabled={busy || loadingAll}
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
                      {editingArtwork.status} · {formatDate(editingArtwork.ts)}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <EditInput
                      label="Title"
                      value={edits.title}
                      onChange={(title) => setEdits({ ...edits, title })}
                    />
                    <EditInput
                      label="Artist first name"
                      value={edits.f_name}
                      onChange={(f_name) => setEdits({ ...edits, f_name })}
                    />
                    <EditInput
                      label="Age"
                      inputMode="numeric"
                      value={edits.age}
                      onChange={(age) => setEdits({ ...edits, age })}
                    />
                    <EditInput
                      label="Country"
                      value={edits.country}
                      onChange={(country) => setEdits({ ...edits, country })}
                    />
                    <EditInput
                      label="Region"
                      value={edits.region}
                      onChange={(region) => setEdits({ ...edits, region })}
                    />
                    <EditInput
                      label="Theme SK"
                      value={edits.theme}
                      onChange={(theme) => setEdits({ ...edits, theme })}
                    />
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
                    disabled={busy || loadingAll}
                    onClick={() => void saveArtworkEdits()}
                    className="bg-primary mt-4 w-full rounded-md px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    {busy ? 'Saving...' : 'Save artwork details'}
                  </button>
                </div>
              )}
            </aside>
          )}
        </div>
      )}
      {hasMore && !loading && !loadingAll && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            disabled={busy || loadingMore}
            onClick={() => loadQueue(lastKey)}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            {loadingMore
              ? 'Loading more...'
              : `Load more ${statusLabel} artwork`}
          </button>
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
