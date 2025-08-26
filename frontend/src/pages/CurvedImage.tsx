import { ribbonPaths } from '@/types/RibbonTypes';
import { RibbonStyleTypes } from '@/types/RibbonTypes';
import { useId } from 'react';

interface CurvedImageProps {
  src: string;
  curveStyle?: RibbonStyleTypes;
  darkened?: boolean;
  gradientDefinition?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  objectPosition?: string; //'center top', 'center bottom', '50% 30%'
  scale?: number;
  height?: string;
}

export const CurvedImage = ({
  src,
  curveStyle = 'Ellipse',
  darkened = true,
  gradientDefinition,
  objectFit = 'cover',
  objectPosition = 'center',
  scale = 1,
  height = '550px',
}: CurvedImageProps) => {
  const clipPathId = useId();
  const clipPathClass = `clipped-image-${clipPathId}`;

  return (
    <>
      <svg width="0" height="0">
        <defs>
          <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
            <path d={ribbonPaths[curveStyle].bottom} />
          </clipPath>
        </defs>
      </svg>

      <style jsx>{`
        .${clipPathClass} {
          clip-path: url(#${clipPathId});
        }
      `}</style>

      <div
        className={`relative grid w-full grid-cols-1 grid-rows-1`}
        style={{ height }}
      >
        <div
          className={`${clipPathClass} relative col-start-1 row-start-1 grid w-full overflow-hidden`}
          style={{ height: `calc(${height} + 20px)` }}
        >
          <div
            className={`bg-tertiary-blue col-start-1 row-start-1 h-full w-full`}
          />
        </div>

        <div
          className={`${clipPathClass} relative col-start-1 row-start-1 grid h-full w-full overflow-hidden`}
        >
          <div
            className={`bg-tertiary-blue col-start-1 row-start-1 h-full w-full`}
          />
        </div>

        <div
          className={`${clipPathClass} relative col-start-1 row-start-1 w-full overflow-hidden`}
          style={{ height }}
        >
          <img
            src={src}
            className="col-start-1 row-start-1 h-full w-full"
            style={{
              objectFit: objectFit,
              objectPosition: objectPosition,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }}
            alt="Header image"
          />
        </div>

        {darkened && (
          <div
            className={`${clipPathClass} relative col-start-1 row-start-1 w-full overflow-hidden ${gradientDefinition ? gradientDefinition : 'bg-gradient-to-r from-black/80 via-black/0 to-black/0'}`}
            style={{ height }}
          />
        )}
      </div>
    </>
  );
};
