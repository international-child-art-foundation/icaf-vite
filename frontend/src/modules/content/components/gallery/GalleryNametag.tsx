import { formatArtistName } from '@/utils/galleryProcessing';
import { TResolvedArtwork } from '@/modules/content/types/Gallery';
import { DescriptionScroll } from './DescriptionScroll';

export const galleryNametag = (artwork: TResolvedArtwork) => {
  const name =
    (artwork.artists?.length ?? 0) > 0
      ? formatArtistName(artwork.artists ?? [], artwork.lastInitial)
      : null;
  const location = [artwork.region, artwork.country].filter(Boolean).join(', ');
  const theme = [artwork.theme_family, artwork.theme_instance]
    .filter(Boolean)
    .join(' ');
  const classroomSticker =
    artwork.groupType === 'classroom' && artwork.groupOwnerName
      ? `Part of ${artwork.groupOwnerName}'s classroom`
      : artwork.groupTitle
        ? `Part of ${artwork.groupTitle}`
        : null;

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        backgroundImage:
          'linear-gradient(to top right, #0286C3, #168C39, #FBB22E, #EE2F4D, #834CAD)',
      }}
    >
      <div className="m-[3px] rounded-xl bg-white px-4 py-3 text-neutral-700">
        {(classroomSticker || theme) && (
          <div className="mb-2 flex flex-wrap gap-1.5 pr-6">
            {classroomSticker && (
              <span className="rounded-full bg-[#FBB22E]/25 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#775000]">
                {classroomSticker}
              </span>
            )}
            {theme && (
              <span className="rounded-full bg-[#0286C3]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#026997]">
                {theme}
              </span>
            )}
          </div>
        )}
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
            {artwork.age}
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
