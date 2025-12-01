import { useId, useRef, useState, useMemo, useLayoutEffect } from 'react';
import { BannerItem } from '@/types/BannerItem';
import { ribbonPaths } from '@/types/RibbonTypes';
import { useWindowSize } from 'usehooks-ts';

interface RibbonScrollTuning {
  repeats: number;
  durationSeconds: number;
  shiftPercent: (viewportWidth: number) => number;
}

interface RibbonScrollResponsiveConfig {
  base: RibbonScrollTuning;
  sm?: RibbonScrollTuning;
  md?: RibbonScrollTuning;
  lg?: RibbonScrollTuning;
  xl?: RibbonScrollTuning;
}

interface BannerImageProps {
  data: BannerItem;
  height?: number;
  scrollConfig?: RibbonScrollResponsiveConfig;
}

const DEFAULT_SCROLL_CONFIG: RibbonScrollResponsiveConfig = {
  base: {
    repeats: 4,
    durationSeconds: 25,
    shiftPercent: (viewportWidth: number) => {
      const minW = 320;
      const start = 100;
      const slope = -0.153;
      const w = Math.max(viewportWidth, minW);
      return start + (w - minW) * slope;
    },
  },
  sm: {
    repeats: 4,
    durationSeconds: 25,
    shiftPercent: (viewportWidth: number) => {
      const minW = 640;
      const start = 53;
      const slope = -0.075;
      const w = Math.max(viewportWidth, minW);
      return start + (w - minW) * slope;
    },
  },
  md: {
    repeats: 4,
    durationSeconds: 25,
    shiftPercent: (viewportWidth: number) => {
      const minW = 768;
      const start = 49.2;
      const slope = -0.048;
      const w = Math.max(viewportWidth, minW);
      return start + (w - minW) * slope;
    },
  },
  lg: {
    repeats: 5,
    durationSeconds: 25,
    shiftPercent: (viewportWidth: number) => {
      const minW = 1024;
      const start = 40.5;
      const slope = -0.03;
      const w = Math.max(viewportWidth, minW);
      return start + (w - minW) * slope;
    },
  },
  xl: {
    repeats: 6,
    durationSeconds: 25,
    shiftPercent: (viewportWidth: number) => {
      const maxW = 1550;
      if (viewportWidth > maxW) {
        return 27.05;
      }
      const minW = 1280;
      const start = 32.6;
      const slope = -0.021;
      const clamped = Math.min(Math.max(viewportWidth, minW), maxW);
      return start + (clamped - minW) * slope;
    },
  },
};

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

function getScrollParams(
  containerWidth: number,
  viewportWidth: number,
  scrollConfig?: RibbonScrollResponsiveConfig,
):
  | {
      repeats: number;
      durationSeconds: number;
      shiftPercent: number;
    }
  | undefined {
  if (containerWidth <= 0 || viewportWidth <= 0) return undefined;

  const cfg = scrollConfig ?? DEFAULT_SCROLL_CONFIG;

  let tuning: RibbonScrollTuning | undefined = cfg.base;

  if (viewportWidth >= 1280 && cfg.xl) {
    tuning = cfg.xl;
  } else if (viewportWidth >= 1024 && cfg.lg) {
    tuning = cfg.lg;
  } else if (viewportWidth >= 768 && cfg.md) {
    tuning = cfg.md;
  } else if (viewportWidth >= 640 && cfg.sm) {
    tuning = cfg.sm;
  }

  if (!tuning) return undefined;

  const repeats = tuning.repeats > 0 ? tuning.repeats : 1;
  const durationSeconds = tuning.durationSeconds;
  const shiftPercent = tuning.shiftPercent(viewportWidth);

  return {
    repeats,
    durationSeconds,
    shiftPercent,
  };
}

export const BannerImage = ({
  data,
  height = 550,
  scrollConfig,
}: BannerImageProps) => {
  const { width: viewportWidth } = useWindowSize();
  const baseId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const measureContainer = () => {
      const rect = element.getBoundingClientRect();
      setContainerWidth(rect.width);
    };

    measureContainer();

    let resizeObserver: ResizeObserver | undefined;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        measureContainer();
      });
      resizeObserver.observe(element);
    } else {
      window.addEventListener('resize', measureContainer);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', measureContainer);
      }
    };
  }, []);

  const effectiveHeight = height - 100;
  const topClipId = `${baseId}-top`;
  const bottomClipId = `${baseId}-bottom`;

  const textPathId = `${baseId}-text-path-top`;
  const textPathNormalized = ribbonPaths.PeakValley.topText;

  const baseText = data.bannerText || 'INTERNATIONAL CHILD ART FOUNDATION';
  const separator = ' • ';

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

  const scrollParams = useMemo(
    () => getScrollParams(containerWidth, viewportWidth, scrollConfig),
    [containerWidth, viewportWidth, scrollConfig],
  );

  const {
    repeatedText,
    durationSeconds,
    shiftPercent,
  }: {
    repeatedText: string;
    durationSeconds: number;
    shiftPercent: number;
  } = useMemo(() => {
    if (!hasText || !scrollParams) {
      return { repeatedText: '', durationSeconds: 0, shiftPercent: 0 };
    }

    const text = Array.from({ length: scrollParams.repeats })
      .map(() => baseText)
      .join(separator);

    return {
      repeatedText: text,
      durationSeconds: scrollParams.durationSeconds,
      shiftPercent: scrollParams.shiftPercent,
    };
  }, [hasText, scrollParams, baseText, separator]);

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
      <svg width="0" height="0" aria-hidden="true" focusable="false">
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

        {hasText &&
          textPathScaled &&
          repeatedText &&
          durationSeconds > 0 &&
          shiftPercent !== 0 && (
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
                    to={`-${shiftPercent}%`}
                    dur={`${durationSeconds}s`}
                    repeatCount="indefinite"
                    calcMode="linear"
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
