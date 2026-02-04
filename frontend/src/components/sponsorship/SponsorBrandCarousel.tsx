import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import type { EmblaPluginType } from 'embla-carousel';
import AutoplayLib from 'embla-carousel-autoplay';
import type { AutoplayOptionsType } from 'embla-carousel-autoplay';
import { sponsorCarouselImages } from '@/data/sponsorship/sponsorCarouselImages';

const Autoplay = (opts: AutoplayOptionsType): EmblaPluginType => {
  const factory = AutoplayLib as unknown as (
    o: AutoplayOptionsType,
  ) => EmblaPluginType;
  return factory(opts);
};

export const SponsorBrandCarousel = () => {
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
    <div className="max-w-screen-3xl overflow-hidden">
      <p className="font-montserrat text-center text-[40px] font-bold">
        Trusted by Leading Brands
      </p>
      <div className="mx-auto w-full py-8 lg:flex lg:items-start">
        <div className="w-full">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
              slidesToScroll: 1,
            }}
            plugins={[Autoplay(autoplayOptions)]}
            className="w-full"
          >
            <div className="overflow-hidden rounded-lg pr-0">
              <CarouselContent className="flex select-none justify-around">
                {sponsorCarouselImages.map((logo) => (
                  <CarouselItem key={logo.id} className="basis-1/8 my-auto">
                    <div className="w-full overflow-hidden rounded-md px-6">
                      <img src={logo.image} className="w-full object-cover" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </div>
          </Carousel>
        </div>
      </div>
    </div>
  );
};
