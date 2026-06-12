import { useEffect, useMemo, useState } from 'react';
import type {
  ReviewTakedownRequest,
  TakedownRequestListItem,
  TakedownStatus,
} from '@icaf/shared';
import {
  hasActiveTakedownRequests,
  listTakedownRequests,
  reviewTakedownRequest,
  TAKEDOWN_ACTIVITY_CACHE_MS,
} from '@/api/admin';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { DashboardModule, ModuleState } from './DashboardModule';

type PendingAction = {
  request: TakedownRequestListItem;
  action: ReviewTakedownRequest['action'];
} | null;

const statusLabels: Record<TakedownStatus, string> = {
  requesting: 'Requesting',
  disputing: 'Disputing',
  executed: 'Executed',
  canceled: 'Canceled',
};

const statusClasses: Record<TakedownStatus, string> = {
  requesting: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  disputing: 'border-blue-200 bg-blue-50 text-blue-800',
  executed: 'border-neutral-300 bg-neutral-100 text-neutral-700',
  canceled: 'border-green-200 bg-green-50 text-green-800',
};

const filterOptions: Array<TakedownStatus | 'all'> = [
  'requesting',
  'disputing',
  'executed',
  'canceled',
  'all',
];

function formatDateTime(seconds: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(seconds * 1000));
}

function targetText(request: TakedownRequestListItem): string {
  return [
    request.art_id ? `Artwork ${request.art_id}` : undefined,
    request.group_id ? `Group ${request.group_id}` : undefined,
  ]
    .filter(Boolean)
    .join(' and ');
}

function activeStatus(status: TakedownStatus): boolean {
  return status === 'requesting' || status === 'disputing';
}

function actionTitle(action: ReviewTakedownRequest['action']): string {
  if (action === 'execute') return 'Execute takedown';
  if (action === 'cancel') return 'Cancel request';
  return 'Mark disputing';
}

function actionResultLabel(action: ReviewTakedownRequest['action']): string {
  if (action === 'execute') return 'executed';
  if (action === 'cancel') return 'canceled';
  return 'disputing';
}

type TakedownRequestsPanelProps = {
  onActiveChange?: (hasActive: boolean) => void;
};

