import {
  formatArtworkByline,
  formatArtworkContext,
  getArtistDisplayName,
} from '@/utils/galleryProcessing';
import type { TResolvedArtwork } from '@/modules/content/types/Gallery';
import { DescriptionScroll } from './DescriptionScroll';

export const galleryNametag = (artwork: TResolvedArtwork) => {
  const name = getArtistDisplayName(artwork.artists ?? [], artwork.lastInitial);
  const theme = [artwork.theme_family, artwork.theme_instance]
    .filter(Boolean)
    .join(' ');
  const artworkContext = formatArtworkContext(artwork);
  const byline = formatArtworkByline(artwork);
  const ageLine = artwork.age !== undefined ? `Age ${artwork.age}` : null;

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        backgroundImage:
          'linear-gradient(to top right, #0286C3, #168C39, #FBB22E, #EE2F4D, #834CAD)',
      }}
    >
      <div className="m-[3px] rounded-xl bg-white px-4 py-3 text-neutral-700">
        {(artworkContext || theme) && (
          <div className="mb-2 flex flex-wrap gap-1.5 pr-6">
            {artworkContext && (
              <span className="rounded-full bg-[#FBB22E]/25 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#775000]">
                {artworkContext}
              </span>
            )}
            {theme && (
              <span className="rounded-full bg-[#0286C3]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#026997]">
                {theme}
              </span>
            )}
          </div>
        )}
        <p className="pr-6 text-lg font-semibold leading-snug">{name}</p>
        <p className="mt-0.5 pr-6 text-sm font-medium text-neutral-600">
          {byline}
        </p>
        {artwork.title && (
          <p className="mt-0.5 text-base font-medium italic text-neutral-900 opacity-90">
            &ldquo;{artwork.title}&rdquo;
          </p>
        )}
        {ageLine && <p className="mt-0.5 text-sm opacity-85">{ageLine}</p>}
        {artwork.description && (
          <>
            <p className="mt-2 text-sm opacity-90">{name} says:</p>
            <DescriptionScroll
              key={`desc-${artwork.id}`}
              description={artwork.description}
            />
          </>
        )}
      </div>
    </div>
  );
};
