import pastFestival_1 from '@/assets/worldChildrensFestival/pastFestival_1.webp';
import pastFestival_2 from '@/assets/worldChildrensFestival/pastFestival_2.webp';
import pastFestival_3 from '@/assets/worldChildrensFestival/pastFestival_3.webp';

import openingAddressThumb from '@/assets/shared/media/thumb/2021 World Childrens Festival opening address by Dr. Liston Bochette III.webp';
import watchThumb from '@/assets/shared/media/thumb/Swatchs master watchmaker at the World Childrens Festival.webp';
import musicThumb from '@/assets/shared/media/thumb/WCF Musical Celebration.webp';

import openingAddressVideo from '@/assets/shared/media/2021 World Childrens Festival opening address by Dr. Liston Bochette III.mp4';
import watchVideo from '@/assets/shared/media/Swatchs master watchmaker at the World Childrens Festival.mp4';
import musicVideo from '@/assets/shared/media/WCF Musical Celebration.mp4';
import { ColorKey } from '@/components/shared/FlairColorMap';

//At this time missing video links for each video, and may need a poster to lay over the video.

export interface PastFestivalsData {
  id: number;
  title: string;
  paragraph: string;
  color: ColorKey;
  videoSrc: string;
  thumbSrc: string;
  magazineCover: string;
}

export const pastFestivalsData: PastFestivalsData[] = [
  {
    id: 1,
    title: 'Empathy for a Better World',
    paragraph:
      'Featured creativity workshops, cultural performances, and leadership training.',
    color: 'red',
    videoSrc: openingAddressVideo,
    thumbSrc: openingAddressThumb,
    magazineCover: pastFestival_1,
  },
  {
    id: 2,
    title: 'Creativity, Diversity, & Unity',
    paragraph:
      'Global collaboration through interactive arts and storytelling.',
    color: 'tertiaryYellow',
    videoSrc: watchVideo,
    thumbSrc: watchThumb,
    magazineCover: pastFestival_2,
  },
  {
    id: 3,
    title: 'Peace & Creativity',
    paragraph:
      'A landmark event showcasing art, dance, and music from young talents worldwide.',
    color: 'tertiaryBlue',
    videoSrc: musicVideo,
    thumbSrc: musicThumb,
    magazineCover: pastFestival_3,
  },
];
