import history from '../assets/shared/images/navigation/about/history_small.webp';
import team from '../assets/shared/images/navigation/about/team_small.webp';
import partner from '../assets/shared/images/navigation/about/partners_small.webp';
import impact from '../assets/shared/images/navigation/about/impact_small.webp';
import childArt from '../assets/shared/images/navigation/programs/childArtMagazine_small.webp';
import climate from '../assets/shared/images/navigation/programs/climateChange_smaller.webp';
import healing from '../assets/shared/images/navigation/programs/healingArtsProgram_smaller.webp';
import peace from '../assets/shared/images/navigation/programs/peaceThroughArt_small.webp';
import theArtOlypiad from '../assets/shared/images/navigation/programs/theArtOlympiad_small.webp';
import world from '../assets/shared/images/navigation/programs/worldChildrensFestival_small.webp';
import professional from '../assets/shared/images/navigation/getInvolved/professional.webp';
import student from '../assets/shared/images/navigation/getInvolved/student_small.webp';
import volunteer from '../assets/shared/images/navigation/getInvolved/volunteer.webp';
import latest from '../assets/shared/images/navigation/news/latestNews_small.webp';
import upcoming from '../assets/shared/images/navigation/news/upcomingEvents.webp';

export interface NavChild {
  label: string;
  href: string;
  imageSrc: string;
  alt: string;
  external?: boolean;
  hoverDescription: string;
}

export interface NavItem {
  key: string;
  label: string;
  navLabel: string;
  href?: string;
  children?: NavChild[];
}

export const navItems: NavItem[] = [
  {
    key: 'about',
    label: 'About',
    navLabel: 'About',
    href: '/about',
    children: [
      {
        label: 'History',
        href: '/about/history',
        imageSrc: history,
        alt: 'Our history',
        hoverDescription: "Learn about ICAF's history, see where it all began.",
      },
      {
        label: 'Team',
        href: '/about/team',
        imageSrc: team,
        alt: 'Our team',
        hoverDescription: 'Learn about the people that work in ICAF.',
      },
      {
        label: 'Partners',
        href: '/about/partners',
        imageSrc: partner,
        alt: 'Our partners',
        hoverDescription:
          'List of organizations and companies ICAF works with.',
      },
      {
        label: 'Impact',
        href: '/about/impact',
        imageSrc: impact,
        alt: 'Our partners',
        hoverDescription:
          'List of organizations and companies ICAF works with.',
      },
    ],
  },
  {
    key: 'programs',
    label: 'Programs',
    navLabel: 'Programs',
    children: [
      {
        label: 'Arts Olympiad',
        href: '/programs/arts-olympiad',
        imageSrc: theArtOlypiad,
        alt: 'The Art Olympiad gallery',
        hoverDescription: '',
      },
      {
        label: 'ChildArt Magazine',
        href: '/programs/childart-magazine',
        imageSrc: childArt,
        alt: 'Child Art Magazine',
        hoverDescription: '',
      },
      {
        label: "World Children's Festival",
        href: '/programs/world-childrens-festival',
        imageSrc: world,
        alt: "World Children's Festival",
        hoverDescription: '',
      },
      {
        label: 'Peace Through Art',
        href: '/programs/peace-through-art',
        imageSrc: peace,
        alt: 'Peace',
        hoverDescription: '',
      },
      {
        label: 'Climate Change',
        href: '/programs/climate-change',
        imageSrc: climate,
        alt: 'Climate Change',
        hoverDescription: '',
      },
      {
        label: 'Healing Arts Program',
        href: '/programs/healing-arts',
        imageSrc: healing,
        alt: 'healing',
        hoverDescription: '',
      },
    ],
  },
  {
    key: 'get-involved',
    label: 'Get Involved',
    navLabel: 'Get Involved',
    children: [
      {
        label: 'Volunteer',
        href: '/get-involved/volunteer',
        imageSrc: volunteer,
        alt: 'Volunteer with us',
        hoverDescription: '',
      },
      {
        label: 'Profesionals',
        href: '/get-involved/professionals',
        imageSrc: professional,
        alt: 'Make a donation',
        hoverDescription: '',
      },
      {
        label: 'Student',
        href: '/get-involved/student',
        imageSrc: student,
        alt: 'Make a donation',
        hoverDescription: '',
      },
      // {
      //   label: 'Corporate Partnerships',
      //   href: '/get-involved/corporation',
      //   imageSrc: corporate,
      //   alt: 'Make a donation',
      //   hoverDescription: '',
      // },
    ],
  },
  {
    key: 'news-events',
    label: 'News & Events',
    navLabel: 'News & Events',
    children: [
      {
        label: 'Latest News',
        href: '/news-events/news',
        imageSrc: latest,
        alt: 'Latest news',
        hoverDescription: '',
      },
      {
        label: 'Upcoming Events',
        href: 'https://worldchildrensfestival.org/',
        external: true,
        imageSrc: upcoming,
        alt: 'Upcoming events',
        hoverDescription: '',
      },
    ],
  },
  {
    key: 'sponsorship',
    label: 'Sponsorship',
    navLabel: 'Sponsorship',
    href: '/sponsorship',
    children: [],
  },
  // {
  //   key: 'gallery',
  //   label: 'Gallery',
  //   navLabel: 'Gallery',
  //   href: '/gallery',
  //   children: [
  //     {
  //       label: 'Recent',
  //       href: '/gallery/recent',
  //       imageSrc: gallery,
  //       alt: 'Recent art',
  //       hoverDescription: '',
  //     },
  //     {
  //       label: 'Annual Reports',
  //       href: '/gallery/all',
  //       imageSrc: annual,
  //       alt: 'All submissions',
  //       hoverDescription: '',
  //     },
  //   ],
  // },
];
