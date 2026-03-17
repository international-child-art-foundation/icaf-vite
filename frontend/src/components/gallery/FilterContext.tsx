import React, { createContext, useContext, useState, ReactNode } from 'react';
import { filterableOptions as initialFilterableOptions } from '@/data/gallery/filterData';
import type { SortValue } from '@/data/gallery/sortData';

interface FilterContextType {
  filterableOptions: typeof initialFilterableOptions;
  setFilterOption: (
    optionName: string,
    updates: Partial<{ number: number; active: boolean }>,
  ) => void;
  activateOptionsByName: (names: string[]) => void;
  bulkAlterCategoryOptions: (
    categoryId: string,
    activeStatus: boolean,
  ) => void;
  resetAllFilters: () => void;
  pageNumber: number;
  setPageNumber: (n: number) => void;
  sortValue: SortValue;
  setSortValue: (v: SortValue) => void;
  activeEntryId: string;
  setActiveEntryId: (id: string) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [filterableOptions, setFilterableOptions] = useState(
    initialFilterableOptions,
  );
  const [pageNumber, setPageNumber] = useState(1);
  const [sortValue, setSortValue] = useState<SortValue>('Newest Event');
  const [activeEntryId, setActiveEntryId] = useState('');

  const setFilterOption = (
    optionName: string,
    updates: Partial<{ number: number; active: boolean }>,
  ) => {
    setFilterableOptions((prev) =>
      prev.map((category) => ({
        ...category,
        options: category.options.map((option) =>
          option.name === optionName ? { ...option, ...updates } : option,
        ),
      })),
    );
  };

  const activateOptionsByName = (names: string[]) => {
    setFilterableOptions((prev) =>
      prev.map((category) => ({
        ...category,
        options: category.options.map((option) => ({
          ...option,
          active: names.includes(option.name) ? true : option.active,
        })),
      })),
    );
  };

  const bulkAlterCategoryOptions = (
    categoryId: string,
    activeStatus: boolean,
  ) => {
    setFilterableOptions((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              options: category.options.map((o) => ({
                ...o,
                active: activeStatus,
              })),
            }
          : category,
      ),
    );
  };

  const resetAllFilters = () => {
    setFilterableOptions((prev) =>
      prev.map((category) => ({
        ...category,
        options: category.options.map((o) => ({ ...o, active: false })),
      })),
    );
  };

  return (
    <FilterContext.Provider
      value={{
        filterableOptions,
        setFilterOption,
        activateOptionsByName,
        bulkAlterCategoryOptions,
        resetAllFilters,
        pageNumber,
        setPageNumber,
        sortValue,
        setSortValue,
        activeEntryId,
        setActiveEntryId,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
