import {
  ContentCarouselData,
  IContentCarouselItem,
} from '@/types/ImpactPageTypes';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { useState, useEffect } from 'react';
import { type CarouselApi } from '@/components/ui/carousel';
import { CarouselItemDisplay } from './CarouselItemDisplay';
import { CarouselNav } from '../shared/CarouselNav';

interface ContentCarouselProps {
  carouselData: ContentCarouselData;
}

export const ContentCarousel = ({ carouselData }: ContentCarouselProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentItem, setCurrentItem] = useState(0);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    setCurrentItem(carouselApi.selectedScrollSnap());

    carouselApi.on('select', () => {
      setCurrentItem(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  const scrollToItem = (index: number) => {
    if (carouselApi) {
      carouselApi.scrollTo(index);
    }
  };

  return (
    <>
      <Carousel setApi={setCarouselApi} opts={{ loop: true }}>
        <CarouselContent>
          {carouselData.map((item) => {
            return (
              <CarouselItem
                className="basis-1/3 md:basis-1/2 lg:basis-1/2"
                key={item.title}
              >
                <CarouselItemDisplay item={item} scrollToItem={scrollToItem} />
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselNav<IContentCarouselItem>
          items={carouselData}
          activeIndex={currentItem}
          scrollToItem={scrollToItem}
          getKey={(item) => item.title}
        />
      </Carousel>

      {carouselData.map((item) => {
        return (
          <div key={item.title}>
            <div></div>
          </div>
        );
      })}
    </>
  );
};
