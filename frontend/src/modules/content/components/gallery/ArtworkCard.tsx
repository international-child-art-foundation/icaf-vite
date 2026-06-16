import { memo } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import type { TResolvedArtwork } from '@/modules/content/types/Gallery';
import { getArtistDisplayNameWithAge } from '@/utils/galleryProcessing';
import { GalleryArtworkInfo } from './GalleryArtworkInfo';

type ArtworkCardProps = {
  artwork: TResolvedArtwork;
  openModal: (id: string) => void;
  actionSlot?: ReactNode;
};

const ArtworkCard = ({ artwork, openModal, actionSlot }: ArtworkCardProps) => {
  const { id, thumbUrl } = artwork;
  const artistText = getArtistDisplayNameWithAge(artwork);
  const isWholeCardInteractive = !actionSlot;
  const handleOpen = () => openModal(id);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isWholeCardInteractive) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handleOpen();
  };

  return (
    <div
      id={id}
      role={isWholeCardInteractive ? 'button' : undefined}
      tabIndex={isWholeCardInteractive ? 0 : undefined}
      onClick={isWholeCardInteractive ? handleOpen : undefined}
      onKeyDown={handleKeyDown}
      className={`focus-visible:ring-primary relative flex h-full w-full flex-col gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        isWholeCardInteractive ? 'cursor-pointer' : ''
      }`}
    >
      <div className="rounded-lg shadow-md shadow-gray-400">
        <section className="relative h-48 w-full select-none overflow-hidden rounded-t-lg sm:h-60 md:h-72">
          <img
            src={thumbUrl}
            alt={artistText || 'Artwork'}
            onClick={isWholeCardInteractive ? undefined : handleOpen}
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

        <section className="relative flex h-48 w-full flex-col gap-2 rounded-b-lg p-4 sm:h-40">
          <GalleryArtworkInfo
            artwork={artwork}
            variant="card"
            descriptionMode="none"
            maxTags={4}
            className="max-h-20 overflow-hidden"
          />
          <div className="mt-auto flex">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleOpen();
              }}
              className="bg-primary text-text-inverse mt-auto w-full cursor-pointer rounded py-2 text-center text-sm tracking-wide"
            >
              View
            </button>
          </div>
        </section>
      </div>
      {actionSlot && (
        <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-sm">
          {actionSlot}
        </div>
      )}
    </div>
  );
};

export default memo(ArtworkCard);
