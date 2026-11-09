import purposeBackgroundLarge from '@/modules/content/assets/home/MissionVisionLarge.webp';
import purposeBackgroundSmall from '@/modules/content/assets/home/MissionVisionSmall.webp';

const HomePurpose = () => {
  return (
    <section
      aria-label="What we do and how"
      className="breakout-w m-pad relative -mt-20 grid min-h-[500px] w-full grid-cols-1 grid-rows-1"
    >
      <picture aria-hidden="true" className="col-start-1 row-start-1 mt-16">
        <source media="(min-width: 1024px)" srcSet={purposeBackgroundLarge} />
        <source media="(max-width: 1023px)" srcSet={purposeBackgroundSmall} />
        <img
          src={purposeBackgroundLarge}
          alt=""
          className="m-auto h-auto w-full object-cover object-center"
          loading="lazy"
        />
      </picture>

      <div className="lg:gap-18 col-start-1 row-start-1 mx-auto flex flex-col gap-0 sm:gap-20 md:gap-6 xl:gap-20">
        <div className="mx-auto my-auto flex flex-col items-start overflow-hidden lg:flex-row lg:items-center">
          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:grid-rows-1 lg:gap-10">
            <div className="grid grid-cols-1 grid-rows-[36px_1fr] items-center gap-y-2 rounded-lg bg-gradient-to-br from-white/75 via-white/65 to-white/75 py-6 transition-colors hover:bg-white/80">
              <h2 className="font-montserrat text-tertiary-blue col-start-1 row-start-1 text-3xl font-semibold leading-6 md:text-4xl">
                What
              </h2>
              <p className="font-openSans col-start-1 row-start-2 self-start text-base text-black lg:text-2xl">
                <strong className="font-semibold">Creativity</strong> is an
                essential life skill in the AI age.{' '}
                <strong className="font-semibold">Empathy</strong> is a vital
                survival skill in the nuclear age. Together, they empower young
                people to shape a prosperous and peaceful future.
              </p>
            </div>

            <div className="grid grid-cols-1 grid-rows-[36px_1fr] items-center gap-y-2 rounded-lg bg-gradient-to-br from-white/75 via-white/65 to-white/75 py-6 transition-colors hover:bg-white/80">
              <h2 className="font-montserrat text-error text-3xl font-semibold leading-6 md:text-4xl">
                How
              </h2>
              <p className="font-openSans col-start-1 row-start-2 text-base text-black lg:text-2xl">
                Join the{' '}
                <strong className="font-semibold">
                  International Child Art Foundation (ICAF)
                </strong>
                , America's national arts organization serving children since
                1997. ICAF cultivates creativity and grows empathy among young
                Americans as they pursue “<em>a more perfect union</em>,” while
                connecting them with peers worldwide to shape a brighter future.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePurpose;
