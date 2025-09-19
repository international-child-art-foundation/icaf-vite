import ourLegacyImage from '@/assets/worldChildrensFestival/ourLegacy.webp';
import { CircleArrowRight } from 'lucide-react';
import OurLegacyDecorative from './ourLegacyDecorative';

/**
 *
 *Contains largely decorative elements (e.g., the Congress image, fireworks, stripe, and banner) and all that is placed into OurLegacyDecorative.
 *After that is the content, image, and link
 */
export default function OurLegacy() {
  return (
    <section>
      {/* Decoratitive elements */}
      <OurLegacyDecorative />

      {/* Content Section */}
      <div className="relative z-40 px-6 pt-16 md:px-12 lg:px-16 lg:pt-36 xl:px-20">
        {/* Heading */}
        <h2 className="my-8 text-center text-3xl font-extrabold lg:mb-16 lg:text-[40px]">
          Our Legacy
        </h2>

        {/* Content Grid */}
        <div className="grid max-h-[750px] lg:grid-cols-2">
          <img
            src={ourLegacyImage}
            loading="lazy"
            alt="Festival scene"
            className="max-h-[330px] w-full rounded-t-2xl object-cover shadow-md lg:order-2 lg:h-full lg:max-h-[540px] lg:rounded-tl-none lg:rounded-tr-2xl xl:max-h-[470px]"
          />
          <div className="rounded-b-2xl bg-[#FCEED5] shadow-md md:flex md:h-[330px] md:flex-col md:items-start md:justify-center lg:order-1 lg:h-[540px] lg:rounded-b-none lg:rounded-l-2xl xl:h-[470px]">
            <div className="p-6 lg:p-12">
              <h3 className="font-montserrat text-2xl font-extrabold">
                World Children’s Festival 2025
              </h3>
              <p className="mt-4 text-xl font-normal">
                Since its inception, the World Children’s Festival has brought
                together young artists, educators, and thought leaders from
                around the world to celebrate creativity and promote
                cross-cultural understanding.
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
    </section>
  );
}
