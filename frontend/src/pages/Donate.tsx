// import Portrait1 from '@/assets/donate/Portrait1.svg';
// import Portrait2 from '@/assets/donate/Portrait2.svg';
import { ArrowUp, X } from 'lucide-react';
import { childArtExhibition } from '@/data/donate/childArtExhibitionData';
import DonationUsageOrgCards from '@/components/donate/DonationUsageOrgCards';
import QuoteBanner from '@/components/donate/QuoteBanner';
import IntroBanner from '@/components/donate/IntroBanner';
import DonationUsageCards from '@/components/donate/DonationUsageCards';
import groupswCapitol from '@/assets/donate/groupswCapitol.png';
import Icaflogo from '@/assets/donate/icafLogo.svg';
import { useState } from 'react';
import DonationMethod from '@/components/donate/DonationMethod';
import { DonationHeader } from '@/components/donate/DonationHeader';
import DonateButton from '@/components/ui/donateButton';

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
    <div className="overflow-hidden">
      <DonationHeader />

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
              <h2 className="mb-4 text-3xl font-bold text-black md:text-4xl">
                Art by the children we serve
              </h2>
              <p className="mb-6 text-base text-black">
                Every piece of art here tells a story of hope and resilience.
                Here's a glimpse of the talent you're supporting.
              </p>
              {/* <div className="mb-8 flex items-center justify-center gap-2">
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
              </div> */}
            </div>

            <div className="flex flex-row items-start justify-center gap-8 md:flex-col">
              {Array.from({ length: 2 }).map((_, rowIdx) => (
                <div
                  // eslint-disable-next-line react-x/no-array-index-key
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
        <div className="mx-auto flex max-w-4xl flex-col gap-6 text-center">
          <h2 className="font-inter mx-4 text-xl text-black md:text-4xl">
            Create a <span className="font-medium italic">brighter future</span>{' '}
            with your donation{' '}
            <span className="font-medium italic">today!</span>
          </h2>

          <div className="mx-auto flex max-w-[350px] content-center">
            <DonateButton
              text="Donate in 60 Seconds"
              iconSide={'right'}
              onClick={handleDonateClick}
              className="px-6"
            />
          </div>
        </div>
        <div className="group mx-auto mt-12 flex cursor-pointer flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className=""
          >
            <div className="border-primary transition-color rounded-full border-2 p-2 duration-300 group-hover:bg-gray-100">
              <ArrowUp className="text-secondary-black h-6 w-6" />
            </div>
          </button>
          <span className="cursor-pointer text-sm text-gray-500 underline">
            Scroll to top
          </span>
        </div>
      </div>

      {showRedirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8">
            <button
              type="button"
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
              type="button"
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
