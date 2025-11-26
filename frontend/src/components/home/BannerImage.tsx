import { useEffect, useId, useRef, useState } from 'react';
import { BannerItem } from '@/types/BannerItem';
import { ribbonPaths } from '@/types/RibbonTypes';

interface BannerImageProps {
  data: BannerItem;
  height: number;
}

function scalePath(
  path: string,
  width: number,
  height: number,
  offsetY = 0,
): string {
  const numberRegex = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;
  let index = 0;
  return path.replace(numberRegex, (match) => {
    const value = parseFloat(match);
    if (Number.isNaN(value)) return match;
    const isX = index % 2 === 0;
    index += 1;
    const scaled = isX ? width * value : height * value + offsetY;
    return scaled.toString();
  });
}

export const BannerImage = ({ data, height = 550 }: BannerImageProps) => {
  const baseId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setContainerWidth(width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const topClipId = `${baseId}-top`;
  const bottomClipId = `${baseId}-bottom`;
  const topClipClass = `clipped-top-${baseId}`;
  const bottomClipClass = `clipped-bottom-${baseId}`;
  const effectiveHeight = height - 100;

  const textEdge = 'top';
  const textPathId = `${baseId}-text-path-${textEdge}`;
  const textPathNormalized = ribbonPaths.PeakValley.topText;

  const baseText = data.bannerText || 'INTERNATIONAL CHILD ART FOUNDATION';
  const separator = ' \u2022 ';
  const repeats = 50;
  const repeatedText = Array.from({ length: repeats })
    .map(() => baseText)
    .join(separator);

  const hasText = baseText.length > 0 && containerWidth > 0;
  const verticalTextOffset = effectiveHeight * 0.05;
  const textPathScaled =
    hasText && textPathNormalized
      ? scalePath(
          textPathNormalized,
          containerWidth,
          effectiveHeight,
          verticalTextOffset,
        )
      : '';

  return (
    <div className="relative w-full xl:mt-12" ref={containerRef}>
      <svg width="0" height="0">
        <defs>
          <clipPath id={topClipId} clipPathUnits="objectBoundingBox">
            <path d={ribbonPaths.PeakValley.top} />
          </clipPath>
          <clipPath id={bottomClipId} clipPathUnits="objectBoundingBox">
            <path d={ribbonPaths.PeakValley.bottom} />
          </clipPath>
        </defs>
      </svg>

      <style>{`
        .${topClipClass} {
          clip-path: url(#${topClipId});
        }
        .${bottomClipClass} {
          clip-path: url(#${bottomClipId});
        }
      `}</style>

      <div
        className="relative grid w-full grid-cols-1 grid-rows-1"
        style={{ height: effectiveHeight }}
      >
        <div
          className={`${bottomClipClass} relative col-start-1 row-start-1 w-full overflow-hidden`}
          style={{ height: effectiveHeight }}
        >
          <div
            className={`${topClipClass} relative col-start-1 row-start-1 grid h-full w-full overflow-hidden`}
          >
            <div
              className="col-start-1 row-start-1 h-full w-full bg-[#DA1E40]"
              style={{ background: data.bannerColor }}
            />
          </div>
        </div>

        <div
          className={`${bottomClipClass} relative col-start-1 row-start-1 mt-8 w-full overflow-hidden md:mt-10 lg:mt-12`}
          style={{ height: effectiveHeight }}
        >
          <div
            className={`${topClipClass} relative col-start-1 row-start-1 grid h-full w-full overflow-hidden`}
          >
            <div
              className="overflow-hidden"
              style={{ height: effectiveHeight }}
            >
              <img
                src={data.src}
                className={`col-start-1 row-start-1 w-full ${
                  data.objectFit && 'object-' + data.objectFit
                } ${data.objectPosition}`}
                alt="Banner image"
                style={{ height: effectiveHeight }}
              />
            </div>
          </div>
        </div>

        {hasText && textPathScaled && (
          <svg
            className="pointer-events-none z-20 col-start-1 row-start-1 mt-[3px] md:mt-[2px] lg:-mt-1"
            width="100%"
            height={effectiveHeight}
            viewBox={`0 0 ${containerWidth} ${effectiveHeight}`}
          >
            <defs>
              <path id={textPathId} d={textPathScaled} />
            </defs>

            <text
              fill="#ffffff"
              fontWeight="500"
              className="text-base md:text-lg lg:text-xl"
            >
              <textPath href={`#${textPathId}`} startOffset="0%">
                <animate
                  attributeName="startOffset"
                  from="0%"
                  to="-100%"
                  dur={`${Math.max(baseText.length * 2, 10)}s`}
                  repeatCount="indefinite"
                />
                {repeatedText}
              </textPath>
            </text>
          </svg>
        )}
      </div>
    </div>
  );
};
