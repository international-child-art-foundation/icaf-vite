import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useState, useEffect, useRef } from 'react';
import CarouselArrowsDots from '@/components/about/testimonials/CarouselArrowsDots';
import { pastFestivalsData } from '@/data/wcf/pastFestivals';
import PastFestivalsCarouselCard from './pastFestivalCarouselCard';
import type { VideoHandle } from '../shared/VideoWrapper';

export default function PastFestivalsCarousel() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const videoRefs = useRef<Array<VideoHandle | null>>([]);

  if (videoRefs.current.length !== pastFestivalsData.length) {
    videoRefs.current = new Array(pastFestivalsData.length).fill(
      null,
    ) as (VideoHandle | null)[];
  }

  useEffect(() => {
    if (!api) return;

    const updateSelected = () => setSelectedIndex(api.selectedScrollSnap());

    const pauseNonVisible = () => {
      const visible = new Set(api.slidesInView());
      videoRefs.current.forEach((handle, idx) => {
        if (!visible.has(idx)) handle?.pause();
      });
    };

    updateSelected();
    pauseNonVisible();

    const onSelect = () => {
      updateSelected();
      pauseNonVisible();
    };
    const onSettle = () => {
      pauseNonVisible();
    };

    api.on('select', onSelect);
    api.on('settle', onSettle);

    return () => {
      api.off('select', onSelect);
      api.off('settle', onSettle);
    };
  }, [api]);

  const handlePrevious = () => api?.scrollPrev();
  const handleNext = () => api?.scrollNext();
  const handleSelect = (index: number) => api?.scrollTo(index);

  return (
    <section className="pt-40 md:pt-60 xl:pt-80">
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
        <CarouselContent>
          {pastFestivalsData.map((item, index) => (
            <CarouselItem key={item.id}>
              <PastFestivalsCarouselCard
                item={item}
                videoRef={(handle) => {
                  videoRefs.current[index] = handle;
                }}
              />
            </CarouselItem>
          ))}
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
