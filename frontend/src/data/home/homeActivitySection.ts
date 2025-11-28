import { IActivitySection } from '@/types/HomeActivities';
import craftsImage from '@/assets/home/Crafts.webp';
import capitolImage from '@/assets/home/Capitol.webp';
import environmentImage from '@/assets/home/Environment.webp';
import heartImage from '@/assets/home/Heart.webp';
import lectureImage from '@/assets/home/Lecture.webp';
import presentationImage from '@/assets/home/Presentation.webp';
import olympiadImage from '@/assets/home/Olympiad.webp';
import magazineImage from '@/assets/home/Magazine.webp';

export const HomeActivities: IActivitySection = [
  [
    {
      id: 1,
      title: 'The Arts Olympiad*',
      description: 'The world’s most extensive school art program.',
      img: olympiadImage,
    },
    {
      id: 2,
      title: 'Peace through Art',
      description: 'Restore trust in humanity of children in conflict zones.',
      img: craftsImage,
    },
  ],
  [
    {
      id: 3,
      title: 'World Children’s Festival',
      description: 'At the National Mall across the U.S. Capitol.',
      img: capitolImage,
    },
    {
      id: 4,
      title: 'Youth Panels at Conferences',
      description: 'Give young people a voice to benefit professionals.',
      img: lectureImage,
    },
  ],
  [
    {
      id: 5,
      title: 'Quarterly Magazine',
      description:
        'An arts learning, new skill development, and global competency publication.',
      img: magazineImage,
    },
    {
      id: 6,
      title: 'World Children’s Award',
      description: 'Children choose to honor supporters and champions.',
      img: presentationImage,
    },
  ],
  [
    {
      id: 7,
      title: 'Healing Arts',
      description:
        'Revive faith in nature of child victims of natural disasters.',
      img: heartImage,
    },
    {
      id: 8,
      title: 'Research & writings',
      description:
        'Share with professionals what we have learned from and about children.',
      img: environmentImage,
    },
  ],
];
