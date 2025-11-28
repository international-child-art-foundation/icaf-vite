import { useId, useRef, useState, useMemo, useLayoutEffect } from 'react';
import { BannerItem } from '@/types/BannerItem';
import { ribbonPaths } from '@/types/RibbonTypes';

interface BannerImageProps {
  data: BannerItem;
  height?: number;
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
  const dur = 900;
  const toPercent = dur * 1.4;

  const baseId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      setContainerWidth(rect.width);
    };

    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        measure();
      });
      observer.observe(element);
      return () => observer.disconnect();
    } else {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
  }, []);

  const topClipId = `${baseId}-top`;
  const bottomClipId = `${baseId}-bottom`;
  const effectiveHeight = height - 100;

  const textPathId = `${baseId}-text-path-top`;
  const textPathNormalized = ribbonPaths.PeakValley.topText;

  const baseText = data.bannerText || 'INTERNATIONAL CHILD ART FOUNDATION';
  const separator = ' \u2022 ';
  const repeats = 50;

  const repeatedText = useMemo(
    () =>
      Array.from({ length: repeats })
        .map(() => baseText)
        .join(separator),
    [baseText],
  );

  const hasText =
    !!textPathNormalized && baseText.length > 0 && containerWidth > 0;
  const verticalTextOffset = effectiveHeight * 0.05;

  const textPathScaled = useMemo(
    () =>
      hasText && textPathNormalized
        ? scalePath(
            textPathNormalized,
            containerWidth,
            effectiveHeight,
            verticalTextOffset,
          )
        : '',
    [
      hasText,
      textPathNormalized,
      containerWidth,
      effectiveHeight,
      verticalTextOffset,
    ],
  );

  const imageClassName = useMemo(() => {
    const classes = ['col-start-1', 'row-start-1', 'w-full'];
    if (data.objectFit) {
      classes.push(`object-${data.objectFit}`);
    }
    if (data.objectPosition) {
      classes.push(data.objectPosition);
    }
    return classes.join(' ');
  }, [data.objectFit, data.objectPosition]);

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

      <div
        className="relative grid w-full grid-cols-1 grid-rows-1"
        style={{ height: effectiveHeight }}
      >
        <div
          className="relative col-start-1 row-start-1 w-full overflow-hidden"
          style={{ height: effectiveHeight, clipPath: `url(#${bottomClipId})` }}
        >
          <div
            className="relative col-start-1 row-start-1 grid h-full w-full overflow-hidden"
            style={{ clipPath: `url(#${topClipId})` }}
          >
            <div
              className="col-start-1 row-start-1 h-full w-full bg-[#DA1E40]"
              style={{ background: data.bannerColor }}
            />
          </div>
        </div>

        <div
          className="relative col-start-1 row-start-1 mt-8 w-full overflow-hidden md:mt-10 lg:mt-12"
          style={{ height: effectiveHeight, clipPath: `url(#${bottomClipId})` }}
        >
          <div
            className="relative col-start-1 row-start-1 grid h-full w-full overflow-hidden"
            style={{ clipPath: `url(#${topClipId})` }}
          >
            <div
              className="overflow-hidden"
              style={{ height: effectiveHeight }}
            >
              <img
                src={data.src}
                className={imageClassName}
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
              className="select-none text-base md:text-lg lg:text-xl"
            >
              <textPath href={`#${textPathId}`} startOffset="0%">
                <animate
                  attributeName="startOffset"
                  from="0%"
                  to={`-${toPercent}%`}
                  dur={`${dur}s`}
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
