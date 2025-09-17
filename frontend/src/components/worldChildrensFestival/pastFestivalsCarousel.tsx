import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useState, useEffect } from 'react';
import CarouselArrowsDots from '@/components/about/Testimonials/CarouselArrowsDots';
import { pastFestivalsData } from '@/lib/pastFestivals';
import PastFestivalsCarouselCard from './pastFestivalCarouselCard';

export default function PastFestivalsCarousel() {
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
    <section className="pt-16">
      <div>
        <h2 className="my-8 text-center text-3xl font-extrabold lg:mb-16 lg:text-[40px]">
          Past Festivals
        </h2>
      </div>

      <Carousel
        setApi={setApi}
        opts={{
          align: 'center',
          loop: true,
        }}
      >
        <CarouselContent className="">
          {pastFestivalsData.map((item) => {
            return (
              <CarouselItem key={item.id}>
                <PastFestivalsCarouselCard item={item} />
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="md:py-4">
          <CarouselArrowsDots
            items={pastFestivalsData}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSelect={handleSelect}
            currentIndex={selectedIndex || 0}
          />
        </div>
      </Carousel>
    </section>
  );
}
