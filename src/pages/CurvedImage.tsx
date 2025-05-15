import { ribbonPaths } from '@/types/RibbonTypes';
import { RibbonStyleTypes } from '@/types/RibbonTypes';
interface CurvedImageProps {
  src: string;
  curveStyle?: RibbonStyleTypes;
  darkened?: boolean;
}

export const CurvedImage = ({
  src,
  curveStyle = 'Ellipse',
  darkened = true,
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

      <div className="relative grid h-[550px] w-full grid-cols-1 grid-rows-1">
        <div className="clipped-image-bottom relative col-start-1 row-start-1 grid h-[570px] w-full overflow-hidden md:h-[580px]">
          <div
            className={`bg-tertiary-blue col-start-1 row-start-1 h-full w-full`}
          />
        </div>

        <div className="clipped-image-bottom relative col-start-1 row-start-1 h-[550px] w-full overflow-hidden">
          <img
            src={src}
            className="col-start-1 row-start-1 min-h-[550px] w-full object-cover"
            alt="Header image"
          />
        </div>
        {darkened && (
          <div className="clipped-image-bottom relative col-start-1 row-start-1 h-[550px] w-full overflow-hidden bg-gradient-to-r from-black/80 via-black/0 to-black/0" />
        )}
      </div>
    </>
  );
};
