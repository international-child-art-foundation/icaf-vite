import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { testimonials } from '@/data/about/testimonials';
import { TestimonialCard } from './TestimonialsCard';
import { useState, useEffect } from 'react';
import CarouselArrowsDots from '../../shared/CarouselArrowsDots';
import { YellowBlob } from '@/assets/shared/images/about/YellowBlob';
import { BlueBlob } from '@/assets/shared/images/about/BlueBlob';
import { RedBlob } from '@/assets/shared/images/about/RedBlob';

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
    <section className="relative select-none bg-white py-6 md:py-20">
      <h2 className="mb-10 text-center font-sans text-3xl font-bold lg:text-[40px]">
        Testimonials
      </h2>
      {/* Color blobs behind the card  */}
      <YellowBlob className="top-22 absolute hidden sm:left-[-15rem] sm:top-20 sm:block sm:rotate-180 sm:scale-110 md:left-[-12rem] md:top-36 md:scale-105 lg:left-[-1rem] lg:top-40 lg:rotate-0 lg:scale-x-[85%] xl:left-8 xl:scale-100 2xl:left-20 2xl:top-52 2xl:scale-125" />
      <BlueBlob className="top-22 absolute left-1/2 -translate-x-1/2 scale-x-[85%] xl:scale-100 2xl:top-52 2xl:scale-125" />
      <RedBlob className="top-22 absolute hidden sm:right-[-15rem] sm:top-20 sm:block sm:rotate-180 sm:scale-110 md:right-[-12rem] md:top-36 md:scale-105 lg:right-[-1rem] lg:top-40 lg:rotate-0 lg:scale-x-[85%] xl:right-8 xl:scale-100 2xl:right-20 2xl:top-52 2xl:scale-125" />

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
                className="basis-[75%] pl-4 sm:basis-1/2 md:basis-[45%] lg:basis-[31%]"
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
