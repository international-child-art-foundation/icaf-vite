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
    if (!api) return;

    setSelectedIndex(api.selectedScrollSnap());
    api.on('select', () => setSelectedIndex(api.selectedScrollSnap()));
  }, [api]);

  const handlePrevious = () => api?.scrollPrev();
  const handleNext = () => api?.scrollNext();
  const handleSelect = (index: number) => api?.scrollTo(index);

  return (
    <div className="z-0 grid grid-cols-1 grid-rows-1">
      <div className="z-0 col-start-1 row-start-1 -mt-16 pt-16">
        <img
          src={colorfulBannerBackground}
          className="z-0 h-[110%] min-h-[650px] w-full object-cover sm:scale-[110%] xl:h-full xl:scale-100 xl:scale-y-[95%]"
          alt=""
        />
      </div>

      <div className="z-10 col-start-1 row-start-1 flex flex-col justify-center gap-4 px-4 py-8 md:mt-12 xl:mt-0">
        <p className="font-montserrat text-center text-[40px] font-extrabold leading-[48px]">
          Inspiring Young Artists
        </p>
        <p className="text-center">Their art speaks louder than words.</p>

        <Carousel
          setApi={setApi}
          opts={{
            align: 'center',
            loop: true,
            containScroll: 'trimSnaps',
          }}
          className={[
            'mx-auto w-full',
            '[--peek:clamp(8px,7vw,160px)]',
            '[&>div]:px-[var(--peek)]',
            '[&>div>div]:-mx-[var(--peek)]',
          ].join(' ')}
        >
          <CarouselContent className="gap-2">
            {YoungArtistArtworks.map((artwork) => (
              <CarouselItem
                key={artwork.label}
                className={[
                  'shrink-0 grow-0 basis-auto',
                  'w-[clamp(260px,48vw,720px)]',
                ].join(' ')}
              >
                <div className="relative h-full w-full overflow-hidden">
                  <img
                    src={artwork.imgSrc}
                    alt={artwork.label}
                    className="h-[200px] w-full rounded-[20px] object-cover shadow-sm sm:h-[300px] md:h-[420px] lg:h-[480px]"
                  />
                  <p className="mt-2 text-center font-bold">{artwork.label}</p>
                </div>
              </CarouselItem>
            ))}
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
