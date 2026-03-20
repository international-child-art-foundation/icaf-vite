import { PageBottomSpacer } from '@/components/shared/PageBottomSpacer';
import { CurvedImage } from './CurvedImage';
import MagazineCarousel from '../components/childArt/MagazineCarousel';
import { childArtMagazine } from '@/assets/shared/images/navigation/programs';
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
      <div className="content-gap items-center">
        {/* === Hero Section with Curved Image === */}
        <div className="site-w grid grid-cols-1 grid-rows-1">
          <div className="col-start-1 row-start-1">
            <CurvedImage
              src={childArtMagazine}
              curveStyle="Ellipse"
              gradientDefinition={gradientDefinition}
            />
          </div>

          {/* Foreground Text */}
          <div className="hero-w relative z-10 col-start-1 row-start-1 flex h-full items-start pt-20 md:items-center md:pt-0">
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
                <DonateButton text="Donate to our Campaign" />
              </div>
            </div>
          </div>
        </div>

        {/* === Carousel Section === */}
        <MagazineCarousel />

        <BackIssueGrid />

        <TestimonialBlock />

        {/* Donation CTA Section */}
        <YourDonations />
      </div>
      <PageBottomSpacer />
    </>
  );
}
