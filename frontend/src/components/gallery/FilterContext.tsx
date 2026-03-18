import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
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
  updateOptionCounts: (counts: Record<string, number>) => void;
  setRegionActive: (categoryId: string, active: boolean) => void;
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
      prev.map((category) => {
        if (category.id !== categoryId) return category;
        if ((category.categoryType === 'country' || category.categoryType === 'event') && activeStatus) {
          // Select All: set regionActive, leave individual options alone
          return { ...category, regionActive: true };
        }
        // Deselect / non-country: clear regionActive and toggle all individual options
        return {
          ...category,
          regionActive: false,
          options: category.options.map((o) => ({ ...o, active: activeStatus })),
        };
      }),
    );
  };

  const resetAllFilters = () => {
    setFilterableOptions((prev) =>
      prev.map((category) => ({
        ...category,
        regionActive: false,
        options: category.options.map((o) => ({ ...o, active: false })),
      })),
    );
  };

  const setRegionActive = (categoryId: string, active: boolean) => {
    setFilterableOptions((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? { ...category, regionActive: active }
          : category,
      ),
    );
  };

  const updateOptionCounts = (counts: Record<string, number>) => {
    setFilterableOptions((prev) =>
      prev.map((category) => ({
        ...category,
        options: category.options.map((option) => ({
          ...option,
          number: counts[option.name] ?? 0,
        })),
      })),
    );
  };

  const value = useMemo(
    () => ({
      filterableOptions,
      setFilterOption,
      activateOptionsByName,
      bulkAlterCategoryOptions,
      resetAllFilters,
      updateOptionCounts,
      setRegionActive,
      pageNumber,
      setPageNumber,
      sortValue,
      setSortValue,
      activeEntryId,
      setActiveEntryId,
    }),
    [filterableOptions, pageNumber, sortValue, activeEntryId],
  );

  return <FilterContext value={value}>{children}</FilterContext>;
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
