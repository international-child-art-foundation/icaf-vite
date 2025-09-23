import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useState, useEffect } from 'react';
import CarouselArrowsDots from '../shared/CarouselArrowsDots';
import { brandCampaignCardData } from '@/data/sponsorship/brandCampaignCardData';
import { BrandCampaignCard } from './BrandCampaignCard';

export const BrandImpactCarousel = () => {
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
          {brandCampaignCardData.map((data, i) => {
            return (
              <CarouselItem
                key={data.id}
                className="basis-[70%] pl-4 md:basis-[43%]"
              >
                <BrandCampaignCard data={data} isActive={selectedIndex === i} />
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="pt-4">
          <CarouselArrowsDots
            items={brandCampaignCardData}
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
