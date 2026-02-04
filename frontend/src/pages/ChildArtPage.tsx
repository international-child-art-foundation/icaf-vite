import { CurvedImage } from './CurvedImage';
import MagazineCarousel from '../components/childArt/MagazineCarousel';
import magazineCoverLarge from '@/assets/shared/images/navigation/programs/childArtMagazine.webp';
import BackIssueGrid from '@/components/childArt/BackIssueGrid';
import TestimonialBlock from '@/components/childArt/TestimonialBlock';
import YourDonations from '@/components/shared/YourDonations';
import { useWindowSize } from 'usehooks-ts';
import DonateButton from '@/components/ui/donateButton';
import { Seo } from '@/components/shared/Seo';

const childArtMetadata = {
  title: 'ChildArt Magazine | ICAF',
  description:
    'ChildArt Magazine is a quarterly magazine dedicated to the impact of child art on the world.',
  path: '/programs/childart-magazine',
};

export default function ChildArtPage() {
  const size = useWindowSize();

  let gradientDefinition;
  if (size.width >= 1280) {
    gradientDefinition =
      'bg-[linear-gradient(to_right,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.7)_50%,rgba(0,0,0,0.4)_75%,rgba(255,255,255,0.15)_100%)]';
  } else if (size.width >= 1024) {
    gradientDefinition =
      'bg-[linear-gradient(to_right,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.65)_55%,rgba(0,0,0,0.45)_80%,rgba(255,255,255,0.1)_100%)]';
  } else if (size.width >= 640) {
    gradientDefinition =
      'bg-gradient-to-r from-black/90 from-0% via-black/60 via-[65%] to-black/50 to-100%';
  } else {
    gradientDefinition = 'bg-black/75';
  }

  return (
    <>
      <Seo {...childArtMetadata} />
      <div className="flex flex-col items-center gap-[100px] md:gap-[120px] lg:gap-[130px] xl:gap-[140px] 2xl:gap-[150px]">
        {/* === Hero Section with Curved Image === */}
        <div className="relative w-full">
          {/* Background image */}
          <div className="grid grid-cols-1 grid-rows-1">
            <div className="col-start-1 row-start-1">
              <CurvedImage
                src={magazineCoverLarge}
                curveStyle="Ellipse"
                gradientDefinition={gradientDefinition}
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
                    “evidence of the attributes, values, and skills that come
                    from arts education, including social and emotional
                    development, improvements in school engagement, as well as
                    vital civic and social participation.”
                  </p>
                  <div className="flex justify-start">
                    <DonateButton text="Donate to our Campaign" />
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

        <BackIssueGrid />

        <TestimonialBlock />

        {/* Donation CTA Section */}
        <YourDonations />
      </div>
    </>
  );
}
