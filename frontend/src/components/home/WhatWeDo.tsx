import soccer from '@/assets/shared/images/home/circle-images/soccer.webp';
import globeKids from '@/assets/shared/images/home/circle-images/globe-kids.webp';
import redBlueFirework from '@/assets/home/RedBlueFirework.png';

const WhatWeDo = () => {
  return (
    <div className="relative">
      <img
        src={redBlueFirework}
        className="absolute -top-12 hidden w-32 sm:right-8 sm:block md:right-24 md:w-48 lg:right-48 xl:right-80"
      />
      <div className="z-10 flex flex-col items-center gap-6 p-6 py-24 lg:gap-10 lg:p-10 lg:py-[50px]">
        <h1 className="font-montserrat text-[32px] font-extrabold leading-6 text-black lg:text-[40px]">
          What we do
        </h1>
        <p className="font-sans text-xl font-normal text-black lg:text-center">
          ICAF empowers children by seeding their imagination, cultivating
          creativity, and growing mutual empathy as building blocks for a more
          peaceful, prosperous, and sustainable future.
        </p>
        <p className="font-montserrat mt-4 text-2xl font-bold text-black lg:mt-5 lg:text-center">
          We focus on what’s important for schoolchildren: How they view
          themselves. Our Holistic identity development has two phases:
        </p>
        <div className="mt-9 flex max-w-[402px] flex-col items-center gap-8 lg:max-w-[700px] lg:flex-row lg:gap-[60px]">
          <div className="flex flex-1 flex-col items-center gap-4 lg:gap-6">
            <img
              src={soccer}
              className="h-[272px] w-[223px] lg:h-[204px] lg:w-[167px]"
              alt="Soccer Kids"
              loading="lazy"
            />
            <div className="flex flex-row gap-7 lg:flex-col lg:items-center lg:gap-2">
              <h1 className="font-montserrat text-2xl font-semibold text-black">
                01
              </h1>
              <p className="font-sans text-xl text-black lg:text-center">
                Combine art and sport to develop "artist athletes"
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center gap-4 lg:gap-6">
            <img
              src={globeKids}
              className="h-[184px] w-[223px] lg:h-[204px] lg:w-[248px]"
              alt="Soccer Kids"
              loading="lazy"
            />
            <div className="flex flex-row gap-7 lg:flex-col lg:items-center lg:gap-2">
              <h1 className="font-montserrat text-2xl font-semibold text-black">
                02
              </h1>
              <p className="font-sans text-xl text-black lg:text-center">
                Infuse creativity with empathy to grow "creative empaths"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatWeDo;
