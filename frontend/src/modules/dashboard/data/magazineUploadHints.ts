type MagazineUploadHint = {
  slug: string;
  name?: string;
  period?: string;
  volume?: string;
};

// Admin-only upload draft hints. Public magazine data comes from /api/magazines.
export const magazineUploadHints: MagazineUploadHint[] = [
  {
    slug: '250th-2026WCF',
    name: "Children's 250th Celebration",
    period: 'July-September 2026',
    volume: 'Volume 26, Issue 02, Number 82',
  },
  {
    slug: 'Happiness',
    name: 'Pursuit of Happiness',
    period: 'January-March 2026',
    volume: 'Volume 26, Issue 01, Number 81',
  },
  {
    slug: 'CSR',
    name: 'Corporate Responsibility and Social Change',
    period: 'October-December 2025',
    volume: 'Volume 25, Issue 4, Number 80',
  },
  {
    slug: 'Robotics',
    name: 'Robotics',
    period: 'July-September 2025',
    volume: 'Volume 25, Issue 3, Number 79',
  },
  {
    slug: 'Art&SocialJustice',
    name: 'Art & Social Justice',
    period: 'April-June 2025',
    volume: 'Volume 25, Issue 2, Number 78',
  },
  {
    slug: 'Philanthropy',
    name: 'Philanthropy',
    period: 'January-March 2025',
    volume: 'Volume 25, Issue 1, Number 77',
  },
  {
    slug: 'AI&Art',
    name: 'AI & Art',
    period: 'October-December 2024',
    volume: 'Volume 24, Issue 4, Number 76',
  },
  {
    slug: 'Art&Sports',
    name: 'Art & Sports',
    period: 'July-September 2024',
    volume: 'Volume 24, Issue 3, Number 75',
  },
  {
    slug: 'Plurality',
    name: 'Plurality',
    period: 'April-June 2024',
    volume: 'Volume 24, Issue 2, Number 74',
  },
  {
    slug: 'Dance',
    name: 'Dance',
    period: 'January-March 2024',
    volume: 'Volume 24, Issue 1, Number 73',
  },
  {
    slug: 'AnimalArt',
    name: 'Animal Art',
    period: 'October-December 2023',
    volume: 'Volume 23, Issue 4, Number 72',
  },
  {
    slug: 'Metaverse',
    name: 'Metaverse',
    period: 'July-September 2023',
    volume: 'Volume 23, Issue 3, Number 71',
  },
  {
    slug: 'Mindfulness',
    name: 'Mindfulness',
    period: 'April-June 2023',
    volume: 'Volume 23, Issue 2, Number 70',
  },
  {
    slug: 'ThePowerOfWords',
    name: 'The Power Of Words',
    period: 'January-March 2023',
    volume: 'Volume 23, Issue 1, Number 69',
  },
  {
    slug: 'YoungLeaders',
    name: 'Young Leaders',
    period: 'October-December 2022',
    volume: 'Volume 22, Issue 4, Number 68',
  },
  {
    slug: 'HumanSecurity',
    name: 'Human Security',
    period: 'July-September 2022',
    volume: 'Volume 22, Issue 3, Number 67',
  },
  {
    slug: 'Artpreneurs',
    name: 'Artpreneurs',
    period: 'April-June 2022',
    volume: 'Volume 22, Issue 2, Number 66',
  },
  {
    slug: 'Creativity',
    name: 'Creativity',
    period: 'January-March 2022',
    volume: 'Volume 22, Issue 1, Number 65',
  },
  {
    slug: '2021WCF',
    name: "6th World Children's Festival",
    period: 'October-December 2021',
    volume: 'Volume 21, Issue 4, Number 64',
  },
  {
    slug: 'ChangingEnvironment',
    name: 'Changing Environment',
    period: 'July-September 2021',
    volume: 'Volume 21, Issue 3, Number 63',
  },
  {
    slug: 'TheMoralOfYourStory',
    name: 'The Moral of Your Story',
    period: 'April-June 2021',
    volume: 'Volume 21, Issue 2, Number 62',
  },
  {
    slug: 'GlobalCreativeLeaders',
    name: 'Global Creative Leaders',
    period: 'January-March 2021',
    volume: 'Volume 21, Issue 1, Number 61',
  },
  {
    slug: 'ABCDStudy',
    name: 'ABCDstudy',
    period: 'October-December 2020',
    volume: 'Volume 20, Issue 2, Number 60',
  },
];
