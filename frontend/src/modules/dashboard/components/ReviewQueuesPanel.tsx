import { useState } from 'react';
import { Image, Users } from 'lucide-react';
import { ReviewArtworkQueue } from './ReviewArtworkQueue';
import { ReviewGroupQueue } from './ReviewGroupQueue';

type ReviewQueueView = 'artwork' | 'group';

type ReviewQueuesPanelProps = {
  admin: boolean;
};

function ReviewQueueViewToggle({
  view,
  onToggle,
}: {
  view: ReviewQueueView;
  onToggle: () => void;
}) {
  const isGroup = view === 'group';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isGroup ? 'artwork' : 'group'} review view`}
      className={`group relative h-[80px] w-[188px] flex-none overflow-hidden rounded-md p-3 text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] ${
        isGroup ? 'text-neutral-950' : 'text-white'
      }`}
    >
      <span
        className={`absolute inset-0 transition-opacity duration-500 ${
          isGroup ? 'opacity-0' : 'opacity-100'
        } from-secondary-blue/80 to-primary/100 bg-gradient-to-br`}
      />
      <span
        className={`absolute inset-0 transition-opacity duration-500 ${
          isGroup ? 'opacity-100' : 'opacity-0'
        } from-secondary-yellow via-tertiary-yellow to-primary-alt bg-gradient-to-br`}
      />
      <span className="relative z-10 flex h-full items-center gap-3">
        <span
          className={`relative h-10 w-10 flex-none overflow-hidden rounded-full shadow-sm transition-colors duration-300 ${
            isGroup ? 'bg-white/60 text-neutral-950' : 'bg-white/20 text-white'
          }`}
        >
          <Image
            aria-hidden="true"
            className={`absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 transition duration-300 ${
              isGroup
                ? 'translate-y-[115%] opacity-0'
                : '-translate-y-1/2 opacity-100'
            }`}
          />
          <Users
            aria-hidden="true"
            className={`absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 transition duration-300 ${
              isGroup
                ? '-translate-y-1/2 opacity-100'
                : '-translate-y-[165%] opacity-0'
            }`}
          />
        </span>
        <span className="min-w-0">
          <span className="block text-[11px] font-bold uppercase tracking-[0.18em] opacity-80">
            View
          </span>
          <span className="font-montserrat block text-lg font-bold leading-tight">
            {isGroup ? 'Group' : 'Artwork'}
          </span>
        </span>
      </span>
    </button>
  );
}

export function ReviewQueuesPanel({ admin }: ReviewQueuesPanelProps) {
  const [view, setView] = useState<ReviewQueueView>('artwork');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-start">
        <ReviewQueueViewToggle
          view={view}
          onToggle={() =>
            setView((current) => (current === 'artwork' ? 'group' : 'artwork'))
          }
        />
      </div>
      {view === 'artwork' ? (
        <ReviewArtworkQueue
          key="review-artwork-queue"
          admin={admin}
          defaultMode="pending"
        />
      ) : (
        <ReviewGroupQueue key="review-group-queue" admin={admin} />
      )}
    </div>
  );
}
