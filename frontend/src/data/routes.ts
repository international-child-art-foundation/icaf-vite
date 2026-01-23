export type RouteAliasGroup = {
  main: string;
  aliases: string[];
};

export const routes: RouteAliasGroup[] = [
  {
    main: '/',
    aliases: ['/home', '/index'],
  },
  {
    main: '/about',
    aliases: ['/about-us', '/abou'],
  },
  {
    main: '/about/partners',
    aliases: ['/partners', '/partner'],
  },
  {
    main: '/about/impact',
    aliases: ['/impact', '/our-impact'],
  },
  {
    main: '/about/team',
    aliases: ['/team', '/staff'],
  },
  {
    main: '/about/leadership',
    aliases: ['/board', '/board-members', '/board-member'],
  },
  {
    main: '/about/history',
    aliases: ['/history', '/our-history'],
  },
  {
    main: '/programs/world-childrens-festival',
    aliases: ['/world-childrens-festival', '/world-children-festival'],
  },
  {
    main: '/programs/childart-magazine',
    aliases: [
      '/childart-magazine',
      '/child-art-magazine',
      '/programs/child-art-magazine',
    ],
  },
  {
    main: '/programs/healing-arts',
    aliases: ['/healing-arts', '/healingarts', '/healingart'],
  },
  {
    main: '/programs/peace-through-art',
    aliases: [
      '/peace-through-art',
      '/peace-through-arts',
      '/programs/peace-through-arts',
    ],
  },
  {
    main: '/programs/arts-olympiad',
    aliases: ['/arts-olympiad', '/art-olympiad', '/programs/art-olympiad'],
  },
  {
    main: '/programs/climate-change',
    aliases: ['/climate-change', '/climate'],
  },
  {
    main: '/get-involved/student',
    aliases: ['/student', '/students'],
  },
  {
    main: '/donate',
    aliases: ['/donations', '/donation'],
  },
  {
    main: '/sponsorship',
    aliases: ['/sponsor', '/sponsorships'],
  },
  {
    main: '/access',
    aliases: ['/acess', '/access-magazine'],
  },
  {
    main: '/contact',
    aliases: ['/contact-us', '/about/contact-us'],
  },
  {
    main: '/news-events/news',
    aliases: ['/news', '/news-events'],
  },
  {
    main: '/get-involved/volunteer',
    aliases: ['/volunteer', '/volinteer', '/volunter', '/volunteering'],
  },
  {
    main: '/get-involved/professionals',
    aliases: ['/professionals', '/profesionals'],
  },
];
