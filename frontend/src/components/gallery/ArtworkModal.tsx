import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { Artwork } from '@/data/gallery/artworks';
import { SocialShare } from './SocialShare';

type ArtworkModalProps = {
  id: string;
  artworks: Artwork[];
  modalState: boolean;
  isHorizontal: boolean;
  closeModal: () => void;
  getShareUrl: () => string;
};

const ArtworkModal: React.FC<ArtworkModalProps> = ({
  id,
  artworks,
  modalState,
  isHorizontal,
  closeModal,
  getShareUrl,
}) => {
  const [artworkData, setArtworkData] = useState<Artwork | undefined>(
    undefined,
  );
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = artworks.find((a) => a.id === id);
    setArtworkData(data);
  }, [id, modalState, artworks]);

  useEffect(() => {
    if (modalState && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' },
      );
    }
  }, [modalState]);

  if (!modalState) return null;

  const artistText = artworkData?.artists.join(' & ') ?? '';
  const locationText = [artworkData?.locationDetail, artworkData?.country]
    .filter(Boolean)
    .join(', ');

  function renderError() {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="font-montserrat text-xl font-semibold">
          Oops! This artwork may be unavailable.
        </p>
        <button
          className="w-[200px] rounded bg-primary p-2 text-text-inverse"
          onClick={closeModal}
        >
          Close
        </button>
      </div>
    );
  }

  function renderDefault() {
    if (!artworkData) return renderError();
    return (
      <div className="mx-auto grid max-h-full grid-cols-2 gap-5 overflow-hidden px-6 md:gap-10">
        <div className="flex flex-col overflow-auto">
          {artistText && <p className="mt-5 text-xl font-bold">{artistText}</p>}
          <div className="mt-3 space-y-1">
            {artworkData.age != null && (
              <p>{artworkData.age} years old</p>
            )}
            {locationText && <p>{locationText}</p>}
            <p className="text-gray-600">{artworkData.event}</p>
          </div>
          <div className="mt-auto pt-6">
            <p className="text-xl font-semibold">Share this post</p>
            <SocialShare shareUrl={getShareUrl()} />
          </div>
        </div>
        <div className="relative flex flex-shrink items-center justify-center overflow-hidden rounded-xl">
          <img
            src={artworkData.displayUrl}
            alt={artworkData.alt || artistText || 'Artwork'}
            className="relative z-20 max-h-full max-w-full object-contain"
          />
          <img
            src={artworkData.displayUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 z-10 h-full w-full rounded-xl object-cover opacity-50 blur-3xl"
          />
        </div>
      </div>
    );
  }

  function renderDefaultMobile() {
    if (!artworkData) return renderError();
    return (
      <div className="grid max-h-full gap-y-2 overflow-auto">
        <div className="relative flex flex-shrink items-center justify-center overflow-hidden rounded-xl">
          <img
            src={artworkData.displayUrl}
            alt={artworkData.alt || artistText || 'Artwork'}
            className="relative z-20 max-h-[300px] max-w-full object-contain"
          />
          <img
            src={artworkData.displayUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 z-10 h-full w-full rounded-xl object-cover opacity-50 blur-3xl"
          />
        </div>
        {artistText && <p className="mt-5 text-xl font-bold">{artistText}</p>}
        <div className="mt-2 space-y-1">
          {artworkData.age != null && <p>{artworkData.age} years old</p>}
          {locationText && <p>{locationText}</p>}
          <p className="text-gray-600">{artworkData.event}</p>
        </div>
        <div className="mt-4">
          <p className="text-xl font-semibold">Share this post</p>
          <SocialShare shareUrl={getShareUrl()} />
        </div>
      </div>
    );
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) closeModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)]"
      onClick={handleBackdropClick}
    >
      <div
        ref={cardRef}
        className={`relative flex flex-col overflow-hidden rounded-3xl bg-white ${isHorizontal ? 'max-h-[90vh] w-[80%] max-w-[1100px] p-16' : 'max-h-[90vh] w-[480px] max-w-[95%] p-8'} min-h-[400px]`}
      >
        <span
          onClick={closeModal}
          className="absolute right-0 top-0 cursor-pointer p-4 text-5xl font-light active:scale-90"
        >
          &times;
        </span>
        {isHorizontal ? renderDefault() : renderDefaultMobile()}
      </div>
    </div>
  );
};

export default ArtworkModal;
