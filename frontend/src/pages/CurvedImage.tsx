import { ribbonPaths } from '@/types/RibbonTypes';
import { RibbonStyleTypes } from '@/types/RibbonTypes';
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
  return (
    <>
      <svg width="0" height="0">
        <defs>
          <clipPath id="wave-clip-bottom" clipPathUnits="objectBoundingBox">
            <path d={ribbonPaths[curveStyle].bottom} />
          </clipPath>
        </defs>
      </svg>

      <div className={`relative grid w-full grid-cols-1 grid-rows-1`} style={{ height }}>
        <div 
          className="clipped-image-bottom relative col-start-1 row-start-1 grid w-full overflow-hidden"
          style={{ height: `calc(${height} + 20px)` }} 
        >
         <div className={`bg-tertiary-blue col-start-1 row-start-1 h-full w-full`} />
        </div>
        <div className="clipped-image-bottom relative col-start-1 row-start-1 grid h-full w-full overflow-hidden">
          <div
            className={`bg-tertiary-blue col-start-1 row-start-1 h-full w-full`}
          />
        </div>

        <div className="clipped-image-bottom relative col-start-1 row-start-1 h-[550px] w-full overflow-hidden">
          <img
            src={src}
            className="col-start-1 row-start-1 w-full h-full"
            style={{
              objectFit: objectFit,
              objectPosition: objectPosition,
              transform: `scale(${scale})`,
              transformOrigin: 'center center'
            }}
            alt="Header image"
          />
        </div>
        {darkened && (
          <div
            className={`clipped-image-bottom relative col-start-1 row-start-1 h-[550px] w-full overflow-hidden ${gradientDefinition ? gradientDefinition : 'bg-gradient-to-r from-black/80 via-black/0 to-black/0'}`}
          />
        )}
      </div>
    </>
  );
};
