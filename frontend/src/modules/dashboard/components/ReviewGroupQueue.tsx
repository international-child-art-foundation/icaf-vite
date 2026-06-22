import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  GroupListItem,
  GroupStatus,
  UpdateGroupRequest,
} from '@icaf/shared';
import { adminUpdateGroup } from '@/api/admin';
import {
  changeGroupStatus,
  fetchHiddenGroups,
  fetchPendingGroups,
} from '@/api/contributor';
import { GalleryGroupCard } from '@/modules/content/components/gallery/GalleryGroupCard';
import { mapWithConcurrency } from '@/shared/utils/concurrency';
import { formatDate, groupTitle } from '../utils/dashboardFormat';
import { DashboardModule, ModuleState } from './DashboardModule';

type QueueMode = 'pending' | 'hidden';
type ReviewStatus = Extract<GroupStatus, 'approved' | 'hidden' | 'rejected'>;

const editableFields: (keyof UpdateGroupRequest)[] = [
  'title',
  'class_name',
  'submitter_display_name',
  'country',
  'region',
  'theme',
];

function editableFieldLabel(field: keyof UpdateGroupRequest) {
  if (field === 'theme') return 'Theme SK';
  return field.replace(/_/g, ' ');
}

export function ReviewGroupQueue({ admin = false }: { admin?: boolean }) {
  const [mode, setMode] = useState<QueueMode>('pending');
  const [groups, setGroups] = useState<GroupListItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [edits, setEdits] = useState<UpdateGroupRequest>({});
  const [lastKey, setLastKey] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const selectedIds = useMemo(() => [...selected], [selected]);

  const loadQueue = useCallback(
    (cursor?: string) => {
      const append = Boolean(cursor);
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      const request =
        mode === 'pending' ? fetchPendingGroups : fetchHiddenGroups;
      request({
        limit: 24,
        ...(cursor ? { last_key: cursor } : {}),
      })
        .then((response) => {
          setGroups((current) =>
            append ? [...current, ...response.groups] : response.groups,
          );
          setLastKey(
            response.has_more && response.last_key
              ? response.last_key
              : undefined,
          );
          if (!append) setSelected(new Set());
        })
        .catch((err: unknown) => {
          if (!append) {
            setGroups([]);
            setLastKey(undefined);
          }
          setError(
            err instanceof Error ? err.message : 'Failed to load groups',
          );
        })
        .finally(() => {
          setLoading(false);
          setLoadingMore(false);
        });
    },
    [mode],
  );

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const mutateStatus = async (
    ids: string[],
    status: ReviewStatus,
    approveAll = false,
  ) => {
    if (ids.length === 0) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await mapWithConcurrency(ids, 2, (id) =>
        changeGroupStatus(id, {
          status,
          rev_num: groups.find((group) => group.group_id === id)?.rev_num ?? 1,
          ...(status === 'approved' ? { approve_all: approveAll } : {}),
        }),
      );
      setMessage(
        status === 'approved'
          ? `${ids.length} group${ids.length === 1 ? '' : 's'} approved${approveAll ? ' with all pending artwork' : ' without changing artwork status'}.`
          : `${ids.length} group${ids.length === 1 ? '' : 's'} updated.`,
      );
      loadQueue();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update group status',
      );
    } finally {
      setBusy(false);
    }
  };

  const applyBulkEdits = async () => {
    const payload = Object.fromEntries(
      editableFields
        .map((field) => [field, edits[field]])
        .filter(
          ([, value]) => typeof value === 'string' && value.trim() !== '',
        ),
    ) as UpdateGroupRequest;

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
      await mapWithConcurrency(selectedIds, 3, async (id): Promise<void> => {
        await adminUpdateGroup(id, payload);
      });
      setMessage(`${selectedIds.length} group attribute set updated.`);
      setEdits({});
      setConfirmed(false);
      setBulkEditOpen(false);
      loadQueue();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update group attributes',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardModule
      title={admin ? 'Group review and correction' : 'Group review'}
      description="Approval is the normal path. Rejection and hiding are moderation decisions, while attribute changes should be reserved for fixing clear submission errors."
      aside={
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as QueueMode)}
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm"
          >
            <option value="pending">Pending review</option>
            <option value="hidden">Hidden</option>
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
      <p className="mb-2 text-xs text-neutral-600">
        <strong>Approve groups only</strong> publishes the group scaffold and
        leaves its artwork pending. <strong>Approve all</strong> also publishes
        every pending artwork in the group.
      </p>
      <div className="mb-4 flex flex-wrap items-stretch gap-2">
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-green-200 bg-green-50 p-2">
          <span className="px-1 text-xs font-semibold text-green-900">
            Selected groups
          </span>
          <button
            type="button"
            disabled={busy || selectedIds.length === 0}
            onClick={() => void mutateStatus(selectedIds, 'approved')}
            className="rounded-md border border-green-700 bg-white px-3 py-2 text-sm font-semibold text-green-800 disabled:opacity-40"
            title="Approve only the group scaffold; artwork statuses remain unchanged"
          >
            Approve groups only
          </button>
          <button
            type="button"
            disabled={busy || selectedIds.length === 0}
            onClick={() => void mutateStatus(selectedIds, 'approved', true)}
            className="rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
            title="Approve each group and all pending artwork in it"
          >
            Approve all
          </button>
        </div>
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
        {admin && (
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={() => setBulkEditOpen((value) => !value)}
            className="bg-primary rounded-md px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Edit selected attributes
          </button>
        )}
      </div>

      {bulkEditOpen && admin && (
        <div className="border-primary/20 bg-primary/5 mb-5 rounded-md border p-4">
          <p className="text-primary text-sm font-semibold">
            Attribute editing is a last-resort correction tool.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {editableFields.map((field) => (
              <label
                key={field}
                className="text-xs font-semibold uppercase text-neutral-600"
              >
                {editableFieldLabel(field)}
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
          <label className="text-primary mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="accent-primary"
            />
            I understand this rewrites submitted details for every selected
            group.
          </label>
          <button
            type="button"
            disabled={busy || !confirmed}
            onClick={() => void applyBulkEdits()}
            className="bg-primary mt-3 rounded-md px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Apply attribute changes
          </button>
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
                    {formatDate(group.ts)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex flex-wrap gap-2 rounded border border-green-200 bg-green-50 p-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void mutateStatus([group.group_id], 'approved')
                        }
                        className="rounded border border-green-700 bg-white px-3 py-2 text-xs font-semibold text-green-800 disabled:opacity-40"
                        title="Approve only the group scaffold; artwork statuses remain unchanged"
                      >
                        Approve group
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void mutateStatus([group.group_id], 'approved', true)
                        }
                        className="rounded bg-green-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                        title="Approve the group and all pending artwork in it"
                      >
                        Approve all
                      </button>
                    </div>
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
      {lastKey && !loading && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            disabled={busy || loadingMore}
            onClick={() => loadQueue(lastKey)}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            {loadingMore ? 'Loading more...' : 'Load more groups'}
          </button>
        </div>
      )}
    </DashboardModule>
  );
}
