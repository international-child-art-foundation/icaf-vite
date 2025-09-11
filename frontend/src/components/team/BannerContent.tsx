import { useId, type ReactNode, CSSProperties } from 'react';
import { ribbonPaths } from '@/types/RibbonTypes';

type RibbonKey = keyof typeof ribbonPaths;

interface ClippedBannerProps {
  children: ReactNode;
  height?: number;
  ribbon?: RibbonKey;
  className?: string;
}

export function ClippedBanner({
  children,
  height = 550,
  ribbon = 'PeakValley',
  className = '',
}: ClippedBannerProps) {
  const baseId = useId();
  const topClipId = `${baseId}-top`;
  const bottomClipId = `${baseId}-bottom`;

  const topClipStyle: CSSProperties = { clipPath: `url(#${topClipId})` };
  const bottomClipStyle: CSSProperties = { clipPath: `url(#${bottomClipId})` };

  return (
    <div className={`relative w-full ${className}`} style={{ height }}>
      <svg width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={topClipId} clipPathUnits="objectBoundingBox">
            <path d={ribbonPaths[ribbon].top} />
          </clipPath>
          <clipPath id={bottomClipId} clipPathUnits="objectBoundingBox">
            <path d={ribbonPaths[ribbon].bottom} />
          </clipPath>
        </defs>
      </svg>

      <div className="relative grid h-full w-full grid-cols-1 grid-rows-1">
        <div
          className="col-start-1 row-start-1 h-full w-full overflow-hidden"
          style={bottomClipStyle}
        >
          <div
            className="col-start-1 row-start-1 grid h-full w-full overflow-hidden"
            style={topClipStyle}
          >
            <div className="h-full w-full">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
