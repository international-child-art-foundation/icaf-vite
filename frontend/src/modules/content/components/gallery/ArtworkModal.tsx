import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TResolvedArtwork } from '@/modules/content/types/Gallery';
import { getArtistDisplayNameWithAge } from '@/utils/galleryProcessing';
import { GalleryArtworkInfo } from './GalleryArtworkInfo';
import { KudosControls } from './KudosControls';
import { SocialShare } from './SocialShare';

type ArtworkModalProps = {
  id: string;
  artworks: TResolvedArtwork[];
  navigationList: TResolvedArtwork[];
  onNavigate: (id: string) => void;
  modalState: boolean;
  isHorizontal: boolean;
  closeModal: () => void;
  getShareUrl: () => string;
  onEnterExhibition: (id: string) => void;
  onKudosApplied?: (artId: string, amount: number) => void;
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
  onEnterExhibition,
  onKudosApplied,
}) => {
  const [artworkData, setArtworkData] = useState<TResolvedArtwork | undefined>(
    undefined,
  );
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const isFirstOpenRef = useRef(true);

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

    if (!modalState) {
      setArtworkData(data);
      isFirstOpenRef.current = true;
      return;
    }

    if (isFirstOpenRef.current) {
      isFirstOpenRef.current = false;
      setArtworkData(data);
      gsap
        .timeline()
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
        )
        .call(() => {
          if (gridContainerRef.current) {
            gridContainerRef.current.style.overflowY = 'auto';
          }
          if (scrollContentRef.current) {
            scrollContentRef.current.style.overflowY = 'auto';
          }
        });
      return;
    }

    if (artworkData?.id === data?.id) {
      setArtworkData(data);
      return;
    }

    const content = modalContentRef.current;
    gsap.set(content, { opacity: 0 });
    setArtworkData(data);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        gsap.to(content, { opacity: 1, duration: 0.2, ease: 'power2.out' });
      }),
    );
  }, [id, modalState, artworks, artworkData?.id]);

  if (!modalState) return null;

  const artistText = artworkData
    ? getArtistDisplayNameWithAge(artworkData)
    : '';

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
      <div className="mx-auto grid max-h-full min-w-0 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-5 overflow-hidden px-6 md:gap-10">
        <div
          ref={scrollContentRef}
          className="flex min-h-0 min-w-0 flex-col overflow-x-hidden"
          style={{ overflowY: 'hidden' }}
        >
          <GalleryArtworkInfo
            artwork={artworkData}
            variant="modal"
            descriptionMode="plain"
            className="mt-5"
          />
          <div className="mt-auto pt-6">
            <p className="text-xl font-semibold">Share this post</p>
            <SocialShare shareUrl={getShareUrl()} />
            <div className="mt-4 grid grid-cols-1 gap-2 xl:grid-cols-2">
              <button
                type="button"
                onClick={() => onEnterExhibition(artworkData.id)}
                className="bg-primary text-text-inverse flex min-h-11 items-center justify-center rounded px-4 py-2.5 text-center text-base"
              >
                Mural View
              </button>
              <KudosControls
                artwork={artworkData}
                onKudosApplied={onKudosApplied}
              />
            </div>
          </div>
        </div>
        <div className="relative flex min-h-[400px] flex-shrink select-none items-center justify-center overflow-hidden rounded-xl">
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
      <div
        ref={scrollContentRef}
        className="grid max-h-full min-w-0 gap-y-2 overflow-x-hidden"
        style={{ overflowY: 'hidden' }}
      >
        <div className="relative flex min-h-[300px] flex-shrink select-none items-center justify-center overflow-hidden rounded-xl">
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
        <GalleryArtworkInfo
          artwork={artworkData}
          variant="modal"
          descriptionMode="plain"
          className="mt-5"
        />
        <div className="mt-4">
          <p className="text-xl font-semibold">Share this post</p>
          <SocialShare shareUrl={getShareUrl()} />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onEnterExhibition(artworkData.id)}
              className="bg-primary text-text-inverse flex min-h-9 items-center justify-center rounded px-3 py-1.5 text-center text-sm"
            >
              Mural View
            </button>
            <KudosControls
              artwork={artworkData}
              compact
              onKudosApplied={onKudosApplied}
            />
          </div>
        </div>
      </div>
    );
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const navBtnClass =
    'hidden lg:flex items-center justify-center w-12 h-12 flex-shrink-0 rounded-full bg-black/70 hover:bg-black/30 text-white transition-colors mx-4';

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-x-hidden bg-[rgba(0,0,0,0.5)]"
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
        className={`relative flex min-w-0 flex-col overflow-hidden rounded-3xl bg-white ${
          isHorizontal
            ? 'max-h-[95dvh] w-[calc(100%-1rem)] max-w-[1500px] lg:w-[calc(100%-10rem)]'
            : 'max-h-[90dvh] w-[calc(100%-1rem)] max-w-[800px]'
        }`}
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
          className="no-scrollbar grid min-w-0 overflow-x-hidden"
          style={{ gridTemplateRows: '0.2fr', overflowY: 'hidden' }}
        >
          <div
            ref={modalContentRef}
            className={`min-h-[300px] min-w-0 ${isHorizontal ? 'px-8 pb-8 xl:px-16 xl:pb-16 [@media(max-height:600px)]:px-8 [@media(max-height:600px)]:pb-8' : 'px-8 pb-8'}`}
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
    </div>,
    document.body,
  );
};

export default ArtworkModal;
