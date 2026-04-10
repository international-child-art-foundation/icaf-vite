import { TResolvedArtwork } from '@/types/Gallery';

interface Props {
  artworks: TResolvedArtwork[];
  currentIdx: number;
  dragX: number;
  peekDir: 1 | -1;
  showPeek: boolean;
  withTransition: boolean;
  screenW: number;
}

export const MobileImageSwiper = ({
  artworks,
  currentIdx,
  dragX,
  peekDir,
  showPeek,
  withTransition,
  screenW,
}: Props) => {
  const peekIdx = (currentIdx + peekDir + artworks.length) % artworks.length;
  const peekOffset = peekDir > 0 ? screenW : -screenW;
  const transition = withTransition
    ? 'transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    : 'none';

  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0 overflow-hidden bg-white"
        style={{ transform: `translateX(${dragX}px)`, transition, zIndex: 2 }}
      >
        <img
          src={artworks[currentIdx].displayUrl}
          alt={artworks[currentIdx].alt}
          className="h-full w-full object-contain"
        />
      </div>

      {showPeek && (
        <div
          className="absolute inset-0 overflow-hidden bg-white"
          style={{
            transform: `translateX(${dragX + peekOffset}px)`,
            transition,
            zIndex: 1,
          }}
        >
          <img
            src={artworks[peekIdx].displayUrl}
            alt={artworks[peekIdx].alt}
            className="h-full w-full object-contain"
          />
        </div>
      )}
    </div>
  );
};
