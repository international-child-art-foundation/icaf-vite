import type { TCarouselImages } from '@/types/HomeCarousel';

// Glob-import all carousel images in both formats.
// vite-imagetools processes ?format=avif at build time via the imagetools() plugin.
const webpModules = import.meta.glob<{ default: string }>(
  '@/assets/home/carousel/*.webp',
  { eager: true },
);
const avifModules = import.meta.glob<{ default: string }>(
  '@/assets/home/carousel/*.webp',
  { eager: true, query: { format: 'avif' } },
);

// Sort by filename so IDs are stable across builds
const sortedKeys = Object.keys(webpModules).sort();

export const carouselImages: TCarouselImages = sortedKeys.map((key, i) => ({
  id: i + 1,
  image: {
    webp: webpModules[key].default,
    avif: avifModules[key].default,
  },
}));
