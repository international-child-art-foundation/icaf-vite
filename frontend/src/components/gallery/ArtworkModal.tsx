import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Artwork } from '@/data/gallery/artworks';
import { formatArtistName } from '@/data/gallery/artworks';
import { SocialShare } from './SocialShare';

type ArtworkModalProps = {
  id: string;
  artworks: Artwork[];
  navigationList: Artwork[];
  onNavigate: (id: string) => void;
  modalState: boolean;
  isHorizontal: boolean;
  closeModal: () => void;
  getShareUrl: () => string;
};

const ArtworkModal: React.FC<ArtworkModalProps> = ({
  id,
  artworks,
  navigationList,
  onNavigate,
  modalState,
  isHorizontal,
  closeModal,
  getShareUrl,
}) => {
  const [artworkData, setArtworkData] = useState<Artwork | undefined>(
    undefined,
  );
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const currentNavIdx = navigationList.findIndex((a) => a.id === id);
  const prevId =
    currentNavIdx > 0 ? navigationList[currentNavIdx - 1].id : null;
  const nextId =
    currentNavIdx < navigationList.length - 1
      ? navigationList[currentNavIdx + 1].id
      : null;

  useEffect(() => {
    if (!modalState) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && prevId) onNavigate(prevId);
      else if (e.key === 'ArrowRight' && nextId) onNavigate(nextId);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modalState, prevId, nextId, onNavigate]);

  useEffect(() => {
    const data = artworks.find((a) => a.id === id);
    setArtworkData(data);

    if (modalState && data) {
      const timeline = gsap.timeline();
      timeline
        .set(modalContentRef.current, { opacity: 0 })
        .to(gridContainerRef.current, {
          gridTemplateRows: '1fr',
          duration: 0.4,
          ease: 'power4.out',
        })
        .to(
          modalContentRef.current,
          { opacity: 1, duration: 0.2, ease: 'power4.out' },
          '-=0.1',
        );
    }
  }, [id, modalState, artworks]);

  if (!modalState) return null;

  const artistText = artworkData
    ? formatArtistName(artworkData.artists, artworkData.lastInitial)
    : '';
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
          type="button"
          className="bg-primary text-text-inverse w-[200px] rounded p-2"
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
          {artworkData.title && (
            <p className="mt-0.5 text-lg font-medium italic text-gray-700">
              &ldquo;{artworkData.title}&rdquo;
            </p>
          )}
          <div className="mt-1 space-y-0.5 text-gray-500">
            {(artworkData.age != null || locationText) && (
              <p>
                {[
                  artworkData.age != null ? `Age ${artworkData.age}` : null,
                  locationText,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
            {artworkData.event && <p>{artworkData.event}</p>}
          </div>
          <div className="mt-auto pt-6">
            <p className="text-xl font-semibold">Share this post</p>
            <SocialShare shareUrl={getShareUrl()} />
            <a
              href={artworkData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-text-inverse mt-4 block w-full rounded p-4 text-center text-base"
            >
              View full image
            </a>
          </div>
        </div>
        <div className="relative flex min-h-[400px] flex-shrink items-center justify-center overflow-hidden rounded-xl">
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
        <div className="relative flex min-h-[300px] flex-shrink items-center justify-center overflow-hidden rounded-xl">
          <img
            src={artworkData.displayUrl}
            alt={artworkData.alt || artistText || 'Artwork'}
            className="relative z-20 max-h-[420px] max-w-full object-contain"
          />
          <img
            src={artworkData.displayUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 z-10 h-full w-full rounded-xl object-cover opacity-50 blur-3xl"
          />
        </div>
        {artistText && <p className="mt-5 text-xl font-bold">{artistText}</p>}
        {artworkData.title && (
          <p className="mt-0.5 text-lg font-medium italic text-gray-700">
            &ldquo;{artworkData.title}&rdquo;
          </p>
        )}
        <div className="mt-1 space-y-0.5 text-gray-500">
          {(artworkData.age != null || locationText) && (
            <p>
              {[
                artworkData.age != null ? `Age ${artworkData.age}` : null,
                locationText,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
          {artworkData.event && <p>{artworkData.event}</p>}
        </div>
        <div className="mt-4">
          <p className="text-xl font-semibold">Share this post</p>
          <SocialShare shareUrl={getShareUrl()} />
          <a
            href={artworkData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-text-inverse mt-4 block w-full rounded p-4 text-center text-base"
          >
            View full image
          </a>
        </div>
      </div>
    );
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const navBtnClass =
    'hidden lg:flex items-center justify-center w-12 h-12 flex-shrink-0 rounded-full bg-black/70 hover:bg-black/30 text-white transition-colors mx-4';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)]"
      onClick={handleBackdropClick}
    >
      <button
        type="button"
        className={navBtnClass}
        style={{ visibility: prevId ? 'visible' : 'hidden' }}
        onClick={(e) => {
          e.stopPropagation();
          if (prevId) onNavigate(prevId);
        }}
        aria-label="Previous artwork"
      >
        <ChevronLeft size={24} />
      </button>
      <div
        className={`relative flex flex-col overflow-hidden rounded-3xl bg-white ${isHorizontal ? 'w-[88%] max-w-[1100px] lg:w-[80%]' : 'w-[92%] max-w-[700px]'} max-h-[93%]`}
      >
        <div className="flex flex-shrink-0 justify-end px-4 pt-3">
          <span
            onClick={closeModal}
            className="cursor-pointer text-5xl font-light leading-none active:scale-90"
          >
            &times;
          </span>
        </div>
        <div
          ref={gridContainerRef}
          className="no-scrollbar grid overflow-scroll"
          style={{ gridTemplateRows: '0.2fr' }}
        >
          <div
            ref={modalContentRef}
            className={`min-h-[300px] ${isHorizontal ? 'px-16 pb-16 [@media(max-height:600px)]:px-8 [@media(max-height:600px)]:pb-8' : 'px-8 pb-8'}`}
          >
            {isHorizontal ? renderDefault() : renderDefaultMobile()}
          </div>
        </div>
      </div>
      <button
        type="button"
        className={navBtnClass}
        style={{ visibility: nextId ? 'visible' : 'hidden' }}
        onClick={(e) => {
          e.stopPropagation();
          if (nextId) onNavigate(nextId);
        }}
        aria-label="Next artwork"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default ArtworkModal;
