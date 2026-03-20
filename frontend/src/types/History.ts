import type { PictureSrc } from '@/components/shared/Picture';

export type TMomentsCarouselData = {
  src: PictureSrc;
  title: string;
  description: string | React.ReactNode;
  id: string;
};
