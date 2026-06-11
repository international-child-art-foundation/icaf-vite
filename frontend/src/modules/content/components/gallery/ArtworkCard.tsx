import { memo } from 'react';
import type { ReactNode } from 'react';
import type { TResolvedArtwork } from '@/modules/content/types/Gallery';
import {
  formatArtworkByline,
  getArtistDisplayName,
} from '@/utils/galleryProcessing';

type ArtworkCardProps = {
  artwork: TResolvedArtwork;
  openModal: (id: string) => void;
  actionSlot?: ReactNode;
};

const ArtworkCard = ({ artwork, openModal, actionSlot }: ArtworkCardProps) => {
  const { id, artists, lastInitial, age, country, region, event, thumbUrl } =
    artwork;
  const artistText = getArtistDisplayName(artists ?? [], lastInitial);

  const locationText = [region, country].filter(Boolean).join(', ');

  return (
    <div id={id} className="relative h-full w-full rounded-lg">
      <div className="rounded-lg shadow-md shadow-gray-400">
        <section className="relative h-48 w-full select-none overflow-hidden rounded-t-lg sm:h-60 md:h-72">
          <img
            src={thumbUrl}
            alt={artistText || 'Artwork'}
            onClick={() => openModal(id)}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full cursor-pointer object-cover object-center transition-transform duration-300 ease-in-out hover:scale-110"
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

        <section className="relative flex w-full flex-col gap-4 rounded-b-lg p-4">
          <div>
            <p className="truncate text-base font-semibold xl:text-xl">
              {artistText}
            </p>
            <p className="truncate text-sm text-gray-500">
              {[age != null ? `${age}` : null, locationText]
                .filter(Boolean)
                .join(' · ') || formatArtworkByline(artwork)}
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
          {actionSlot && <div className="border-t pt-4">{actionSlot}</div>}
        </section>
      </div>
    </div>
  );
};

export default memo(ArtworkCard);
