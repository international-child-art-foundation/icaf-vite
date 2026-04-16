import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ITranscriptCue, parseVTT } from './transcriptParser';

interface NewsTranscriptProps {
  transcriptSrc: string;
  currentTime: number;
  onSeek: (seconds: number) => void;
  accentBarClass: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; cues: ITranscriptCue[] }
  | { status: 'missing' };

function findActiveCueIndex(cues: ITranscriptCue[], t: number): number {
  if (cues.length === 0) return -1;
  let lo = 0;
  let hi = cues.length - 1;
  let candidate = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (cues[mid].start <= t) {
      candidate = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (candidate === -1) return -1;
  if (t >= cues[candidate].end && candidate < cues.length - 1) {
    return candidate;
  }
  return candidate;
}

export const NewsTranscript = memo(
  ({
    transcriptSrc,
    currentTime,
    onSeek,
    accentBarClass,
    expanded,
    onExpandedChange,
  }: NewsTranscriptProps) => {
    const [state, setState] = useState<LoadState>({ status: 'loading' });
    const [userScrolled, setUserScrolled] = useState(false);

    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const cueRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const lastActiveIdxRef = useRef<number>(-1);
    // When we programmatically scroll, the scroll event fires and would
    // otherwise flip userScrolled to true. Guard against that by marking
    // the next scroll as ours.
    const programmaticScrollRef = useRef<boolean>(false);

    useEffect(() => {
      let cancelled = false;
      setState({ status: 'loading' });

      fetch(transcriptSrc)
        .then((r) => {
          if (!r.ok) throw new Error(`status ${r.status}`);
          return r.text();
        })
        .then((text) => {
          if (cancelled) return;
          const cues = parseVTT(text);
          if (cues.length === 0) {
            setState({ status: 'missing' });
          } else {
            setState({ status: 'ready', cues });
          }
        })
        .catch(() => {
          if (cancelled) return;
          setState({ status: 'missing' });
        });

      return () => {
        cancelled = true;
      };
    }, [transcriptSrc]);

    const cues = state.status === 'ready' ? state.cues : [];

    const activeIdx = useMemo(
      () => findActiveCueIndex(cues, currentTime),
      [cues, currentTime],
    );

    useEffect(() => {
      if (activeIdx === -1) return;
      if (activeIdx === lastActiveIdxRef.current) return;
      lastActiveIdxRef.current = activeIdx;

      if (!expanded) return;

      const container = scrollContainerRef.current;
      const node = cueRefs.current[activeIdx];
      if (!container || !node) return;

      const containerRect = container.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      const offset =
        nodeRect.top -
        containerRect.top -
        containerRect.height / 2 +
        nodeRect.height / 2;

      programmaticScrollRef.current = true;
      container.scrollBy({ top: offset, behavior: 'smooth' });
    }, [activeIdx, userScrolled, expanded]);

    const onScroll = useCallback(() => {
      if (programmaticScrollRef.current) {
        programmaticScrollRef.current = false;
        return;
      }
      setUserScrolled(true);
    }, []);

    const jumpToCurrent = useCallback(() => {
      setUserScrolled(false);
      lastActiveIdxRef.current = -1;
    }, []);

    if (state.status === 'missing') return null;

    return (
      <div className="mt-3 rounded-md border border-gray-200 bg-white">
        <div className="flex items-center justify-between px-3 py-2">
          <button
            type="button"
            onClick={() => onExpandedChange(!expanded)}
            aria-expanded={expanded}
            className={[
              'flex items-center gap-2 text-sm font-medium text-gray-700',
              'transition-colors hover:text-gray-900',
              'rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2',
            ].join(' ')}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              aria-hidden="true"
              fill="currentColor"
              style={{
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 150ms ease',
              }}
            >
              <path d="M3 1 L7 5 L3 9 Z" />
            </svg>
            Transcript
          </button>

          {expanded && userScrolled && activeIdx !== -1 ? (
            <button
              type="button"
              onClick={jumpToCurrent}
              className={[
                'text-xs font-medium text-gray-600 underline underline-offset-2',
                'transition-colors hover:text-gray-900',
                'rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2',
              ].join(' ')}
            >
              Jump to current
            </button>
          ) : null}
        </div>

        {expanded && state.status === 'loading' ? (
          <div className="px-3 pb-3 text-sm text-gray-500">
            Loading transcript…
          </div>
        ) : null}

        {expanded && state.status === 'ready' ? (
          <div
            ref={scrollContainerRef}
            onScroll={onScroll}
            className={[
              'relative max-h-64 overflow-y-auto px-3 pb-3',
              'scroll-smooth',
            ].join(' ')}
          >
            <ol className="flex flex-col gap-1">
              {cues.map((cue, i) => {
                const isActive = i === activeIdx;
                return (
                  <li key={i}>
                    <button
                      type="button"
                      ref={(el) => {
                        cueRefs.current[i] = el;
                      }}
                      onClick={() => onSeek(cue.start)}
                      className={[
                        'relative block w-full rounded px-3 py-1.5 text-left',
                        'text-[15px] leading-[1.55] transition-colors duration-200',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2',
                        isActive
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
                      ].join(' ')}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      {isActive ? (
                        <span
                          aria-hidden="true"
                          className={[
                            accentBarClass,
                            'absolute inset-y-1 left-0 w-[3px] rounded-full',
                          ].join(' ')}
                        />
                      ) : null}
                      <span className="break-words">{cue.text}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}
      </div>
    );
  },
);
NewsTranscript.displayName = 'NewsTranscript';
