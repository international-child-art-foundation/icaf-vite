import { ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
  scrollFunction: () => void;
}

export const ScrollToTop = ({ scrollFunction }: ScrollToTopProps) => {
  return (
    <div className="mx-auto mb-10 text-center">
      <div
        className="flex cursor-pointer flex-col gap-4"
        onClick={scrollFunction}
      >
        <div className="mx-auto flex h-[50px] w-[50px] cursor-pointer items-center rounded-full border-2 border-[#FFD743] text-center">
          <ArrowUp className="mx-auto" />
        </div>

        <p className="cursor-pointer select-none text-xs underline">
          Scroll to top
        </p>
      </div>
    </div>
  );
};
