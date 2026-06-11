type Preloader = () => void;

const routePreloaders: Partial<Record<string, Preloader>> = {
  '/about': () => {
    void import('./modules/content/pages/About');
  },
  '/about/partners': () => {
    void import('./modules/content/pages/Partners');
  },
  '/about/impact': () => {
    void import('./modules/content/pages/Impact');
  },
  '/about/team': () => {
    void import('./modules/content/pages/Team');
  },
  '/about/leadership': () => {
    void import('./modules/content/pages/Leadership');
  },
  '/about/research-and-publications': () => {
    void import('./modules/content/pages/ResearchAndPublications');
  },
  '/about/history': () => {
    void import('./modules/content/pages/History');
  },
  '/programs/world-childrens-festival': () => {
    void import('./modules/content/pages/WorldChildrensFestivalPage');
  },
  '/programs/childart-magazine': () => {
    void import('./modules/content/pages/ChildArtPage');
  },
  '/programs/healing-arts': () => {
    void import('./modules/content/pages/HealingArts');
  },
  '/programs/peace-through-art': () => {
    void import('./modules/content/pages/PeaceThroughArt');
  },
  '/programs/arts-olympiad': () => {
    void import('./modules/content/pages/ArtsOlympiad');
  },
  '/programs/climate-change': () => {
    void import('./modules/content/pages/ClimateChange');
  },
  '/programs/world-childrens-award': () => {
    void import('./modules/content/pages/WorldChildrensAward');
  },
  '/get-involved/students': () => {
    void import('./modules/content/pages/Student');
  },
  '/get-involved/volunteers': () => {
    void import('./modules/content/pages/Volunteer');
  },
  '/get-involved/professionals': () => {
    void import('./modules/content/pages/Professionals');
  },
  '/donate': () => {
    void import('./modules/content/pages/Donate');
  },
  '/sponsorship': () => {
    void import('./modules/content/pages/Sponsorship');
  },
  '/access': () => {
    void import('./modules/content/components/access/MagazineAccess');
  },
  '/contact': () => {
    void import('./modules/content/pages/Contact');
  },
  '/news-events/news': () => {
    void import('./modules/content/pages/News');
  },
  '/gallery': () => {
    void import('./modules/content/pages/Gallery');
  },
  '/gallery/slideshow': () => {
    void import('./modules/content/components/gallery/GallerySlideshowEntry');
  },
};

const preloadedRoutes = new Set<string>();
const scheduledRoutes = new Set<string>();

function normalizePath(href: string) {
  if (!href.startsWith('/') || href.startsWith('//')) return undefined;
  return href.split(/[?#]/, 1)[0];
}

export function preloadRoute(href: string | undefined) {
  if (!href || typeof window === 'undefined') return;

  const path = normalizePath(href);
  if (!path || preloadedRoutes.has(path) || scheduledRoutes.has(path)) return;

  const preload = routePreloaders[path];
  if (!preload) return;

  scheduledRoutes.add(path);

  window.setTimeout(() => {
    scheduledRoutes.delete(path);
    if (preloadedRoutes.has(path)) return;

    preloadedRoutes.add(path);
    preload();
  }, 150);
}
