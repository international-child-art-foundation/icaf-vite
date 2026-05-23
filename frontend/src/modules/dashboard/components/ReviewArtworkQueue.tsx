import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ArtworkListItem,
  ArtworkStatus,
  UpdateArtworkRequest,
} from '@icaf/shared';
import { adminUpdateArtwork } from '@/api/admin';
import {
  changeArtworkStatus,
  fetchHiddenArtworks,
  fetchPendingArtworks,
} from '@/api/contributor';
import ArtworkCard from '@/modules/content/components/gallery/ArtworkCard';
import { resolveApiArtwork } from '@/utils/galleryProcessing';
import { artworkLabel, formatDate } from '../utils/dashboardFormat';
import { DashboardModule, ModuleState } from './DashboardModule';

type QueueMode = 'pending' | 'hidden';
type ReviewStatus = Extract<ArtworkStatus, 'approved' | 'hidden' | 'rejected'>;

const editableFields: (keyof UpdateArtworkRequest)[] = [
  'theme_family',
  'theme_instance',
  'country',
  'region',
];

export function ReviewArtworkQueue({ admin = false }: { admin?: boolean }) {
  const [mode, setMode] = useState<QueueMode>('pending');
  const [artworks, setArtworks] = useState<ArtworkListItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [edits, setEdits] = useState<UpdateArtworkRequest>({});

  const selectedIds = useMemo(() => [...selected], [selected]);

  const loadQueue = useCallback(() => {
    setLoading(true);
    setError(null);
    const request =
      mode === 'pending' ? fetchPendingArtworks : fetchHiddenArtworks;
    request({ limit: 24 })
      .then((response) => {
        setArtworks(response.artworks);
        setSelected(new Set());
      })
      .catch((err: unknown) => {
        setArtworks([]);
        setError(err instanceof Error ? err.message : 'Failed to load artworks');
      })
      .finally(() => setLoading(false));
  }, [mode]);

  useEffect(loadQueue, [loadQueue]);

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

  const applyBulkEdits = async () => {
    const payload = Object.fromEntries(
      editableFields
        .map((field) => [field, edits[field]])
        .filter(([, value]) => typeof value === 'string' && value.trim() !== ''),
    ) as UpdateArtworkRequest;

    if (
      !confirmed ||
      selectedIds.length === 0 ||
      Object.keys(payload).length === 0
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await Promise.all(
        selectedIds.map((id) => adminUpdateArtwork(id, payload)),
      );
      setMessage(`${selectedIds.length} artwork attribute set updated.`);
      setEdits({});
      setConfirmed(false);
      setBulkEditOpen(false);
      loadQueue();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update artwork attributes',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardModule
      title={admin ? 'Artwork review and correction' : 'Artwork review'}
      description="Approval is the normal path. Rejection and hiding are moderation decisions, while attribute changes should be reserved for fixing clear submission errors."
      aside={
        <select
          value={mode}
          onChange={(event) => setMode(event.target.value as QueueMode)}
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm"
        >
          <option value="pending">Pending review</option>
          <option value="hidden">Hidden</option>
        </select>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || selectedIds.length === 0}
          onClick={() => mutateStatus(selectedIds, 'approved')}
          className="rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Approve selected
        </button>
        <button
          type="button"
          disabled={busy || selectedIds.length === 0}
          onClick={() => mutateStatus(selectedIds, 'hidden')}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Hide selected
        </button>
        <button
          type="button"
          disabled={busy || selectedIds.length === 0}
          onClick={() => mutateStatus(selectedIds, 'rejected')}
          className="rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-40"
        >
          Reject selected
        </button>
        {admin && (
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={() => setBulkEditOpen((value) => !value)}
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Edit selected attributes
          </button>
        )}
      </div>

      {bulkEditOpen && admin && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">
            Attribute editing is a last-resort correction tool.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            {editableFields.map((field) => (
              <label
                key={field}
                className="text-xs font-semibold uppercase text-neutral-600"
              >
                {field.replace('_', ' ')}
                <input
                  value={String(edits[field] ?? '')}
                  onChange={(event) =>
                    setEdits((current) => ({
                      ...current,
                      [field]: event.target.value,
                    }))
                  }
                  className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm font-normal normal-case"
                />
              </label>
            ))}
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-red-900">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            I understand this rewrites submitted details for every selected artwork.
          </label>
          <button
            type="button"
            disabled={busy || !confirmed}
            onClick={applyBulkEdits}
            className="mt-3 rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Apply attribute changes
          </button>
        </div>
      )}

      {message && <ModuleState tone="success">{message}</ModuleState>}
      {error && <ModuleState tone="error">{error}</ModuleState>}
      {loading ? (
        <ModuleState>Loading artwork queue...</ModuleState>
      ) : artworks.length === 0 ? (
        <ModuleState>No artworks in this queue.</ModuleState>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {artworks.map((artwork) => {
            const resolvedArtwork = resolveApiArtwork(artwork);
            return (
              <ArtworkCard
                key={artwork.art_id}
                artwork={resolvedArtwork}
                openModal={() =>
                  window.open(
                    resolvedArtwork.displayUrl,
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
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
                    <p className="text-xs text-neutral-500">
                      {artworkLabel(artwork)} · {artwork.status} ·{' '}
                      {formatDate(artwork.timestamp)}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          mutateStatus([artwork.art_id], 'approved')
                        }
                        className="rounded bg-green-700 px-2 py-2 text-xs font-semibold text-white disabled:opacity-40"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          mutateStatus([artwork.art_id], 'hidden')
                        }
                        className="rounded border px-2 py-2 text-xs font-semibold disabled:opacity-40"
                      >
                        Hide
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          mutateStatus([artwork.art_id], 'rejected')
                        }
                        className="rounded border border-red-300 px-2 py-2 text-xs font-semibold text-red-700 disabled:opacity-40"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </DashboardModule>
  );
}
