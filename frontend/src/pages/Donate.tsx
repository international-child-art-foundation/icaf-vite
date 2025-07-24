import { CurvedImage } from './CurvedImage';
import MalaysiaChildren from '@/assets/donate/MalaysiaChildren.png';
import TransparencyLogo from '@/assets/donate/TransparencyLogo.png';
import Award from '@/assets/donate/award-alt.svg';

import Portrait1 from '@/assets/donate/Portrait1.png';
import Portrait2 from '@/assets/donate/Portrait2.png';
import { Button } from '@/components/ui/button';
import { HeartIcon } from 'lucide-react';
import { childArtExhibition } from '@/data/donate/childArtExhibitionData';
import DonationUsageOrgCards from '@/components/donate/DonationUsageOrgCards';
import QuoteBanner from '@/components/donate/QuoteBanner';
import IntroBanner from '@/components/donate/IntroBanner';
import DonationUsageCards from '@/components/donate/DonationUsageCards';
import DonationWay from '@/components/donate/DonationWay';
import groupswCapitol from '@/assets/donate/groupswCapitol.png';
import { CircleArrowUp } from 'lucide-react';
import DonateForm from '@/components/donate/DonateForm';

export default function Donate() {
  return (
    <div className="relative w-full font-montserrat">
      {/* Header */}
      <div className="relative">
        {/* Desktop Layout (1280px+) - Side by side */}
        <div className="hidden xl:grid h-[550px] grid-cols-1 grid-rows-1">
          <div className="col-start-1 row-start-1">
            <CurvedImage
              src={MalaysiaChildren}
              curveStyle={'Ellipse'}
              darkened={true}
              gradientDefinition={'bg-gradient-to-b from-black/70 to-black/0'}
              objectFit="cover"
              objectPosition="center center"
              scale={1}
            />
          </div>
          <div className="z-20 col-start-1 row-start-1 flex justify-between items-center px-8 md:px-8 lg:px-20">
            <div className="w-full md:w-1/2">
              <div className="mb-8">
                <h1 className="font-montserrat mb-2 text-5xl font-bold text-white md:text-6xl lg:text-7xl text-left">
                  Art Changes Lives,
                </h1>
                <h2 className="font-montserrat text-4xl font-bold text-secondary-yellow md:text-5xl lg:text-6xl text-left">
                  You Can Too.
                </h2>
              </div>
              <p className="font-montserrat text-base text-white md:text-lg lg:text-xl text-left mb-6">
                Your gift funds art programs for underserved schools, spotlights young artists at the World Children's Festival, and delivers creativity without ads through ChildArt Magazine. Empower children to create their future—donate today!
              </p>
              <img
                src={TransparencyLogo}
                alt="Transparent Logo"
                className="h-8 w-auto md:h-10"
              />
            </div>
            <DonateForm />
          </div>
        </div>

        {/* Tablet Layout (1024px) - Stacked with form below image */}
        <div className="hidden lg:block xl:hidden">
          <div className="relative h-[400px]">
            <CurvedImage
              src={MalaysiaChildren}
              curveStyle={'Ellipse'}
              darkened={true}
              gradientDefinition={'bg-gradient-to-b from-black/70 to-black/0'}
              objectFit="cover"
              objectPosition="center center"
              scale={1}
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 lg:px-20 text-center">
              <div className="mb-6">
                <h1 className="font-montserrat mb-2 text-4xl font-bold text-white lg:text-5xl">
                  Art Changes Lives,
                </h1>
                <h2 className="font-montserrat text-3xl font-bold text-secondary-yellow lg:text-4xl">
                  You Can Too.
                </h2>
              </div>
              <p className="font-montserrat text-base text-white lg:text-lg mb-4 max-w-2xl mx-auto">
                Your gift funds art programs for underserved schools, spotlights young artists at the World Children's Festival, and delivers creativity without ads through ChildArt Magazine. Empower children to create their future—donate today!
              </p>
              <div className="flex justify-center">
                <img
                  src={TransparencyLogo}
                  alt="Transparent Logo"
                  className="h-8 w-auto"
                />
              </div>
            </div>
          </div>
          <div className="bg-white px-8 lg:px-20 py-12">
            <div className="max-w-2xl mx-auto">
              <DonateForm isMobile={true} isTablet={true} />
            </div>
          </div>
        </div>

        {/* Mobile Layout (768px and below) - Compact stacked */}
        <div className="lg:hidden">
          <div className="relative h-[350px]">
            <CurvedImage
              src={MalaysiaChildren}
              curveStyle={'Ellipse'}
              darkened={true}
              gradientDefinition={'bg-gradient-to-b from-black/70 to-black/0'}
              objectFit="cover"
              objectPosition="center center"
              scale={1}
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 text-center">
              <div className="mb-4">
                <h1 className="font-montserrat mb-2 text-2xl font-bold text-white md:text-3xl">
                  Art Changes Lives,
                </h1>
                <h2 className="font-montserrat text-xl font-bold text-secondary-yellow md:text-2xl">
                  You Can Too.
                </h2>
              </div>
              <p className="font-montserrat text-sm text-white md:text-base mb-4">
                Your gift funds art programs for underserved schools, spotlights young artists at the World Children's Festival, and delivers creativity without ads through ChildArt Magazine. Empower children to create their future—donate today!
              </p>
              <div className="flex justify-center">
                <img
                  src={TransparencyLogo}
                  alt="Transparent Logo"
                  className="h-6 w-auto"
                />
              </div>
            </div>
          </div>
          <div className="bg-white px-6 py-8">
            <DonateForm isMobile={true} />
          </div>
        </div>
      </div>

      {/* About ICAF */}
      <div className="px-8 md:px-8 lg:px-20 py-12 text-center">
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-3">
            About ICAF
          </h2>
          <div className="flex items-center justify-center gap-2">
            <img src={Award} alt="Award" className="w-5 h-5" />
            <p className="text-base text-black">
              We have been consistently ranked among the{' '}
              <a href="#" className="text-secondary-blue font-bold hover:underline">
                Top 25 Children's Charities in the United States.
              </a>
            </p>
          </div>
        </div>

        <div>
          <IntroBanner />
        </div>

        <div className="mb-6">
          <div className="mt-16">
            <div className="text-center mb-8">
              <h3 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Art by the children we serve
              </h3>
              <p className="text-base text-black mb-6">
                Every piece of art here tells a story of hope and resilience. Here's a glimpse of the talent you're supporting.
              </p>
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-secondary-blue rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-secondary-yellow rounded-full border-2 border-white"></div>
                </div>
                <p className="text-sm text-black">
                  Join 254 others who donated this month!
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-8 items-center">
              {Array.from({ length: 2 }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex flex-row gap-8 w-full justify-center">
                  {childArtExhibition.slice(rowIdx * 3, rowIdx * 3 + 3).map((artwork) => (
                    <div key={artwork.id} className="text-center">
                      <div className="mb-4">
                        <img
                          src={artwork.image}
                          alt={artwork.alt}
                          className="rounded-lg shadow-md"
                        />
                      </div>
                      <p className="text-sm text-black font-medium">
                        {artwork.artistName}, {artwork.age}, {artwork.location}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <DonationUsageOrgCards />
        </div>
      </div>

      <div className="px-8 md:px-8 lg:px-20">
        <QuoteBanner />
      </div>

      <div className="px-8 md:px-8 lg:px-20">
        <DonationUsageCards />
        <img src={groupswCapitol} alt="groupsqCapitol" className="w-full h-full rounded-2xl" />
      </div>

      <div className="px-8 md:px-8 lg:px-20">
        <DonationWay />
      </div>

      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-8">
            Create a <span className="font-bold">brighter future</span> with your donation <span className="font-bold">today!</span>
          </h2>

          <Button
            asChild
            variant="secondary"
            className="mt-4 mb-12 h-14 self-start rounded-full px-6 text-base tracking-wide"
          >
            <a
              href="https://icaf.org/donate"
              target="blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <HeartIcon
                strokeWidth={2}
                className="!h-5 !w-5 stroke-black lg:mr-0 lg:!h-5 lg:!w-5"
              />
              DONATE IN 60 SECONDS
            </a>
          </Button>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className=""
            >
              <CircleArrowUp className="w-10 h-10 text-secondary-black" />
            </button>
            <span className="text-sm text-gray-500">Scroll to top</span>
          </div>
        </div>
      </div>
    </div>
  );
}