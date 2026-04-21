import { formatArtistName } from '@/utils/galleryProcessing';
import { TResolvedArtwork } from '@/types/Gallery';
import { DescriptionScroll } from './DescriptionScroll';

export const galleryNametag = (artwork: TResolvedArtwork) => {
  const name =
    (artwork.artists?.length ?? 0) > 0
      ? formatArtistName(artwork.artists ?? [], artwork.lastInitial)
      : null;
  const location = [artwork.region, artwork.country].filter(Boolean).join(', ');

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        backgroundImage:
          'linear-gradient(to top right, #0286C3, #168C39, #FBB22E, #EE2F4D, #834CAD)',
      }}
    >
      <div className="m-[3px] rounded-xl bg-white px-4 py-3 text-neutral-700">
        {name && (
          <p className="pr-6 text-lg font-semibold leading-snug">{name}</p>
        )}
        {artwork.title && (
          <p className="mt-0.5 text-base font-medium italic text-neutral-900 opacity-90">
            &ldquo;{artwork.title}&rdquo;
          </p>
        )}
        {artwork.age !== undefined && (
          <p className="mt-0.5 text-sm opacity-85">
            Age {artwork.age}
            {location && (
              <span className="text-sm opacity-85"> · {location}</span>
            )}
          </p>
        )}
        {artwork.event && (
          <p className="mt-1 text-xs capitalize opacity-60">{artwork.event}</p>
        )}
        {artwork.description && (
          <>
            <p className="mt-2 text-sm opacity-90">
              {artwork.artists && artwork.artists[0] && artwork.artists[0]}{' '}
              says:
            </p>
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
