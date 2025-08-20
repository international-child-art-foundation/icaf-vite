// BannerImageCarousel.tsx
import React from 'react';
import { BannerItem } from '@/types/BannerItem';
import { BannerImage } from './BannerImage';
import { useWindowSize } from 'usehooks-ts';

interface BannerImageCarouselProps {
  items: BannerItem[];
  displayMs?: number;
  transitionMs?: number;
  className?: string;
}

export function BannerImageCarousel({
  items,
  displayMs = 2000,
  transitionMs = 500,
  className = 'w-full',
}: BannerImageCarouselProps) {
  const size = useWindowSize();

  let carousel_height;
  switch (true) {
    case size.width > 1024:
      carousel_height = 800;
      break;
    case size.width > 768:
      carousel_height = 600;
      break;
    case size.width > 640:
      carousel_height = 500;
      break;
    default:
      carousel_height = 400;
      break;
  }

  if (!items?.length) return null;

  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(
      () => setIndex((p) => (p + 1) % items.length),
      Math.max(200, displayMs + transitionMs),
    );
    return () => clearInterval(id);
  }, [items.length, displayMs, transitionMs]);

  const layerBase =
    'absolute inset-0 transition-opacity ease-in-out motion-reduce:transition-none';

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ height: carousel_height }}
    >
      {items.map((item, i) => (
        <div
          key={item.id ?? i}
          className={`${layerBase} ${i === index ? 'opacity-100' : 'opacity-0'}`}
          style={{
            height: carousel_height,
            transitionDuration: `${transitionMs}ms`,
          }}
          aria-hidden={i !== index}
        >
          <BannerImage data={item} height={carousel_height} />
        </div>
      ))}

      <span className="sr-only" aria-live="polite">
        Slide {index + 1} of {items.length}
      </span>
    </div>
  );
}
