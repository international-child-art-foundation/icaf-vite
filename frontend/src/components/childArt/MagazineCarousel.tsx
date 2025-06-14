import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useState, useEffect } from 'react';

import { magazineCovers } from '@/data/magazineCovers';

import { Button } from '../ui/button';

const TOTAL_PAGES = magazineCovers.length;

export default function MagazineCarousel() {
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

  // const handleSlideChange = (newPage: number) => {
  //   setPage(newPage);
  // };

  return (
    // <div className="lg:gap- w-full py-16 pl-8 pr-0 lg:flex lg:items-start">
    <div className="mx-auto w-full max-w-screen-2xl px-8 pb-12 pb-16 pt-0 md:px-12 md:pt-0 lg:flex lg:items-start lg:px-16 lg:pt-0 xl:px-20">
      {/* left - description */}
      <div className="w-full pb-16 lg:w-1/3 lg:pb-0">
        {/* <div className="mx-auto max-w-screen-2xl px-8 md:px-12 lg:px-16 xl:px-20"> */}
        <h2 className="mb-4 text-2xl font-bold">Latest Issues</h2>
        <p className="mb-2 font-semibold text-blue-700">
          Subscription is $30 per year
        </p>
        <p className="mb-6 text-sm leading-relaxed text-gray-700">
          Please pay online to start receiving emails each quarter with a link
          to the magazine. To order, pay $10 and email us the title of the
          ChildArt issue you ordered, so we can email it to you. All 15 issues,
          you can order for $110—a saving of $40.00!
        </p>
        <Button
          className="rounded-full px-6 py-3 font-medium"
          variant="default"
          size="lg"
        >
          Subscribe
        </Button>
      </div>
      {/* </div> */}
      {/* right - Carousel */}
      <div className="w-full lg:w-2/3 lg:pl-16">
        <h2 className="mb-4 text-xl font-bold italic md:text-left lg:text-2xl xl:text-3xl">
          <span className="font-semibold italic">ChildArt</span> Magazine Art
        </h2>
        {/* <div className="-mx-8 md:-mx-12 lg:-mx-16 xl:-mx-20"> */}
        <div className="-mr-8 pr-0 md:-mr-12 lg:-mr-16 xl:-mr-20">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
              slidesToScroll: 1,
            }}
            setApi={setApi}
            className="w-full"
          >
            <CarouselContent className="-ml-4 flex">
              {magazineCovers.map((cover) => (
                <CarouselItem
                  key={cover.name}
                  className="basis-[42%] pl-4 md:basis-1/4 lg:basis-[40%]"
                >
                  <img
                    src={cover.image}
                    alt={cover.name}
                    className="aspect-[3/4] w-full rounded object-cover shadow-md"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
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
    </div>
    // </div>
  );
}
