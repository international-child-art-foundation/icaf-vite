let preloaded = false;

type Preloader = () => Promise<unknown>;

const preloaders: Preloader[] = [
  () => import('./pages/Partners'),
  () => import('./pages/About'),
  () => import('./pages/ChildArtPage'),
  () => import('./pages/Impact'),
  () => import('./pages/Donate'),
  () => import('./pages/WorldChildrensFestivalPage'),
  () => import('./pages/Team'),
  () => import('./pages/Leadership'),
  () => import('./pages/Sponsorship'),
  () => import('./pages/HealingArts'),
  () => import('./pages/PeaceThroughArt'),
  () => import('./pages/Student'),
  () => import('./components/access/MagazineAccess'),
  () => import('./pages/Page404'),
  () => import('./pages/Contact'),
  () => import('./pages/News'),
  () => import('./pages/History'),
  () => import('./pages/ArtsOlympiad'),
  () => import('./pages/ClimateChange'),
  () => import('./pages/Volunteer'),
  () => import('./pages/Professionals'),
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
