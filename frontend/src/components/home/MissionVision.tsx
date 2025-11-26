import missionVisionBackgroundLarge from '@/assets/home/MissionVisionLarge.webp';
import missionVisionBackgroundSmall from '@/assets/home/MissionVisionSmall.webp';
import { ClickIcon } from '@/assets/shared/icons/ClickIcon';
import { VisibilityIcon } from '@/assets/shared/icons/VisibilityIcon';

const MissionVision = () => {
  return (
    <div className="relative grid h-[500px] w-full max-w-screen-2xl grid-cols-1 grid-rows-1">
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

      <div className="xl:px-18 lg:gap-18 col-start-1 row-start-1 flex flex-col gap-0 px-6 sm:gap-20 md:gap-6 md:px-10 lg:px-14 xl:gap-20">
        <h1 className="font-montserrat text-center text-[32px] font-extrabold leading-[40px] text-black lg:text-[40px] lg:leading-[48px]">
          Our Purpose
        </h1>
        <div className="mx-auto my-auto flex flex-col items-start overflow-hidden lg:flex-row lg:items-center">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
            <div className="grid grid-cols-[36px_1fr] grid-rows-[36px_1fr] items-center gap-4 gap-y-2 rounded-lg bg-gradient-to-br from-white/60 via-white/50 to-white/60 p-6 transition-colors hover:bg-white/80 lg:grid lg:flex-row">
              <ClickIcon className="col-start-1 row-start-1 lg:col-start-1 lg:row-start-1" />
              <h1 className="font-montserrat text-tertiary-blue col-start-2 row-start-1 text-3xl font-semibold leading-6 md:text-4xl lg:col-start-2 lg:row-start-1">
                Mission
              </h1>
              <p className="font-openSans col-span-2 col-start-1 row-start-2 self-start text-base text-black lg:col-start-2 lg:row-start-2 lg:text-2xl">
                To seed students’
                <span className="font-semibold"> imagination</span>, cultivate
                their <span className="font-semibold">creativity</span>, and{' '}
                grow mutual <span className="font-semibold">empathy</span>{' '}
                through the power of art.{' '}
              </p>
            </div>
            <div className="grid grid-cols-[36px_1fr] grid-rows-[36px_1fr] items-center gap-4 gap-y-2 rounded-lg bg-gradient-to-br from-white/60 via-white/50 to-white/60 p-6 transition-colors hover:bg-white/80 lg:grid lg:flex-row">
              <VisibilityIcon className="lg:col-start-1 lg:row-start-1" />
              <h1 className="font-montserrat text-error text-3xl font-semibold leading-6 md:text-4xl lg:col-start-2 lg:row-start-1">
                Vision
              </h1>
              <p className="font-openSans col-span-2 col-start-1 row-start-2 text-base text-black lg:col-start-2 lg:row-start-2 lg:text-2xl">
                To <span className="font-semibold">democratize creativity</span>{' '}
                and <span className="font-semibold">mainstream empathy</span>{' '}
                for shared prosperity and a more perfect union.{' '}
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
