import { gsap } from 'gsap';
import type { TResolvedArtwork } from '@/types/Gallery';
import { formatArtistName } from '@/utils/galleryProcessing';

type ArtworkCardProps = {
  artwork: TResolvedArtwork;
  openModal: (id: string) => void;
};

const ArtworkCard = ({ artwork, openModal }: ArtworkCardProps) => {
  const { id, artists, lastInitial, age, country, region, event, thumbUrl } =
    artwork;
  const artistText = formatArtistName(artists ?? [], lastInitial);

  const manageEnter = (e: React.MouseEvent<HTMLImageElement>) => {
    gsap.to(e.target, {
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 0.3,
      ease: 'power3.inOut',
    });
  };

  const manageLeave = (e: React.MouseEvent<HTMLImageElement>) => {
    gsap.to(e.target, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.3,
      ease: 'power3.inOut',
    });
  };

  const locationText = [region, country].filter(Boolean).join(', ');

  return (
    <div id={id} className="relative h-full w-full rounded-lg">
      <div className="rounded-lg shadow-md shadow-gray-400">
        <section className="relative h-32 w-full select-none overflow-hidden rounded-t-lg sm:h-52 md:h-60 xl:h-52">
          <img
            src={thumbUrl}
            alt={artistText || 'Artwork'}
            onMouseEnter={manageEnter}
            onMouseLeave={manageLeave}
            onClick={() => openModal(id)}
            className="absolute inset-0 h-full w-full cursor-pointer object-cover object-center"
          />
          {/* {locationText && (
            <div
              className="absolute bottom-0 right-0 w-fit max-w-full rounded-tl-lg bg-[#ffffff80]"
              style={{ backdropFilter: 'blur(13px)' }}
            >
              <p className="max-w-full truncate px-4 py-2 text-right text-xs font-normal xl:text-sm">
                {locationText}
              </p>
            </div>
          )} */}
        </section>

        <section className="relative flex w-full flex-col gap-4 rounded-b-lg p-4 py-6">
          <div>
            {artistText && (
              <p className="truncate text-base font-semibold xl:text-xl">
                {artistText}
              </p>
            )}
            <p className="truncate text-sm text-gray-500">
              {[age != null ? `Age ${age}` : null, locationText].filter(Boolean).join(' · ') || '\u00A0'}
            </p>
            <p className="truncate text-sm text-gray-400">
              {event || '\u00A0'}
            </p>
          </div>
          <div className="flex">
            <button
              type="button"
              onClick={() => openModal(id)}
              className="bg-primary text-text-inverse w-full cursor-pointer rounded py-3 text-center text-sm tracking-wide"
            >
              View
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ArtworkCard;
