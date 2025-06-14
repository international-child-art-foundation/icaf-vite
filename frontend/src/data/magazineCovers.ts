import cover1 from '@/assets/shared/images/navigation/programs/theArtOlympiad.webp';
import cover2 from '@/assets/shared/images/navigation/programs/worldChildrensFestival_small.webp';
import cover3 from '@/assets/shared/images/navigation/programs/peaceThroughArt_small.webp';

export interface MagazineCover {
  name: string;
  image: string;
}

export const magazineCovers: MagazineCover[] = [
  { name: 'ChildArt Magazine', image: cover1 },
  { name: 'ChildArt Magazine Small', image: cover2 },
  { name: 'The Art Olympiad', image: cover3 },
  { name: 'World Children Festival', image: cover1 },
  { name: 'Peace Through Art', image: cover2 },
  { name: 'ChildArt Magazine Repeat 1', image: cover3 },
  { name: 'ChildArt Magazine Small Repeat 1', image: cover1 },
  { name: 'The Art Olympiad Repeat 1', image: cover2 },
  { name: 'World Children Festival Repeat 1', image: cover3 },
  { name: 'Peace Through Art Repeat 1', image: cover1 },
  { name: 'ChildArt Magazine Repeat 2', image: cover2 },
  { name: 'ChildArt Magazine Small Repeat 2', image: cover3 },
];
