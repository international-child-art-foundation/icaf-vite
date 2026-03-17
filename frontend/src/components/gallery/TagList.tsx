import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Flip } from 'gsap/all';
import { Tag } from './Tag';

gsap.registerPlugin(Flip);

interface TagListProps {
  paramsObj: Record<string, string[]>;
  updateFilterOption: (
    optionName: string,
    updates: Partial<{ number: number; active: boolean }>,
  ) => void;
  clearAllFilters: () => void;
  dropdownActive: boolean;
}

export const TagList = (props: TagListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const state = Flip.getState(containerRef.current);

      if (props.dropdownActive) {
        containerRef.current.classList.add(
          'col-start-7',
          'xl:col-span-15',
          'xl:col-start-6',
        );
      } else {
        containerRef.current.classList.add('col-start-1', 'col-span-20');
        containerRef.current.classList.remove(
          'col-start-7',
          'xl:col-span-15',
          'xl:col-start-6',
        );
      }

      Flip.from(state, {
        duration: 0.3,
        ease: 'power1.inOut',
      });
    }
  }, [props.dropdownActive]);

  const removeTag = (filterValue: string) => {
    props.updateFilterOption(filterValue, { active: false });
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
    >
      {hasMultipleActiveFilters && (
        <button
          onClick={props.clearAllFilters}
          className="h-[40px] cursor-pointer select-none px-5 py-2 font-semibold text-black"
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
            onRemove={() => removeTag(value)}
          />
        )),
      )}
    </div>
  );
};
