import { TResolvedArtwork } from '@/types/Gallery';
import { SlotState } from './useGallerySlideshowState';

export const renderSlot = (
  artworks: TResolvedArtwork[],
  slot: SlotState,
  isTop: boolean,
  isPaused: boolean,
  intervalMs: number,
) => {
  const KB_ANIMS = [
    'kb-zoom-in',
    'kb-zoom-out',
    'kb-zoom-in-pan',
    'kb-zoom-out-pan',
  ] as const;
  const TRANSITION_MS = 700;

  const artwork = artworks[slot.artworkIdx];
  if (!artwork) return null;
  const kbAnim = KB_ANIMS[slot.animKey % KB_ANIMS.length];
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        opacity: isTop ? 1 : 0,
        transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
        zIndex: isTop ? 1 : 0,
      }}
    >
      <img
        key={slot.animKey}
        src={artwork.featureUrl}
        alt={artwork.alt}
        className="h-full w-full object-contain"
        style={{
          animationName: kbAnim,
          animationDuration: `${intervalMs + TRANSITION_MS * 2}ms`,
          animationTimingFunction: 'ease-in-out',
          animationFillMode: 'both',
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      />
    </div>
  );
};
