import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';

export type VideoHandle = {
  play: () => void;
  pause: () => void;
  isStarted: () => boolean;
};

interface VideoWrapperProps {
  src: string;
  thumbnail: string;
  curved?: boolean;
  className?: string;
  lazyMode?: 'idle' | 'viewport' | 'off';
  videoRef?: (handle: VideoHandle | null) => void;
}

export const VideoWrapper = ({
  src,
  thumbnail,
  curved,
  className,
  lazyMode = 'idle',
  videoRef,
}: VideoWrapperProps) => {
  const [started, setStarted] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | undefined>(undefined);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const startPlayback = () => {
    if (!started) {
      if (!videoSrc) setVideoSrc(src);
      setStarted(true);
      requestAnimationFrame(() => {
        videoElRef.current?.play().catch(() => {});
      });
    }
  };

  useEffect(() => {
    if (!videoRef) return;

    const handle: VideoHandle = {
      play: () => {
        if (!started) {
          setVideoSrc((s) => s ?? src);
          setStarted(true);
        }
        videoElRef.current?.play().catch(() => {});
      },
      pause: () => {
        videoElRef.current?.pause();
      },
      isStarted: () => started,
    };

    videoRef(handle);
    return () => videoRef(null);
  }, [videoRef, started, src]);

  useEffect(() => {
    if (started || videoSrc || lazyMode === 'off') return;

    let cleanup: (() => void) | undefined;
    const attach = () => setVideoSrc(src);

    if (lazyMode === 'idle') {
      const runIdle = () => {
        const ric = window.requestIdleCallback;
        if (ric) {
          const id = ric(attach, { timeout: 2000 });
          return () => window.cancelIdleCallback?.(id);
        } else {
          const t = window.setTimeout(attach, 0);
          return () => window.clearTimeout(t);
        }
      };

      if (document.readyState === 'complete') {
        cleanup = runIdle();
      } else {
        const onLoad = () => {
          cleanup = runIdle();
        };
        window.addEventListener('load', onLoad, { once: true });
        cleanup = () => window.removeEventListener('load', onLoad);
      }
    } else if (lazyMode === 'viewport') {
      if (!containerRef.current) return;
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            attach();
            io.disconnect();
          }
        },
        { rootMargin: '200px' },
      );
      io.observe(containerRef.current);
      cleanup = () => io.disconnect();
    }

    return () => cleanup?.();
  }, [started, videoSrc, src, lazyMode]);

  return (
    <div
      ref={containerRef}
      className={[
        'relative flex h-full w-full bg-gray-600',
        curved ? 'overflow-hidden rounded-xl' : '',
        className || '',
      ].join(' ')}
    >
      <video
        ref={videoElRef}
        src={videoSrc}
        className="h-full w-full"
        controls={started}
        playsInline
        preload={started ? 'auto' : videoSrc ? 'metadata' : 'none'}
      />

      {!started && (
        <div
          className="absolute inset-0 cursor-pointer select-none"
          role="button"
          aria-label="Play video"
          tabIndex={0}
          onClick={startPlayback}
        >
          <img
            src={thumbnail}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 grid place-items-center">
            <div
              className="flex items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-md transition hover:scale-[1.04] active:scale-95"
              style={{ width: 72, height: 72 }}
            >
              <Play aria-hidden className="h-8 w-8" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
