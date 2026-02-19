import waveUrl from '@/assets/shared/images/about/Group 515076.svg';
import www1 from '@/assets/shared/images/about/rectangleHeart.webp';
import www2 from '@/assets/shared/images/about/rectangleGlobe.webp';
import www1Large from '@/assets/shared/images/about/rectangleHeartLarge.webp';
import www2Large from '@/assets/shared/images/about/rectangleGlobeLarge.webp';
import { AboutGraphic2 } from '@/assets/shared/images/about/AboutGraphic2';

export default function WhatWeWant() {
  const cards = [
    {
      mobileSrc: www1,
      desktopSrc: www1Large,
      titleTop: 'A Better World',
      titleBottom: 'Brighter Future',
      alt: 'Heart Shaped Globe',
    },
    {
      mobileSrc: www2,
      desktopSrc: www2Large,
      titleTop: 'Creativity',
      titleBottom: 'Art',
      alt: 'Children Holding Hands Around Globe',
    },
  ];
  return (
    <section className="overflow-visible">
      <div className="relative">
        <img
          src={waveUrl}
          alt=""
          className="h-[775px] w-full object-cover sm:h-[805px] md:h-[830px] lg:h-[900px] 2xl:h-[950px]"
        />

        <div className="absolute inset-0 z-10 flex h-full flex-col justify-center text-center">
          <div>
            <h2 className="font-montserrat text-[40px] font-extrabold md:mb-16">
              What We Want
            </h2>
          </div>
          <div className="absolute right-0 top-0 z-[-10] translate-x-[20%] translate-y-[-20%] transform sm:translate-x-[30%] md:translate-y-[80%] lg:translate-x-[-10%] lg:translate-y-[50%]">
            <AboutGraphic2 className="h-56 w-56 lg:h-72 lg:w-72" />
          </div>
          <div className="absolute left-0 top-0 z-[-10] translate-x-[-80%] translate-y-[40%] transform sm:translate-x-[-40%] md:translate-y-[80%] lg:translate-x-[10%] lg:translate-y-[50%] xl:translate-x-[10%] xl:translate-y-[20%]">
            <AboutGraphic2 className="h-56 w-56 lg:h-72 lg:w-72" />
          </div>
          <div className="flex flex-col overflow-visible md:flex-row md:justify-center md:gap-8 lg:gap-20 lg:px-32 2xl:gap-32">
            {cards.map((card) => (
              <div
                key={card.titleTop}
                className="relative flex items-center justify-center"
              >
                <picture>
                  <source srcSet={card.desktopSrc} media="(min-width: 768px)" />
                  <img
                    src={card.mobileSrc}
                    alt={card.alt}
                    loading="lazy"
                    className="object-cover"
                  />
                </picture>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-lg font-semibold text-white">
                  <span>{card.titleTop}</span>
                  <span>&</span>
                  <span>{card.titleBottom}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
