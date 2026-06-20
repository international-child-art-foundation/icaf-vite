import type { TResolvedArtwork } from '@/modules/content/types/Gallery';
import { GALLERY_OUTLINE_GRADIENT } from './galleryOutline';
import { GalleryArtworkInfo } from './GalleryArtworkInfo';
import { KudosControls } from './KudosControls';

export const galleryNametag = (
  artwork: TResolvedArtwork,
  onKudosApplied?: (artId: string, amount: number) => void,
) => {
  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        backgroundImage: GALLERY_OUTLINE_GRADIENT,
      }}
    >
      <div className="m-[3px] rounded-xl bg-white px-4 py-3 text-neutral-700">
        <GalleryArtworkInfo
          artwork={artwork}
          variant="nametag"
          descriptionMode="scroll"
        />
        <KudosControls
          artwork={artwork}
          className="mt-3 h-9"
          compact
          layout="nametag"
          onKudosApplied={onKudosApplied}
        />
      </div>
    </div>
  );
};
