import { ArrowRight } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';

interface ICarouselNav<T> {
  items: T[];
  activeIndex: number;
  scrollToItem: (index: number) => void;
  getKey: (item: T) => React.Key;
}

export function CarouselNav<T>({
  items,
  activeIndex,
  scrollToItem,
  getKey,
}: ICarouselNav<T>) {
  const handlePrev = () =>
    scrollToItem((activeIndex - 1 + items.length) % items.length);
  const handleNext = () => scrollToItem((activeIndex + 1) % items.length);
  const usableIndex = activeIndex % items.length;

  return (
    <div className="grid-col mt-10 grid gap-6 text-center">
      <div className="flex items-center justify-center gap-3">
        <button
          aria-label="Previous slide"
          onClick={handlePrev}
          className="rounded-full p-1 hover:bg-gray-100"
          type="button"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>

        {items.map((item, i) => {
          const isActive = i === usableIndex;
          return (
            <span
              key={getKey(item)}
              onClick={() => scrollToItem(i)}
              className={`block cursor-pointer rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-primary h-3 w-3'
                  : 'h-2 w-2 bg-gray-400 hover:bg-gray-500'
              }`}
            />
          );
        })}

        <button
          aria-label="Next slide"
          onClick={handleNext}
          className="rounded-full p-1 hover:bg-gray-100"
          type="button"
        >
          <ArrowRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
