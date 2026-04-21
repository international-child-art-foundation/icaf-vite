import { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Pause,
  Pin,
  PinOff,
  Play,
  X,
} from 'lucide-react';
import { GallerySlideshowShare } from './GallerySlideshowShare';
import { useGallerySlideshowState } from './useGallerySlideshowState';
import { renderSlot } from './RenderSlot';
import { galleryNametag } from './GalleryNametag';

const INTERVALS_S = [5, 8, 12, 20, 30];
const DEFAULT_INTERVAL_IDX = 3;

const KB_STYLES = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes desc-scroll {
    from { transform: translateY(0); }
    to   { transform: translateY(var(--desc-dist)); }
  }
  @keyframes thumb-scroll {
    from { transform: translateY(0); }
    to   { transform: translateY(var(--thumb-dist)); }
  }
  @keyframes kb-zoom-in {
    from { transform: scale(1.0) translate(0%, 0%); }
    to   { transform: scale(1.05) translate(-0.5%, -0.5%); }
  }
  @keyframes kb-zoom-out {
    from { transform: scale(1.05) translate(-0.5%, 0.5%); }
    to   { transform: scale(1.0)  translate(0.5%,  -0.5%); }
  }
  @keyframes kb-zoom-in-pan {
    from { transform: scale(1.0)  translate(0.5%, 0.5%); }
    to   { transform: scale(1.05) translate(-0.5%, 0%); }
  }
  @keyframes kb-zoom-out-pan {
    from { transform: scale(1.05) translate(0.5%, -0.5%); }
    to   { transform: scale(1.0)  translate(-0.5%, 0.5%); }
  }
