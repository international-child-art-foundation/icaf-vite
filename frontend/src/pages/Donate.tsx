import { CurvedImage } from './CurvedImage';
import MalaysiaChildren from '@/assets/donate/MalaysiaChildren.png';
import TransparencyLogo from '@/assets/donate/TransparencyLogo.png';

import Portrait1 from '@/assets/donate/Portrait1.svg';
import Portrait2 from '@/assets/donate/Portrait2.svg';
import { Button } from '@/components/ui/button';
import { HeartIcon, X } from 'lucide-react';
import { childArtExhibition } from '@/data/donate/childArtExhibitionData';
import DonationUsageOrgCards from '@/components/donate/DonationUsageOrgCards';
import QuoteBanner from '@/components/donate/QuoteBanner';
import IntroBanner from '@/components/donate/IntroBanner';
import DonationUsageCards from '@/components/donate/DonationUsageCards';
import groupswCapitol from '@/assets/donate/groupswCapitol.png';
import { CircleArrowUp } from 'lucide-react';
import DonateForm from '@/components/donate/DonateForm';
import Icaflogo from '@/assets/donate/icafLogo.svg';
import { useState } from 'react';
import DonationMethod from '@/components/donate/DonationMethod';

export default function Donate() {
  const [showRedirectModal, setShowRedirectModal] = useState(false);

  const handleDonateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowRedirectModal(true);
  };

  const handleGotItClick = () => {
    setShowRedirectModal(false);
    window.open(
      'https://www.every.org/icaf?search_meta=%7B%22query%22%3A%22international+art+foun%22%7D&donateTo=icaf#/donate/card',
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <div className="font-montserrat relative w-full">
      {/* Header */}
      <div className="relative">
        {/* Desktop Layout (1280px+) - Side by side */}
        <div className="hidden h-[550px] grid-cols-1 grid-rows-1 xl:grid">
          <div className="col-start-1 row-start-1">
            <CurvedImage
              src={MalaysiaChildren}
              curveStyle={'Ellipse'}
              darkened={true}
              gradientDefinition={'bg-gradient-to-b from-black/70 to-black/0'}
              objectFit="cover"
              objectPosition="center center"
              scale={1}
              height="650px"
            />
          </div>
          <div className="z-20 col-start-1 row-start-1 flex items-center justify-between px-8 md:px-8 lg:px-20">
            <div className="w-full md:w-3/5">
              <div className="mb-8">
                <h1 className="font-montserrat mb-2 text-left text-5xl font-bold text-white md:text-6xl lg:text-7xl">
                  Art Changes Lives,
                </h1>
                <h2 className="font-montserrat text-secondary-yellow text-left text-4xl font-bold md:text-5xl lg:text-6xl">
                  You Can Too.
                </h2>
              </div>
              <p className="font-montserrat mb-6 text-left text-base text-white md:text-lg lg:text-xl">
                Your gift funds art programs for underserved schools, spotlights
                young artists at the World Children's Festival, and delivers
                creativity without ads through ChildArt Magazine. Empower
                children to create their future—donate today!
              </p>
              <a
                href="https://www.guidestar.org/profile/52-2032649"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer transition-opacity hover:opacity-80"
              >
                <img
                  src={TransparencyLogo}
                  alt="Transparent Logo"
                  className="h-20 w-auto md:h-20"
                />
              </a>
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
              height="500px"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 text-center lg:px-20">
              <div className="mb-6">
                <h1 className="font-montserrat mb-2 text-4xl font-bold text-white lg:text-5xl">
                  Art Changes Lives,
                </h1>
                <h2 className="font-montserrat text-secondary-yellow text-3xl font-bold lg:text-4xl">
                  You Can Too.
                </h2>
              </div>
              <p className="font-montserrat mx-auto mb-4 max-w-2xl text-base text-white lg:text-lg">
                Your gift funds art programs for underserved schools, spotlights
                young artists at the World Children's Festival, and delivers
                creativity without ads through ChildArt Magazine. Empower
                children to create their future—donate today!
              </p>
              <div className="flex justify-center">
                <a
                  href="https://www.guidestar.org/profile/52-2032649"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer transition-opacity hover:opacity-80"
                >
                  <img
                    src={TransparencyLogo}
                    alt="Transparent Logo"
                    className="h-20 w-auto"
                  />
                </a>
              </div>
            </div>
          </div>
          <div className="bg-white px-8 py-12 lg:px-20">
            <div className="mx-auto max-w-2xl">
              <DonateForm isMobile={true} isTablet={true} />
            </div>
          </div>
        </div>

        {/* Mobile Layout (768px and below) - Compact stacked */}
        <div className="lg:hidden">
          <div className="relative h-[600px]">
            <CurvedImage
              src={MalaysiaChildren}
              curveStyle={'Ellipse'}
              darkened={true}
              gradientDefinition={'bg-gradient-to-b from-black/70 to-black/0'}
              objectFit="cover"
              objectPosition="center center"
              scale={1}
              height="700px"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 text-center">
              <div className="mb-4">
                <h1 className="font-montserrat mb-2 text-2xl font-bold text-white md:text-3xl">
                  Art Changes Lives,
                </h1>
                <h2 className="font-montserrat text-secondary-yellow text-xl font-bold md:text-2xl">
                  You Can Too.
                </h2>
              </div>
              <p className="font-montserrat mb-6 text-sm text-white md:text-base">
                Your gift funds art programs for underserved schools, spotlights
                young artists at the World Children's Festival, and delivers
                creativity without ads through ChildArt Magazine. Empower
                children to create their future—donate today!
              </p>
              <div className="mb-6 flex justify-center">
                <a
                  href="https://www.guidestar.org/profile/52-2032649"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer transition-opacity hover:opacity-80"
                >
                  <img
                    src={TransparencyLogo}
                    alt="Transparent Logo"
                    className="h-10 w-auto"
                  />
                </a>
              </div>
              <div className="mx-auto max-w-md">
                <DonateForm isMobile={true} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About ICAF */}
      <div className="px-8 pb-12 pt-10 text-center md:px-8 lg:px-20">
        <div className="mb-6">
          <h2 className="mb-3 text-3xl font-bold text-black md:text-4xl">
            About ICAF
          </h2>
          {/* <div className="flex items-center justify-center gap-2">
            <img src={Award} alt="Award" className="h-5 w-5" />
            <p className="text-base text-black">
              We have been consistently ranked among the{' '}
              <a
                href="#"
                className="text-secondary-blue font-bold hover:underline"
              >
                Top 25 Children's Charities in the United States.
              </a>
            </p>
          </div> */}
        </div>

        <div>
          <IntroBanner />
        </div>

        <div className="mb-6">
          <div className="mt-16">
            <div className="mb-8 text-center">
              <h3 className="mb-4 text-3xl font-bold text-black md:text-4xl">
                Art by the children we serve
              </h3>
              <p className="mb-6 text-base text-black">
                Every piece of art here tells a story of hope and resilience.
                Here's a glimpse of the talent you're supporting.
              </p>
              <div className="mb-8 flex items-center justify-center gap-2">
                <div className="relative flex -space-x-2">
                  <img
                    src={Portrait1}
                    alt="Portrait 1"
                    className="h-8 w-8 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src={Portrait2}
                    alt="Portrait 2"
                    className="relative z-10 h-8 w-8 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src={Portrait1}
                    alt="Portrait 1"
                    className="h-8 w-8 rounded-full border-2 border-white object-cover"
                  />
                </div>
                <p className="text-sm text-black">
                  Join 254 others who donated this month!
                </p>
              </div>
            </div>

            <div className="flex flex-row items-start justify-center gap-8 md:flex-col">
              {Array.from({ length: 2 }).map((_, rowIdx) => (
                <div
                  key={rowIdx}
                  className="flex w-full flex-col justify-center gap-8 md:flex-row"
                >
                  {childArtExhibition
                    .slice(rowIdx * 3, rowIdx * 3 + 3)
                    .map((artwork) => (
                      <div key={artwork.id} className="text-center">
                        <div className="mb-4">
                          <img
                            src={artwork.image}
                            alt={artwork.alt}
                            className="rounded-lg shadow-md"
                          />
                        </div>
                        <p className="text-sm font-medium text-black">
                          {artwork.artistName}, {artwork.age},{' '}
                          {artwork.location}
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

      <div className="mb-12 px-8 md:px-8 lg:px-20">
        <QuoteBanner />
      </div>

      <div className="px-8 md:px-8 lg:px-20">
        <div className="text-center">
          <h2 className="mb-12 text-3xl font-bold text-black md:text-4xl">
            How we make it happen
          </h2>
        </div>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-12 2xl:flex-col 2xl:gap-8">
          <div className="w-full lg:w-2/5 2xl:w-full">
            <DonationUsageCards />
          </div>
          <div className="w-full lg:w-3/5 2xl:w-full">
            <img
              src={groupswCapitol}
              alt="groupsqCapitol"
              className="h-auto w-full rounded-2xl lg:h-full lg:object-cover 2xl:h-auto"
            />
          </div>
        </div>
      </div>

      <div className="px-8 md:px-8 lg:px-20">
        <DonationMethod />
      </div>

      <div className="bg-white py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-8 text-3xl font-bold text-black md:text-4xl">
            Create a <span className="font-bold">brighter future</span> with
            your donation <span className="font-bold">today!</span>
          </h2>

          <Button
            variant="secondary"
            className="mb-12 mt-4 h-14 self-start rounded-full px-6 text-base tracking-wide"
            onClick={handleDonateClick}
          >
            <HeartIcon
              strokeWidth={2}
              className="!h-5 !w-5 stroke-black lg:mr-0 lg:!h-5 lg:!w-5"
            />
            DONATE IN 60 SECONDS
          </Button>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className=""
            >
              <CircleArrowUp className="text-secondary-black h-10 w-10" />
            </button>
            <span className="text-sm text-gray-500">Scroll to top</span>
          </div>
        </div>
      </div>

      {showRedirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8">
            <button
              onClick={() => setShowRedirectModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            <div className="mb-6">
              <img src={Icaflogo} alt="ICAF Logo" className="h-15 w-20" />
            </div>

            <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">
              Heads up!
            </h2>

            <div className="mb-6 text-center">
              <p className="mb-4 leading-relaxed text-gray-700">
                You're about to be redirected to Every.org to complete your
                donation.
              </p>
              <p className="text-sm leading-relaxed text-gray-600">
                An optional tip to Every.org may appear. You can set it to $0.
                100% of your donation will go to ICAF.
              </p>
            </div>

            <button
              onClick={handleGotItClick}
              className="bg-primary hover:bg-primary/90 w-full rounded-full px-6 py-3 font-semibold text-white transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
