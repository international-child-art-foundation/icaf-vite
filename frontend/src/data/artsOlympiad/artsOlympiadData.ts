import type { ArtsOlympiadHelpfulLink } from '@/types/ArtsOlympiadTypes';

import HlImg1 from '@/assets/artsOlympiad/hl-img1.webp';
import HlImg2 from '@/assets/artsOlympiad/hl-img2.webp';
import HlImg3 from '@/assets/artsOlympiad/hl-img3.webp';
import HlImg4 from '@/assets/artsOlympiad/hl-img4.webp';
import HlImg5 from '@/assets/artsOlympiad/hl-img5.webp';

export const artsOlympiadHelpfulLinks: ArtsOlympiadHelpfulLink[] = [
  {
    id: 'suffolk-times-coverage',
    imageSrc: HlImg1,
    href: 'https://suffolktimes.timesreview.com/2019/01/new-suffolk-students-compete-in-art-olympics/',
    description: 'News coverage of the Arts Olympiad: Suffolk Times.',
    label: 'Suffolk Times coverage',
    external: true,
  },
  {
    id: 'stories-texas',
    imageSrc: HlImg2,
    href: '/documents/Arts-Olympiad-Stories-Texas.pdf',
    description:
      'Arts Olympiad in Texas, China, Croatia, Israel, and New Zealand.',
    label: 'Arts Olympiad stories',
    external: true,
  },
  {
    id: 'childart-magazine',
    imageSrc: HlImg3,
    href: '/ChildArt/2021WCF/',
    description:
      'ChildArt Magazine on the 6th Arts Olympiad and the 6th World Children’s Festival.',
    label: 'ChildArt magazine flipbook',
    external: true,
  },
  {
    id: 'pta-article',
    imageSrc: HlImg4,
    href: 'https://ptaourchildren.org/how-to-prepare-children-for-the-fourth-industrial-revolution/',
    description:
      'How to Prepare Children for the Fourth Industrial Revolution, Our Children, National PTA, May 2021.',
    label: 'National PTA article',
    external: true,
  },
  {
    id: 'schoolarts-article',
    imageSrc: HlImg5,
    href: '/documents/Focus_In_ICAF_SchoolArts_5_21.pdf',
    description:
      'The International Child Art Foundation. SchoolArts Magazine, May 2021.',
    label: 'SchoolArts magazine article',
    external: true,
  },
];