`;

export const GallerySlideshow = () => {
  const {
    artworks,
    currentIdx,
    slotA,
    slotB,
    topSlot,
    advance,
    advanceTo,
    currentIdxRef,
    isPaused,
    setIsPaused,
    uiState,
    resetUiTimer,
    artworkShareUrl,
    onClose,
  } = useGallerySlideshowState();

  const intervalIdx = DEFAULT_INTERVAL_IDX;
  const intervalMs = INTERVALS_S[intervalIdx] * 1000;

  const [namePinned, setNamePinned] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Share crossfade state (desktop-specific: accounts for share bar visibility)
  const [shareVisible, setShareVisible] = useState(true);
  const [deferredIdx, setDeferredIdx] = useState(0);
  const shareBarVisibleRef = useRef(false);

  // Preload next featureUrl (desktop shows full-res images)
  useEffect(() => {
    if (artworks.length > 1) {
      const preload = new window.Image();
      preload.src = artworks[(currentIdx + 1) % artworks.length].featureUrl;
    }
  }, [currentIdx, artworks]);

  // Auto-advance timer (desktop only — mobile uses manual swipe)
  useEffect(() => {
    if (artworks.length <= 1 || isPaused) return;
    const t = setTimeout(() => {
      advanceTo((currentIdxRef.current + 1) % artworks.length);
    }, intervalMs);
    return () => clearTimeout(t);
  }, [
    currentIdx,
    intervalMs,
    artworks.length,
    advanceTo,
    isPaused,
    currentIdxRef,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') {
        advance(1);
        resetUiTimer();
      } else if (e.key === 'ArrowLeft') {
        advance(-1);
        resetUiTimer();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
        resetUiTimer();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, advance, resetUiTimer, setIsPaused]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Share crossfade: fade out on advance, fade back in after 150ms with new artwork
  useEffect(() => {
    if (!shareBarVisibleRef.current) {
      setShareVisible(true);
      setDeferredIdx(currentIdx);
    }
    setShareVisible(false);
    const t = setTimeout(() => {
      setShareVisible(true);
      setDeferredIdx(currentIdx);
    }, 150);
    return () => clearTimeout(t);
  }, [currentIdx]);

  if (artworks.length === 0) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const uiOpacity = uiState === 'full' ? 1 : uiState === 'dim' ? 0.35 : 0;
  const uiPointerEvents = uiState === 'hidden' ? 'none' : ('auto' as const);

  const nametagOpacity = namePinned ? 1 : uiOpacity;
  const shareBarOpacity = namePinned && uiState !== 'full' ? 0 : uiOpacity;
  const shareBarVisible = shareBarOpacity > 0;
  shareBarVisibleRef.current = shareBarVisible;
  const shareBarPointerEvents = !shareBarVisible ? 'none' : ('auto' as const);

  return (
    <>
      <style>{KB_STYLES}</style>
      <div
        className="fixed inset-0 animate-[fade-in_300ms_ease-out] select-none bg-white"
        style={{ zIndex: 9999 }}
        onMouseMove={resetUiTimer}
        onClick={resetUiTimer}
      >
        {renderSlot(artworks, slotA, topSlot === 'a', isPaused, intervalMs)}
        {renderSlot(artworks, slotB, topSlot === 'b', isPaused, intervalMs)}

        <div
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: 3 }}
        >
          <div
            className="absolute left-2 top-2 sm:left-8 sm:top-8 md:bottom-8"
            style={{
              width: 300,
              pointerEvents: nametagOpacity > 0 ? 'auto' : 'none',
            }}
          >
            <div
              className="rounded-xl shadow-md"
              style={{
                opacity: nametagOpacity,
                transition: 'opacity 0.12s ease-out',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                aria-hidden="true"
                style={{ visibility: 'hidden', pointerEvents: 'none' }}
              >
                {galleryNametag(artworks[deferredIdx])}{' '}
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  opacity: topSlot === 'a' ? 1 : 0,
                  transition:
                    topSlot === 'a'
                      ? 'opacity 300ms ease-in 150ms'
                      : 'opacity 0ms',
                }}
              >
                {galleryNametag(artworks[slotA.artworkIdx])}
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  opacity: topSlot === 'b' ? 1 : 0,
                  transition:
                    topSlot === 'b'
                      ? 'opacity 300ms ease-in 150ms'
                      : 'opacity 0ms',
                }}
              >
                {galleryNametag(artworks[slotB.artworkIdx])}
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setNamePinned((p) => !p);
              }}
              className="absolute right-2.5 top-2.5 rounded p-0.5 text-black/60 transition-colors hover:text-black/80"
              aria-label={namePinned ? 'Unpin nametag' : 'Pin nametag'}
              title={namePinned ? 'Unpin' : 'Keep visible when UI hides'}
              style={{
                opacity: uiOpacity,
                transition: 'opacity 0.12s ease-out',
                pointerEvents: uiOpacity > 0 ? 'auto' : 'none',
              }}
            >
              {namePinned ? <PinOff size={13} /> : <Pin size={13} />}
            </button>
            <div
              style={{
                maxHeight: shareBarVisible ? '52px' : '0px',
                paddingTop: '6px',
                pointerEvents: shareBarPointerEvents,
              }}
            >
              <div
                style={{
                  opacity: shareBarOpacity,
                  transition: 'opacity 0.12s ease-out',
                }}
              >
                <div
                  style={{
                    opacity: shareVisible ? 1 : 0,
                    transition: shareVisible
                      ? 'opacity 300ms ease-in 0ms'
                      : 'opacity 0ms',
                  }}
                >
                  <GallerySlideshowShare shareUrl={artworkShareUrl} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: uiOpacity,
            transition: 'opacity 0.12s ease-out',
            zIndex: 3,
          }}
        >
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            style={{ pointerEvents: uiPointerEvents }}
          >
            <div className="flex items-center gap-0.5 rounded-2xl bg-white p-1.5 text-white shadow-md backdrop-blur-sm">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  advance(-1);
                  resetUiTimer();
                }}
                className="rounded-xl p-2.5 transition-colors hover:bg-black/5"
                aria-label="Previous artwork"
              >
                <ChevronLeft size={22} className="text-neutral-700" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused((p) => !p);
                  resetUiTimer();
                }}
                className="rounded-xl p-2.5 transition-colors hover:bg-black/5"
                aria-label={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
              >
                {isPaused ? (
                  <Play size={22} className="text-neutral-700" />
                ) : (
                  <Pause size={22} className="text-neutral-700" />
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  advance(1);
                  resetUiTimer();
                }}
                className="rounded-xl p-2.5 transition-colors hover:bg-black/5"
                aria-label="Next artwork"
              >
                <ChevronRight size={22} className="text-neutral-700" />
              </button>
            </div>
          </div>

          <div
            className="absolute bottom-8 right-8"
            style={{ pointerEvents: uiPointerEvents }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="pointer-events-none hidden rounded-full bg-white p-2.5 shadow-md transition-colors hover:bg-black/5 md:pointer-events-auto md:block"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title={
                isFullscreen
                  ? 'Exit fullscreen'
                  : 'Enter fullscreen (or press F11)'
              }
            >
              {isFullscreen ? (
                <Minimize2 size={18} className="text-neutral-700" />
              ) : (
                <Maximize2 size={18} className="text-neutral-700" />
              )}
            </button>
          </div>

          <div
            className="absolute right-6 top-6"
            style={{ pointerEvents: uiPointerEvents }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="rounded-full bg-white p-2.5 text-gray-800 shadow-md transition-colors hover:bg-black/5"
              aria-label="Close slideshow"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
