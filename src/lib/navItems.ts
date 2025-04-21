export interface NavChild {
  label: string;
  href: string;
  imageSrc: string;
  alt: string;
}

export interface NavItem {
  key: string;
  label: string;
  href?: string;
  colSpan: number;
  children?: NavChild[];
}

export const navItems: NavItem[] = [
  {
    key: "about",
    label: "ABOUT",
    colSpan: 3,
    children: [
      {
        label: "History",
        href: "/about/history",
        imageSrc: "https://placehold.co/300x300",
        alt: "Our history",
      },
      {
        label: "Team",
        href: "/about/team",
        imageSrc: "https://placehold.co/300x300",
        alt: "Our team",
      },
      {
        label: "Partners",
        href: "/about/partners",
        imageSrc: "https://placehold.co/300x300",
        alt: "Our partners",
      },
      {
        label: "Impact",
        href: "/about/impact",
        imageSrc: "https://placehold.co/300x300",
        alt: "Our partners",
      },
    ],
  },
  {
    key: "programs",
    label: "PROGRAMS",
    href: "/programs",
    colSpan: 4,
    children: [
      {
        label: "The Art Olympiad",
        href: "/programs/theartolympiad",
        imageSrc: "https://placehold.co/300x300",
        alt: "The Art Olympiad gallery",
      },
      {
        label: "ChilArt Magazine",
        href: "/programs/outreach",
        imageSrc: "https://placehold.co/300x300",
        alt: "School outreach",
      },
      {
        label: "Peace Through Art",
        href: "/programs/outreach",
        imageSrc: "https://placehold.co/300x300",
        alt: "School outreach",
      },
      {
        label: "Climate Change",
        href: "/programs/outreach",
        imageSrc: "https://placehold.co/300x300",
        alt: "School outreach",
      },
      {
        label: "Healing Arts Program",
        href: "/programs/outreach",
        imageSrc: "https://placehold.co/300x300",
        alt: "School outreach",
      },
    ],
  },
  {
    key: "get-involved",
    label: "GET INVOLVED",
    href: "/get-involved",
    colSpan: 3,
    children: [
      {
        label: "Volunteer",
        href: "/get-involved/volunteer",
        imageSrc: "https://placehold.co/300x300",
        alt: "Volunteer with us",
      },
      {
        label: "Profesional",
        href: "/get-involved/donate",
        imageSrc: "https://placehold.co/300x300",
        alt: "Make a donation",
      },
      {
        label: "Student",
        href: "/get-involved/donate",
        imageSrc: "https://placehold.co/300x300",
        alt: "Make a donation",
      },
      {
        label: "Corporate Partnerships",
        href: "/get-involved/donate",
        imageSrc: "https://placehold.co/300x300",
        alt: "Make a donation",
      },
    ],
  },
  {
    key: "news-events",
    label: "NEWS & EVENTS",
    href: "/news-events",
    colSpan: 4,
    children: [
      {
        label: "Latest News",
        href: "/news-events/news",
        imageSrc: "https://placehold.co/300x300",
        alt: "Latest news",
      },
      {
        label: "Upcoming Events",
        href: "/news-events/events",
        imageSrc: "https://placehold.co/300x300",
        alt: "Upcoming events",
      },
    ],
  },
  {
    key: "sponsorship",
    label: "SPONSORSHIP",
    href: "/sponsorship",
    colSpan: 6,
    children: [],
  },
  {
    key: "gallery",
    label: "GALLERY",
    href: "/gallery",
    colSpan: 4,
    children: [
      {
        label: "Gallery",
        href: "/gallery/recent",
        imageSrc: "https://placehold.co/300x300",
        alt: "Recent art",
      },
      {
        label: "Annual Reports",
        href: "/gallery/all",
        imageSrc: "https://placehold.co/300x300",
        alt: "All submissions",
      },
    ],
  },
];
