import React, { useState, useEffect } from 'react';
import Checkbox from './Checkbox';
import { useFilters } from './FilterContext';
import type { SortValue } from '@/data/gallery/sortData';

interface FilterProps {
  isFilterOpen: boolean;
  updateFilterOption: (
    optionName: string,
    updates: Partial<{ number: number; active: boolean }>,
  ) => void;
  updateSortValue: (sortValue: SortValue) => void;
  alterFiltersByCategory: (
    categoryId: string,
    activeStatus: boolean,
  ) => void;
}

export const Filter = (props: FilterProps) => {
  const { filterableOptions } = useFilters();
  const [isVisible, setIsVisible] = useState(props.isFilterOpen);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (props.isFilterOpen) {
      setIsVisible(true);
    } else {
      timeoutId = setTimeout(() => setIsVisible(false), 1);
    }
    return () => clearTimeout(timeoutId);
  }, [props.isFilterOpen]);

  const visibleCategories = filterableOptions.filter(
    (cat) => cat.options.some((o) => o.number > 0 || o.active),
  );

  return (
    <div className="relative w-full">
      <section>
        {visibleCategories.map(({ id, title, options, filterType }) => (
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
    </div>
  );
};

export default Filter;
