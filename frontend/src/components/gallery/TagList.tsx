import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Flip } from 'gsap/all';
import { Tag } from './Tag';

gsap.registerPlugin(Flip);

interface TagListProps {
  paramsObj: Record<string, string[]>;
  removeFilterTag: (categoryId: string, value: string) => void;
  clearAllFilters: () => void;
  dropdownActive: boolean;
}

export const TagList = (props: TagListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const prevDropdownActive = useRef(props.dropdownActive);

  // Capture position before this render's layout change takes effect
  if (
    prevDropdownActive.current !== props.dropdownActive &&
    containerRef.current
  ) {
    flipStateRef.current = Flip.getState(containerRef.current);
    prevDropdownActive.current = props.dropdownActive;
  }

  // Animate from captured state after DOM has updated
  useLayoutEffect(() => {
    if (flipStateRef.current) {
      Flip.from(flipStateRef.current, { duration: 0.3, ease: 'power1.inOut' });
      flipStateRef.current = null;
    }
  }, [props.dropdownActive]);

  const removeTag = (categoryId: string, value: string) => {
    props.removeFilterTag(categoryId, value);
  };

  const filteredKeys = Object.keys(props.paramsObj).filter(
    (key) => key !== 'page' && key !== 'sort' && key !== 'id',
  );

  const hasMultipleActiveFilters = filteredKeys.some(
    (key) => props.paramsObj[key].length > 1,
  );

  return (
    <div
      ref={containerRef}
      className="relative row-start-1 flex flex-wrap gap-2"
      style={{ gridColumn: props.dropdownActive ? '6 / -1' : '1 / -1' }}
    >
      {hasMultipleActiveFilters && (
        <button
          type="button"
          onClick={props.clearAllFilters}
          className="cursor-pointer select-none px-5 py-2 font-semibold text-black"
        >
          Clear filters
        </button>
      )}
      {filteredKeys.map((key) =>
        props.paramsObj[key].map((value) => (
          <Tag
            key={value}
            label={value}
            filterType={key}
            onRemove={() => removeTag(key, value)}
          />
        )),
      )}
    </div>
  );
};
