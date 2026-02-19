import DonateButton from '@/components/ui/donateButton';
import ICAFAboutImage from '@/assets/shared/images/about/ICAF1.webp';
import ourProgramsImage from '@/assets/shared/images/about/ourPrograms.webp';
import writingsResearchImage from '@/assets/shared/images/about/writingsResearch.webp';
import { AboutGraphic1 } from '@/assets/shared/images/about/AboutGraphic1';

export default function WhoWeAre() {
  return (
    <section className="font-montserrat w-breakout pad-sides relative mx-auto">
      <div className="pointer-events-none absolute right-0 top-0 z-[-10] -translate-y-1/4">
        <AboutGraphic1
          fill="#0050FA"
          className="h-36 w-36 md:h-48 md:w-48 lg:h-60 lg:w-60"
        />
      </div>

      <div className="pointer-events-none absolute left-0 top-[55%] z-[-10] -translate-y-1/2">
        <AboutGraphic1
          fill="#DA1E40"
          className="h-28 w-28 md:h-36 md:w-36 lg:h-48 lg:w-48"
        />
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 z-[-10] translate-y-1/4">
        <AboutGraphic1 fill="#FFBC42" className="h-48 w-48 lg:h-64 lg:w-64" />
      </div>

      <div className="relative">
        <h2 className="text-center text-3xl font-extrabold lg:text-[40px]">
          Who We Are
        </h2>
      </div>

      {/* Section 1 */}
      <article className="mx-auto my-10 max-w-screen-2xl lg:flex">
        <div className="lg:w-1/2">
          <h3 className="lg:text-x my-4 text-2xl font-semibold">
            International Child Art Foundation
          </h3>
          <div className="bg-tertiary-red my-4 h-1 rounded-full"></div>
          <p className="my-4 font-sans lg:text-xl">
            Founded in the District of Columbia in 1997 as a 501(c)(3) nonprofit
            with federal tax# 52-2032649, the International Child Art Foundation
            (ICAF) serves American children as their national arts organization
            that fosters their creativity and develops mutual empathy among them
            and with their peers worldwide through the universal language of
            art.
          </p>
          <div className="flex justify-start">
            <DonateButton text="Donate to our Campaign" className="w-[268px]" />
          </div>
        </div>
        <div className="my-4 h-[350px] w-full md:h-[475px] lg:h-96 lg:w-1/2 lg:pl-32 xl:h-[400px] 2xl:h-[455px] 2xl:pl-36">
          <picture className="h-full w-full">
            <img
              src={ICAFAboutImage}
              loading="lazy"
              alt="children showing artwork"
              className="border-tertiary-red h-full w-full rounded-[42px] border-4 object-cover"
            />
          </picture>
        </div>
      </article>

      {/* Section 2 */}
      <article className="my-20 max-w-screen-2xl md:my-24 lg:flex lg:flex-row-reverse">
        <div className="lg:w-1/2">
          <h3 className="my-4 text-2xl font-semibold">Our Programs</h3>
          <div className="bg-secondary-blue my-4 h-1 rounded-full"></div>
          <div className="font-sans">
            <h5 className="my-4 text-xl font-semibold">The Arts Olympiad</h5>
            <p className="my-4 lg:text-xl">
              Since its inception 25 years ago, the Arts Olympiad has grown into
              the world's largest art program for children, inspiring the
              creation of art by participants around the world.
            </p>
          </div>
          <div className="font-sans">
            <h4 className="my-4 text-xl font-semibold">
              World Children's Festival
            </h4>
            <p className="lg:text-xl">
              The "Olympics" of children's imagination.
            </p>
            <p className="lg:text-xl">
              As the world's largest exhibitor of children's art and organizer
              of youth panels at major conferences, we give voice to children
              like no other. ICAF has won several awards and is independently
              ranked as one of the 25 Top Children's Charities in the United
              States.
            </p>
          </div>
        </div>
        <div className="my-4 h-[350px] w-full md:h-[475px] lg:h-96 lg:w-1/2 lg:pr-32 xl:h-[400px] 2xl:h-[455px] 2xl:pr-36">
          <picture className="h-full w-full">
            <img
              src={ourProgramsImage}
              loading="lazy"
              alt="children showing artwork"
              className="border-secondary-blue h-full w-full rounded-[42px] border-4 object-cover"
            />
          </picture>
        </div>
      </article>

      {/* Section 3 */}
      <article className="my-10 max-w-screen-2xl lg:my-20 lg:flex">
        <div className="lg:w-1/2">
          <h3 className="my-4 text-2xl font-semibold">Writings and Research</h3>
          <div className="bg-secondary-yellow my-4 h-1 rounded-full"></div>
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
            <img
              src={writingsResearchImage}
              loading="lazy"
              alt="children showing artwork"
              className="border-secondary-yellow h-full w-full rounded-[42px] border-4 object-cover"
            />
          </picture>
        </div>
      </article>
    </section>
  );
}
