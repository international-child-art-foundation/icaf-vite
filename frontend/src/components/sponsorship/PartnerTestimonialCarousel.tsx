import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useState, useEffect } from 'react';
import CarouselArrowsDots from '../shared/CarouselArrowsDots';
import { partnerTestimonialData } from '@/data/sponsorship/partnerTestimonials';
import { PartnerTestimonialCard } from './PartnerTestimonialCard';
import { useWindowSize } from 'usehooks-ts';

export const PartnerTestimonialCarousel = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const size = useWindowSize();

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
    <section className="relative max-w-screen-2xl bg-white">
      <h2 className="mb-10 text-center font-sans text-3xl font-bold lg:text-[40px]">
        What Partners Say
      </h2>

      <Carousel
        setApi={setApi}
        opts={{
          align: 'center',
          loop: true,
        }}
        className="mx-auto"
      >
        <CarouselContent className="">
          {partnerTestimonialData.map((data) => {
            return (
              <CarouselItem key={data.id} className="">
                <PartnerTestimonialCard
                  data={data}
                  windowWidth={size.width}
                  windowHeight={size.height}
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="md:py-4">
          <CarouselArrowsDots
            items={partnerTestimonialData}
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
