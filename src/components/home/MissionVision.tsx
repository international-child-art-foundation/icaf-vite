import { mapBg1024, mapBg428 } from '@/assets/shared/images/home/map-bg';
import { ClickIcon } from '@/assets/shared/icons/ClickIcon';
import { VisibilityIcon } from '@/assets/shared/icons/VisibilityIcon';
import StepperLineIcon from '@/assets/shared/icons/StepperLineIcon';

const MissionVision = () => {
  return (
    <div className="relative inline-block">
      <picture>
        <source media="(min-width: 1024px)" srcSet={mapBg1024} />
        <source media="(max-width: 1023px)" srcSet={mapBg428} />
        <img
          src={mapBg1024}
          alt="Map Background"
          className="m-auto h-[1060px] w-[438px] object-cover object-center lg:h-[785px] lg:w-[1024px]"
          loading="lazy"
        />
      </picture>
      <div className="absolute top-[190px] flex max-w-[428px] flex-col items-center justify-center lg:top-[140px] lg:max-w-[1024px]">
        <h1 className="text-center font-montserrat text-[32px] font-extrabold leading-6 text-black lg:text-[40px]">
          Mission & Vision
        </h1>
        <div className="mx-auto mt-12 flex flex-col items-start gap-12 px-6 lg:flex-row lg:items-center lg:gap-12">
          <div className="flex flex-col gap-8 lg:max-w-[520px] lg:gap-10">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex items-center gap-2">
                <ClickIcon />
                <h1 className="font-montserrat text-[32px] font-extrabold leading-6 text-primary">
                  Mission
                </h1>
              </div>
              <p className="font-sans text-base text-black">
                To inspire kids to imagine, create, and care for each other.
              </p>
            </div>
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex items-center gap-2">
                <VisibilityIcon />
                <h1 className="font-montserrat text-[32px] font-extrabold leading-6 text-error">
                  Vision
                </h1>
              </div>
              <p className="font-sans text-base text-black">
                We envision a world where everyone is creative and kind,
                achieving success and happiness together.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionVision;
