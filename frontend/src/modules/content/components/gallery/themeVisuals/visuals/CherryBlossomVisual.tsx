import type { CSSProperties } from 'react';
import type { ThemeVisualProps } from '../types';
import { DEFAULT_THEME_VISUAL_DURATION_SECONDS } from '../constants';

export const CHERRY_BLOSSOM_VISUAL_DURATION_SECONDS =
  DEFAULT_THEME_VISUAL_DURATION_SECONDS;

export function CherryBlossomVisual({
  durationSeconds = CHERRY_BLOSSOM_VISUAL_DURATION_SECONDS,
  isActive = false,
}: ThemeVisualProps) {
  const activeClass = isActive ? 'cherry-blossom-active' : '';

  return (
    <div
      className={`absolute inset-0 ${activeClass}`}
      style={
        {
          '--theme-visual-duration': `${durationSeconds}s`,
        } as CSSProperties
      }
    >
      <style>
        {`
          @keyframes cherry-drift {
            0% { transform: translate3d(-10%, 8%, 0) rotate(0deg); opacity: 0.45; }
            50% { transform: translate3d(12%, -10%, 0) rotate(14deg); opacity: 0.85; }
            100% { transform: translate3d(28%, 14%, 0) rotate(28deg); opacity: 0.45; }
          }

          .cherry-blossom-active .cherry-blossom-petal {
            animation:
              cherry-drift
              var(--theme-visual-duration)
              ease-in-out
              1
              forwards;
          }

        `}
      </style>
      <div className="absolute inset-0 bg-[#fff7fb]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(250,170,205,0.72),transparent_32%),linear-gradient(130deg,rgba(255,255,255,0.86),rgba(250,216,229,0.78)_48%,rgba(103,74,99,0.82))]" />
      <div className="absolute -left-8 top-3 h-16 w-36 rotate-[-10deg] rounded-full border-t-[10px] border-[#6f4b5d]/70" />
      <span
        className="cherry-blossom-petal absolute left-[56%] top-4 h-5 w-3 rounded-[60%_40%_60%_40%] bg-[#f6a8c8] opacity-80"
      />
      <span
        className="cherry-blossom-petal absolute left-[72%] top-10 h-4 w-2.5 rounded-[60%_40%_60%_40%] bg-white/80"
      />
      <span
        className="cherry-blossom-petal absolute left-[42%] top-16 h-3.5 w-2 rounded-[60%_40%_60%_40%] bg-[#e97faa]/85"
      />
    </div>
  );
}
