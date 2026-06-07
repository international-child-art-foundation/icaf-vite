import type { ThemeVisualProps } from '../types';

export function CherryBlossomVisual({ isActive = false }: ThemeVisualProps) {
  const driftAnimation = isActive
    ? '[animation:cherry-drift_7s_ease-in-out_1_forwards]'
    : '';
  const slowDriftAnimation = isActive
    ? '[animation:cherry-drift_9s_ease-in-out_1_forwards]'
    : '';
  const mediumDriftAnimation = isActive
    ? '[animation:cherry-drift_8s_ease-in-out_1_forwards]'
    : '';

  return (
    <>
      <style>
        {`
          @keyframes cherry-drift {
            0% { transform: translate3d(-10%, 8%, 0) rotate(0deg); opacity: 0.45; }
            50% { transform: translate3d(12%, -10%, 0) rotate(14deg); opacity: 0.85; }
            100% { transform: translate3d(28%, 14%, 0) rotate(28deg); opacity: 0.45; }
          }
        `}
      </style>
      <div className="absolute inset-0 bg-[#fff7fb]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(250,170,205,0.72),transparent_32%),linear-gradient(130deg,rgba(255,255,255,0.86),rgba(250,216,229,0.78)_48%,rgba(103,74,99,0.82))]" />
      <div className="absolute -left-8 top-3 h-16 w-36 rotate-[-10deg] rounded-full border-t-[10px] border-[#6f4b5d]/70" />
      <span
        className={`absolute left-[56%] top-4 h-5 w-3 rounded-[60%_40%_60%_40%] bg-[#f6a8c8] opacity-80 ${driftAnimation}`}
      />
      <span
        className={`absolute left-[72%] top-10 h-4 w-2.5 rounded-[60%_40%_60%_40%] bg-white/80 ${slowDriftAnimation}`}
      />
      <span
        className={`absolute left-[42%] top-16 h-3.5 w-2 rounded-[60%_40%_60%_40%] bg-[#e97faa]/85 ${mediumDriftAnimation}`}
      />
    </>
  );
}
