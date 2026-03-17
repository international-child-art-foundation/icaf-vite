import React, { useState, useEffect } from 'react';
import Checkbox from './Checkbox';
import { filterableOptions } from '@/data/gallery/filterData';
import { sortBy } from '@/data/gallery/sortData';
import type { SortValue } from '@/data/gallery/sortData';

interface MobileFilterProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  updateFilterOption: (
    optionName: string,
    updates: Partial<{ number: number; active: boolean }>,
  ) => void;
  updateSortValue: (sortValue: SortValue) => void;
  alterFiltersByCategory: (
    categoryId: string,
    activeStatus: boolean,
  ) => void;
  resetAllFilters: () => void;
}

export const MobileFilter = (props: MobileFilterProps) => {
  const [isVisible, setIsVisible] = useState(props.isFilterOpen);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (props.isFilterOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      timeoutId = setTimeout(() => setIsVisible(false), 1);
    }
    return () => clearTimeout(timeoutId);
  }, [props.isFilterOpen]);

  return (
    <div
      className={`fixed top-0 z-[100] h-full w-full overflow-scroll bg-[#f9faf6] p-6 transition-all duration-300 ${props.isFilterOpen ? 'opacity-100' : 'pointer-events-none select-none opacity-0'}`}
    >
      <div className="w-full text-right">
        <span
          className="cursor-pointer select-none p-4 text-4xl"
          onClick={() => props.setIsFilterOpen(false)}
        >
          &times;
        </span>
      </div>
      <section className="mt-4 overflow-y-auto">
        <div className="w-full rounded-lg bg-[#f9faf6]">
          <Checkbox
            category="sort-mobile"
            title="Sort"
            options={sortBy}
            type="radio"
            updateFilterOption={props.updateFilterOption}
            updateSortValue={props.updateSortValue}
            alterFiltersByCategory={props.alterFiltersByCategory}
          />
        </div>
        <div className="p-4 text-center text-xl">Filter Options</div>
        {filterableOptions.map(({ id, title, options, filterType }) => (
          <React.Fragment key={id + title}>
            <section
              className={`transition-all duration-300 ${isVisible ? 'mb-4 opacity-100' : 'mb-0 opacity-0'}`}
            >
              <Checkbox
                category={id}
                title={title}
                type={filterType}
                options={options}
                updateFilterOption={props.updateFilterOption}
                updateSortValue={props.updateSortValue}
                alterFiltersByCategory={props.alterFiltersByCategory}
              />
            </section>
          </React.Fragment>
        ))}
      </section>
      <div className="grid grid-cols-2 gap-2">
        <button
          className="rounded-md border border-black p-2 font-semibold"
          onClick={() => props.resetAllFilters()}
        >
          Reset Filters
        </button>
        <button
          className="rounded-md bg-primary font-semibold text-text-inverse"
          onClick={() => props.setIsFilterOpen(false)}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default MobileFilter;
