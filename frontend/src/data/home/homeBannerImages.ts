import { bannerImage1, bannerImage2, bannerImage3, bannerImage4 } from '@/assets/home/index';
import type { BannerItem } from '@/types/BannerItem';

export const bannerItems: BannerItem[] = [
  {
    id: 'waving_flag',
    src: bannerImage1,
    bannerColor: 'red',
    objectFit: 'cover',
    objectPosition: 'object-[65%_35%]',
  },
  {
    id: 'flags',
    src: bannerImage2,
    bannerColor: 'blue',
    objectFit: 'cover',
    objectPosition: 'object-bottom',
  },
  {
    id: 'fingerpainting',
    src: bannerImage3,
    bannerColor: 'red',
    objectFit: 'cover',
    objectPosition: 'object-bottom',
  },
  {
    id: 'wcf',
    src: bannerImage4,
    bannerColor: 'blue',
    objectFit: 'cover',
    objectPosition: 'object-top',
  },
];
