import BannerImage1 from '@/assets/home/BannerImage1.webp';
import BannerImage2 from '@/assets/home/BannerImage2.webp';
import BannerImage3 from '@/assets/home/BannerImage3.webp';
import BannerImage4 from '@/assets/home/BannerImage4.webp';
import { BannerItem } from '@/types/BannerItem';

export const bannerItems: BannerItem[] = [
  {
    id: 'waving_flag',
    src: BannerImage1,
    bannerColor: 'red',
    objectFit: 'cover',
    objectPosition: 'object-[65%_35%]',
  },
  {
    id: 'flags',
    src: BannerImage2,
    bannerColor: 'blue',
    objectFit: 'cover',
    objectPosition: 'object-bottom',
  },
  {
    id: 'fingerpainting',
    src: BannerImage3,
    bannerColor: 'red',
    objectFit: 'cover',
    objectPosition: 'object-bottom',
  },
  {
    id: 'wcf',
    src: BannerImage4,
    bannerColor: 'blue',
    objectFit: 'cover',
    objectPosition: 'object-bottom',
  },
];
