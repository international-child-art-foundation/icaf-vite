import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useOutletContext, useNavigate } from 'react-router-dom';
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
import { IGalleryContext } from '@/types/Gallery';
import { formatArtistName } from '@/utils/galleryProcessing';

const TRANSITION_MS = 700;
const INTERVALS_S = [5, 8, 12, 20, 30];
const DEFAULT_INTERVAL_IDX = 3;
const DIM_MS = 3000;
const HIDE_MS = 7000;

const KB_ANIMS = [
  'kb-zoom-in',
  'kb-zoom-out',
  'kb-zoom-in-pan',
  'kb-zoom-out-pan',
] as const;
type KbAnim = (typeof KB_ANIMS)[number];

type SlotState = { artworkIdx: number; animKey: number; kbAnim: KbAnim };

const SCROLL_BASE_PX_S = 6;
const SCROLL_START_DELAY_S = 2.5; // pause before scroll begins
const SCROLL_END_BUFFER_S = 0.6; // headroom before transition fires

const KB_STYLES = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fade-out {
    from { opacity: 1; }
    to {opacity: 0; }
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
  const [slotA, setSlotA] = useState<SlotState>({
    artworkIdx: 0,
    animKey: 0,
    kbAnim: KB_ANIMS[0],
  });
  const [slotB, setSlotB] = useState<SlotState>({
    artworkIdx: 0,
    animKey: 0,
    kbAnim: KB_ANIMS[1],
  });
  const [topSlot, setTopSlot] = useState<'a' | 'b'>('a');
  const topSlotRef = useRef<'a' | 'b'>('a');
  const advanceCountRef = useRef(0);
  const currentIdxRef = useRef(0);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [namePinned, setNamePinned] = useState(true);
  // const [intervalIdx, setIntervalIdx] = useState(DEFAULT_INTERVAL_IDX);
  const intervalIdx = DEFAULT_INTERVAL_IDX;
  const [uiState, setUiState] = useState<'full' | 'dim' | 'hidden'>('full');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { artworks: rawArtworks } = useOutletContext<IGalleryContext>();
  const [artworks] = useState(() =>
    [...rawArtworks].sort(() => Math.random() - 0.5),
  );
  const navigate = useNavigate();

  const dimTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const descScrollRef = useRef<HTMLDivElement>(null);
  const descInnerRef = useRef<HTMLParagraphElement>(null);
  const descTweenRef = useRef<gsap.core.Tween | null>(null);

  const intervalMs = INTERVALS_S[intervalIdx] * 1000;

  const onClose = () => {
    void navigate('/gallery');
  };

  const advanceTo = useCallback((nextIdx: number) => {
    advanceCountRef.current++;
    const kbAnim = KB_ANIMS[advanceCountRef.current % KB_ANIMS.length];
    const newTop = topSlotRef.current === 'a' ? 'b' : 'a';
    const animKey = advanceCountRef.current;

    if (newTop === 'a') {
      setSlotA({ artworkIdx: nextIdx, animKey, kbAnim });
    } else {
      setSlotB({ artworkIdx: nextIdx, animKey, kbAnim });
    }

    topSlotRef.current = newTop;
    setTopSlot(newTop);
    setCurrentIdx(nextIdx);
    currentIdxRef.current = nextIdx;
  }, []);

  const advance = useCallback(
    (dir: 1 | -1 = 1) => {
      if (artworks.length <= 1) return;
      const nextIdx =
        (currentIdxRef.current + dir + artworks.length) % artworks.length;
      advanceTo(nextIdx);
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    },
    [artworks.length, advanceTo],
  );

  useEffect(() => {
    if (artworks.length <= 1 || isPaused) return;
    autoTimerRef.current = setTimeout(() => {
      const nextIdx = (currentIdxRef.current + 1) % artworks.length;
      advanceTo(nextIdx);
    }, intervalMs);
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [currentIdx, intervalMs, artworks.length, advanceTo, isPaused]);

  useEffect(() => {
    if (artworks.length > 1) {
      const preload = new window.Image();
      preload.src = artworks[(currentIdx + 1) % artworks.length].featureUrl;
    }
  }, [currentIdx, artworks]);

  useEffect(() => {
    const outer = descScrollRef.current;
    const inner = descInnerRef.current;
    descTweenRef.current?.kill();
    descTweenRef.current = null;
    if (!outer || !inner) return;
    gsap.set(inner, { y: 0 });
    const dist = inner.offsetHeight - outer.clientHeight;
    if (dist <= 0) return;
    const naturalDuration = dist / SCROLL_BASE_PX_S;
    const available =
      intervalMs / 1000 - SCROLL_START_DELAY_S - SCROLL_END_BUFFER_S;
    const duration = Math.min(naturalDuration, Math.max(available, 0.3));
    descTweenRef.current = gsap.to(inner, {
      y: -dist,
      duration,
      ease: 'none',
      delay: SCROLL_START_DELAY_S,
    });
    return () => {
      descTweenRef.current?.kill();
    };
  }, [currentIdx, intervalMs]);

  const resetUiTimer = useCallback(() => {
    setUiState('full');
    if (dimTimerRef.current) clearTimeout(dimTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    dimTimerRef.current = setTimeout(() => setUiState('dim'), DIM_MS);
    hideTimerRef.current = setTimeout(() => setUiState('hidden'), HIDE_MS);
  }, []);

  useEffect(() => {
    resetUiTimer();
    return () => {
      if (dimTimerRef.current) clearTimeout(dimTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [resetUiTimer]);

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
  }, [onClose, advance, resetUiTimer]);

  // Fullscreen tracking
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

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
  const shareBarPointerEvents = !shareBarVisible ? 'none' : ('auto' as const);

  const currentArtwork = artworks[currentIdx];
  const displayName =
    (currentArtwork.artists?.length ?? 0) > 0
      ? formatArtistName(
          currentArtwork.artists ?? [],
          currentArtwork.lastInitial,
        )
      : null;
  const displayLocation = [currentArtwork.region, currentArtwork.country]
    .filter(Boolean)
    .join(', ');
  const eventLabel = currentArtwork.event;

  const artworkShareUrl = `${window.location.protocol}//${window.location.host}/gallery?id=${currentArtwork.id}`;

  const renderSlot = (slot: SlotState, isTop: boolean) => {
    const artwork = artworks[slot.artworkIdx];
    if (!artwork) return null;
    return (
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          opacity: isTop ? 1 : 0,
          transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
          zIndex: isTop ? 1 : 0,
        }}
      >
        <img
          key={slot.animKey}
          src={artwork.featureUrl}
          alt={artwork.alt}
          className="h-full w-full object-contain"
          style={{
            animationName: slot.kbAnim,
            animationDuration: `${intervalMs + TRANSITION_MS * 2}ms`,
            animationTimingFunction: 'ease-in-out',
            animationFillMode: 'both',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />
      </div>
    );
  };

  return (
    <>
      <style>{KB_STYLES}</style>
      <div
        className="fixed inset-0 animate-[fade-in_300ms_ease-out] select-none bg-white"
        style={{ zIndex: 9999 }}
        onMouseMove={resetUiTimer}
        onClick={resetUiTimer}
      >
        {renderSlot(slotA, topSlot === 'a')}
        {renderSlot(slotB, topSlot === 'b')}

        <div
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: 3 }}
        >
          <div
            className="absolute left-2 top-2 max-w-xs sm:left-8 sm:top-8 md:bottom-8"
            style={{
              filter:
                'drop-shadow(0 6px 12px rgba(0,0,0,0.2)) drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
              pointerEvents: nametagOpacity > 0 ? 'auto' : 'none',
            }}
          >
            {/* Nametag pill */}
            <div
              className="rounded-xl bg-black/65 px-4 py-3 text-white"
              style={{
                opacity: nametagOpacity,
                transition: 'opacity 0.12s ease-out',
              }}
            >
              {displayName && (
                <p
                  className="pr-6 text-lg font-semibold leading-snug"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {displayName}
                </p>
              )}
              {currentArtwork.title && (
                <p
                  className="mt-0.5 text-base font-medium italic opacity-90"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                >
                  &ldquo;{currentArtwork.title}&rdquo;
                </p>
              )}
              {currentArtwork.age !== undefined && (
                <p
                  className="mt-0.5 text-sm opacity-80"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                >
                  Age {currentArtwork.age}{' '}
                  {displayLocation && (
                    <span
                      className="text-sm opacity-75"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      · {displayLocation}
                    </span>
                  )}
                </p>
              )}
              {eventLabel && (
                <p
                  className="mt-1 text-xs capitalize opacity-60"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {eventLabel}
                </p>
              )}
              {currentArtwork.description && (
                <div
                  ref={descScrollRef}
                  className="mt-1.5 max-h-[96px] max-w-[240px] overflow-hidden"
                >
                  <p
                    ref={descInnerRef}
                    className="text-sm opacity-70"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    {currentArtwork.description}
                  </p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setNamePinned((p) => !p);
              }}
              className="absolute right-2.5 top-2.5 rounded p-0.5 text-white/60 transition-colors hover:text-white"
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
              className="overflow-hidden"
              style={{
                maxHeight: shareBarVisible ? '52px' : '0px',
                paddingTop: shareBarVisible ? '6px' : '0px',
                transition: shareBarVisible
                  ? 'max-height 0.38s cubic-bezier(0.25,1,0.5,1), padding-top 0.38s cubic-bezier(0.25,1,0.5,1)'
                  : 'max-height 0.28s ease-in, padding-top 0.28s ease-in',
                pointerEvents: shareBarPointerEvents,
              }}
            >
              <div
                style={{
                  opacity: shareBarOpacity,
                  transform: shareBarVisible
                    ? 'translateY(0)'
                    : 'translateY(40%)',
                  transition: shareBarVisible
                    ? 'transform 0.38s cubic-bezier(0.25,1,0.5,1), opacity 0.25s ease-out'
                    : 'transform 0.25s ease-in, opacity 0.15s ease-in',
                }}
              >
                <GallerySlideshowShare shareUrl={artworkShareUrl} />
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
            <div
              className="flex items-center gap-0.5 rounded-2xl bg-black/55 p-1.5 text-white backdrop-blur-sm"
              style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.4))' }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  advance(-1);
                  resetUiTimer();
                }}
                className="rounded-xl p-2.5 transition-colors hover:bg-white/15"
                aria-label="Previous artwork"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused((p) => !p);
                  resetUiTimer();
                }}
                className="rounded-xl p-2.5 transition-colors hover:bg-white/15"
                aria-label={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
              >
                {isPaused ? <Play size={22} /> : <Pause size={22} />}
              </button>
              {/* Counter 
              <span
                className="select-none px-3 text-base font-semibold tabular-nums"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
              >
                {currentIdx + 1}&thinsp;/&thinsp;{artworks.length}
              </span>
              */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  advance(1);
                  resetUiTimer();
                }}
                className="rounded-xl p-2.5 transition-colors hover:bg-white/15"
                aria-label="Next artwork"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>

          <div
            className="absolute bottom-8 right-8"
            style={{ pointerEvents: uiPointerEvents }}
          >
            {/* Speed picker
            <div className="flex items-center gap-1 rounded-lg bg-black/10 px-3 py-2">
              <button type="button" onClick={(e) => { e.stopPropagation(); setIntervalIdx((i) => Math.max(0, i - 1)); }} className="w-5 text-center text-base text-gray-600 opacity-70 hover:opacity-100" aria-label="Faster">−</button>
              <span className="w-8 text-center text-xs tabular-nums text-gray-500">{INTERVALS_S[intervalIdx]}s</span>
              <button type="button" onClick={(e) => { e.stopPropagation(); setIntervalIdx((i) => Math.min(INTERVALS_S.length - 1, i + 1)); }} className="w-5 text-center text-base text-gray-600 opacity-70 hover:opacity-100" aria-label="Slower">+</button>
            </div>
            */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="pointer-events-none hidden rounded-full bg-black/10 p-2.5 text-gray-800 transition-colors hover:bg-black/20 md:pointer-events-auto md:block"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title={
                isFullscreen
                  ? 'Exit fullscreen'
                  : 'Enter fullscreen (or press F11)'
              }
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
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
              className="rounded-full bg-black/10 p-2.5 text-gray-800 transition-colors hover:bg-black/20"
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
