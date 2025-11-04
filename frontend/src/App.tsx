import { sharedOpenGraph } from '@/data/shared-metadata';
import NavigationBar from '@/components/shared/NavigationBar';
import Footer from '@/components/shared/Footer';
import './index.css';
import Home from './pages/Home';
import Partners from './pages/Partners';
import About from './pages/About';
import { Route, Routes } from 'react-router-dom';
import ChildArtPage from './pages/ChildArtPage';
import Impact from './pages/Impact';
import Donate from './pages/Donate';
import WorldChildrensFestival from './pages/WorldChildrensFestivalPage';
import { Team } from './pages/Team';
import { Sponsorship } from './pages/Sponsorship';
import { HealingArts } from './pages/HealingArts';
import { PeaceThroughArt } from './pages/PeaceThroughArt';
import { Student } from './pages/Student';
import { MagazineAccess } from './components/access/MagazineAccess';

export const metadata = {
  title: 'Home | ICAF',
  openGraph: {
    ...sharedOpenGraph,
    title: 'Home | ICAF',
  },
};

export default function App() {
  return (
    <div className="mx-auto box-border flex min-h-screen w-full max-w-screen-2xl flex-col px-0">
      <NavigationBar />
      <main className="mt-[98px] flex-1">
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
          <Route path="/get-involved/student" element={<Student />} />
          <Route
            path="/programs/peace-through-art"
            element={<PeaceThroughArt />}
          />
          <Route path="/about/partners" element={<Partners />} />
          <Route path="/about" element={<About />} />
          <Route path="/about/impact" element={<Impact />} />
          <Route path="/about/team" element={<Team />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/sponsorship" element={<Sponsorship />} />
          <Route path="/childart/access" element={<MagazineAccess />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
