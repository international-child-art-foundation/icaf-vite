import DonateButton from '@/components/ui/donateButton';
import ICAFAboutImage from '@/assets/shared/images/about/ICAF1.png';
import { AboutGraphic1 } from '@/assets/shared/images/about/AboutGraphic1';

export default function WhoWeAre() {
  return (
    <section className="my-10 font-montserrat md:my-20">
      <div className="relative">
        <div className="absolute right-0 top-0 z-[-10] -translate-y-[60%] translate-x-1/2 transform md:-translate-y-1/2 md:translate-x-[20%] lg:translate-x-[35%] lg:translate-y-[0%] xl:translate-x-[45%] 2xl:translate-x-[30%]">
          <AboutGraphic1
            fill="#0050FA"
            className="h-36 w-36 md:h-48 md:w-48 lg:h-60 lg:w-60"
          />
        </div>

        <h2 className="text-center text-3xl font-extrabold lg:mb-16 lg:text-[40px]">
          Who We Are
        </h2>
      </div>
      {/*Section 1*/}
      <article className="my-10 lg:flex">
        <div className="lg:w-1/2">
          <h3 className="lg:text-x my-4 text-2xl font-semibold">
            International Child Art Foundation
          </h3>
          <div className="border-secondary-red lg:text-x my-4 rounded-full border-4"></div>
          <p className="my-4 font-sans lg:text-xl">
            Founded in the District of Columbia in 1997 as a 501(c)(3) nonprofit
            with federal tax# 52-2032649, the International Child Art Foundation
            (ICAF) serves American children as their national arts organization
            that fosters their creativity and develops mutual empathy among them
            and with their peers worldwide through the universal language of
            art.
          </p>
          <div className="flex justify-start">
            <DonateButton
              title="Donate to our campaign"
              className="w-[268px]"
            />
          </div>
        </div>
        <div className="my-4 h-[350px] w-full md:h-[475px] lg:h-96 lg:w-1/2 lg:pl-32 xl:h-[400px] 2xl:h-[455px] 2xl:pl-36">
          <picture className="h-full w-full">
            <img
              src={ICAFAboutImage}
              alt="children showing artwork"
              className="border-secondary-red h-full w-full rounded-[42px] border-4 object-cover"
            />
          </picture>
        </div>
      </article>
      {/*Section 2*/}
      <article className="my-20 md:my-24 lg:flex lg:flex-row-reverse">
        <div className="lg:w-1/2">
          <div className="relative">
            <div className="absolute left-0 top-0 z-[-10] -translate-y-[90%] translate-x-[-20%] transform lg:hidden">
              <AboutGraphic1
                fill="#DA1E40"
                className="h-28 w-28 md:h-36 md:w-36 lg:h-48 lg:w-48"
              />
            </div>
          </div>
          <h3 className="my-4 text-2xl font-semibold">Our Programs</h3>
          <div className="my-4 rounded-full border-4 border-secondary-blue"></div>
          <div className="font-sans">
            <h5 className="my-4 text-xl font-semibold">The Arts Olympiad</h5>
            <p className="my-4 lg:text-xl">
              Over the years it has grown into the world’s largest art program.
            </p>
          </div>
          <div className="font-sans">
            <h4 className="my-4 text-xl font-semibold">
              World Children's Festival
            </h4>
            <p className="lg:text-xl">
              The “Olympics” of children’s imagination.
            </p>
            <p className="lg:text-xl">
              As the world’s largest exhibitor of children’s art and organizer
              of youth panels at major conferences, we give voice to children
              like no other. ICAF has won several awards and is independently
              ranked as one of the 25 Top Children’s Charities in the United
              States.
            </p>
          </div>
        </div>
        <div className="my-4 h-[350px] w-full md:h-[475px] lg:h-96 lg:w-1/2 lg:pr-32 xl:h-[400px] 2xl:h-[455px] 2xl:pr-36">
          <div className="relative">
            <div className="absolute left-0 top-0 z-[-10] hidden -translate-y-[90%] translate-x-[-20%] transform lg:block lg:-translate-y-[30%] lg:translate-x-[-55%]">
              <AboutGraphic1
                fill="#DA1E40"
                className="h-28 w-28 md:h-36 md:w-36 lg:h-48 lg:w-48"
              />
            </div>
          </div>
          <picture className="h-full w-full">
            <img
              src={ICAFAboutImage}
              alt="children showing artwork"
              className="h-full w-full rounded-[42px] border-4 border-secondary-blue object-cover"
            />
          </picture>
        </div>
      </article>
      {/*Section 3*/}
      <article className="my-10 lg:my-20 lg:flex">
        <div className="lg:w-1/2">
          <h3 className="my-4 text-2xl font-semibold">Writings and Research</h3>
          <div className="my-4 rounded-full border-4 border-secondary-yellow"></div>
          <div className="font-sans">
            <p className="my-4 lg:text-xl">
              Our writings and research have appeared in leading journals and
              magazines such as Art&Activities, Dynamische Psychiatrie, The
              Lancet, SchoolArts, The State Education Standard, and The STEAM
              Journal.
            </p>
          </div>
        </div>
        <div className="my-4 h-[350px] w-full md:h-[475px] lg:h-96 lg:w-1/2 lg:pl-32 xl:h-[400px] 2xl:h-[455px] 2xl:pl-36">
          <picture className="h-full w-full">
            <div className="relative">
              <div className="absolute left-0 top-0 z-[-10] hidden transform lg:block lg:translate-x-[-85%] lg:translate-y-[100%]">
                <AboutGraphic1 fill="#FFBC42" className="h-64 w-64" />
              </div>
            </div>
            <img
              src={ICAFAboutImage}
              alt="children showing artwork"
              className="h-full w-full rounded-[42px] border-4 border-secondary-yellow object-cover"
            />
          </picture>
        </div>
      </article>
    </section>
  );
}
