import { CheckCircle2, LoaderCircle } from 'lucide-react';

export type SubmissionProgressState = {
  completed: number;
  phase: 'preparing' | 'uploading' | 'finalizing';
  total: number;
};

export function SubmissionProgress({
  completed,
  phase,
  total,
}: SubmissionProgressState) {
  const totalSteps = total * 2 + 1;
  const completedSteps =
    phase === 'preparing'
      ? completed
      : phase === 'uploading'
        ? total + completed
        : total * 2;
  const percentage = Math.round((completedSteps / totalSteps) * 100);
  const isFinalizing = phase === 'finalizing';
  const status =
    phase === 'preparing'
      ? completed > 0
        ? `${completed} of ${total} secure upload links ready`
        : 'Preparing secure upload links…'
      : phase === 'uploading'
        ? `Uploading ${total === 1 ? 'artwork' : 'artworks'} — ${completed} of ${total} complete`
        : 'Uploads complete. Finishing your submission…';

  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className="mt-3 overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-amber-50 p-4 shadow-sm"
      role="status"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm">
          {isFinalizing ? (
            <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
          ) : (
            <LoaderCircle
              aria-hidden="true"
              className="h-5 w-5 animate-spin"
            />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3 text-sm font-bold text-slate-800">
            <span>{status}</span>
            <span className="shrink-0 tabular-nums text-primary">
              {percentage}%
            </span>
          </div>
          <div
            aria-label="Submission progress"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={percentage}
            className="mt-2 h-2.5 overflow-hidden rounded-full bg-sky-100 shadow-inner"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-secondary-blue via-primary to-secondary-purple transition-[width] duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            Please keep this page open. Larger uploads and batches may take a
            few minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
