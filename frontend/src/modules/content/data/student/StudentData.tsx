import {
  ICreativityItem,
  IStudentParticipationItem,
} from '@/modules/content/types/StudentTypes';
import { WCF_SITE_URL } from '@/modules/content/utils/outboundLinks';

import artsOlympiadLogo from '@/modules/content/assets/student/7th Arts Olympiad logo.webp';
import childArtLogo from '@/modules/content/assets/student/ChildArtLogo.webp';
import ICAFLogo from '@/modules/content/assets/student/ICAFLogo.webp';
import fistBump from '@/modules/content/assets/student/fistBump.svg';
import magnifyingGlass from '@/modules/content/assets/student/magnifyingGlass.svg';
import puzzlePiece from '@/modules/content/assets/student/puzzlePiece.svg';

export const creativityItems: ICreativityItem[] = [
  {
    id: 'experiment-and-explore',
    title: 'Experiment and Explore',
    body: 'Try new things and see what works.',
    imgSrc: magnifyingGlass,
  },
  {
    id: 'solve-problems',
    title: 'Solve Problems',
    body: 'Find unique ways to tackle challenges.',
    imgSrc: puzzlePiece,
  },
  {
    id: 'work-together',
    title: 'Work Together',
    body: 'Collaborate with others to create something wonderful.',
    imgSrc: fistBump,
  },
];

export const studentParticipationItems: IStudentParticipationItem[] = [
  {
    id: 'arts-olympiad',
    title: (
      <>
        Participate in the{' '}
        <span className="text-secondary-pink font-semibold">7th</span> Arts
        Olympiad
      </>
    ),
    forAges: 'For ages 8–12',
    bodyText1:
      'You’ll draw, be creative, and learn how to keep your mind and body strong like a true artist-athlete.',
    bodyText2: 'Want to join? Talk to your teacher!',
    buttonText: 'Show me how',
    color: 'red',
    link: '/programs/arts-olympiad',
    isExternal: false,
    imgSrc: artsOlympiadLogo,
  },
  {
    id: 'childart-magazine',
    title: <>Subscribe to ChildArt Magazine</>,
    forAges: 'For all ages',
    bodyText1:
      'Dive into colorful ideas, stories, and creations by young artists from around the world.',
    bodyText2: 'Want to read it? Ask your parents to subscribe!',
    buttonText: 'I want to read',
    color: 'green',
    link: '/programs/childart-magazine',
    isExternal: false,
    imgSrc: childArtLogo,
  },
  {
    id: 'world-childrens-festival',
    title: <>Experience the World Children’s Festival</>,
    forAges: 'For all ages',
    bodyText1:
      'Meet creative kids from everywhere and share your art in Washington, D.C., this summer.',
    bodyText2: 'Want to go? Visit the website to sign up!',
    buttonText: 'Register for free',
    color: 'yellow',
    link: WCF_SITE_URL,
    isExternal: true,
    imgSrc: ICAFLogo,
  },
];
