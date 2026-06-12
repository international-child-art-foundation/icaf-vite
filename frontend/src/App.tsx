import { Suspense, lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import { sharedOpenGraph } from '@/shared/data/shared-metadata';
import NavigationBar from '@/modules/content/components/shared/NavigationBar';
import Footer from '@/modules/content/components/shared/Footer';
import { routes } from '@/shared/data/routes';

import Home from './modules/content/pages/Home';
import './index.css';
import { GlobalContextProvider } from './modules/content/components/shared/GlobalContext';
import GoogleAnalytics from './modules/content/components/shared/GoogleAnalytics';
import CookieBanner from './modules/content/components/shared/CookieBanner';
import { MyIcafAccessGate } from './modules/dashboard/components/MyIcafAccessGate';

export const metadata = {
  title: 'Home | ICAF',
  openGraph: {
    ...sharedOpenGraph,
    title: 'Home | ICAF',
  },
};

const Partners = lazy(() => import('./modules/content/pages/Partners'));
const About = lazy(() => import('./modules/content/pages/About'));
const ChildArtPage = lazy(() => import('./modules/content/pages/ChildArtPage'));
const Impact = lazy(() => import('./modules/content/pages/Impact'));
const Donate = lazy(() => import('./modules/content/pages/Donate'));
const WorldChildrensFestival = lazy(
  () => import('./modules/content/pages/WorldChildrensFestivalPage'),
);
const Team = lazy(() =>
  import('./modules/content/pages/Team').then((m) => ({
    default: m.Team,
  })),
);
const Leadership = lazy(() =>
  import('./modules/content/pages/Leadership').then((m) => ({
    default: m.Leadership,
  })),
);
const ResearchAndPublications = lazy(() =>
  import('./modules/content/pages/ResearchAndPublications').then((m) => ({
    default: m.ResearchAndPublications,
  })),
);
const Sponsorship = lazy(() =>
  import('./modules/content/pages/Sponsorship').then((m) => ({
    default: m.Sponsorship,
  })),
);
const HealingArts = lazy(() =>
  import('./modules/content/pages/HealingArts').then((m) => ({
    default: m.HealingArts,
  })),
);
const PeaceThroughArt = lazy(() =>
  import('./modules/content/pages/PeaceThroughArt').then((m) => ({
    default: m.PeaceThroughArt,
  })),
);
const Student = lazy(() =>
  import('./modules/content/pages/Student').then((m) => ({
    default: m.Student,
  })),
);
const MagazineAccess = lazy(() =>
  import('./modules/content/components/access/MagazineAccess').then((m) => ({
    default: m.MagazineAccess,
  })),
);
const Page404 = lazy(() =>
  import('./modules/scaffolding/pages/Page404').then((m) => ({
    default: m.Page404,
  })),
);
const Contact = lazy(() =>
  import('./modules/content/pages/Contact').then((m) => ({
    default: m.Contact,
  })),
);
const News = lazy(() =>
  import('./modules/content/pages/News').then((m) => ({
    default: m.News,
  })),
);
const History = lazy(() =>
  import('./modules/content/pages/History').then((m) => ({
    default: m.History,
  })),
);
const ArtsOlympiad = lazy(() =>
  import('./modules/content/pages/ArtsOlympiad').then((m) => ({
    default: m.ArtsOlympiad,
  })),
);
const ClimateChange = lazy(() =>
  import('./modules/content/pages/ClimateChange').then((m) => ({
    default: m.ClimateChange,
  })),
);
const Volunteer = lazy(() =>
  import('./modules/content/pages/Volunteer').then((m) => ({
    default: m.Volunteer,
  })),
);
const Professionals = lazy(() =>
  import('./modules/content/pages/Professionals').then((m) => ({
    default: m.Professionals,
  })),
);
const WorldChildrensAward = lazy(() =>
  import('./modules/content/pages/WorldChildrensAward').then((m) => ({
    default: m.WorldChildrensAward,
  })),
);
const Gallery = lazy(() =>
  import('./modules/content/pages/Gallery').then((m) => ({
    default: m.Gallery,
  })),
);
const GallerySlideshowEntry = lazy(() =>
  import('./modules/content/components/gallery/GallerySlideshowEntry').then(
    (m) => ({
      default: m.GallerySlideshowEntry,
    }),
  ),
);
const Register = lazy(() =>
  import('./modules/account/pages/Register').then((m) => ({
    default: m.Register,
  })),
);
const Login = lazy(() =>
  import('./modules/account/pages/Login').then((m) => ({
    default: m.Login,
  })),
);
const VerifyAccount = lazy(() =>
  import('./modules/account/pages/VerifyAccount').then((m) => ({
    default: m.VerifyAccount,
  })),
);
const CreateAccount = lazy(() =>
  import('./modules/account/pages/CreateAccount').then((m) => ({
    default: m.CreateAccount,
  })),
);
const ForgotPassword = lazy(() =>
  import('./modules/account/pages/ForgotPassword').then((m) => ({
    default: m.ForgotPassword,
  })),
);
const ConfirmForgotPassword = lazy(() =>
  import('./modules/account/pages/ConfirmForgotPassword').then((m) => ({
    default: m.ConfirmForgotPassword,
  })),
);
const Unsubscribe = lazy(() =>
  import('./modules/account/pages/Unsubscribe').then((m) => ({
    default: m.Unsubscribe,
  })),
);
const SubmitArtworkGroup = lazy(() =>
  import('./modules/submissions/pages/SubmitArtworkGroup').then((m) => ({
    default: m.SubmitArtworkGroup,
  })),
);
const SubmitArtwork = lazy(() =>
  import('./modules/submissions/pages/SubmitArtwork').then((m) => ({
    default: m.SubmitArtwork,
  })),
);
const SubmitArtworkRouter = lazy(() =>
  import('./modules/submissions/pages/SubmitArtworkRouter').then((m) => ({
    default: m.SubmitArtworkRouter,
  })),
);
const SubmitArtworkSuccess = lazy(() =>
  import('./modules/submissions/pages/SubmitArtworkSuccess').then((m) => ({
    default: m.SubmitArtworkSuccess,
  })),
);
const TakedownRequest = lazy(() =>
  import('./modules/submissions/pages/TakedownRequest').then((m) => ({
    default: m.TakedownRequest,
  })),
);

export default function App() {
  return (
    <GlobalContextProvider>
      <GoogleAnalytics
        GA_MEASUREMENT_ID={import.meta.env.VITE_GA_MEASUREMENT_ID}
      />
      <div className="relative mx-auto box-border flex min-h-screen w-full flex-col overflow-x-hidden px-0">
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
              <Route
                path="/programs/world-childrens-award"
                element={<WorldChildrensAward />}
              />
              <Route path="/gallery" element={<Gallery />}>
                <Route
                  path="/gallery/slideshow"
                  element={<GallerySlideshowEntry />}
                />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-account" element={<VerifyAccount />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/confirm-forgot-password"
                element={<ConfirmForgotPassword />}
              />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              <Route path="/unsubscribe/artwork" element={<Unsubscribe />} />
              <Route path="/my-icaf" element={<MyIcafAccessGate />} />
              <Route
                path="/dashboard"
                element={<Navigate to="/my-icaf" replace />}
              />
              <Route path="/submit-artwork" element={<SubmitArtworkRouter />} />
              <Route
                path="/submit-artwork/success"
                element={<SubmitArtworkSuccess />}
              />
              <Route
                path="/submit-artwork/single/:submitterFlow"
                element={<SubmitArtwork />}
              />
              <Route
                path="/submit-artwork/single/:submitterFlow/artworks"
                element={<SubmitArtwork />}
              />
              <Route
                path="/submit-artwork/group/:submitterFlow"
                element={<SubmitArtworkGroup />}
              />
              <Route
                path="/submit-artwork/group/:submitterFlow/artworks"
                element={<SubmitArtworkGroup />}
              />
              <Route path="/takedown-request" element={<TakedownRequest />} />

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
