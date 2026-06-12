import pastFestival_1 from '@/modules/content/assets/worldChildrensFestival/pastFestival_1.webp';
import pastFestival_2 from '@/modules/content/assets/worldChildrensFestival/pastFestival_2.webp';
import pastFestival_3 from '@/modules/content/assets/worldChildrensFestival/pastFestival_3.webp';

import openingAddressThumb from '@/shared/assets/media/thumb/2021 World Childrens Festival opening address by Dr. Liston Bochette III.webp';
import watchThumb from '@/shared/assets/media/thumb/Swatchs master watchmaker at the World Childrens Festival.webp';
import musicThumb from '@/shared/assets/media/thumb/WCF Musical Celebration.webp';

import { ColorKey } from '@/modules/content/components/shared/FlairColorMap';
import { largeMedia } from '@/shared/lib/largeMedia';

//At this time missing video links for each video, and may need a poster to lay over the video.

export interface PastFestivalsData {
  id: number;
  title: string;
  paragraph: string;
  color: ColorKey;
  videoSrc: string;
  thumbSrc: string;
  magazineCover: string;
  magazineLink?: string;
}

export const pastFestivalsData: PastFestivalsData[] = [
  {
    id: 1,
    title: 'Empathy for a Better World',
    paragraph:
      'Featured creativity workshops, cultural performances, and leadership training.',
    color: 'red',
    videoSrc: largeMedia.wcf2021OpeningAddress,
    thumbSrc: openingAddressThumb,
    magazineCover: pastFestival_1,
    magazineLink: 'https://icaf.org/ChildArt/2021WCF/',
  },
  {
    id: 2,
    title: 'Creativity, Diversity, & Unity',
    paragraph:
      'Global collaboration through interactive arts and storytelling.',
    color: 'tertiaryYellow',
    videoSrc: largeMedia.swatchMasterWatchmaker,
    thumbSrc: watchThumb,
    magazineCover: pastFestival_2,
    magazineLink: 'https://icaf.org/ChildArt/Creativity,DiversityandUnity/',
  },
  {
    id: 3,
    title: 'Peace & Creativity',
    paragraph:
      'A landmark event showcasing art, dance, and music from young talents worldwide.',
    color: 'tertiaryBlue',
    videoSrc: largeMedia.wcfMusicalCelebration,
    thumbSrc: musicThumb,
    magazineCover: pastFestival_3,
    magazineLink: 'https://icaf.org/ChildArt/2011WCF/',
  },
];
