import { ChevronLeft, ChevronRight } from 'lucide-react';

type CarouselArrowsDotsProps = {
  items: { id: string | number }[];
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  currentIndex: number;
};

export default function CarouselArrowsDots({
  items,
  onPrevious,
  onNext,
  onSelect,
  currentIndex,
}: CarouselArrowsDotsProps) {
  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        type="button"
        onClick={onPrevious}
        className="rounded-full p-2 transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Previous"
      >
        <ChevronLeft className="h-5 w-5 text-gray-700" />
      </button>

      {items.map((item, index) => (
        <button
          type="button"
          key={`dot-${item.id}`}
          onClick={() => onSelect(index)}
          className={`h-2 w-2 rounded-full transition-colors duration-300 md:h-3 md:w-3 ${
            index === currentIndex
              ? 'bg-blue-500'
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
          aria-label={`Go to item ${index + 1}`}
          aria-current={index === currentIndex ? 'true' : 'false'}
        />
      ))}

      <button
        type="button"
        onClick={onNext}
        className="rounded-full p-2 transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Next"
      >
        <ChevronRight className="h-5 w-5 text-gray-700" />
      </button>
    </div>
  );
}
