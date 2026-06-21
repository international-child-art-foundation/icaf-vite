import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TResolvedArtwork } from '@/modules/content/types/Gallery';
import { getArtistDisplayNameWithAge } from '@/utils/galleryProcessing';
import { GalleryArtworkInfo } from './GalleryArtworkInfo';
import { KudosControls } from './KudosControls';
import { SocialShare } from './SocialShare';
import { Button } from '@/shared/components/ui/button';
import { useAnimationPerformanceGate } from '@/utils/useAnimationPerformanceGate';

type ArtworkModalProps = {
  id: string;
  artworks: TResolvedArtwork[];
  artworksLoading: boolean;
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
  artworksLoading,
  navigationList,
  onNavigate,
  modalState,
  isHorizontal,
  closeModal,
  getShareUrl,
  onEnterExhibition,
  onKudosApplied,
}) => {
  const [unavailableGrace, setUnavailableGrace] = useState({
    id: '',
    elapsed: false,
  });
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const modalShellRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const isFirstOpenRef = useRef(true);
  const activeArtworkIdRef = useRef(id);
  const [imageReady, setImageReady] = useState(false);
  const animationsEnabled = useAnimationPerformanceGate();
  activeArtworkIdRef.current = id;

  const currentNavIdx = navigationList.findIndex((a) => a.id === id);
  const prevId =
    currentNavIdx > 0 ? navigationList[currentNavIdx - 1].id : null;
  const nextId =
    currentNavIdx < navigationList.length - 1
      ? navigationList[currentNavIdx + 1].id
      : null;

  const requestedArtworkExists = artworks.some((artwork) => artwork.id === id);
  const canShowUnavailable =
    !artworksLoading &&
    !requestedArtworkExists &&
    unavailableGrace.id === id &&
    unavailableGrace.elapsed;
  const artworkData = artworks.find((artwork) => artwork.id === id);

  useEffect(() => {
    if (!modalState) return;

    setUnavailableGrace({ id, elapsed: false });
    const timeout = window.setTimeout(() => {
      setUnavailableGrace({ id, elapsed: true });
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [id, modalState]);

  useEffect(() => {
    if (!modalState) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && prevId) onNavigate(prevId);
      else if (e.key === 'ArrowRight' && nextId) onNavigate(nextId);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modalState, prevId, nextId, onNavigate]);

  useLayoutEffect(() => {
    if (!modalState) {
      isFirstOpenRef.current = true;
      return;
    }

    setImageReady(false);

    const shell = modalShellRef.current;
    const content = modalContentRef.current;
    if (!shell || !content) return;

    gsap.killTweensOf([shell, content]);
    if (!animationsEnabled) {
      gsap.set(shell, { clearProps: 'height' });
      gsap.set(content, { opacity: 1 });
      return;
    }

    const maxHeightRatio = isHorizontal ? 0.95 : 0.9;
    const placeholderHeight = Math.min(
      window.innerHeight * maxHeightRatio,
      Math.max(360, window.innerHeight * 0.7),
    );

    gsap.set(content, { opacity: artworkData ? 0 : 1 });
    if (isFirstOpenRef.current) {
      gsap.set(shell, { height: 0 });
      isFirstOpenRef.current = false;
    }
    gsap.to(shell, {
      height: placeholderHeight,
      duration: 1,
      ease: 'power3.out',
    });

    return () => gsap.killTweensOf([shell, content]);
  }, [
    id,
    modalState,
    isHorizontal,
    artworkData?.displayUrl,
    animationsEnabled,
  ]);

  const handleArtworkLoad = (loadedArtworkId: string) => {
    if (loadedArtworkId !== activeArtworkIdRef.current) return;

    const shell = modalShellRef.current;
    const content = modalContentRef.current;
    if (!shell || !content) return;
    setImageReady(true);

    if (!animationsEnabled) return;

    requestAnimationFrame(() => {
      if (loadedArtworkId !== activeArtworkIdRef.current) return;

      const maxHeight = window.innerHeight * (isHorizontal ? 0.95 : 0.9);
      const currentHeight = shell.getBoundingClientRect().height;

      // Measure outside the placeholder constraint so load timing does not
      // influence the artwork's final modal height.
      gsap.set(shell, { height: 'auto' });
      const targetHeight = Math.min(maxHeight, shell.scrollHeight);
      gsap.set(shell, { height: currentHeight });

      // Retargeting the shell interrupts and speeds up the placeholder tween.
      gsap.killTweensOf(shell);
      gsap.to(shell, {
        height: targetHeight,
        duration: 0.4,
        ease: 'power3.out',
        onComplete: () => gsap.set(shell, { height: 'auto' }),
      });
      gsap.to(content, { opacity: 1, duration: 0.2, ease: 'power2.out' });
    });
  };

  if (!modalState) return null;

  const artistText = artworkData
    ? getArtistDisplayNameWithAge(artworkData)
    : '';

  function renderUnavailable() {
    if (!canShowUnavailable) return null;

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
    if (artworkData?.id !== id) return renderUnavailable();
    return (
      <div className="mx-auto grid max-h-full min-w-0 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-5 overflow-hidden px-6 md:gap-10">
        <div
          ref={scrollContentRef}
          className="flex min-h-0 min-w-0 flex-col overflow-y-auto overflow-x-hidden"
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
            <div className="mt-4 grid grid-cols-1 grid-rows-2 items-stretch gap-2 xl:grid-cols-2 xl:grid-rows-1">
              <Button
                type="button"
                onClick={() => onEnterExhibition(artworkData.id)}
                className="text-text-inverse flex items-center justify-center rounded"
              >
                Spotlight View
              </Button>
              <KudosControls
                artwork={artworkData}
                className="h-full"
                onKudosApplied={onKudosApplied}
              />
            </div>
          </div>
        </div>
        <div className="relative flex min-h-[400px] flex-shrink select-none items-center justify-center overflow-hidden rounded-xl">
          <img
            src={artworkData.displayUrl}
            alt={artworkData.alt || artistText || 'Artwork'}
            onLoad={() => handleArtworkLoad(artworkData.id)}
            className={`relative z-20 max-h-full max-w-full object-contain ${imageReady ? '' : 'invisible'}`}
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
    if (artworkData?.id !== id) return renderUnavailable();
    return (
      <div
        ref={scrollContentRef}
        className="grid max-h-full min-w-0 gap-y-2 overflow-y-auto overflow-x-hidden"
      >
        <div className="relative flex min-h-[300px] flex-shrink select-none items-center justify-center overflow-hidden rounded-xl">
          <img
            src={artworkData.displayUrl}
            alt={artworkData.alt || artistText || 'Artwork'}
            onLoad={() => handleArtworkLoad(artworkData.id)}
            className={`relative z-20 max-h-[420px] max-w-full object-contain ${imageReady ? '' : 'invisible'}`}
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
          <div className="mt-4 grid grid-cols-2 items-stretch gap-2">
            <Button
              type="button"
              onClick={() => onEnterExhibition(artworkData.id)}
              size="sm"
            >
              Spotlight View
            </Button>
            <KudosControls
              artwork={artworkData}
              className="h-full"
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
    'hidden lg:flex items-center active:scale-[95%] justify-center w-12 h-12 flex-shrink-0 rounded-full bg-black/70 hover:bg-black/30 text-white transition-colors mx-4';

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
        ref={modalShellRef}
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
        <div className="no-scrollbar grid min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
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
