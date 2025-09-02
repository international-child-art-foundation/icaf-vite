import { BannerItem } from '@/types/BannerItem';
import { ribbonPaths } from '@/types/RibbonTypes';
import { useId } from 'react';
interface BannerImageProps {
  data: BannerItem;
  height: number;
}

export const BannerImage = ({ data, height = 550 }: BannerImageProps) => {
  const baseId = useId();
  const topClipId = `${baseId}-top`;
  const bottomClipId = `${baseId}-bottom`;
  const topClipClass = `clipped-top-${baseId}`;
  const bottomClipClass = `clipped-bottom-${baseId}`;
  const effectiveHeight = height - 100;

  return (
    <div className="relative w-full">
      <svg width="0" height="0">
        <defs>
          <clipPath id={topClipId} clipPathUnits="objectBoundingBox">
            <path d={ribbonPaths['PeakValley'].top} />
          </clipPath>
          <clipPath id={bottomClipId} clipPathUnits="objectBoundingBox">
            <path d={ribbonPaths['PeakValley'].bottom} />
          </clipPath>
        </defs>
      </svg>

      <style jsx>{`
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
            <div className="col-start-1 row-start-1 h-full w-full bg-[#DA1E40]" />
          </div>
        </div>
        <div
          className={`${bottomClipClass} relative col-start-1 row-start-1 mt-4 w-full overflow-hidden lg:mt-8`}
          style={{ height: effectiveHeight }}
        >
          <div
            className={`${topClipClass} relative col-start-1 row-start-1 grid h-full w-full overflow-hidden`}
          >
            <div
              className={`overflow-hidden`}
              style={{ height: effectiveHeight }}
            >
              <img
                src={data.src}
                className={`col-start-1 row-start-1 w-full ${data.objectFit && 'object-' + data.objectFit} ${data.objectPosition}`}
                alt="Banner image"
                style={{ height: effectiveHeight }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
