import { useEffect, useRef, useState } from 'react';
import { BannerItem } from '@/modules/content/types/BannerItem';
import { BannerImage } from './BannerImage';
import { useWindowSize } from 'usehooks-ts';

interface BannerImageCarouselProps {
  items: BannerItem[];
  displayMs?: number;
  transitionMs?: number;
  initialDelayMs?: number;
  className?: string;
}

export function BannerImageCarousel({
  items,
  displayMs = 2000,
  transitionMs = 500,
  initialDelayMs = 750,
  className = 'w-full',
}: BannerImageCarouselProps) {
  const size = useWindowSize();

  const [slideState, setSlideState] = useState<{
    current: number;
    previous: number | null;
  }>({ current: 0, previous: null });
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [hasEverBeenNearViewport, setHasEverBeenNearViewport] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemCount = items?.length ?? 0;

  let carousel_height: number;
  switch (true) {
    case size.width >= 1024:
      carousel_height = 800;
      break;
    case size.width >= 768:
      carousel_height = 600;
      break;
    case size.width >= 640:
      carousel_height = 500;
      break;
    default:
      carousel_height = 500;
      break;
  }

  useEffect(() => {
    if (itemCount === 0) return;
    if (slideState.current < itemCount) return;
    setSlideState({ current: 0, previous: null });
  }, [itemCount, slideState.current]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsNearViewport(true);
      setHasEverBeenNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nearViewport = entry.isIntersecting;
        setIsNearViewport(nearViewport);

        if (nearViewport) {
          setHasEverBeenNearViewport(true);
        }
      },
      {
        rootMargin: '100px 0px',
        threshold: 0,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isNearViewport || itemCount < 2) return;

    const advanceSlide = () => {
      setSlideState((previousState) => ({
        current: (previousState.current + 1) % itemCount,
        previous: previousState.current,
      }));
    };

    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(
      () => {
        advanceSlide();

        intervalId = setInterval(
          advanceSlide,
          Math.max(200, displayMs + transitionMs),
        );
      },
      Math.max(0, initialDelayMs),
    );

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isNearViewport, itemCount, displayMs, transitionMs, initialDelayMs]);

  useEffect(() => {
    if (slideState.previous === null) return;

    const timeoutId = setTimeout(() => {
      setSlideState((currentState) => {
        if (currentState.previous !== slideState.previous) {
          return currentState;
        }

        return {
          ...currentState,
          previous: null,
        };
      });
    }, transitionMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [slideState.previous, transitionMs]);

  if (!itemCount) return null;

  const index = slideState.current % itemCount;
  const nextIndex = itemCount > 1 ? (index + 1) % itemCount : index;

  const layerBase =
    'absolute inset-0 transition-opacity ease-in-out motion-reduce:transition-none';

  return (
    <div
      ref={containerRef}
      className={`breakout-w relative overflow-hidden ${className}`}
      style={{ height: carousel_height }}
    >
      {hasEverBeenNearViewport &&
        items.map((item, i) => {
          const shouldRenderSlide =
            i === index || i === slideState.previous || i === nextIndex;

          if (!shouldRenderSlide) return null;

          return (
            <div
              key={item.id ?? i}
              className={`${layerBase} ${
                i === index ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                height: carousel_height,
                transitionDuration: `${transitionMs}ms`,
              }}
              aria-hidden={i !== index}
            >
              <BannerImage data={item} height={carousel_height} />
            </div>
          );
        })}

      <span className="sr-only">
        Slide {index + 1} of {items.length}
      </span>
    </div>
  );
}
