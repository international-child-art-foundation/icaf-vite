import { IActivitySection } from '@/types/HomeActivities';
import craftsImage from '@/assets/home/Crafts.png';
import capitolImage from '@/assets/home/Capitol.png';
import environmentImage from '@/assets/home/Environment.png';
import heartImage from '@/assets/home/Heart.png';
import lectureImage from '@/assets/home/Lecture.png';
import presentationImage from '@/assets/home/Presentation.png';
import olympiadImage from '@/assets/home/Olympiad.png';
import magazineImage from '@/assets/home/Magazine.png';

export const HomeActivities: IActivitySection = [
  [
    {
      id: 1,
      title: 'The Arts Olympiad*',
      description: 'The largest-ever school art program',
      img: olympiadImage,
    },
    {
      id: 2,
      title: 'Peace through Art',
      description: 'Revive trust in humanity of children in conflict zones',
      img: craftsImage,
    },
  ],
  [
    {
      id: 3,
      title: 'World Children’s Festival',
      description: 'At the National Mall across the U.S. Capitol',
      img: capitolImage,
    },
    {
      id: 4,
      title: 'Youth’s panel at conferences',
      description: 'Giving voice to children and educating adults',
      img: lectureImage,
    },
  ],
  [
    {
      id: 5,
      title: 'Quarterly Magazine',
      description: 'Arts learning and global competency distributed quarterly',
      img: magazineImage,
    },
    {
      id: 6,
      title: 'World Children’s Award',
      description: 'Honoring leaders children adore',
      img: presentationImage,
    },
  ],
  [
    {
      id: 7,
      title: 'Healing Arts',
      description:
        'Revive faith in nature of child victims of natural disasters',
      img: heartImage,
    },
    {
      id: 8,
      title: 'Research & writings',
      description: 'Research on children and their art & future',
      img: environmentImage,
    },
  ],
];
