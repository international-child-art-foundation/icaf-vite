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
import board from '@/assets/shared/images/icafGroupPhoto.webp';
import researchAndPublications from '@/assets/shared/images/about/UnitedStatesSLKorth.webp';

export interface NavChild {
  label: string;
  href: string;
  imageSrc: string;
  alt?: string;
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
        hoverDescription: "Learn about ICAF's history, see where it all began.",
      },
      {
        label: 'Team',
        href: '/about/team',
        imageSrc: team,
        hoverDescription: 'Learn about the people that work in ICAF.',
      },
      {
        label: 'Leadership',
        href: '/about/leadership',
        imageSrc: board,
        hoverDescription: "Learn about ICAF's leadership.",
      },
      {
        label: 'Research & Publications',
        href: '/about/research-and-publications',
        imageSrc: researchAndPublications,
        hoverDescription: 'Read our academic literature.',
      },
      {
        label: 'Partners',
        href: '/about/partners',
        imageSrc: partner,
        hoverDescription:
          'List of organizations and companies ICAF works with.',
      },
      {
        label: 'Impact',
        href: '/about/impact',
        imageSrc: impact,
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
        hoverDescription: '',
      },
      {
        label: 'ChildArt Magazine',
        href: '/programs/childart-magazine',
        imageSrc: childArt,
        hoverDescription: '',
      },
      {
        label: "World Children's Festival",
        href: '/programs/world-childrens-festival',
        imageSrc: world,
        hoverDescription: '',
      },
      {
        label: 'Peace Through Art',
        href: '/programs/peace-through-art',
        imageSrc: peace,
        hoverDescription: '',
      },
      {
        label: 'Climate Change',
        href: '/programs/climate-change',
        imageSrc: climate,
        hoverDescription: '',
      },
      {
        label: 'Healing Arts Program',
        href: '/programs/healing-arts',
        imageSrc: healing,
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
        label: 'Volunteers',
        href: '/get-involved/volunteers',
        imageSrc: volunteer,
        hoverDescription: 'Help ICAF achieve its vision.',
      },
      {
        label: 'Profesionals',
        href: '/get-involved/professionals',
        imageSrc: professional,
        hoverDescription: 'Collaborate professionally with ICAF.',
      },
      {
        label: 'Students',
        href: '/get-involved/students',
        imageSrc: student,
        hoverDescription: 'Express your creativity through ICAF initiatives.',
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
        hoverDescription: "See ICAF's recent activity.",
      },
      {
        label: 'Upcoming Events',
        href: 'https://worldchildrensfestival.org/',
        external: true,
        imageSrc: upcoming,
        hoverDescription: 'See what ICAF has planned for the future.',
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
