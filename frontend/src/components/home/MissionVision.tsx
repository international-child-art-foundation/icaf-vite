import missionVisionBackgroundLarge from '@/assets/home/MissionVisionLarge.webp';
import missionVisionBackgroundSmall from '@/assets/home/MissionVisionSmall.webp';
import { ClickIcon } from '@/assets/shared/icons/ClickIcon';
import { VisibilityIcon } from '@/assets/shared/icons/VisibilityIcon';

const MissionVision = () => {
  return (
    <div className="relative grid w-full max-w-screen-2xl grid-cols-1 grid-rows-1">
      <picture className="col-start-1 row-start-1 mt-16">
        <source
          media="(min-width: 1024px)"
          srcSet={missionVisionBackgroundLarge}
        />
        <source
          media="(max-width: 1023px)"
          srcSet={missionVisionBackgroundSmall}
        />
        <img
          src={missionVisionBackgroundLarge}
          alt="Map Background"
          className="m-auto object-cover object-center"
          loading="lazy"
        />
      </picture>
      <div className="col-start-1 row-start-1 flex flex-col gap-0 px-8 sm:gap-20 md:gap-12 md:px-12 lg:gap-28 lg:px-16 xl:gap-40 xl:px-20">
        <h1 className="font-montserrat text-center text-[32px] font-extrabold leading-6 text-black lg:text-[40px]">
          Why ICAF?
        </h1>
        <div className="mx-auto mt-12 flex flex-col items-start gap-12 lg:flex-row lg:items-center lg:gap-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex items-center gap-2">
                <ClickIcon />
                <h1 className="font-montserrat text-tertiary-blue text-2xl font-semibold leading-6 md:text-4xl">
                  Mission
                </h1>
              </div>
              <p className="font-openSans text-base text-black">
                To seed students’ imagination, cultivate their creativity, and
                grow mutual empathy through the power of art.
              </p>
            </div>
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex items-center gap-2">
                <VisibilityIcon />
                <h1 className="font-montserrat text-error text-2xl font-semibold leading-6 md:text-4xl">
                  Vision
                </h1>
              </div>
              <p className="font-openSans text-base text-black">
                To democratize creativity and mainstream empathy for shared
                prosperity and a more perfect union.
              </p>
            </div>
          </div>
          {/* <div className="flex gap-3">
            <StepperLineIcon />
            <div className="mt-6 flex flex-col">
              <h1 className="font-montserrat text-2xl font-semibold text-black">
                Social and Cultural Impact
              </h1>
              <div className="mt-16 flex flex-col">
                <h1 className="font-montserrat text-2xl font-semibold text-black">
                  115 Countries Reached
                </h1>
                <p className="font-sans text-base text-black">
                  to make students creative and empathetic
                </p>
              </div>
              <div className="mt-10 flex flex-col">
                <h1 className="font-montserrat text-2xl font-semibold text-black">
                  500+ Workshops
                </h1>
                <p className="font-sans text-base text-black">
                  at events and exhibitions worldwide
                </p>
              </div>
              <div className="mt-10 flex flex-col">
                <h1 className="font-montserrat text-2xl font-semibold text-black">
                  2 Million Kids Worldwide
                </h1>
                <p className="font-sans text-base text-black">
                  produced original works for ICAF
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default MissionVision;
