import { gsap } from 'gsap';
import type { Artwork } from '@/data/gallery/artworks';

type ArtworkCardProps = {
  artwork: Artwork;
  openModal: (id: string) => void;
};

const ArtworkCard = ({ artwork, openModal }: ArtworkCardProps) => {
  const { id, artists, age, country, locationDetail, event, thumbUrl } = artwork;
  const artistText = artists.join(' & ');

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

  const locationText = [locationDetail, country].filter(Boolean).join(', ');

  return (
    <div id={id} className="relative h-full w-full rounded-lg">
      <div className="rounded-lg shadow-md shadow-gray-600">
        <section className="relative h-32 w-full select-none overflow-hidden rounded-t-lg md:h-60 xl:h-52">
          <img
            src={thumbUrl}
            alt={artistText || 'Artwork'}
            onMouseEnter={manageEnter}
            onMouseLeave={manageLeave}
            onClick={() => openModal(id)}
            className="absolute inset-0 h-full w-full cursor-pointer object-cover object-center"
          />
          {locationText && (
            <div
              className="absolute bottom-0 right-0 w-fit max-w-full rounded-tl-lg bg-[#ffffff80]"
              style={{ backdropFilter: 'blur(13px)' }}
            >
              <p className="max-w-full truncate px-4 py-2 text-right text-xs font-normal xl:text-sm">
                {locationText}
              </p>
            </div>
          )}
        </section>

        <section className="relative h-36 w-full overflow-hidden rounded-b-lg xl:h-44">
          {artistText && (
            <p className="truncate p-4 text-base font-semibold xl:text-xl">
              {artistText}
            </p>
          )}
          {age != null && (
            <p className="truncate px-4 pb-4 text-sm font-normal xl:text-base">
              {age} years old
            </p>
          )}
          <p className="truncate px-4 pb-2 text-sm text-gray-600">{event}</p>
          <div className="-mt-1 flex xl:mt-4">
            <button
              onClick={() => openModal(id)}
              className="mx-4 w-full cursor-pointer rounded bg-primary py-3 text-center text-sm tracking-wide text-text-inverse"
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
