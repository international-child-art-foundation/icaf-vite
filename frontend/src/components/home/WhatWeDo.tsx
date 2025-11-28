import soccer from '@/assets/shared/images/home/circle-images/soccer.webp';
import globeKids from '@/assets/shared/images/home/circle-images/globe-kids.webp';
import redBlueFirework from '@/assets/home/RedBlueFirework.svg';

const WhatWeDo = () => {
  return (
    <div className="relative">
      <img
        src={redBlueFirework}
        className="absolute -top-32 hidden w-32 sm:left-8 sm:block md:left-12 md:w-48 lg:left-48 xl:-top-24 xl:left-[0px]"
        alt=""
      />
      <div className="z-10 flex flex-col items-center gap-6 p-6 pt-0 lg:gap-10 lg:p-10 lg:py-[50px]">
        <h2 className="font-montserrat text-[32px] font-extrabold leading-6 text-black lg:text-[40px]">
          What we do
        </h2>
        <div>
          <p className="font-sans text-2xl font-normal text-black lg:text-center">
            We focus on what’s critically important in formative years:{' '}
            <span className="font-semibold">how students view themselves.</span>
          </p>
          <p className="mt-4 text-2xl text-black lg:mt-5 lg:text-center">
            We have created a{' '}
            <span className="font-semibold">two-stage approach</span> for
            holistic identity development.
          </p>
        </div>
        <div className="mt-9 flex max-w-[402px] flex-col items-center gap-8 lg:max-w-[800px] lg:flex-row lg:gap-[60px]">
          <div className="flex flex-1 flex-col items-center gap-4 lg:gap-6">
            <img
              src={soccer}
              className="h-[204px] lg:h-[204px]"
              alt=""
              loading="lazy"
            />
            <div className="flex flex-row gap-7 lg:flex-col lg:items-center lg:gap-2">
              <h1 className="font-montserrat text-2xl font-semibold text-black">
                01
              </h1>
              <p className="font-sans text-xl text-black lg:text-center">
                Consilience of art and sports to nurture “artist-athletes.”
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center gap-4 lg:gap-6">
            <img src={globeKids} className="h-[204px]" alt="" loading="lazy" />
            <div className="flex flex-row gap-7 lg:flex-col lg:items-center lg:gap-2">
              <h1 className="font-montserrat text-2xl font-semibold text-black">
                02
              </h1>
              <p className="font-sans text-xl text-black lg:text-center">
                Consonance of creativity and empathy to inspire
                “creative-empaths.”
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatWeDo;
