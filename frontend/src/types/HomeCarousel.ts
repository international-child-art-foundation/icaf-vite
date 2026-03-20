import type { PictureSrc } from '@/components/shared/Picture';

export interface ICarouselImage {
  id: number;
  image: PictureSrc;
}

export type TCarouselImages = ICarouselImage[];
