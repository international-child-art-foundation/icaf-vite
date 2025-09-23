import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useState, useEffect } from 'react';
import CarouselArrowsDots from '../shared/CarouselArrowsDots';
import { experimentalBrandingCarouselData } from '@/data/sponsorship/experimentalBranding';
import { ExperimentalBrandingCard } from './ExperimentalBrandingCard';

export const ExperimentalBrandingCarousel = () => {
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
    <section className="relative bg-white py-6 md:pt-20">
      <Carousel
        setApi={setApi}
        opts={{
          align: 'center',
          loop: true,
        }}
        className="mx-auto"
      >
        <CarouselContent className="">
          {experimentalBrandingCarouselData.map((data) => {
            return (
              <CarouselItem key={data.id} className="pl-4">
                <ExperimentalBrandingCard data={data} />
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="pt-4">
          <CarouselArrowsDots
            items={experimentalBrandingCarouselData}
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
