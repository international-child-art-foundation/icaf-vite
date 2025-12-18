import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useState, useEffect } from 'react';
import { CarouselApi } from '@/components/ui/carousel';
import { getMagazines } from '@/server_asset_handlers/magazines';
import { Button } from '../ui/button';
import { IMagazine } from '@/types/Magazines';
import { ManageSubscriptionCallout } from './ManageSubscriptionCallout';

export default function MagazineCarousel() {
  const [magazines, setMagazines] = useState<IMagazine[]>([]);

  useEffect(() => {
    getMagazines().then(setMagazines).catch(console.error);
  }, []);
  const TOTAL_PAGES = magazines.length;

  const [page, setPage] = useState(0);
  const progressPercent = ((page + 1) / TOTAL_PAGES) * 100;

  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      const index = api.selectedScrollSnap(); // current page
      setPage(index);
    };

    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-8 pb-16 pt-0 md:px-12 md:pt-0 lg:flex lg:items-start lg:px-16 lg:pt-0 xl:px-20">
      {/* left - description */}
      <div className="flex w-full flex-col gap-4 pb-16 lg:w-1/3 lg:pb-0">
        <h2 className="text-2xl font-bold">Latest Issues</h2>
        <p className="font-semibold text-blue-700">
          Subscription is $30 per year
        </p>
        <p className="text-base leading-relaxed text-gray-700">
          Please pay online to start receiving emails each quarter with a link
          to the magazine. To order a specific magazine, pay $10 and email us
          the title of the ChildArt issue you ordered, so we can email it to
          you.
        </p>
        <Button
          className="mx-auto rounded-full px-14 py-3 text-lg"
          variant="default"
          size="lg"
        >
          <a
            href={'https://buy.stripe.com/00w14p9UQ7bPd8a6TQabK02'}
            target="_blank"
            rel="noopener noreferrer"
          >
            Subscribe
          </a>
        </Button>
        <div className="h-[2px] bg-gray-600 shadow-md"></div>
        <ManageSubscriptionCallout />
      </div>
      {/* right - Carousel */}
      <div className="w-full lg:w-2/3 lg:pl-16">
        <h2 className="mb-4 text-xl font-bold italic md:text-left lg:text-2xl xl:text-3xl">
          <span className="font-semibold italic">ChildArt</span> Magazine Art
        </h2>
        <Carousel
          opts={{
            align: 'start',
            loop: true,
            slidesToScroll: 1,
          }}
          setApi={setApi}
          className="w-full"
        >
          <div className="-mr-8 pr-0 md:-mr-12 lg:-mr-16 xl:-mr-20">
            <CarouselContent className="-ml-4 flex">
              {magazines.map((magazine) => (
                <CarouselItem
                  key={magazine.name}
                  className="basis-[42%] pl-4 md:basis-1/4 lg:basis-[55%] xl:basis-[40%]"
                >
                  <img
                    src={magazine.cover}
                    alt={magazine.name}
                    className="aspect-[3/4] w-full rounded object-cover shadow-md"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
          {/* Buttons & progress bar */}
          <div className="mt-5 flex w-full items-center justify-center gap-4">
            <div className="mt-7 flex items-center gap-5">
              <CarouselPrevious
                className="static h-10 w-10 rounded-full border border-[hsl(var(--primary))] text-[hsl(var(--primary))] transition hover:bg-[hsl(var(--primary-muted))]"
                aria-label="Previous"
                onClick={() => api?.scrollPrev()}
              />
              <CarouselNext
                className="static h-10 w-10 rounded-full border border-[hsl(var(--primary))] text-[hsl(var(--primary))] transition hover:bg-[hsl(var(--primary-muted))]"
                aria-label="Next"
                onClick={() => api?.scrollNext()}
              />
            </div>

            <div
              className="relative h-1 max-w-md flex-1 overflow-hidden rounded bg-[hsl(var(--gray-100))]"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progress"
            >
              <div
                className="absolute left-0 top-0 h-full bg-[hsl(var(--primary))] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <span className="min-w-[3ch] text-right text-base font-bold text-[hsl(var(--primary))]">
              {String(page + 1).padStart(2, '0')}
            </span>
          </div>
        </Carousel>
      </div>
    </div>
  );
}
