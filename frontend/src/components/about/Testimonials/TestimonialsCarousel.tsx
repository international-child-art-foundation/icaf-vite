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

  return (
    <section className="bg-white py-6 md:py-20 lg:px-10">
      <h2 className="mb-10 text-center font-sans text-3xl font-bold">
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
            return (
              <CarouselItem
                key={testimonial.id}
                className="mx-0 px-0 sm:basis-1/2 lg:basis-1/3"
              >
                <TestimonialCard
                  testimonial={testimonial}
                  active={selectedIndex === index}
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
