import { useEffect, useRef, useState } from 'react';

type ThemeVisualDebugProps = {
  durationSeconds: number;
  isActive: boolean;
};

export function ThemeVisualDebug({
  durationSeconds,
  isActive,
}: ThemeVisualDebugProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      startedAtRef.current = null;
      setElapsedSeconds(0);
      return;
    }

    let frameId = 0;

    function tick(now: number) {
      if (startedAtRef.current === null) {
        startedAtRef.current = now;
      }

      const nextElapsedSeconds = Math.min(
        (now - startedAtRef.current) / 1000,
        durationSeconds,
      );

      setElapsedSeconds(nextElapsedSeconds);

      if (nextElapsedSeconds < durationSeconds) {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [durationSeconds, isActive]);

  const percent =
    durationSeconds > 0
      ? Math.min((elapsedSeconds / durationSeconds) * 100, 100)
      : 100;

  return (
    <div className="pointer-events-none absolute bottom-0 right-1 z-30 flex items-end gap-1 font-mono text-[12px] leading-none text-black">
      <span>{percent.toFixed(1)}%</span>
    </div>
  );
}
