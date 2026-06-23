import soccer from '@/modules/content/assets/home/circle-images/soccer.webp';
import globeKids from '@/modules/content/assets/home/circle-images/globe-kids.webp';
import redBlueFirework from '@/shared/assets/images/RedBlueFirework.svg';
import DonateButton from '../../../../shared/components/ui/donateButton';

const WhatWeDo = () => {
  return (
    <div className="breakout-w m-pad relative">
      <img
        src={redBlueFirework}
        className="absolute -top-32 hidden w-32 sm:left-8 sm:block md:left-12 md:w-48 lg:left-48 xl:-top-36 xl:left-64"
        alt=""
      />
      <div className="content-w z-10 flex flex-col items-center gap-6 py-6 pt-0 lg:px-10">
        <h2 className="font-montserrat text-[32px] font-extrabold text-black lg:text-[40px]">
          What We Do
        </h2>
        <div className="flex flex-col gap-6">
          <p className="font-sans text-2xl font-semibold md:text-center">
            ICAF empowers children to be creators and peacemakers.
          </p>
          {/* <p className="font-sans text-xl font-normal text-black md:text-center lg:text-center xl:text-2xl">
            We focus on what’s critically important in formative years:{' '}
            <span className="font-semibold">how students view themselves.</span>
          </p> */}
          <p className="max-w-[1300px] text-xl text-black lg:text-center">
            Through the transformative power of the arts, we ignite children's
            imaginations and foster their holistic identity development through
            a two-stage approach.
          </p>
        </div>
        <div className="flex max-w-[602px] flex-col items-center gap-8 lg:max-w-[1000px] lg:flex-row lg:gap-[60px]">
          <div className="flex flex-1 flex-col items-center gap-4 lg:gap-6">
            <img
              src={soccer}
              className="h-[204px] lg:h-[204px]"
              alt=""
              loading="lazy"
            />
            <div className="flex flex-row gap-7 lg:flex-col lg:items-center lg:gap-2">
              <p className="font-montserrat text-2xl font-semibold text-black">
                01
              </p>
              <p className="font-sans text-xl text-black lg:text-center">
                Through free school art programs, we motivate students to
                embrace the role of "artist-athletes," nurturing creative minds
                and healthy bodies.
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center gap-4 lg:gap-6">
            <img src={globeKids} className="h-[204px]" alt="" loading="lazy" />
            <div className="flex flex-row gap-7 lg:flex-col lg:items-center lg:gap-2">
              <p className="font-montserrat text-2xl font-semibold text-black">
                02
              </p>
              <p className="font-sans text-xl text-black lg:text-center">
                Through festivals, interactive exhibitions, and ChildArt
                magazine, we inspire students to become "creative-empaths,"
                promoting self-improvement and social contribution.
              </p>
            </div>
          </div>
        </div>
        <DonateButton text="Donate to our Campaign" />
      </div>
    </div>
  );
};

export default WhatWeDo;
