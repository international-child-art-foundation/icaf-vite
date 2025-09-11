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
import corporate from '../assets/shared/images/navigation/getInvolved/corporatePartnership.webp';
import professional from '../assets/shared/images/navigation/getInvolved/professional.webp';
import student from '../assets/shared/images/navigation/getInvolved/student_small.webp';
import volunteer from '../assets/shared/images/navigation/getInvolved/volunteer.webp';
import latest from '../assets/shared/images/navigation/news/latestNews_small.webp';
import upcoming from '../assets/shared/images/navigation/news/upcomingEvents.webp';
import annual from '../assets/shared/images/navigation/gallery/annualReports.webp';
import gallery from '../assets/shared/images/navigation/gallery/gallery.webp';

export interface NavChild {
  label: string;
  href: string;
  imageSrc: string;
  alt: string;
  hoverDescription: string;
}

export interface NavItem {
  key: string;
  label: string;
  navLabel: string;
  href: string;
  col: number;
  children?: NavChild[];
}

export const navItems: NavItem[] = [
  {
    key: 'about',
    label: 'ABOUT',
    navLabel: 'About',
    href: '/about',
    col: 4,
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
    label: 'PROGRAMS',
    navLabel: 'Programs',
    href: '/programs',
    col: 6,
    children: [
      {
        label: 'The Art Olympiad',
        href: '/programs/theartolympiad',
        imageSrc: theArtOlypiad,
        alt: 'The Art Olympiad gallery',
        hoverDescription: '',
      },
      {
        label: 'Child Art Magazine',
        href: '/programs/outreach',
        imageSrc: childArt,
        alt: 'Child Art Magazine',
        hoverDescription: '',
      },
      {
        label: "World Children's Festival",
        href: '/programs/worldchildrensfestival',
        imageSrc: world,
        alt: "World Children's Festival",
        hoverDescription: '',
      },
      {
        label: 'Peace Through Art',
        href: '/programs/outreach',
        imageSrc: peace,
        alt: 'Peace',
        hoverDescription: '',
      },
      {
        label: 'Climate Change',
        href: '/programs/outreach',
        imageSrc: climate,
        alt: 'Climate Change',
        hoverDescription: '',
      },
      {
        label: 'Healing Arts Program',
        href: '/programs/outreach',
        imageSrc: healing,
        alt: 'healing',
        hoverDescription: '',
      },
    ],
  },
  {
    key: 'get-involved',
    label: 'GET INVOLVED',
    navLabel: 'Get Involved',
    href: '/get-involved',
    col: 4,
    children: [
      {
        label: 'Volunteer',
        href: '/get-involved/volunteer',
        imageSrc: volunteer,
        alt: 'Volunteer with us',
        hoverDescription: '',
      },
      {
        label: 'Profesional',
        href: '/get-involved/donate',
        imageSrc: professional,
        alt: 'Make a donation',
        hoverDescription: '',
      },
      {
        label: 'Student',
        href: '/get-involved/donate',
        imageSrc: student,
        alt: 'Make a donation',
        hoverDescription: '',
      },
      {
        label: 'Corporate Partnerships',
        href: '/get-involved/donate',
        imageSrc: corporate,
        alt: 'Make a donation',
        hoverDescription: '',
      },
    ],
  },
  {
    key: 'news-events',
    label: 'NEWS & EVENTS',
    navLabel: 'News & Events',
    href: '/news-events',
    col: 2,
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
        href: '/news-events/events',
        imageSrc: upcoming,
        alt: 'Upcoming events',
        hoverDescription: '',
      },
    ],
  },
  {
    key: 'sponsorship',
    label: 'SPONSORSHIP',
    navLabel: 'Sponsorship',
    href: '/sponsorship',
    col: 0,
    children: [],
  },
  {
    key: 'gallery',
    label: 'GALLERY',
    navLabel: 'Gallery',
    href: '/gallery',
    col: 2,
    children: [
      {
        label: 'Gallery',
        href: '/gallery/recent',
        imageSrc: gallery,
        alt: 'Recent art',
        hoverDescription: '',
      },
      {
        label: 'Annual Reports',
        href: '/gallery/all',
        imageSrc: annual,
        alt: 'All submissions',
        hoverDescription: '',
      },
    ],
  },
];
