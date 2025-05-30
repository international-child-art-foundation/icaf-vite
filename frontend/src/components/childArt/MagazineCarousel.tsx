import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useState, useEffect } from 'react';

import cover1 from '@/assets/shared/images/navigation/programs/childArtMagazine.webp';
import cover2 from '@/assets/shared/images/navigation/programs/childArtMagazine_small.webp';
import cover3 from '@/assets/shared/images/navigation/programs/theArtOlympiad.webp';
import cover4 from '@/assets/shared/images/navigation/programs/worldChildrensFestival_small.webp';
import cover5 from '@/assets/shared/images/navigation/programs/peaceThroughArt_small.webp';
import { Button } from '../ui/button';

const covers = [
  cover1,
  cover2,
  cover3,
  cover4,
  cover5,
  cover1,
  cover2,
  cover3,
  cover4,
  cover5,
  cover1,
  cover2,
];

// const ITEMS_PER_PAGE = 3;
const TOTAL_PAGES = covers.length;

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
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-10 px-4 sm:px-6 md:flex-row md:items-start md:gap-12 lg:gap-16 xl:gap-20">
      {/* left - description */}
      <div className="order-2 mb-8 text-center md:order-1 md:mb-0 md:w-1/2 md:text-left lg:w-1/3">
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
          variant={'default'}
          size={'lg'}
        >
          Subscribe
        </Button>
      </div>
      {/* right - title + Carousel  */}
      <div className="order-1 w-full md:order-2 md:w-full lg:w-2/3">
        {/* title */}
        <h2 className="mb-4 text-center text-xl font-bold italic md:text-left lg:text-2xl xl:text-3xl">
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
          <CarouselContent className="-ml-4 flex">
            {covers.map((src, index) => (
              <CarouselItem key={index} className="basis-1/3 pl-4">
                <img
                  src={src}
                  alt={`Magazine ${index + 1}`}
                  className="h-64 w-full rounded object-cover shadow-md"
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="mt-5 flex w-full items-center justify-center gap-4">
            {/* left */}
            <div className="mt-7 flex items-center gap-5">
              <CarouselPrevious
                className="static h-10 w-10 rounded-full border border-[hsl(var(--primary))] text-[hsl(var(--primary))] transition hover:bg-[hsl(var(--primary-muted))]"
                aria-label="Previous"
                onClick={() => api?.scrollPrev()}
              />
              {/* right  */}
              <CarouselNext
                className="static h-10 w-10 rounded-full border border-[hsl(var(--primary))] text-[hsl(var(--primary))] transition hover:bg-[hsl(var(--primary-muted))]"
                aria-label="Next"
                onClick={() => api?.scrollNext()}
              />
            </div>

            {/* progress bar */}
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

            {/* page */}
            <span className="min-w-[3ch] text-right text-base font-bold text-[hsl(var(--primary))]">
              {String(page + 1).padStart(2, '0')}
            </span>
          </div>
        </Carousel>
      </div>
    </div>
  );
}
