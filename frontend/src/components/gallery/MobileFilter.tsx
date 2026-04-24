import React, { useState, useEffect } from 'react';
import Checkbox from './Checkbox';
import { useFilters } from './FilterContext';
import type { SortValue } from '@/data/gallery/sortData';

interface MobileFilterProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  updateFilterOption: (
    optionName: string,
    updates: Partial<{ number: number; active: boolean }>,
  ) => void;
  updateSortValue: (sortValue: SortValue) => void;
  alterFiltersByCategory: (categoryId: string, activeStatus: boolean) => void;
  resetAllFilters: () => void;
}

export const MobileFilter = (props: MobileFilterProps) => {
  const { filterableOptions } = useFilters();
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
      className={`fixed inset-0 z-[100] flex flex-col bg-[#f9faf6] transition-all duration-300 ${props.isFilterOpen ? 'opacity-100' : 'pointer-events-none select-none opacity-0'}`}
    >
      <div className="absolute right-4 top-4 w-full text-right">
        <span
          className="cursor-pointer select-none p-4 text-4xl"
          onClick={() => props.setIsFilterOpen(false)}
        >
          &times;
        </span>
      </div>
      <section className="min-h-0 flex-1 overflow-y-auto px-6 pt-6">
        {/* <div className="w-full rounded-lg bg-[#f9faf6]">
          <Checkbox
            category="sort-mobile"
            title="Sort"
            options={sortBy}
            type="radio"
            updateFilterOption={props.updateFilterOption}
            updateSortValue={props.updateSortValue}
            alterFiltersByCategory={props.alterFiltersByCategory}
          />
        </div> */}
        <div className="p-4 text-center text-xl font-semibold">
          Filter Options
        </div>
        {filterableOptions
          .filter((cat) => cat.options.some((o) => o.number > 0 || o.active))
          .map(({ id, title, options, filterType }) => (
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
      <div className="grid grid-cols-2 gap-2 px-6 pb-6 pt-3">
        <button
          type="button"
          className="h-[48px] w-full rounded-md border border-black p-2 font-semibold"
          onClick={() => props.resetAllFilters()}
        >
          Reset Filters
        </button>
        <button
          type="button"
          className="bg-primary text-text-inverse h-[48px] w-full rounded-md font-semibold"
          onClick={() => props.setIsFilterOpen(false)}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default MobileFilter;
