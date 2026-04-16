import {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  KeyboardEvent,
  PointerEvent,
  Ref,
} from 'react';

export interface NewsAudioPlayerHandle {
  seek: (seconds: number) => void;
}

interface NewsAudioPlayerProps {
  src: string;
  title: string;
  downloadFilename?: string;
  accentBarClass: string;
  onTimeUpdate?: (seconds: number) => void;
  onFirstPlay?: () => void;
  ref?: Ref<NewsAudioPlayerHandle>;
}

function formatTime(secs: number): string {
  if (!Number.isFinite(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const NewsAudioPlayer = memo(function NewsAudioPlayer({
  src,
  title,
  downloadFilename,
  accentBarClass,
  onTimeUpdate,
  onFirstPlay,
  ref,
}: NewsAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const hasFiredFirstPlayRef = useRef(false);

  useImperativeHandle(
    ref,
    () => ({
      seek: (seconds: number) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Math.max(
          0,
          Math.min(seconds, audio.duration || seconds),
        );
        setCurrentTime(audio.currentTime);
        onTimeUpdate?.(audio.currentTime);
      },
    }),
    [onTimeUpdate],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
    };
    const onMeta = () => {
      setDuration(audio.duration || 0);
      setIsReady(true);
    };
    const onPlay = () => {
      const audio = audioRef.current;
      if (audio && !hasFiredFirstPlayRef.current && audio.currentTime < 1) {
        hasFiredFirstPlayRef.current = true;
        onFirstPlay?.();
      }
      setIsPlaying(true);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('durationchange', onMeta);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('durationchange', onMeta);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [onTimeUpdate]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const seekToClientX = useCallback(
    (clientX: number) => {
      const bar = barRef.current;
      const audio = audioRef.current;
      if (!bar || !audio || !duration) return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.min(
        1,
        Math.max(0, (clientX - rect.left) / rect.width),
      );
      audio.currentTime = ratio * duration;
      setCurrentTime(audio.currentTime);
    },
    [duration],
  );

  const onBarPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      seekToClientX(e.clientX);
    },
    [seekToClientX],
  );

  const onBarPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (e.buttons !== 1) return;
      seekToClientX(e.clientX);
    },
    [seekToClientX],
  );

  const onBarKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        togglePlay();
        return;
      }

      const step = e.shiftKey ? 15 : 5;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        audio.currentTime = Math.min(duration, audio.currentTime + step);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        audio.currentTime = Math.max(0, audio.currentTime - step);
      } else if (e.key === 'Home') {
        e.preventDefault();
        audio.currentTime = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        audio.currentTime = duration;
      }
    },
    [duration, togglePlay],
  );

  const progressRatio = duration > 0 ? currentTime / duration : 0;
  const progressPct = `${(progressRatio * 100).toFixed(2)}%`;

  const derivedFilename =
    downloadFilename ?? (src.split('/').pop() || 'audio.mp3');

  return (
    <div
      className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-3"
      onClick={(e) => e.stopPropagation()}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        type="button"
        onClick={togglePlay}
        disabled={!isReady}
        aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          'bg-gray-900 text-white transition-colors',
          'hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2',
        ].join(' ')}
      >
        {isPlaying ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            aria-hidden="true"
            fill="currentColor"
          >
            <rect x="2" y="1" width="3.5" height="12" rx="0.5" />
            <rect x="8.5" y="1" width="3.5" height="12" rx="0.5" />
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            aria-hidden="true"
            fill="currentColor"
            style={{ marginLeft: 2 }}
          >
            <path d="M2.5 1.5 L12 7 L2.5 12.5 Z" />
          </svg>
        )}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div
          ref={barRef}
          role="slider"
          tabIndex={0}
          aria-label={`Seek ${title}`}
          aria-valuemin={0}
          aria-valuemax={Math.max(0, Math.floor(duration))}
          aria-valuenow={Math.floor(currentTime)}
          aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
          onPointerDown={onBarPointerDown}
          onPointerMove={onBarPointerMove}
          onKeyDown={onBarKeyDown}
          className={[
            'relative h-1.5 w-full cursor-pointer rounded-full bg-gray-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2',
          ].join(' ')}
        >
          <div
            className={[
              accentBarClass,
              'pointer-events-none absolute inset-y-0 left-0 rounded-full',
            ].join(' ')}
            style={{ width: progressPct }}
          />
        </div>

        <div className="flex justify-between font-mono text-xs tabular-nums text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <a
        href={src}
        download={derivedFilename}
        aria-label={`Download ${title}`}
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          'text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2',
        ].join(' ')}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 2 V10" />
          <path d="M4.5 6.5 L8 10 L11.5 6.5" />
          <path d="M2.5 13 H13.5" />
        </svg>
      </a>
    </div>
  );
});
