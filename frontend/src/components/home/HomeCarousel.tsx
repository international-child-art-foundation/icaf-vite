import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useState } from 'react';
import type { CarouselApi } from '@/components/ui/carousel';
import type { EmblaPluginType } from 'embla-carousel';
import AutoplayLib from 'embla-carousel-autoplay';
import type { AutoplayOptionsType } from 'embla-carousel-autoplay';
import { carouselImages } from '@/data/homeCarouselImages';

type AutoplayPlugin = {
  play: () => void;
  stop: () => void;
  reset: () => void;
};

const Autoplay = (opts: AutoplayOptionsType): EmblaPluginType => {
  const factory = AutoplayLib as unknown as (
    o: AutoplayOptionsType,
  ) => EmblaPluginType;
  return factory(opts);
};

export const HomeCarousel = () => {
  const [api, setApi] = useState<CarouselApi>();

  const getAutoplay = (): AutoplayPlugin | undefined => {
    const plugins = api?.plugins?.();
    return (plugins?.autoplay as AutoplayPlugin | undefined) ?? undefined;
  };

  const autoplayOptions: AutoplayOptionsType = {
    delay: 3000,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
    stopOnFocusIn: true,
    rootNode: (emblaRoot: HTMLElement): HTMLElement => {
      const parent = emblaRoot.parentElement;
      return parent ?? emblaRoot;
    },
  };

  return (
    <div className="mx-auto w-full py-8 lg:flex lg:items-start">
      <div className="w-full">
        <Carousel
          opts={{
            align: 'start',
            loop: true,
            slidesToScroll: 1,
          }}
          plugins={[Autoplay(autoplayOptions)]}
          setApi={setApi}
          className="w-full"
        >
          <div className="overflow-hidden rounded-lg pr-0 md:-mr-12 lg:-mr-16 xl:-mr-40">
            <CarouselContent className="-ml-4 flex">
              {carouselImages.map((cover) => (
                <CarouselItem
                  key={cover.id}
                  className="basis-full pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-[25%]"
                >
                  <div className="w-full overflow-hidden rounded-md shadow-md">
                    <img src={cover.image} className="w-full object-cover" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
          <div className="w-full"></div>
          <div className="mt-5 flex w-full items-center justify-center gap-4">
            <div className="mt-7 flex items-center gap-5">
              <CarouselPrevious
                className="static h-10 w-10 rounded-full border border-[hsl(var(--primary))] text-[hsl(var(--primary))] transition hover:bg-[hsl(var(--primary-muted))]"
                aria-label="Previous"
                onClick={() => {
                  getAutoplay()?.reset();
                  api?.scrollPrev();
                }}
              />
              <CarouselNext
                className="static h-10 w-10 rounded-full border border-[hsl(var(--primary))] text-[hsl(var(--primary))] transition hover:bg-[hsl(var(--primary-muted))]"
                aria-label="Next"
                onClick={() => {
                  getAutoplay()?.reset();
                  api?.scrollNext();
                }}
              />
            </div>
          </div>
        </Carousel>
      </div>
    </div>
  );
};
