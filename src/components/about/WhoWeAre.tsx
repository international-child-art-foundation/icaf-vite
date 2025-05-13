import DonateButton from '@/components/ui/donateButton';
import ICAFAboutImage from '@/assets/shared/images/about/ICAF.png';

export default function WhoWeAre() {
  return (
    <section className="my-10 font-montserrat">
      <h2 className="text-center text-3xl font-extrabold">Who We Are</h2>
      {/*Section 1*/}
      <article className="my-10">
        <div>
          <h3 className="my-4 text-2xl font-semibold">
            International Child Art Foundation
          </h3>
          <div className="border-secondary-red my-4 rounded-full border-4"></div>
          <p className="my-4 font-sans">
            Founded in the District of Columbia in 1997 as a 501(c)(3) nonprofit
            with federal tax# 52-2032649, the International Child Art Foundation
            (ICAF) serves American children as their national arts organization
            that fosters their creativity and develops mutual empathy among them
            and with their peers worldwide through the universal language of
            art.
          </p>
          <div>
            <DonateButton />
          </div>
        </div>
        <div className="my-4">
          <picture>
            <img src={ICAFAboutImage} alt="children showing artwork" />
          </picture>
        </div>
      </article>
      {/*Section 2*/}
      <article className="my-10">
        <div>
          <h3 className="my-4 text-2xl font-semibold">Our Programs</h3>
          <div className="my-4 rounded-full border-4 border-secondary-blue"></div>
          <div className="font-sans">
            <h5 className="my-4 font-semibold">The Arts Olympiad</h5>
            <p className="my-4">
              Over the years it has grown into the world’s largest art program.
            </p>
          </div>
          <div className="font-sans">
            <h4 className="my-4 text-xl font-semibold">
              World Children's Festival
            </h4>
            <p>The “Olympics” of children’s imagination.</p>
            <p>
              As the world’s largest exhibitor of children’s art and organizer
              of youth panels at major conferences, we give voice to children
              like no other. ICAF has won several awards and is independently
              ranked as one of the 25 Top Children’s Charities in the United
              States.
            </p>
          </div>
        </div>
        <div className="my-4">
          <picture>
            <img src={ICAFAboutImage} alt="children creating art together" />
          </picture>
        </div>
      </article>
      {/*Section 2*/}
      <article className="my-10">
        <div>
          <h3 className="my-4 text-2xl font-semibold">Writings and Research</h3>
          <div className="my-4 rounded-full border-4 border-secondary-yellow"></div>
          <div className="font-sans">
            <p className="my-4">
              Our writings and research have appeared in leading journals and
              magazines such as Art&Activities, Dynamische Psychiatrie, The
              Lancet, SchoolArts, The State Education Standard, and The STEAM
              Journal.
            </p>
          </div>
        </div>
        <div className="my-4">
          <picture>
            <img src={ICAFAboutImage} alt="children creating art together" />
          </picture>
        </div>
      </article>
    </section>
  );
}
