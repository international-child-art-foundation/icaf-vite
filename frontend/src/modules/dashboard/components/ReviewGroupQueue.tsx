import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GroupListItem, GroupStatus } from '@icaf/shared';
import {
  changeGroupStatus,
  fetchHiddenGroups,
  fetchPendingGroups,
} from '@/api/contributor';
import { GalleryGroupCard } from '@/modules/content/components/gallery/GalleryGroupCard';
import { formatDate, groupTitle } from '../utils/dashboardFormat';
import { DashboardModule, ModuleState } from './DashboardModule';

type QueueMode = 'pending' | 'hidden';
type ReviewStatus = Extract<GroupStatus, 'approved' | 'hidden' | 'rejected'>;

export function ReviewGroupQueue({ admin = false }: { admin?: boolean }) {
  const [mode, setMode] = useState<QueueMode>('pending');
  const [groups, setGroups] = useState<GroupListItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const selectedIds = useMemo(() => [...selected], [selected]);

  const loadQueue = useCallback(() => {
    setLoading(true);
    setError(null);
    const request = mode === 'pending' ? fetchPendingGroups : fetchHiddenGroups;
    request({ limit: 20 })
      .then((response) => {
        setGroups(response.groups);
        setSelected(new Set());
      })
      .catch((err: unknown) => {
        setGroups([]);
        setError(err instanceof Error ? err.message : 'Failed to load groups');
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
      await Promise.all(ids.map((id) => changeGroupStatus(id, { status })));
      setMessage(`${ids.length} group${ids.length === 1 ? '' : 's'} updated.`);
      loadQueue();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update group status',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardModule
      title="Group review"
      description="Approve groups first when the submission looks ready. Hiding and rejection are available for moderation cases; group attribute editing needs a dedicated admin API before it can be safely exposed here."
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

      {admin && (
        <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Admin group attribute editing is intentionally not wired yet because
          the frontend only has guardian self-edit endpoints for group metadata.
        </div>
      )}
      {message && <ModuleState tone="success">{message}</ModuleState>}
      {error && <ModuleState tone="error">{error}</ModuleState>}
      {loading ? (
        <ModuleState>Loading group queue...</ModuleState>
      ) : groups.length === 0 ? (
        <ModuleState>No groups in this queue.</ModuleState>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {groups.map((group) => (
            <GalleryGroupCard
              key={group.group_id}
              group={group}
              onOpen={() => undefined}
              actionSlot={
                <div className="space-y-3 text-sm">
                  <label className="flex items-center gap-2 font-semibold">
                    <input
                      type="checkbox"
                      checked={selected.has(group.group_id)}
                      onChange={(event) =>
                        setSelected((current) => {
                          const next = new Set(current);
                          if (event.target.checked) next.add(group.group_id);
                          else next.delete(group.group_id);
                          return next;
                        })
                      }
                    />
                    Select
                  </label>
                  <p className="text-xs text-neutral-500">
                    {groupTitle(group)} · {group.status} ·{' '}
                    {formatDate(group.timestamp)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void mutateStatus([group.group_id], 'approved')
                      }
                      className="rounded bg-green-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void mutateStatus([group.group_id], 'hidden')
                      }
                      className="rounded border px-3 py-2 text-xs font-semibold disabled:opacity-40"
                    >
                      Hide
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void mutateStatus([group.group_id], 'rejected')
                      }
                      className="rounded border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-40"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              }
            />
          ))}
        </div>
      )}
    </DashboardModule>
  );
}
