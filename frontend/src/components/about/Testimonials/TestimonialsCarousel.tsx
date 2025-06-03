import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { testimonials } from '@/lib/testimonials';
import { TestimonialCard } from './TestimonialsCard';
import { useState, useEffect } from 'react';

import { cn } from '@/lib/utils';
import CarouselArrowsDots from './CarouselArrowsDots';

export const TestimonialsCarousel = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      const inView = api.slidesInView();
      const center = inView[Math.floor(inView.length / 2)];
      setSelectedIndex(center);
    };

    onSelect();
    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
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
          slidesToScroll: 1,
          duration: 40,
        }}
        className="mx-auto"
      >
        <CarouselContent className="">
          {testimonials.map((testimonial, index) => {
            const slidesInView = api?.slidesInView() ?? [];
            const middleInView =
              slidesInView[Math.floor(slidesInView.length / 2)];
            const isActive = index === middleInView;
            console.log('test', middleInView, 'active', isActive);

            return (
              <CarouselItem
                key={testimonial.id}
                className={cn(
                  'basis-[75%] px-4 pl-8 transition-transform duration-300 sm:basis-[50%] lg:basis-1/3',
                  index === selectedIndex ? 'scale-110' : 'scale-100',
                )}
              >
                <TestimonialCard testimonial={testimonial} />
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
