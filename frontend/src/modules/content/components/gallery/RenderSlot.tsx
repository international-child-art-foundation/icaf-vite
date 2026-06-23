import { TResolvedArtwork } from '@/modules/content/types/Gallery';
import { SlotState } from './useGallerySlideshowState';

export const DESKTOP_SLIDE_TRANSITION_MS = 700;

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

  const artwork = artworks[slot.artworkIdx];
  if (!artwork) return null;
  const kbAnim = KB_ANIMS[slot.animKey % KB_ANIMS.length];
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        opacity: isTop ? 1 : 0,
        transition: `opacity ${DESKTOP_SLIDE_TRANSITION_MS}ms ease-in-out`,
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
          animationDuration: `${intervalMs + DESKTOP_SLIDE_TRANSITION_MS * 2}ms`,
          animationTimingFunction: 'ease-in-out',
          animationFillMode: 'both',
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      />
    </div>
  );
};
