import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useState, useEffect } from 'react';
import { moreOnOurSiteData } from '@/data/about/moreOnOurSite';

import CarouselArrowsDots from '@/components/about/testimonials/CarouselArrowsDots';
import { MoreCard } from './MoreCard';
import Graphic from '@/assets/shared/images/about/more/Group 514888.svg';

/**
 * This component is built on top of Shadcn's carousel with custom CarouselArrowsDots navigation
 * Each slide renders a <MoreCard /> with title, description, and image
 * Renders from the `moreOnOurSiteData` array located in lib folder
 */

export const MoreCarousel = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) {
      return;
    }

    setSelectedIndex(api.selectedScrollSnap());

    api.on('select', () => {
      setSelectedIndex(api.selectedScrollSnap());
    });
  }, [api]);

  const handlePrevious = () => api?.scrollPrev();
  const handleNext = () => api?.scrollNext();
  const handleSelect = (index: number) => api?.scrollTo(index);

  return (
    <section className="relative h-full overflow-visible bg-white py-6 md:py-20">
      {/*Decoration */}
      <div className="pointer-events-none absolute bottom-0 left-[40%] w-[150%] -translate-x-1/2 sm:bottom-[-10%] sm:left-[50%] md:bottom-0 2xl:bottom-[-12%]">
        <img
          src={Graphic}
          className="pointer-events-none h-auto w-full object-cover"
        />
      </div>

      <h2 className="mb-10 text-center font-sans text-3xl font-bold lg:text-[40px]">
        More On Our Site
      </h2>

      <Carousel
        setApi={setApi}
        opts={{
          align: 'center',
          loop: true,
        }}
      >
        <CarouselContent className="">
          {moreOnOurSiteData.map((item) => {
            return (
              <CarouselItem key={item.id}>
                <MoreCard item={item} />
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="md:py-4">
          <CarouselArrowsDots
            items={moreOnOurSiteData}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSelect={handleSelect}
            currentIndex={selectedIndex || 0}
          />
        </div>
      </Carousel>
    </section>
  );
};
