import history from '@/shared/assets/images/navigation/about/history_small.webp';
import team from '@/shared/assets/images/navigation/about/team_small.webp';
import partner from '@/shared/assets/images/navigation/about/partners_small.webp';
import impact from '@/shared/assets/images/navigation/about/impact_small.webp';
import childArt from '@/shared/assets/images/navigation/programs/childArtMagazine_small.webp';
import climate from '@/shared/assets/images/navigation/programs/climateChange_smaller.webp';
import healing from '@/shared/assets/images/navigation/programs/healingArtsProgram_smaller.webp';
import peace from '@/shared/assets/images/navigation/programs/peaceThroughArt_small.webp';
import theArtOlypiad from '@/shared/assets/images/navigation/programs/theArtOlympiad_small.webp';
import world from '@/shared/assets/images/navigation/programs/worldChildrensFestival_small.webp';
import professional from '@/shared/assets/images/navigation/getInvolved/professional.webp';
import student from '@/shared/assets/images/navigation/getInvolved/student_small.webp';
import volunteer from '@/shared/assets/images/navigation/getInvolved/volunteer.webp';
import latest from '@/shared/assets/images/navigation/news/latestNews_small.webp';
import upcoming from '@/shared/assets/images/navigation/news/upcomingEvents.webp';
import board from '@/shared/assets/images/icafGroupPhoto.webp';
import wca from '@/shared/assets/images/navigation/programs/worldChildrensAward.webp';
import researchAndPublications from '@/shared/assets/images/UnitedStatesSLKorth.webp';
import submitArtwork from '@/shared/assets/images/navigation/getInvolved/submitArtwork.webp';

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
      {
        label: "World Children's Award",
        href: '/programs/world-childrens-award',
        imageSrc: wca,
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
      {
        label: 'Latest News',
        href: '/news-events/news',
        imageSrc: latest,
        hoverDescription: "See ICAF's recent activity.",
      },
      {
        label: 'Submit Artwork',
        href: '/submit-artwork',
        imageSrc: submitArtwork,
        hoverDescription: "Feature your child's artwork in the ICAF gallery.",
      },
      {
        label: 'Upcoming Events',
        href: 'https://worldchildrensfestival.org/',
        external: true,
        imageSrc: upcoming,
        hoverDescription: 'See what ICAF has planned for the future.',
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
    key: 'sponsorship',
    label: 'Sponsorship',
    navLabel: 'Sponsorship',
    href: '/sponsorship',
    children: [],
  },
  {
    key: 'gallery',
    label: 'Gallery',
    navLabel: 'Gallery',
    href: '/gallery',
    children: [],
  },
  {
    key: 'my-icaf',
    label: 'My ICAF',
    navLabel: 'My ICAF',
    href: '/my-icaf',
    children: [],
  },
];
