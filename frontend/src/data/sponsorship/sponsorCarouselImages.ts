import type { ICarouselImage } from '@/types/HomeCarousel';

const webpModules = import.meta.glob<{ default: string }>(
  '@/assets/sponsorship/*.webp',
  { eager: true },
);
const avifModules = import.meta.glob<{ default: string }>(
  '@/assets/sponsorship/*.webp',
  { eager: true, query: { format: 'avif' } },
);

// Preserve a specific display order by listing filenames explicitly
const order = [
  'adidas',
  'Anthropologie',
  'brother',
  'FaberCastellLogo',
  'FourSeasonsLogo',
  'Galeria',
  'LegoLogo',
  'MadewellLogo',
  'Safilo',
  'Wacom',
  'CannesLions_Logo-1_resized',
  'Ispo_logo_resized',
];

export const sponsorCarouselImages: ICarouselImage[] = order
  .map((name, i) => {
    const key = Object.keys(webpModules).find((k) => k.includes(`/${name}.webp`));
    if (!key) return null;
    return {
      id: i + 1,
      image: {
        webp: webpModules[key].default,
        avif: avifModules[key].default,
      },
    };
  })
  .filter((x) => x !== null) as ICarouselImage[];
