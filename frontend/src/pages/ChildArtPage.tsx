import { CurvedImage } from './CurvedImage';
import MagazineCarousel from '../components/childArt/MagazineCarousel';

import magazineCoverLarge from '@/assets/shared/images/navigation/programs/childArtMagazine.webp';

import DonateButtonPartnersPage from '@/components/ui/donateButtonPartnersPage';

export default function ChildArtPage() {
  return (
    <div className="flex flex-col items-center">
      {/* === Hero Section with Curved Image === */}
      <div className="relative w-full">
        {/* Background image */}
        <div className="grid grid-cols-1 grid-rows-1">
          <div className="col-start-1 row-start-1">
            <CurvedImage
              src={magazineCoverLarge}
              curveStyle="Ellipse"
              darkened={true}
            />
          </div>

          {/* Foreground Text */}
          <div className="relative z-10 col-start-1 row-start-1">
            <div className="container mx-auto flex h-full items-start px-8 pt-20 md:items-center md:px-12 md:pt-0 lg:px-16 xl:px-20">
              {/* <div className="container mx-auto flex h-full items-start px-6 pt-10 md:px-10 lg:px-12 xl:px-16"> */}
              <div className="text-white">
                <h1 className="font-montserrat mb-3 text-4xl font-bold md:mb-4 md:text-5xl lg:mb-6 lg:text-6xl xl:text-7xl">
                  <span className="italic">ChildArt</span> Magazine
                </h1>
                <p className="mb-6 max-w-2xl font-sans text-base leading-relaxed md:text-lg lg:text-xl">
                  The American Academy of Arts & Sciences 2021 Report provides
                  “evidence of the attributes, values, and skills that come from
                  arts education, including social and emotional development,
                  improvements in school engagement, as well as vital civic and
                  social participation.”
                </p>
                <div className="flex justify-start">
                  <DonateButtonPartnersPage className="!w-auto border-0 !px-8 text-gray-900 shadow-lg hover:shadow-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === Carousel Section === */}
      <div className="mt-0 w-full">
        <MagazineCarousel />
      </div>
    </div>
  );
}
