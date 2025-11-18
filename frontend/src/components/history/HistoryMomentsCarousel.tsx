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
    {
      src: foundingImg,
      title: 'The Founding of ICAF',
      description:
        "ICAF was founded in 1997 to promote children's creativity worldwide.",
      id: 'icaffounding',
    },
    {
      src: MagazineCover,
      title: 'The Power of Words',
      description: (
        <div>
          In 2023, ICAF published{' '}
          <span className="italic">The Power of Words</span> — an issue of
          ChildArt magazine focused on how words change lives.
        </div>
      ),
      id: 'magazine',
    },
    {
      src: DCMayorImg,
      title: "Children's Peace Day",
      description: `September 11 was designated as "Children's Peace Day" by the Mayor of Washington, D.C. in 2003.`,
      id: 'dcmayor',
    },
  ];

  const [selectedIndex, setSelectedIndex] = useState(1);
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
    <section className="relative bg-white py-6">
      <Carousel
        setApi={setApi}
        opts={{
          align: 'center',
          loop: true,
        }}
        className="mx-auto"
      >
        <CarouselContent className="" allowOverflow={true}>
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