export function TakedownRequestsPanel({
  onActiveChange,
}: TakedownRequestsPanelProps) {
  const [requests, setRequests] = useState<TakedownRequestListItem[]>([]);
  const [lastKey, setLastKey] = useState<string | undefined>();
  const [filter, setFilter] = useState<TakedownStatus | 'all'>('requesting');
  const [notes, setNotes] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const visibleRequests = useMemo(
    () =>
      filter === 'all'
        ? requests
        : requests.filter((request) => request.status === filter),
    [filter, requests],
  );

  const refreshActiveState = async (bypassCache: boolean) => {
    if (!onActiveChange) return;
    try {
      const hasActive = await hasActiveTakedownRequests({
        bypassCache,
        cacheTtlMs: TAKEDOWN_ACTIVITY_CACHE_MS,
      });
      onActiveChange(hasActive);
    } catch {
      onActiveChange(false);
    }
  };

  const loadRequests = async (
    mode: 'replace' | 'append' = 'replace',
    bypassCache = false,
  ) => {
    setLoading(mode === 'replace');
    setBusy(mode === 'append');
    setError(null);
    try {
      const response = await listTakedownRequests(
        {
          limit: 25,
          ...(mode === 'append' && lastKey ? { last_key: lastKey } : {}),
        },
        {
          bypassCache,
          cacheTtlMs:
            mode === 'replace' ? TAKEDOWN_ACTIVITY_CACHE_MS : undefined,
        },
      );
      setRequests((current) =>
        mode === 'append'
          ? [...current, ...response.requests]
          : response.requests,
      );
      setLastKey(response.last_key);
      if (mode === 'replace') {
        void refreshActiveState(bypassCache);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load takedown requests.',
      );
    } finally {
      setLoading(false);
      setBusy(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const confirmPendingAction = async () => {
    if (!pendingAction) return;

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const response = await reviewTakedownRequest(pendingAction.request.tdr_sk, {
        action: pendingAction.action,
        ...(notes.trim() ? { review_notes: notes.trim() } : {}),
      });
      setRequests((current) =>
        current.map((request) =>
          request.tdr_sk === response.tdr_sk
            ? {
                ...request,
                status: response.status,
                review_notes: notes.trim() || request.review_notes,
                reviewed_at: Math.floor(Date.now() / 1000),
              }
            : request,
        ),
      );
      if (response.status === 'executed') {
        setMessage(
          `Takedown executed. ${response.affected_art_ids?.length ?? 0} artwork item${response.affected_art_ids?.length === 1 ? '' : 's'} hidden.`,
        );
      } else {
        setMessage(
          `Takedown request marked ${statusLabels[response.status].toLowerCase()}.`,
        );
      }
      setPendingAction(null);
      setNotes('');
      void refreshActiveState(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update takedown request.',
      );
    } finally {
      setBusy(false);
    }
  };

  const beginAction = (
    request: TakedownRequestListItem,
    action: ReviewTakedownRequest['action'],
  ) => {
    setPendingAction({ request, action });
    setNotes(request.review_notes ?? '');
    setMessage(null);
    setError(null);
  };

  return (
    <DashboardModule
      title="Takedown requests"
      description="Review submitted takedown requests and mark each request as canceled or disputing."
      aside={
        <Button
          type="button"
          variant="outline"
          onClick={() => void loadRequests('replace', true)}
          disabled={busy}
        >
          Refresh
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                filter === option
                  ? 'border-primary bg-primary text-white'
                  : 'border-black/10 bg-white text-neutral-700 hover:border-black/30'
              }`}
            >
              {option === 'all' ? 'All' : statusLabels[option]}
            </button>
          ))}
        </div>

        {error && <ModuleState tone="error">{error}</ModuleState>}
        {message && <ModuleState tone="success">{message}</ModuleState>}

        {loading ? (
          <ModuleState>Loading takedown requests...</ModuleState>
        ) : visibleRequests.length === 0 ? (
          <ModuleState>No takedown requests found for this view.</ModuleState>
        ) : (
          <div className="grid gap-4">
            {visibleRequests.map((request) => (
              <TakedownRequestCard
                key={request.tdr_sk}
                busy={busy}
                onBeginAction={beginAction}
                request={request}
              />
            ))}
          </div>
        )}

        {lastKey && (
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadRequests('append')}
              disabled={busy}
            >
              Load more
            </Button>
          </div>
        )}

        <Dialog
          open={Boolean(pendingAction)}
          onOpenChange={(open) => {
            if (!open) {
              setPendingAction(null);
              setNotes('');
            }
          }}
        >
          {pendingAction && (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{actionTitle(pendingAction.action)}</DialogTitle>
                <DialogDescription>
                  This will mark request {pendingAction.request.tdr_id} as{' '}
                  {actionResultLabel(pendingAction.action)}.
                </DialogDescription>
              </DialogHeader>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-neutral-700">
                  Review notes
                </span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  disabled={busy}
                  maxLength={1000}
                  className="border-input bg-background focus-visible:ring-ring min-h-24 w-full rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </label>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPendingAction(null);
                    setNotes('');
                  }}
                  disabled={busy}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant={
                    pendingAction.action === 'dispute'
                      ? 'default'
                      : 'destructive'
                  }
                  onClick={() => void confirmPendingAction()}
                  disabled={busy}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </DashboardModule>
  );
}

function TakedownRequestCard({
  busy,
  onBeginAction,
  request,
}: {
  busy: boolean;
  onBeginAction: (
    request: TakedownRequestListItem,
    action: ReviewTakedownRequest['action'],
  ) => void;
  request: TakedownRequestListItem;
}) {
  const canReview = activeStatus(request.status);

  return (
    <article className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[request.status]}`}
            >
              {statusLabels[request.status]}
            </span>
            <span className="text-sm text-neutral-500">
              Submitted {formatDateTime(request.ts)}
            </span>
          </div>
          <h3 className="mt-3 break-words text-base font-semibold text-neutral-950">
            {targetText(request)}
          </h3>
          <p className="mt-1 break-words text-sm text-neutral-600">
            Request ID: {request.tdr_id}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onBeginAction(request, 'dispute')}
            disabled={busy || !canReview}
          >
            Mark disputing
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onBeginAction(request, 'execute')}
            disabled={busy || !canReview}
          >
            Execute takedown
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onBeginAction(request, 'cancel')}
            disabled={busy || !canReview}
          >
            Cancel request
          </Button>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <Detail label="Requester" value={request.requester_name} />
        <Detail label="Requester email" value={request.requester_email} />
        <Detail
          label="Scheduled execution"
          value={formatDateTime(request.scheduled_execution_at)}
        />
        {request.reviewed_at && (
          <Detail label="Reviewed" value={formatDateTime(request.reviewed_at)} />
        )}
      </dl>

      <div className="mt-4 rounded-md border border-black/10 bg-neutral-50 p-3">
        <p className="text-xs font-semibold uppercase text-neutral-500">
          Reason
        </p>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-800">
          {request.reason}
        </p>
      </div>

      {request.review_notes && (
        <div className="mt-3 rounded-md border border-black/10 bg-white p-3">
          <p className="text-xs font-semibold uppercase text-neutral-500">
            Review notes
          </p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-800">
            {request.review_notes}
          </p>
        </div>
      )}
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-neutral-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-neutral-800">{value}</dd>
    </div>
  );
}
