import history from "../assets/shared/images/navigation/about/history.webp";
import team from "../assets/shared/images/navigation/about/team.webp";
import partner from "../assets/shared/images/navigation/about/partners.webp";
import impact from "../assets/shared/images/navigation/about/impact.webp";
import childArt from "../assets/shared/images/navigation/programs/childArtMagazine.webp";
import climate from "../assets/shared/images/navigation/programs/climateChange.webp";
import healing from "../assets/shared/images/navigation/programs/healingArtsProgram.webp";
import peace from "../assets/shared/images/navigation/programs/peaceThroughArt.webp";
import theArtOlypiad from "../assets/shared/images/navigation/programs/theArtOlympiad.webp";
import world from "../assets/shared/images/navigation/programs/worldChildrensFestival.webp";
import corporate from "../assets/shared/images/navigation/getInvolved/corporatePartnership.webp";
import professional from "../assets/shared/images/navigation/getInvolved/professional.webp";
import student from "../assets/shared/images/navigation/getInvolved/student.webp";
import volunteer from "../assets/shared/images/navigation/getInvolved/volunteer.webp";
import latest from "../assets/shared/images/navigation/news/latestNews.webp";
import upcoming from "../assets/shared/images/navigation/news/upcomingEvents.webp";
import annual from "../assets/shared/images/navigation/gallery/annualReports.webp";
import gallery from "../assets/shared/images/navigation/gallery/gallery.webp";

export interface NavChild {
  label: string;
  href: string;
  imageSrc: string;
  alt: string;
}

export interface NavItem {
  key: string;
  label: string;
  navLabel: string;
  href?: string;
  col: number;
  children?: NavChild[];
}

export const navItems: NavItem[] = [
  {
    key: "about",
    label: "ABOUT",
    navLabel: "About",
    col: 4,
    children: [
      {
        label: "History",
        href: "/about/history",
        imageSrc: history,
        alt: "Our history",
      },
      {
        label: "Team",
        href: "/about/team",
        imageSrc: team,
        alt: "Our team",
      },
      {
        label: "Partners",
        href: "/about/partners",
        imageSrc: partner,
        alt: "Our partners",
      },
      {
        label: "Impact",
        href: "/about/impact",
        imageSrc: impact,
        alt: "Our partners",
      },
    ],
  },
  {
    key: "programs",
    label: "PROGRAMS",
    navLabel: "Programs",
    href: "/programs",
    col: 6,
    children: [
      {
        label: "The Art Olympiad",
        href: "/programs/theartolympiad",
        imageSrc: childArt,
        alt: "The Art Olympiad gallery",
      },
      {
        label: "Child Art Magazine",
        href: "/programs/outreach",
        imageSrc: climate,
        alt: "School outreach",
      },
      {
        label: "World Children's Festival",
        href: "/programs/outreach",
        imageSrc: world,
        alt: "School outreach",
      },
      {
        label: "Peace Through Art",
        href: "/programs/outreach",
        imageSrc: peace,
        alt: "School outreach",
      },
      {
        label: "Climate Change",
        href: "/programs/outreach",
        imageSrc: theArtOlypiad,
        alt: "School outreach",
      },
      {
        label: "Healing Arts Program",
        href: "/programs/outreach",
        imageSrc: healing,
        alt: "School outreach",
      },
    ],
  },
  {
    key: "get-involved",
    label: "GET INVOLVED",
    navLabel: "Get Involved",
    href: "/get-involved",
    col: 4,
    children: [
      {
        label: "Volunteer",
        href: "/get-involved/volunteer",
        imageSrc: volunteer,
        alt: "Volunteer with us",
      },
      {
        label: "Profesional",
        href: "/get-involved/donate",
        imageSrc: professional,
        alt: "Make a donation",
      },
      {
        label: "Student",
        href: "/get-involved/donate",
        imageSrc: student,
        alt: "Make a donation",
      },
      {
        label: "Corporate Partnerships",
        href: "/get-involved/donate",
        imageSrc: corporate,
        alt: "Make a donation",
      },
    ],
  },
  {
    key: "news-events",
    label: "NEWS & EVENTS",
    navLabel: "News & Events",
    href: "/news-events",
    col: 2,
    children: [
      {
        label: "Latest News",
        href: "/news-events/news",
        imageSrc: latest,
        alt: "Latest news",
      },
      {
        label: "Upcoming Events",
        href: "/news-events/events",
        imageSrc: upcoming,
        alt: "Upcoming events",
      },
    ],
  },
  {
    key: "sponsorship",
    label: "SPONSORSHIP",
    navLabel: "Sponsorship",
    href: "/sponsorship",
    col: 0,
    children: [],
  },
  {
    key: "gallery",
    label: "GALLERY",
    navLabel: "Gallery",
    href: "/gallery",
    col: 2,
    children: [
      {
        label: "Gallery",
        href: "/gallery/recent",
        imageSrc: gallery,
        alt: "Recent art",
      },
      {
        label: "Annual Reports",
        href: "/gallery/all",
        imageSrc: annual,
        alt: "All submissions",
      },
    ],
  },
];
