import { ArrowUp } from 'lucide-react';
import { ColorKey, FlairColorMap } from '../shared/FlairColorMap';
import { scrollToSection } from '@/lib/utils';
import type { RefObject } from 'react';

interface ScrollToTopProps {
  targetRef: RefObject<HTMLElement | null>;
  flairColor: ColorKey;
  offset?: number;
}

export const ScrollToTop = ({
  targetRef,
  flairColor,
  offset = 110,
}: ScrollToTopProps) => {
  const handleScroll = () => {
    scrollToSection(targetRef, offset);
  };

  return (
    <div className="group mx-auto mb-10 flex text-center">
      <div
        className="mx-auto flex cursor-pointer flex-col gap-2"
        onClick={handleScroll}
      >
        <div
          className={`mx-auto flex h-[50px] w-[50px] cursor-pointer items-center rounded-full border-2 ${FlairColorMap[flairColor].border} transition-color text-center duration-300 group-hover:bg-blue-50`}
        >
          <ArrowUp className={`mx-auto ${FlairColorMap[flairColor].icon}`} />
        </div>

        <p className="cursor-pointer select-none text-xs">Scroll to top</p>
      </div>
    </div>
  );
};
