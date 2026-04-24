import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { gsap } from 'gsap';
import { Flip } from 'gsap/all';
import { useFilters } from './FilterContext';
import type { SortValue } from '@/data/gallery/sortData';

gsap.registerPlugin(Flip);

type VisibilityState = 'Hidden' | 'TransitionIn' | 'Shown' | 'TransitionOut';

interface CheckboxProps {
  category: string;
  title: string;
  options: Array<{ name: string; number: number }>;
  type: string;
  updateFilterOption: (
    optionName: string,
    updates: Partial<{ number: number; active: boolean }>,
  ) => void;
  updateSortValue: (sortOption: SortValue) => void;
  alterFiltersByCategory: (categoryId: string, activeStatus: boolean) => void;
}

interface CheckboxAndRadioItemProps
  extends React.ComponentPropsWithoutRef<'input'> {
  label: string;
  number: number;
  category: string;
}

function CheckboxAndRadioItem({
  label,
  number,
  category,
  ...props
}: CheckboxAndRadioItemProps) {
  return (
    <div className="h-fit w-full rounded-md text-base font-normal">
      <div>
        <label
          data-category={category}
          className={`my-1 grid cursor-pointer select-none items-center gap-4 py-2 ${props.checked ? 'font-semibold' : 'font-normal'}`}
          style={{ gridTemplateColumns: '1.5rem auto' }}
        >
          <input
            data-category={category}
            type="checkbox"
            className="h-6 w-6 cursor-pointer py-2"
            {...props}
          />
          <span>
            {label}
            {number > 0 && <span className="ml-1 font-normal">({number})</span>}
          </span>
        </label>
      </div>
    </div>
  );
}

const Checkbox = (props: CheckboxProps) => {
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const { filterableOptions, sortValue } = useFilters();
  const categoryData = filterableOptions.find(
    (cat) => cat.id === props.category,
  );
  const selectAllLabel =
    categoryData?.categoryType === 'country'
      ? 'Whole continent'
      : categoryData?.categoryType === 'event'
        ? 'All events'
        : 'Select All';
  const [visibilityState, setVisibilityState] =
    useState<VisibilityState>('Hidden');
  const componentRootRef = useRef<HTMLElement>(null);

  const startFlipAnimation = useCallback(
    (targetState: VisibilityState, dataCategory: string) => {
      const dropdownMenu = document.querySelector(
        `[data-category='${dataCategory}']`,
      ) as HTMLElement;
      const stateBeforeAnimation = Flip.getState(dropdownMenu);

      if (targetState === 'Hidden') setVisibilityState('TransitionOut');
      if (targetState === 'Shown') setVisibilityState('TransitionIn');

      if (dropdownMenu) {
        dropdownMenu.style.gridAutoRows =
          dropdownMenu.style.gridAutoRows === 'min-content auto'
            ? 'min-content 0px'
            : 'min-content auto';
      }

      Flip.from(stateBeforeAnimation, {
        duration: 0.3,
        ease: 'power2.inOut',
        absolute: false,
        scale: false,
        onComplete: () => setVisibilityState(targetState),
      });
    },
    [],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        props.category === 'sort' &&
        (visibilityState === 'Shown' || visibilityState === 'TransitionIn')
      ) {
        if (
          componentRootRef.current &&
          !componentRootRef.current.contains(event.target as Node)
        ) {
          startFlipAnimation('Hidden', 'sort');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [visibilityState, props.category, startFlipAnimation]);

  useEffect(() => {
    const category = filterableOptions.find((cat) => cat.id === props.category);
    if (
      category?.categoryType === 'country' ||
      category?.categoryType === 'event'
    ) {
      setSelectAllChecked(category.regionActive ?? false);
    } else {
      const allChecked = props.options.every((option) => {
        const opt = category?.options.find((o) => o.name === option.name);
        return opt?.active;
      });
      setSelectAllChecked(allChecked);
    }
  }, [filterableOptions, props.options, props.category]);

  const handleSelectAllChange = (isChecked: boolean, category: string) => {
    props.alterFiltersByCategory(category, isChecked);
    setSelectAllChecked(isChecked);
  };

  const toggleVisibility = (id: string) => {
    if (visibilityState === 'Hidden' || visibilityState === 'TransitionOut') {
      startFlipAnimation('Shown', id);
    } else {
      startFlipAnimation('Hidden', id);
    }
  };

  const isOptionChecked = (category: string, option: string) => {
    if (props.type === 'checkbox') {
      const filterCategory = filterableOptions.find(
        (cat) => cat.id === category,
      );
      const opt = filterCategory?.options.find((o) => o.name === option);
      return opt?.active ?? false;
    } else if (props.type === 'radio') {
      return option === sortValue;
    }
    return false;
  };

  const handleValueChange = (optionName: string, isActive: boolean) => {
    if (props.type === 'radio') {
      props.updateSortValue(optionName as SortValue);
    } else {
      props.updateFilterOption(optionName, { active: isActive });
    }
  };

  return (
    <section
      data-category={props.category}
      className="grid h-fit overflow-hidden rounded-lg border border-gray-600 px-5 text-base font-medium"
      style={{ gridAutoRows: 'min-content 0px' }}
      ref={componentRootRef}
    >
      <button
        type="button"
        onClick={() => toggleVisibility(props.category)}
        className="inline-flex h-fit w-full py-3 text-base font-medium"
      >
        {props.title}
        <p className="ms-auto self-center">
          {(visibilityState === 'Hidden' ||
            visibilityState === 'TransitionOut') && <ChevronDown size={16} />}
          {(visibilityState === 'Shown' ||
            visibilityState === 'TransitionIn') && <ChevronUp size={16} />}
        </p>
      </button>
      <div
        className={`flex w-full flex-col py-4 ${visibilityState === 'Hidden' ? 'border-t-0' : 'border-t border-black'}`}
      >
        {props.type === 'checkbox' && (
          <CheckboxAndRadioItem
            type="checkbox"
            category={props.category}
            number={0}
            label={selectAllLabel}
            onChange={(e) =>
              handleSelectAllChange(e.target.checked, props.category)
            }
            checked={selectAllChecked}
          />
        )}
        {props.options
          .filter((option) =>
            props.type === 'radio'
              ? true
              : option.number > 0 ||
                isOptionChecked(props.category, option.name),
          )
          .map((option) => (
            <CheckboxAndRadioItem
              key={option.name}
              type={props.type}
              category={props.category}
              number={option.number}
              label={option.name}
              onChange={(e) => handleValueChange(option.name, e.target.checked)}
              checked={isOptionChecked(props.category, option.name) ?? false}
            />
          ))}
        <button
          type="button"
          className={`m-auto cursor-pointer pt-4 font-semibold text-black ${props.type === 'radio' ? 'hidden' : 'visible'}`}
          onClick={() => {
            toggleVisibility(props.category);
            props.alterFiltersByCategory(props.category, false);
          }}
        >
          Clear filters
        </button>
      </div>
    </section>
  );
};

export default Checkbox;
