import { useCallback, useEffect, useRef, useState } from 'react';
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
import { IGalleryContext, TResolvedArtwork } from '@/types/Gallery';
import { formatArtistName } from '@/utils/galleryProcessing';

const TRANSITION_MS = 700;
const INTERVALS_S = [5, 8, 12, 20, 30];
const DEFAULT_INTERVAL_IDX = 3;
const DIM_MS = 2000;
const HIDE_MS = 5000;

const KB_ANIMS = [
  'kb-zoom-in',
  'kb-zoom-out',
  'kb-zoom-in-pan',
  'kb-zoom-out-pan',
] as const;
type KbAnim = (typeof KB_ANIMS)[number];

type SlotState = { artworkIdx: number; animKey: number; kbAnim: KbAnim };

const SCROLL_BASE_PX_S = 12;
const SCROLL_START_DELAY_S = 4;
const DESC_OUTER_H = 96;
const SCROLLBAR_W = 4;
const SCROLLBAR_GAP = 5;

const KB_STYLES = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fade-out {
    from { opacity: 1; }
    to {opacity: 0; }
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

const DescriptionScroll = ({ description }: { description: string }) => {
  const pRef = useRef<HTMLParagraphElement>(null);
  const [scrollDist, setScrollDist] = useState(0);
  const [paused, setPaused] = useState(false);
  // null = CSS animation in control; number = user has taken over via scroll wheel
  const [manualOffset, setManualOffset] = useState<number | null>(null);

  useEffect(() => {
    if (!pRef.current) return;
    setManualOffset(null);
    const el = pRef.current;
    const measure = () => {
      const dist = Math.max(0, el.scrollHeight - DESC_OUTER_H);
      setScrollDist(dist);
      setManualOffset((prev) => (prev !== null ? Math.min(prev, dist) : null));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [description]);

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollDist === 0) return;
    e.preventDefault();
    e.stopPropagation();
    let current: number;
    if (manualOffset !== null) {
      current = manualOffset;
    } else if (pRef.current) {
      const t = getComputedStyle(pRef.current).transform;
      current = t === 'none' ? 0 : -new DOMMatrix(t).m42;
    } else {
      current = 0;
    }
    setManualOffset(
      Math.max(0, Math.min(scrollDist, current + e.deltaY * 0.5)),
    );
  };

  const inManual = manualOffset !== null;
  const duration = scrollDist > 0 ? scrollDist / SCROLL_BASE_PX_S : 0;
  const totalTextH = DESC_OUTER_H + scrollDist;
  const thumbH =
    scrollDist > 0
      ? Math.max(12, (DESC_OUTER_H / totalTextH) * DESC_OUTER_H)
      : 0;
  const thumbDist = DESC_OUTER_H - thumbH;
  const manualThumbY =
    manualOffset !== null && scrollDist > 0
      ? (manualOffset / scrollDist) * thumbDist
      : 0;

  return (
    <div
      style={{
        display: 'flex',
        gap: scrollDist > 0 ? SCROLLBAR_GAP : 0,
        height: DESC_OUTER_H,
        marginTop: 6,
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onWheel={handleWheel}
    >
      <div style={{ flex: 1, overflow: 'hidden', height: DESC_OUTER_H }}>
        <p
          ref={pRef}
          style={
            {
              fontSize: 14,
              lineHeight: '20px',
              color: 'rgba(255,255,255,0.7)',
              fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
              userSelect: 'text',
              cursor: 'text',
              willChange: scrollDist > 0 ? 'transform' : 'auto',
              ...(scrollDist > 0
                ? inManual
                  ? { transform: `translateY(-${manualOffset}px)` }
                  : {
                      '--desc-dist': `-${scrollDist}px`,
                      animationName: 'desc-scroll',
                      animationDuration: `${duration}s`,
                      animationTimingFunction: 'linear',
                      animationDelay: `${SCROLL_START_DELAY_S}s`,
                      animationFillMode: 'forwards',
                      animationPlayState: paused ? 'paused' : 'running',
                    }
                : {}),
            } as React.CSSProperties
          }
        >
          {description}
        </p>
      </div>
      {scrollDist > 0 && (
        <div
          style={{ width: SCROLLBAR_W, flexShrink: 0, position: 'relative' }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: SCROLLBAR_W / 2,
            }}
          />
          <div
            style={
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: thumbH,
                background: 'rgba(255,255,255,0.5)',
                borderRadius: SCROLLBAR_W / 2,
                willChange: 'transform',
                ...(inManual
                  ? { transform: `translateY(${manualThumbY}px)` }
                  : {
                      '--thumb-dist': `${thumbDist}px`,
                      animationName: 'thumb-scroll',
                      animationDuration: `${duration}s`,
                      animationTimingFunction: 'linear',
                      animationDelay: `${SCROLL_START_DELAY_S}s`,
                      animationFillMode: 'forwards',
                      animationPlayState: paused ? 'paused' : 'running',
                    }),
              } as React.CSSProperties
            }
          />
        </div>
      )}
    </div>
  );
};

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
  const [deferredIdx, setDeferredIdx] = useState(0);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [namePinned, setNamePinned] = useState(true);
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

  const [shareVisible, setShareVisible] = useState(true);
  const shareBarVisibleRef = useRef(false);

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

  const currentArtwork = artworks[currentIdx];
  const artworkShareUrl = `${window.location.protocol}//${window.location.host}/gallery?id=${currentArtwork.id}`;

  const renderNametag = (artwork: TResolvedArtwork) => {
    const name =
      (artwork.artists?.length ?? 0) > 0
        ? formatArtistName(artwork.artists ?? [], artwork.lastInitial)
        : null;
    const location = [artwork.region, artwork.country]
      .filter(Boolean)
      .join(', ');

    return (
      <div
        className="rounded-xl bg-black/65 px-4 py-3 text-white"
        style={{
          boxShadow: '0 6px 12px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.3)',
        }}
      >
        {name && (
          <p
            className="pr-6 text-lg font-semibold leading-snug"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            {name}
          </p>
        )}
        {artwork.title && (
          <p
            className="mt-0.5 text-base font-medium italic opacity-90"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            &ldquo;{artwork.title}&rdquo;
          </p>
        )}
        {artwork.age !== undefined && (
          <p
            className="mt-0.5 text-sm opacity-80"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            Age {artwork.age}
            {location && (
              <span
                className="text-sm opacity-75"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
              >
                {' '}
                · {location}
              </span>
            )}
          </p>
        )}
        {artwork.event && (
          <p
            className="mt-1 text-xs capitalize opacity-60"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            {artwork.event}
          </p>
        )}
        {artwork.description && (
          <>
            <p className="mt-2 text-sm opacity-90">
              {artwork.artists && artwork.artists[0] && artwork.artists[0]}{' '}
              says:
            </p>
            <DescriptionScroll
              key={`desc-${artwork.id}`}
              description={artwork.description}
            />
          </>
        )}
      </div>
    );
  };

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
            className="absolute left-2 top-2 sm:left-8 sm:top-8 md:bottom-8"
            style={{
              width: 300,
              pointerEvents: nametagOpacity > 0 ? 'auto' : 'none',
            }}
          >
            {/* Nametag crossfade — same A/B double-buffer as the image slots.
                Outer wrapper: UI hide/show opacity (0.12s).
                Sizer ghost (visibility:hidden, in-flow): always currentArtwork,
                  drives container height immediately on each advance so share
                  icons never lag behind a shrinking nametag.
                Two absolutely-overlaid slots crossfade at TRANSITION_MS. */}
            <div
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
                {renderNametag(artworks[deferredIdx])}{' '}
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
                {renderNametag(artworks[slotA.artworkIdx])}
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
                {renderNametag(artworks[slotB.artworkIdx])}
              </div>
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
