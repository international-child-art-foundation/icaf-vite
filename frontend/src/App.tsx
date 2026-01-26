import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import { sharedOpenGraph } from '@/data/shared-metadata';
import NavigationBar from '@/components/shared/NavigationBar';
import Footer from '@/components/shared/Footer';
import { routes } from '@/data/routes';
import { preloadAllRoutesOnce } from './preloadRoutes';

import Home from './pages/Home';
import './index.css';
import { GlobalContextProvider } from './components/shared/GlobalContext';
import GoogleAnalytics from './components/shared/GoogleAnalytics';
import CookieBanner from './components/shared/CookieBanner';

export const metadata = {
  title: 'Home | ICAF',
  openGraph: {
    ...sharedOpenGraph,
    title: 'Home | ICAF',
  },
};

const Partners = lazy(() => import('./pages/Partners'));
const About = lazy(() => import('./pages/About'));
const ChildArtPage = lazy(() => import('./pages/ChildArtPage'));
const Impact = lazy(() => import('./pages/Impact'));
const Donate = lazy(() => import('./pages/Donate'));
const WorldChildrensFestival = lazy(
  () => import('./pages/WorldChildrensFestivalPage'),
);
const Team = lazy(() =>
  import('./pages/Team').then((m) => ({ default: m.Team })),
);
const Leadership = lazy(() =>
  import('./pages/Leadership').then((m) => ({ default: m.Leadership })),
);
const ResearchAndPublications = lazy(() =>
  import('./pages/ResearchAndPublications').then((m) => ({
    default: m.ResearchAndPublications,
  })),
);
const Sponsorship = lazy(() =>
  import('./pages/Sponsorship').then((m) => ({ default: m.Sponsorship })),
);
const HealingArts = lazy(() =>
  import('./pages/HealingArts').then((m) => ({ default: m.HealingArts })),
);
const PeaceThroughArt = lazy(() =>
  import('./pages/PeaceThroughArt').then((m) => ({
    default: m.PeaceThroughArt,
  })),
);
const Student = lazy(() =>
  import('./pages/Student').then((m) => ({ default: m.Student })),
);
const MagazineAccess = lazy(() =>
  import('./components/access/MagazineAccess').then((m) => ({
    default: m.MagazineAccess,
  })),
);
const Page404 = lazy(() =>
  import('./pages/Page404').then((m) => ({ default: m.Page404 })),
);
const Contact = lazy(() =>
  import('./pages/Contact').then((m) => ({ default: m.Contact })),
);
const News = lazy(() =>
  import('./pages/News').then((m) => ({ default: m.News })),
);
const History = lazy(() =>
  import('./pages/History').then((m) => ({ default: m.History })),
);
const ArtsOlympiad = lazy(() =>
  import('./pages/ArtsOlympiad').then((m) => ({ default: m.ArtsOlympiad })),
);
const ClimateChange = lazy(() =>
  import('./pages/ClimateChange').then((m) => ({ default: m.ClimateChange })),
);
const Volunteer = lazy(() =>
  import('./pages/Volunteer').then((m) => ({ default: m.Volunteer })),
);
const Professionals = lazy(() =>
  import('./pages/Professionals').then((m) => ({ default: m.Professionals })),
);

export default function App() {
  useEffect(() => {
    function handleLoad() {
      preloadAllRoutesOnce();
    }

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad, { once: true });
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  return (
    <GlobalContextProvider>
      <GoogleAnalytics
        GA_MEASUREMENT_ID={import.meta.env.VITE_GA_MEASUREMENT_ID}
      />
      <div className="relative mx-auto box-border flex min-h-screen w-full max-w-screen-2xl flex-col px-0">
        <NavigationBar />
        <main className="relative mt-[98px] flex flex-1 flex-col">
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Home />} />

              <Route
                path="/programs/world-childrens-festival"
                element={<WorldChildrensFestival />}
              />
              <Route
                path="/programs/childart-magazine"
                element={<ChildArtPage />}
              />
              <Route path="/programs/healing-arts" element={<HealingArts />} />
              <Route path="/get-involved/students" element={<Student />} />
              <Route
                path="/programs/peace-through-art"
                element={<PeaceThroughArt />}
              />

              <Route path="/about" element={<About />} />
              <Route path="/about/partners" element={<Partners />} />
              <Route path="/about/impact" element={<Impact />} />
              <Route path="/about/team" element={<Team />} />
              <Route path="/about/leadership" element={<Leadership />} />
              <Route
                path="/about/research-and-publications"
                element={<ResearchAndPublications />}
              />
              <Route path="/about/history" element={<History />} />

              <Route path="/donate" element={<Donate />} />
              <Route path="/sponsorship" element={<Sponsorship />} />
              <Route path="/access" element={<MagazineAccess />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/news-events/news" element={<News />} />
              <Route
                path="/programs/arts-olympiad"
                element={<ArtsOlympiad />}
              />
              <Route
                path="/programs/climate-change"
                element={<ClimateChange />}
              />
              <Route path="/get-involved/volunteers" element={<Volunteer />} />
              <Route
                path="/get-involved/professionals"
                element={<Professionals />}
              />

              {routes.map(({ main, aliases }) =>
                aliases.map((alias) => (
                  <Route
                    key={alias}
                    path={alias}
                    element={<Navigate to={main} replace />}
                  />
                )),
              )}

              <Route path="*" element={<Page404 />} />
            </Routes>
          </Suspense>
        </main>
        <CookieBanner />
        <Footer />
      </div>
    </GlobalContextProvider>
  );
}
