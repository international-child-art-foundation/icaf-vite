import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useState, useEffect } from 'react';
import CarouselArrowsDots from '../shared/CarouselArrowsDots';
import { YoungArtistArtworks } from '@/data/peaceThroughArt/PeaceThroughArtData';

import colorfulBannerBackground from '@/assets/peaceThroughArt/colorfulBannerBackground.svg';

export const YoungArtistCarousel = () => {
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
    <div className="grid grid-cols-1 grid-rows-1">
      <div className="col-start-1 row-start-1 overflow-hidden">
        <img
          src={colorfulBannerBackground}
          className="min-h-[900px] min-w-full object-cover"
        />
      </div>
      <div className="col-start-1 row-start-1 flex flex-col justify-center gap-4">
        <p className="font-montserrat text-center text-[40px] font-extrabold leading-[48px]">
          Inspiring Young Artists
        </p>
        <p className="text-center">Their art speaks louder than words.</p>
        <Carousel
          setApi={setApi}
          opts={{
            align: 'center',
            loop: true,
          }}
          className="mx-auto"
        >
          <CarouselContent className="gap-2">
            {YoungArtistArtworks.map((artwork) => {
              return (
                <CarouselItem key={artwork.label} className="basis-[48%]">
                  <div className="relative h-full w-full overflow-hidden">
                    <img
                      src={artwork.imgSrc}
                      className="max-h-full max-w-full rounded-[20px] object-cover shadow-sm"
                    />
                    <p className="font-bold">{artwork.label}</p>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <div className="md:py-4">
            <CarouselArrowsDots
              items={YoungArtistArtworks}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSelect={handleSelect}
              currentIndex={selectedIndex || 0}
            />
          </div>
        </Carousel>
      </div>
    </div>
  );
};
