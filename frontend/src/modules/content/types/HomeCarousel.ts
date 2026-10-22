import type { CSSProperties } from 'react';

export interface ICarouselImage {
  id: number;
  image: string;
  objectPosition?: CSSProperties['objectPosition'];
}

export type TCarouselImages = ICarouselImage[];
