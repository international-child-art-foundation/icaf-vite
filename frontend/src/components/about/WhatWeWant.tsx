import waveUrl from '@/assets/shared/images/about/Group 515076.svg';
import www1 from '@/assets/shared/images/about/rectangleHeart.webp';
import www2 from '@/assets/shared/images/about/rectangleGlobe.webp';
import { AboutGraphic2 } from '@/assets/shared/images/about/AboutGraphic2';

export default function WhatWeWant() {
  const cards = [
    {
      src: www1,
      titleTop: 'A Better World',
      titleBottom: 'Brighter Future',
    },
    { src: www2, titleTop: 'Creativity', titleBottom: 'Art' },
  ];
  return (
    <section className="mt-28 overflow-visible lg:mt-32">
      <div className="relative -mx-6 w-[calc(100%+3rem)] lg:-mx-10 lg:w-[calc(100%+5rem)] xl:-mx-20 xl:w-[calc(100%+10rem)]">
        <img
          src={waveUrl}
          alt=""
          className="h-[775px] w-full object-cover sm:h-[805px] md:h-[830px] lg:h-[900px] 2xl:h-[950px]"
        />

        <div className="absolute inset-0 z-10 flex h-full flex-col justify-center text-center">
          <div>
            <h2 className="font-montserrat text-[40px] font-extrabold sm:mb-8">
              What We Want
            </h2>
          </div>
          <div className="absolute right-0 top-0 z-[-10] translate-x-[20%] translate-y-[-20%] transform sm:translate-x-[30%] sm:translate-y-[80%] lg:translate-x-[-10%] lg:translate-y-[50%]">
            <AboutGraphic2 className="h-56 w-56 lg:h-72 lg:w-72" />
          </div>
          <div className="absolute left-0 top-0 z-[-10] translate-x-[-80%] translate-y-[40%] transform sm:translate-x-[-40%] sm:translate-y-[80%] lg:translate-x-[10%] lg:translate-y-[50%] xl:translate-x-[10%] xl:translate-y-[20%]">
            <AboutGraphic2 className="h-56 w-56 lg:h-72 lg:w-72" />
          </div>
          <div className="flex flex-col overflow-visible sm:flex-row sm:gap-8 md:gap-12 lg:px-32 xl:gap-20 xl:px-48 2xl:gap-24 2xl:px-56">
            {cards.map(({ src, titleTop, titleBottom }) => (
              <div key={titleTop} className="relative">
                <picture className="flex items-center justify-center">
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="sm:h-[382px] md:h-[430px] xl:h-[450px] 2xl:h-[520px]"
                  />
                </picture>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-lg font-semibold text-white">
                  <span>{titleTop}</span>
                  <span>&</span>
                  <span>{titleBottom}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
