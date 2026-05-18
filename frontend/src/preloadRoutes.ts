let preloaded = false;

type Preloader = () => Promise<unknown>;

const preloaders: Preloader[] = [
  () => import('./modules/content/pages/Partners'),
  () => import('./modules/content/pages/About'),
  () => import('./modules/content/pages/ChildArtPage'),
  () => import('./modules/content/pages/Impact'),
  () => import('./modules/content/pages/Donate'),
  () => import('./modules/content/pages/WorldChildrensFestivalPage'),
  () => import('./modules/content/pages/Team'),
  () => import('./modules/content/pages/Leadership'),
  () => import('./modules/content/pages/ResearchAndPublications'),
  () => import('./modules/content/pages/Sponsorship'),
  () => import('./modules/content/pages/HealingArts'),
  () => import('./modules/content/pages/PeaceThroughArt'),
  () => import('./modules/content/pages/Student'),
  () => import('./modules/content/components/access/MagazineAccess'),
  () => import('./modules/scaffolding/pages/Page404'),
  () => import('./modules/content/types/Contact'),
  () => import('./modules/content/pages/News'),
  () => import('./modules/content/pages/History'),
  () => import('./modules/content/pages/ArtsOlympiad'),
  () => import('./modules/content/pages/ClimateChange'),
  () => import('./modules/content/pages/Volunteer'),
  () => import('./modules/content/pages/Professionals'),
  () => import('./modules/content/pages/WorldChildrensAward'),
];

function runPreloadersSlowly() {
  let index = 0;

  const runNext = () => {
    if (index >= preloaders.length) return;
    void preloaders[index++]();
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(runNext);
    } else {
      setTimeout(runNext, 500);
    }
  };

  runNext();
}

export function preloadAllRoutesOnce() {
  if (preloaded) return;
  preloaded = true;
  if (typeof window === 'undefined') return;
  runPreloadersSlowly();
}
