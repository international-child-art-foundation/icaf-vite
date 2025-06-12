import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useState, useEffect } from 'react';
import { moreOnOurSiteData } from '@/lib/moreOnOurSite';

import CarouselArrowsDots from '../testimonials/CarouselArrowsDots';
import { MoreCard } from './MoreCard';

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
    <section className="bg-white py-6 md:py-20">
      <h2 className="mb-10 text-center font-sans text-3xl font-bold">
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
