import { CurvedImage } from './CurvedImage';
import MagazineCarousel from '../components/childArt/MagazineCarousel';
import cover1 from '@/assets/shared/images/home/children/children-1536w.webp';
export default function ChildArtPage() {
  return (
    <div className="flex flex-col items-center">
      <CurvedImage src={cover1} curveStyle="Ellipse" darkened={true} />

      <div className="mt-12 w-full max-w-6xl px-4">
        <MagazineCarousel />
      </div>
    </div>
  );
}
