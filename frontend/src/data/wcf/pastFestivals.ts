import pastFestival_1 from '@/assets/worldChildrensFestival/pastFestival_1.png';
import pastFestival_2 from '@/assets/worldChildrensFestival/pastFestival_2.png';
import pastFestival_3 from '@/assets/worldChildrensFestival/pastFestival_3.png';

//At this time missing video links for each video, and may need a poster to lay over the video.

export interface PastFestivalsData {
  id: number;
  title: string;
  paragraph: string;
  color: string;
  src?: string;
}

export const pastFestivalsData: PastFestivalsData[] = [
  {
    id: 1,
    title: 'Empathy for a Better World',
    paragraph:
      'Featured creativity workshops, cultural performances, and leadership training.',
    color: '#EE2F4D',
    src: pastFestival_1,
  },
  {
    id: 2,
    title: 'Creativity, Diversity, & Unity',
    paragraph:
      'Global collaboration through interactive arts and storytelling.',
    color: '#FFBC42',
    src: pastFestival_2,
  },
  {
    id: 3,
    title: 'Peace & Creativity',
    paragraph:
      'A landmark event showcasing art, dance, and music from young talents worldwide.',
    color: '#2057CC',
    src: pastFestival_3,
  },
];
