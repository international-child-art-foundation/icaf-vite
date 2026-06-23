import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { X } from 'lucide-react';
import { MobileImageSwiper } from './MobileImageSwiper';
import { MobileLip, LIP_COLLAPSED_H } from './MobileLip';
import { useGallerySlideshowState } from './useGallerySlideshowState';
import type {
  IGalleryContext,
  TResolvedArtwork,
} from '@/modules/content/types/Gallery';

const MOBILE_STYLES = `
  @keyframes mob-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const AXIS_LOCK_PX = 8;
const TAP_MAX_PX = 10;
const LIP_VEL_THRESH = 0.35;
const SWIPE_VEL_THRESH = 0.3;
const SWIPE_DIST_THRESH = 0.14;
const LIP_MAX_HEIGHT_RATIO = 0.6;

type Axis = 'none' | 'vertical' | 'horizontal';
type LipMeasureKey = 'current' | 'prev' | 'next';

interface VelSample {
  v: number;
  t: number;
}
interface GestureState {
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  axis: Axis;
  startedInLip: boolean;
  startLipY: number;
  velHistX: VelSample[];
  velHistY: VelSample[];
  activeTouchId: number;
}

function computeVel(hist: VelSample[], now: number): number {
  const cutoff = now - 100;
  const recent = hist.filter((s) => s.t >= cutoff);
  if (recent.length < 2) return 0;
  const first = recent[0];
  const last = recent[recent.length - 1];
  const dt = last.t - first.t;
  return dt > 0 ? (last.v - first.v) / dt : 0;
}

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

const getWrappedIndex = (index: number, length: number) =>
  (index + length) % length;

const createArtworkShareUrl = (
  artworkId: string,
  fallbackShareUrl: string,
) => {
  const url = new URL(fallbackShareUrl || window.location.href);
  url.pathname = '/gallery/slideshow';
  url.searchParams.set('id', artworkId);
  return url.toString();
};

const MeasuredLip = ({
  artwork,
  lipY,
  maxLipY,
  shareUrl,
  measureKey,
  onMeasure,
}: {
  artwork: TResolvedArtwork;
  lipY: number;
  maxLipY: number;
  shareUrl: string;
  measureKey: LipMeasureKey;
  onMeasure: (key: LipMeasureKey, height: number) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () =>
      onMeasure(measureKey, el.getBoundingClientRect().height);
    measure();

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [artwork, lipY, maxLipY, measureKey, onMeasure, shareUrl]);

  return (
    <div ref={ref}>
      <MobileLip
        artwork={artwork}
        lipY={lipY}
        maxLipY={maxLipY}
        contentOpacity={1}
        shareUrl={shareUrl}
      />
    </div>
  );
};

export const GallerySlideshowMobile = ({
  context,
  onClose: closeOverride,
}: {
  context?: IGalleryContext;
  onClose?: () => void;
}) => {
  const {
    artworks,
    currentIdx,
    currentArtwork,
    advance,
    uiState,
    resetUiTimer,
    applyArtworkKudos,
    artworkShareUrl,
    onClose,
  } = useGallerySlideshowState(context, closeOverride);

  const stableViewportRef = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [screenW, setScreenW] = useState(() => stableViewportRef.current.width);
  const [stableScreenH, setStableScreenH] = useState(
    () => stableViewportRef.current.height,
  );
  useEffect(() => {
    const handler = () => {
      const nextWidth = window.innerWidth;
      const nextHeight = window.innerHeight;
      const prev = stableViewportRef.current;

      if (Math.abs(nextWidth - prev.width) > 24) {
        stableViewportRef.current = {
          width: nextWidth,
          height: nextHeight,
        };
        setScreenW(nextWidth);
        setStableScreenH(nextHeight);
        return;
      }

      stableViewportRef.current = {
        width: nextWidth,
        height: Math.max(prev.height, nextHeight),
      };
      setScreenW(nextWidth);
      setStableScreenH((current) => Math.max(current, nextHeight));
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const [lipY, setLipY] = useState(0);
  const lipYRef = useRef(0);
  const maxLipY = Math.max(
    0,
    Math.max(300, stableScreenH * LIP_MAX_HEIGHT_RATIO) - LIP_COLLAPSED_H,
  );
  const [lipMeasurements, setLipMeasurements] = useState<
    Partial<Record<LipMeasureKey, number>>
  >({});
  const handleLipMeasure = useCallback(
    (key: LipMeasureKey, height: number) => {
      setLipMeasurements((current) => {
        if (Math.abs((current[key] ?? 0) - height) < 0.5) return current;
        return { ...current, [key]: height };
      });
    },
    [],
  );

  const lipAnimRef = useRef<number | null>(null);
  const cancelLipAnim = () => {
    if (lipAnimRef.current !== null) {
      cancelAnimationFrame(lipAnimRef.current);
      lipAnimRef.current = null;
    }
  };

  const animateLipTo = useCallback((target: number) => {
    cancelLipAnim();
    const from = lipYRef.current;
    if (from === target) return;
    const startTime = performance.now();
    const duration = 150;

    const step = (now: number) => {
      const elapsed = Math.min(now - startTime, duration);
      const y = from + (target - from) * easeOutCubic(elapsed / duration);
      lipYRef.current = y;
      setLipY(y);
      if (elapsed < duration) {
        lipAnimRef.current = requestAnimationFrame(step);
      } else {
        lipYRef.current = target;
        setLipY(target);
        lipAnimRef.current = null;
      }
    };
    lipAnimRef.current = requestAnimationFrame(step);
  }, []);

  const [dragX, setDragX] = useState(0);
  const dragXRef = useRef(0);
  const [peekDir, setPeekDir] = useState<1 | -1>(1);
  const [showPeek, setShowPeek] = useState(false);
  const [withTransition, setWithTransition] = useState(false);
  const swipeProgress = Math.min(
    Math.abs(dragX) / Math.max(screenW * 0.42, 1),
    1,
  );

  const imgAnimRef = useRef<number | null>(null);
  const cancelImgAnim = () => {
    if (imgAnimRef.current !== null) {
      cancelAnimationFrame(imgAnimRef.current);
      imgAnimRef.current = null;
    }
  };

  const animateDragXTo = useCallback((target: number, onDone?: () => void) => {
    cancelImgAnim();
    const from = dragXRef.current;
    if (from === target) {
      onDone?.();
      return;
    }
    const startTime = performance.now();
    const duration = 150;

    const step = (now: number) => {
      const elapsed = Math.min(now - startTime, duration);
      const x = from + (target - from) * easeOutCubic(elapsed / duration);
      dragXRef.current = x;
      setDragX(x);
      if (elapsed < duration) {
        imgAnimRef.current = requestAnimationFrame(step);
      } else {
        dragXRef.current = target;
        setDragX(target);
        imgAnimRef.current = null;
        onDone?.();
      }
    };
    imgAnimRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(
    () => () => {
      cancelLipAnim();
      cancelImgAnim();
    },
    [],
  );

  const handleAdvance = useCallback(
    (dir: 1 | -1) => {
      const sw = screenW;
      setPeekDir(dir);
      setShowPeek(true);
      setWithTransition(false);

      const target = dir < 0 ? sw : -sw;
      animateDragXTo(target, () => {
        advance(dir);
        dragXRef.current = 0;
        setDragX(0);
        setShowPeek(false);
        resetUiTimer();
      });
    },
    [screenW, advance, animateDragXTo, resetUiTimer],
  );

  const [artFocus, setArtFocus] = useState(false);
  const lipContentOpacity = artFocus ? 0 : 1 - swipeProgress;
  const [showHint, setShowHint] = useState(false);
  useEffect(() => {
    if (!artFocus) {
      setShowHint(false);
      return;
    }
    setShowHint(true);
    const t = setTimeout(() => setShowHint(false), 2000);
    return () => clearTimeout(t);
  }, [artFocus]);

  useEffect(() => {
    if (artworks.length > 1) {
      const img = new window.Image();
      img.src = artworks[(currentIdx + 1) % artworks.length].displayUrl;
    }
  }, [currentIdx, artworks]);

  const gestureRef = useRef<GestureState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (gestureRef.current) return;
      const touch = e.changedTouches[0];
      const totalLipH = LIP_COLLAPSED_H + lipYRef.current;
      const startedInLip = touch.clientY > window.innerHeight - totalLipH;

      gestureRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        lastX: touch.clientX,
        lastY: touch.clientY,
        axis: 'none',
        startedInLip,
        startLipY: lipYRef.current,
        velHistX: [{ v: touch.clientX, t: performance.now() }],
        velHistY: [{ v: touch.clientY, t: performance.now() }],
        activeTouchId: touch.identifier,
      };

      dragXRef.current = 0;
      setDragX(0);
      setPeekDir(1);
      setShowPeek(false);
      cancelImgAnim();
    };

    const onTouchMove = (e: TouchEvent) => {
      const g = gestureRef.current;
      if (!g || e.touches.length > 1) return;

      let touch: Touch | null = null;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === g.activeTouchId) {
          touch = e.changedTouches[i];
          break;
        }
      }
      if (!touch) return;

      const now = performance.now();
      const dx = touch.clientX - g.startX;
      const dy = touch.clientY - g.startY;

      g.velHistX.push({ v: touch.clientX, t: now });
      g.velHistY.push({ v: touch.clientY, t: now });
      const cutoff = now - 120;
      g.velHistX = g.velHistX.filter((s) => s.t >= cutoff);
      g.velHistY = g.velHistY.filter((s) => s.t >= cutoff);

      if (g.axis === 'none') {
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        if (absDx > AXIS_LOCK_PX || absDy > AXIS_LOCK_PX) {
          if (absDy >= absDx && !artFocus) {
            g.axis = 'vertical';
          } else if (absDx > absDy) {
            g.axis = 'horizontal';
          }
        }
      }

      if (g.axis === 'vertical') {
        if (e.cancelable) e.preventDefault();
        const delta = -dy;
        const newY = Math.max(0, Math.min(maxLipY, g.startLipY + delta));
        lipYRef.current = newY;
        setLipY(newY);
        cancelLipAnim();
      } else if (g.axis === 'horizontal') {
        if (e.cancelable) e.preventDefault();
        dragXRef.current = dx;
        setDragX(dx);
        const dir: 1 | -1 = dx < 0 ? 1 : -1;
        setPeekDir(dir);
        const absDx = Math.abs(dx);
        setShowPeek(absDx > 4);
      }

      g.lastX = touch.clientX;
      g.lastY = touch.clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const g = gestureRef.current;
      if (!g) return;

      let found = false;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === g.activeTouchId) {
          found = true;
          break;
        }
      }
      if (!found) return;

      const now = performance.now();
      const totalDx = g.lastX - g.startX;
      const totalDy = g.lastY - g.startY;

      if (g.axis === 'vertical') {
        const velY = -computeVel(g.velHistY, now);
        const cur = lipYRef.current;
        const max = maxLipY;

        let target: number;
        if (velY > LIP_VEL_THRESH) {
          target = max;
        } else if (velY < -LIP_VEL_THRESH) {
          target = 0;
        } else {
          target = cur > max * 0.3 ? max : 0;
        }
        animateLipTo(target);
      } else if (g.axis === 'horizontal') {
        const sw = window.innerWidth;
        const velX = computeVel(g.velHistX, now);
        const dir: 1 | -1 = totalDx < 0 ? 1 : -1;

        let shouldAdvance: boolean;
        if (Math.abs(velX) > SWIPE_VEL_THRESH) {
          shouldAdvance = true;
        } else {
          shouldAdvance = Math.abs(totalDx) > sw * SWIPE_DIST_THRESH;
        }

        if (shouldAdvance) {
          handleAdvance(dir);
        } else {
          cancelImgAnim();
          setShowPeek(false);
          animateDragXTo(0);
        }
      } else if (
        g.axis === 'none' &&
        !g.startedInLip &&
        g.lastY > 50 &&
        e.touches.length < 2
      ) {
        const movedPx = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
        if (movedPx < TAP_MAX_PX) {
          setArtFocus((prev) => {
            const entering = !prev;
            if (entering) animateLipTo(0);
            return entering;
          });
          resetUiTimer();
        }
      }

      gestureRef.current = null;
    };

    const onTouchCancel = () => {
      const g = gestureRef.current;
      if (!g) return;
      if (g.axis === 'horizontal') {
        setShowPeek(false);
        animateDragXTo(0);
      }
      gestureRef.current = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [
    artFocus,
    animateLipTo,
    handleAdvance,
    animateDragXTo,
    maxLipY,
    resetUiTimer,
  ]);

  if (artworks.length === 0) return null;

  const uiOpacity = artFocus
    ? 0
    : uiState === 'full'
      ? 1
      : uiState === 'dim'
        ? 0.35
        : 0;
  const uiPointerEvents =
    artFocus || uiState === 'hidden' ? 'none' : ('auto' as const);

  const lipDisplayArtwork = currentArtwork ?? artworks[currentIdx];
  const prevArtwork =
    artworks.length > 0
      ? artworks[getWrappedIndex(currentIdx - 1, artworks.length)]
      : null;
  const nextArtwork =
    artworks.length > 0
      ? artworks[getWrappedIndex(currentIdx + 1, artworks.length)]
      : null;
  const getShareUrl = (artwork: TResolvedArtwork) =>
    createArtworkShareUrl(artwork.id, artworkShareUrl);
  const shareUrl = lipDisplayArtwork
    ? getShareUrl(lipDisplayArtwork)
    : artworkShareUrl;
  const lipFallbackHeight = LIP_COLLAPSED_H + lipY;
  const currentLipHeight = lipMeasurements.current ?? lipFallbackHeight;
  const targetLipHeight =
    (peekDir > 0 ? lipMeasurements.next : lipMeasurements.prev) ??
    currentLipHeight;
  const visibleLipHeight = lerp(
    currentLipHeight,
    targetLipHeight,
    swipeProgress,
  );
  const lipContentOffsetY = visibleLipHeight - currentLipHeight;

  return (
    <>
      <style>{MOBILE_STYLES}</style>
      <div
        ref={containerRef}
        className="fixed inset-0 select-none"
        style={{
          zIndex: 200,
          animation: 'mob-fade-in 300ms ease-out both',
          touchAction: 'pan-x pan-y',
          display: 'flex',
          flexDirection: 'column',
          background: 'white',
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <MobileImageSwiper
            artworks={artworks}
            currentIdx={currentIdx}
            dragX={dragX}
            peekDir={peekDir}
            showPeek={showPeek}
            withTransition={withTransition}
            screenW={screenW}
          />

          <div
            className="absolute right-4 top-4"
            style={{
              zIndex: 300,
              opacity: uiOpacity,
              transition: 'opacity 0.15s ease-out',
              pointerEvents: uiPointerEvents,
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="rounded-full bg-black/15 p-2.5 text-gray-800 backdrop-blur-sm transition-colors active:bg-black/25"
              aria-label="Close slideshow"
            >
              <X size={20} />
            </button>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 14,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
              background: 'rgba(0,0,0,0.42)',
              color: 'white',
              borderRadius: 20,
              padding: '5px 14px',
              fontSize: 16,
              fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              opacity: showHint ? 1 : 0,
              transition: 'opacity 0.4s ease',
            }}
          >
            Tap to show info
          </div>
        </div>

        {/* Lip panel — sits at the bottom, naturally sized by content */}
        <div
          style={{
            opacity: artFocus ? 0 : 1,
            transition: 'opacity 0.25s ease',
            pointerEvents: artFocus ? 'none' : 'auto',
            flexShrink: 0,
            height: visibleLipHeight,
            overflow: 'hidden',
          }}
        >
          {lipDisplayArtwork && (
            <MobileLip
              artwork={lipDisplayArtwork}
              lipY={lipY}
              maxLipY={maxLipY}
              contentOpacity={lipContentOpacity}
              height="100%"
              contentHeight={currentLipHeight}
              contentOffsetY={lipContentOffsetY}
              shareUrl={shareUrl}
              onKudosApplied={applyArtworkKudos}
            />
          )}
        </div>

        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: 0,
            bottom: 0,
            width: '100%',
            visibility: 'hidden',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        >
          {lipDisplayArtwork && (
            <MeasuredLip
              key={`current-${lipDisplayArtwork.id}`}
              artwork={lipDisplayArtwork}
              lipY={lipY}
              maxLipY={maxLipY}
              shareUrl={shareUrl}
              measureKey="current"
              onMeasure={handleLipMeasure}
            />
          )}
          {prevArtwork && (
            <MeasuredLip
              key={`prev-${prevArtwork.id}`}
              artwork={prevArtwork}
              lipY={lipY}
              maxLipY={maxLipY}
              shareUrl={getShareUrl(prevArtwork)}
              measureKey="prev"
              onMeasure={handleLipMeasure}
            />
          )}
          {nextArtwork && (
            <MeasuredLip
              key={`next-${nextArtwork.id}`}
              artwork={nextArtwork}
              lipY={lipY}
              maxLipY={maxLipY}
              shareUrl={getShareUrl(nextArtwork)}
              measureKey="next"
              onMeasure={handleLipMeasure}
            />
          )}
        </div>
      </div>
    </>
  );
};
