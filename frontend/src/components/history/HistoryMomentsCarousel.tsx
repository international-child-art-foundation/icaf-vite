import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useState, useEffect } from 'react';
import CarouselArrowsDots from '../shared/CarouselArrowsDots';
import foundingImg from '@/assets/history/ICAFFounding.webp';
import MagazineCover from '@/assets/history/MagazineCover.webp';
import DCMayorImg from '@/assets/history/DCMayor.webp';
import { HistoryMomentCard } from './HistoryMomentCard';
import { TMomentsCarouselData } from '@/types/History';

export const HistoryMomentsCarousel = () => {
  const carouselImages: TMomentsCarouselData[] = [
    { src: foundingImg, title: 'The Founding of ICAF', id: 'icaffounding' },
    { src: MagazineCover, title: 'ChildArt Magazine Cover', id: 'magazine' },
    { src: DCMayorImg, title: 'DC Mayor', id: 'dcmayor' },
  ];

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
          {carouselImages.map((data, i) => {
            return (
              <CarouselItem
                key={data.id}
                className="basis-[70%] pl-4 md:basis-[50%]"
              >
                <HistoryMomentCard
                  cardData={data}
                  isActive={selectedIndex === i}
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="pt-4">
          <CarouselArrowsDots
            items={carouselImages}
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
