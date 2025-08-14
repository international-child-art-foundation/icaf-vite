import { BannerItem } from '@/types/BannerItem';
import { ribbonPaths } from '@/types/RibbonTypes';
import { useId } from 'react';

interface BannerImageProps {
  data: BannerItem;
  height: string;
}

export const BannerImage = ({ data, height = '550px' }: BannerImageProps) => {
  const baseId = useId();
  const topClipId = `${baseId}-top`;
  const bottomClipId = `${baseId}-bottom`;
  const topClipClass = `clipped-top-${baseId}`;
  const bottomClipClass = `clipped-bottom-${baseId}`;

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
        style={{ height }}
      >
        <div
          className={`${bottomClipClass} relative col-start-1 row-start-1 w-full overflow-hidden`}
          style={{ height }}
        >
          <div
            className={`${topClipClass} relative col-start-1 row-start-1 grid h-full w-full overflow-hidden`}
          >
            <div className="col-start-1 row-start-1 h-full w-full bg-[#DA1E40]" />

            {/* {darkened && (
              <div
                className={`col-start-1 row-start-1 w-full ${gradientDefinition ? gradientDefinition : 'bg-gradient-to-r from-black/80 via-black/0 to-black/0'}`}
                style={{ height }}
              />
            )} */}
          </div>
        </div>
        <div
          className={`${bottomClipClass} relative col-start-1 row-start-1 mt-12 w-full overflow-hidden`}
          style={{ height }}
        >
          <div
            className={`${topClipClass} relative col-start-1 row-start-1 grid h-full w-full overflow-hidden`}
          >
            <img
              src={data.src}
              className="col-start-1 row-start-1 h-full w-full"
              style={{
                objectFit: data.objectFit,
                objectPosition: data.objectPosition,
                transform: `scale(${data.scale})`,
                transformOrigin: 'center center',
              }}
              alt="Banner image"
            />

            {/* {darkened && (
              <div
                className={`col-start-1 row-start-1 w-full ${gradientDefinition ? gradientDefinition : 'bg-gradient-to-r from-black/80 via-black/0 to-black/0'}`}
                style={{ height }}
              />
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};
