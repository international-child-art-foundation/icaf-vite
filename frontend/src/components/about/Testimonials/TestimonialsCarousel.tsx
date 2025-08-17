import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { testimonials } from '@/lib/testimonials';
import { TestimonialCard } from './TestimonialsCard';
import { useState, useEffect } from 'react';

import CarouselArrowsDots from './CarouselArrowsDots';

export const TestimonialsCarousel = () => {
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

  const n = testimonials.length;

  return (
    <section className="bg-white py-6 md:py-20">
      <h2 className="mb-10 text-center font-sans text-3xl font-bold lg:text-[40px]">
        Testimonials
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
          {testimonials.map((testimonial, index) => {
            // Tracking the location of the visible indexes to assign the correct blob color in TestimonialCard
            const leftIndex = (selectedIndex - 1 + n) % n;
            const rightIndex = (selectedIndex + 1) % n;

            let blobColor: 'yellow' | 'blue' | 'red' | '' = '';

            if (index === selectedIndex) blobColor = 'blue';
            else if (index === leftIndex) blobColor = 'yellow';
            else if (index === rightIndex) blobColor = 'red';

            return (
              <CarouselItem
                key={testimonial.id}
                className="mx-0 basis-[75%] pl-4 sm:basis-1/2 md:basis-[45%] lg:basis-1/3"
              >
                <TestimonialCard
                  testimonial={testimonial}
                  active={selectedIndex === index}
                  blobColor={blobColor}
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="md:py-4">
          <CarouselArrowsDots
            items={testimonials}
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
