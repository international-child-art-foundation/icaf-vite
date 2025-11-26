import { useState, useEffect, useRef, useCallback } from 'react';
import { ICAFlogo } from '@/assets/shared/logos/ICAFLogo';
import { NavItem, navItems } from '@/lib/navItems';
import DesktopNavDropdown from './DesktopNavDropdown';
import { Link } from 'react-router-dom';
import DonateButton from '@/components/ui/donateButton';

type DropdownAnimationState = {
  progress: number;
  zIndex: number;
  fadingIn: boolean;
  isOpening: boolean;
  openingFromClosed: boolean;
};

type DropdownStateMap = Record<string, DropdownAnimationState>;

const createInitialDropdownState = (): DropdownStateMap => {
  const state: DropdownStateMap = {};
  navItems.forEach((item) => {
    state[item.label] = {
      progress: 0,
      zIndex: 0,
      fadingIn: false,
      isOpening: false,
      openingFromClosed: false,
    };
  });
  return state;
};

const isInternalHref = (href: string): boolean => {
  return href.startsWith('/') && !href.startsWith('//');
};

const DesktopNav: React.FC = () => {
  const [dropdownState, setDropdownState] = useState<DropdownStateMap>(() =>
    createInitialDropdownState(),
  );
  const [currentItemLabel, setCurrentItemLabel] = useState<string | null>(null);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const zCounterRef = useRef<number>(1);

  const collapseDropdowns = useCallback(() => {
    setCurrentItemLabel(null);
    setDropdownState((prev) => {
      const next: DropdownStateMap = {};
      for (const key of Object.keys(prev)) {
        const prevState = prev[key];
        next[key] = {
          ...prevState,
          progress: 0,
          zIndex: 0,
          fadingIn: false,
          isOpening: false,
          openingFromClosed: false,
        };
      }
      return next;
    });
    zCounterRef.current = 1;
  }, []);

  const handleItemHover = (item: NavItem) => {
    const hasChildren = !!item.children && item.children.length > 0;

    if (!hasChildren) {
      setCurrentItemLabel(null);
      collapseDropdowns();
      return;
    }

    if (currentItemLabel === item.label) {
      return;
    }

    setCurrentItemLabel(item.label);

    setDropdownState((prev) => {
      const next: DropdownStateMap = {};
      const currentState = prev[item.label];

      const openingFromClosed = !currentState || currentState.progress === 0;
      const hasOtherOpen = Object.entries(prev).some(
        ([key, state]) => key !== item.label && state.progress > 0,
      );

      const newZIndex = zCounterRef.current++;
      const shouldFadeIn = hasOtherOpen;

      for (const key of Object.keys(prev)) {
        const state = prev[key];

        if (key === item.label) {
          next[key] = {
            progress: 1,
            zIndex: newZIndex,
            fadingIn: shouldFadeIn,
            isOpening: true,
            openingFromClosed,
          };
        } else {
          if (state.progress > 0) {
            next[key] = {
              ...state,
              progress: 0,
              zIndex: state.zIndex,
              fadingIn: false,
              isOpening: false,
              openingFromClosed: false,
            };
          } else {
            next[key] = {
              ...state,
              fadingIn: false,
              isOpening: false,
              openingFromClosed: false,
            };
          }
        }
      }

      if (!next[item.label]) {
        next[item.label] = {
          progress: 1,
          zIndex: newZIndex,
          fadingIn: shouldFadeIn,
          isOpening: true,
          openingFromClosed,
        };
      }

      return next;
    });
  };

  const handleDonateHover = () => {
    setCurrentItemLabel(null);
    collapseDropdowns();
  };

  const handleDropdownItemSelected = () => {
    collapseDropdowns();
  };

  useEffect(() => {
    navItems.forEach((item) => {
      item.children?.forEach((child) => {
        const img = new Image();
        img.src = child.imageSrc;
      });
    });
  }, []);

  useEffect(() => {
    const anyOpen = Object.values(dropdownState).some(
      (state) => state.progress > 0,
    );
    if (!anyOpen) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const target = event.target as Node;
      const inHeader = headerRef.current && headerRef.current.contains(target);

      if (!inHeader) {
        collapseDropdowns();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [dropdownState, collapseDropdowns]);

  return (
    <div
      ref={headerRef}
      className="relative h-full w-full items-center justify-between xl:flex"
    >
      <Link to="/" className="my-2 cursor-pointer">
        <ICAFlogo />
      </Link>

      <div
        className="flex h-full items-center space-x-6"
        aria-label="Main navigation"
      >
        {navItems.map((item: NavItem) => {
          const isActive = currentItemLabel === item.label;
          const hasHref = !!item.href;
          const internal = hasHref && isInternalHref(item.href!);
          const hasChildren = !!item.children && item.children.length > 0;
          const state = dropdownState[item.label];

          const expanded = hasChildren && !!state && state.progress > 0;

          const baseClassName = `group relative text-lg hover:cursor-pointer hover:text-primary ${
            isActive ? 'text-primary' : 'text-black'
          }`;

          const commonProps = {
            onMouseEnter: () => handleItemHover(item),
            onFocus: () => handleItemHover(item),
            className: baseClassName,
            'aria-haspopup': hasChildren ? true : undefined,
            'aria-expanded': expanded,
          };

          const content = (
            <>
              {item.navLabel}
              <span className="bg-primary absolute left-1/2 top-7 h-[1px] w-0 -translate-x-1/2 transform transition-all duration-300 ease-in-out group-hover:w-full" />
            </>
          );

          let trigger: React.ReactNode;

          if (!hasHref) {
            trigger = (
              <button
                type="button"
                {...commonProps}
                onClick={collapseDropdowns}
              >
                {content}
              </button>
            );
          } else if (internal) {
            trigger = (
              <Link
                to={item.href!}
                {...commonProps}
                onClick={collapseDropdowns}
              >
                {content}
              </Link>
            );
          } else {
            trigger = (
              <a href={item.href} {...commonProps} onClick={collapseDropdowns}>
                {content}
              </a>
            );
          }

          return (
            <div key={item.key} className="relative">
              {trigger}
              {state && (
                <DesktopNavDropdown
                  item={item}
                  progress={state.progress}
                  zIndex={state.zIndex}
                  fadingIn={state.fadingIn}
                  isOpening={state.isOpening}
                  openingFromClosed={state.openingFromClosed}
                  onItemSelected={handleDropdownItemSelected}
                />
              )}
            </div>
          );
        })}

        <div onMouseEnter={handleDonateHover} onFocus={handleDonateHover}>
          <DonateButton className="w-32" text="Donate" />
        </div>
      </div>
    </div>
  );
};

export default DesktopNav;
