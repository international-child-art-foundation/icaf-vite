import { sharedOpenGraph } from '@/data/shared-metadata';
import NavigationBar from '@/components/shared/NavigationBar';
import Footer from '@/components/shared/Footer';
import './index.css';
import Home from './pages/Home';
import Partners from './pages/Partners';
import About from './pages/About';
import { Route, Routes } from 'react-router-dom';
import ChildArtPage from './pages/ChildArtPage';

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

          <Route path="/programs/outreach" element={<ChildArtPage />} />
          <Route path="/about/partners" element={<Partners />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
