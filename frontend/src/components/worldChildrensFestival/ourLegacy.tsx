import { WhiteBanner } from '@/assets/worldChildrensFestival/whiteBanner';
import congress from '@/assets/worldChildrensFestival/congress.png';
import { AboutGraphic1 } from '@/assets/shared/images/about/AboutGraphic1';
import YellowConfetti from '@/assets/worldChildrensFestival/yellowConfetti.svg';
import ourLegacyImage from '@/assets/worldChildrensFestival/ourLegacy.jpg';
import { CircleArrowRight } from 'lucide-react';
import { WhiteBannerMobile } from '@/assets/worldChildrensFestival/whiteBannerMobile';
import { BlueBannerMobile } from '@/assets/worldChildrensFestival/blueBannerMobile';
import { BlueBanner } from '@/assets/worldChildrensFestival/blueBanner';
import Graphic from '@/assets/shared/images/about/more/Group 514888.svg';
import { AboutGraphic2 } from '@/assets/shared/images/about/AboutGraphic2';

export default function OurLegacy() {
  return (
    <section>
      {/* Decorative Banner */}
      <div>
        <div className="md:mt-76 relative z-0 mb-32 mt-44 w-full sm:mt-72">
          {/*3 Line Swoop Decoration */}
          <div className="absolute bottom-0 left-0 z-30 hidden w-full overflow-hidden md:-bottom-24 md:block lg:-bottom-40 xl:-bottom-64 2xl:-bottom-72">
            <div className="pointer-events-none relative left-1/2 w-[150%] -translate-x-1/2 sm:bottom-[-10%] sm:left-1/2 md:bottom-0 2xl:bottom-[-12%]">
              <img
                src={Graphic}
                className="pointer-events-none h-auto w-full object-cover"
              />
            </div>
          </div>

          {/*Mobile and Desktop Background Single Swoop*/}
          <WhiteBannerMobile className="absolute left-0 top-4 z-20 h-[900px] w-full md:h-[1000px] lg:hidden" />
          <BlueBannerMobile className="absolute z-10 h-[900px] w-full md:h-[1000px] lg:hidden" />

          <BlueBanner className="absolute left-0 top-0 z-10 hidden h-[700px] w-full lg:block lg:h-[800px] xl:h-[850px] 2xl:h-[900px]" />
          <WhiteBanner className="absolute left-0 top-4 z-20 hidden h-[700px] w-full lg:block lg:h-[800px] xl:h-[850px] 2xl:h-[900px]" />

          {/*Capitol Building Image*/}
          <img
            src={congress}
            alt="Capitol building"
            className="2xl:[700px] xl:tranlate-y-[75%] absolute top-0 z-[-10] w-[270px] translate-y-[-80%] sm:w-[350px] sm:translate-y-[-76%] md:translate-y-[-85%] lg:w-[470px] lg:translate-y-[-70%] xl:w-[600px]"
          />

          {/* Confetti Decorations */}
          <div className="absolute -top-48 translate-x-[160%] sm:translate-x-[220%] md:translate-x-[250%] lg:-top-56 lg:translate-x-[250%] xl:translate-x-[290%] 2xl:-top-64">
            <AboutGraphic1
              fill="#0050FA"
              className="h-32 w-32 lg:h-48 lg:w-48 xl:h-52 xl:w-52 2xl:h-64 2xl:w-64"
            />
          </div>

          <div className="absolute -top-72 hidden translate-x-[160%] sm:block sm:translate-x-[220%] md:translate-x-[250%] lg:-top-96 lg:translate-x-[280%] 2xl:-top-[450px]">
            <img
              src={YellowConfetti}
              className="h-48 w-48 lg:h-64 lg:w-64 xl:h-80 xl:w-80 2xl:h-96 2xl:w-96"
            />
          </div>
          {/*Bottom Confetti Decoration */}
          <div className="absolute -bottom-48 right-0 z-50 md:-bottom-72 md:right-10 xl:-bottom-96 xl:right-16">
            <AboutGraphic2 className="h-32 w-32 sm:h-44 sm:w-44 xl:h-60 xl:w-60" />
          </div>

          {/* Content Section */}
          <div className="relative z-40 mx-auto px-4 pt-16 lg:pt-28">
            {/* Heading */}
            <h2 className="my-8 text-center text-3xl font-extrabold lg:mb-16 lg:text-[40px]">
              Our Legacy
            </h2>

            {/* Content Grid */}
            <div className="mx-4 grid max-h-[750px] lg:grid-cols-2">
              <img
                src={ourLegacyImage}
                alt="Festival scene"
                className="max-h-[330px] w-full rounded-t-2xl object-cover shadow-md lg:order-2 lg:h-full lg:rounded-tl-none lg:rounded-tr-2xl"
              />
              <div className="rounded-b-2xl bg-[#FCEED5] shadow-md md:h-[330px] lg:order-1 lg:rounded-b-none lg:rounded-l-2xl">
                <div className="p-6">
                  <h3 className="font-montserrat text-2xl font-extrabold">
                    World Children’s Festival 2025
                  </h3>
                  <p className="mt-4 text-xl font-normal">
                    Since its inception, the World Children’s Festival has
                    brought together young artists, educators, and thought
                    leaders from around the world to celebrate creativity and
                    promote cross-cultural understanding.
                  </p>
                  <a
                    href="https://worldchildrensfestival.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 flex flex-row gap-4 text-xl"
                  >
                    Go to Website
                    <CircleArrowRight className="-rotate-45" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
