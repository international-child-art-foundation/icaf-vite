import { IProfessionalsHowToItem } from '@/types/Professionals';
import wcfLogo from '@/assets/shared/images/world-childrens-festival.webp';
import aoLogo from '@/assets/shared/images/arts-olympiad-7-transparent.svg';
import globe from '@/assets/shared/images/New-York-_Michael-Wong_---11.webp';
import { linkClasses } from '../linkClasses';
import yellowFirework from '@/assets/shared/images/yellowFirework.webp';
import { Link } from 'react-router-dom';

export const professionalsData: IProfessionalsHowToItem[] = [
  {
    title: 'Arts Olympiad',
    description: (
      <p>
        You can encourage your school to participate in the
        <Link to="/programs/arts-olympiad" className={linkClasses}>
          {' '}
          7th Arts Olympiad{' '}
        </Link>
        in 2025.
      </p>
    ),
    imgSrc: aoLogo,
    color: 'red',
  },
  {
    title: "World Children's Festival",
    description: (
      <p>
        You can host a workshop or volunteer at the{' '}
        <a
          href="https://worldchildrensfestival.org/"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClasses}
        >
          7th World Children's Festival
        </a>{' '}
        in the summer of 2026 at the National Mall across the U.S. Capitol.
      </p>
    ),
    imgSrc: wcfLogo,
    color: 'blue',
  },
  {
    title: 'Organize a Panel',
    description:
      "You can ask us to arrange a children's panel at your conference or exhibit children's art at your annual meeting. ",
    imgSrc: globe,
    color: 'green',
  },
  {
    title: 'Donations',
    description: (
      <p>
        You can adopt the ICAF as your charity by making a tax-deductible
        <Link to="/donate" className={linkClasses}>
          {' '}
          donation{' '}
        </Link>
        today.
      </p>
    ),
    imgSrc: yellowFirework,
    color: 'yellow',
  },
];
