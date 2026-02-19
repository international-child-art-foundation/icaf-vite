import { ribbonPaths } from '@/types/RibbonTypes';
import { RibbonStyleTypes } from '@/types/RibbonTypes';
import { useId, useState } from 'react';

interface CurvedImageProps {
  src: string;
  curveStyle?: RibbonStyleTypes;
  darkened?: boolean;
  gradientDefinition?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  objectPosition?: string;
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
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <svg width="0" height="0">
        <defs>
          <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
            <path d={ribbonPaths[curveStyle].bottom} />
          </clipPath>
        </defs>
      </svg>

      <style>{`
        .${clipPathClass} {
          clip-path: url(#${clipPathId});
        }
      `}</style>

      <div
        className="max-w-screen-3xl relative mx-auto grid w-full select-none grid-cols-1 grid-rows-1"
        style={{ height }}
      >
        <div
          className={`${clipPathClass} relative col-start-1 row-start-1 grid w-full overflow-hidden`}
          style={{ height: `calc(${height} + 20px)` }}
        >
          <div className="bg-tertiary-blue col-start-1 row-start-1 h-full w-full" />
        </div>

        <div
          className={`${clipPathClass} relative col-start-1 row-start-1 w-full overflow-hidden`}
          style={{ height }}
        >
          <img
            src={src}
            className={
              'col-start-1 row-start-1 h-full w-full transition-opacity duration-500 ' +
              (isLoaded ? 'opacity-100' : 'opacity-0')
            }
            style={{
              objectFit,
              objectPosition,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }}
            alt=""
            loading="eager"
            onLoad={() => setIsLoaded(true)}
          />
        </div>

        {darkened && (
          <div
            className={`${clipPathClass} relative col-start-1 row-start-1 w-full overflow-hidden ${
              gradientDefinition
                ? gradientDefinition
                : 'bg-gradient-to-r from-black/80 via-black/0 to-black/0'
            }`}
            style={{ height }}
          />
        )}
      </div>
    </>
  );
};
