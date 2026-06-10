import type { CSSProperties } from 'react';
import type { ThemeVisualProps } from '../types';
import { DEFAULT_THEME_VISUAL_DURATION_SECONDS } from '@/modules/content/components/gallery/themeVisuals/constants';

const burstDots = Array.from({ length: 48 }, (_, index) => {
  const ray = Math.floor(index / 6);
  const step = (index % 6) + 1;

  return {
    index,
    ray,
    step,
  };
});

export function FourthOfJulyVisual({
  durationSeconds = DEFAULT_THEME_VISUAL_DURATION_SECONDS,
  isActive = false,
}: ThemeVisualProps) {
  const activeClass = isActive ? 'fourth-firework-active' : '';

  return (
    <>
      <style>
        {`
          @keyframes fourth-firework-shell {
            0% {
              opacity: 0;
              transform: translate3d(210px, 76px, 0) scale(0.7);
            }

            5% {
              opacity: 1;
            }

            42% {
              opacity: 1;
              transform: translate3d(210px, 12px, 0) scale(0.82);
            }

            50% {
              transform: translate3d(210px, 50px, 0) scale(0.78);
            }

            64% {
              transform: translate3d(176px, 36px, 0) scale(0.82);
            }

            78% {
              opacity: 1;
              transform: translate3d(140px, 30px, 0) scale(1);
            }

            100% {
              opacity: 1;
              transform: translate3d(140px, 30px, 0) scale(1);
            }
          }

          @keyframes fourth-firework-core {
            0% {
              opacity: 0;
              transform: scale(0.7);
            }

            5% {
              opacity: 1;
            }

            72% {
              opacity: 1;
              transform: scale(0.9);
            }

            78% {
              opacity: 0;
              transform: scale(0.25);
            }

            100% {
              opacity: 0;
              transform: scale(0.25);
            }
          }

          @keyframes fourth-firework-burst-dot {
            0% {
              opacity: 0;
              transform:
                rotate(var(--angle))
                translateX(0px)
                scale(0.2);
              background-color: var(--color-a);
            }

            77% {
              opacity: 0;
              transform:
                rotate(var(--angle))
                translateX(0px)
                scale(0.2);
              background-color: var(--color-a);
            }

            80% {
              opacity: 1;
              transform:
                rotate(var(--angle))
                translateX(calc(var(--distance) * 0.35))
                scale(1);
              background-color: var(--color-a);
            }

            86% {
              opacity: 0.75;
              transform:
                rotate(var(--angle))
                translateX(calc(var(--distance) * 0.72))
                scale(0.85);
              background-color: var(--color-b);
            }

            92% {
              opacity: 1;
              transform:
                rotate(var(--angle))
                translateX(var(--distance))
                scale(0.72);
              background-color: var(--color-c);
            }

            100% {
              opacity: 0;
              transform:
                rotate(var(--angle))
                translateX(calc(var(--distance) * 1.08))
                scale(0.2);
              background-color: var(--color-b);
            }
          }

          .fourth-firework-visual {
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
          }

          .fourth-firework-shell {
            position: absolute;
            left: 0;
            top: 0;
            width: 0;
            height: 0;
            opacity: 0;
            transform: translate3d(210px, 76px, 0) scale(0.7);
            will-change: transform, opacity;
          }

          .fourth-firework-core {
            position: absolute;
            left: -3px;
            top: -3px;
            width: 3px;
            height: 6px;
            border-radius: 999px;
            background: #f8fafc;
            box-shadow:
              0 0 6px rgba(255, 255, 255, 0.95),
              0 0 14px rgba(239, 68, 68, 0.9);
            opacity: 0;
            will-change: transform, opacity;
          }

          .fourth-firework-dot {
            position: absolute;
            left: -2px;
            top: -2px;
            width: 4px;
            height: 4px;
            border-radius: 999px;
            opacity: 0;
            background-color: var(--color-a);
            transform:
              rotate(var(--angle))
              translateX(0px)
              scale(0.2);
            transform-origin: center;
            will-change: transform, opacity, background-color;
          }

          .fourth-firework-active .fourth-firework-shell {
            animation:
              fourth-firework-shell
              var(--theme-visual-duration)
              cubic-bezier(.12, .82, .22, 1)
              1
              both;
          }

          .fourth-firework-active .fourth-firework-core {
            animation:
              fourth-firework-core
              var(--theme-visual-duration)
              linear
              1
              both;
          }

          .fourth-firework-active .fourth-firework-dot {
            animation:
              fourth-firework-burst-dot
              var(--theme-visual-duration)
              cubic-bezier(.15, .75, .24, 1)
              1
              both;
          }
        `}
      </style>

      <div
        className={`fourth-firework-visual ${activeClass}`}
        style={
          {
            '--theme-visual-duration': `${durationSeconds}s`,
          } as CSSProperties
        }
      >
        <div className="fourth-firework-shell">
          <div className="fourth-firework-core" />

          {burstDots.map(({ index, ray, step }) => {
            const angle = ray * 45;
            const distance = 7 + step * 5;

            return (
              <div
                key={index}
                className="fourth-firework-dot"
                style={
                  {
                    '--angle': `${angle}deg`,
                    '--distance': `${distance}px`,
                    '--color-a': '#ffffff',
                    '--color-b': ray % 2 === 0 ? '#ef4444' : '#3b82f6',
                    '--color-c': ray % 2 === 0 ? '#facc15' : '#ffffff',
                  } as CSSProperties
                }
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
