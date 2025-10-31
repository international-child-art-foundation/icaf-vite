import { ArrowUp } from 'lucide-react';
import { ColorKey, FlairColorMap } from '../shared/FlairColorMap';

interface ScrollToTopProps {
  scrollFunction: () => void;
  flairColor: ColorKey;
}

export const ScrollToTop = ({
  scrollFunction,
  flairColor,
}: ScrollToTopProps) => {
  return (
    <div className="mx-auto mb-10 text-center">
      <div
        className="flex cursor-pointer flex-col gap-2"
        onClick={scrollFunction}
      >
        <div
          className={`mx-auto flex h-[50px] w-[50px] cursor-pointer items-center rounded-full border-2 ${FlairColorMap[flairColor].border} text-center`}
        >
          <ArrowUp className={`mx-auto ${FlairColorMap[flairColor].icon}`} />
        </div>

        <p className="cursor-pointer select-none text-xs">Scroll to top</p>
      </div>
    </div>
  );
};
