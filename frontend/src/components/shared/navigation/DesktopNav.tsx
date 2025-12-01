import { useState, useEffect, useRef, useCallback } from 'react';
import { ICAFlogo } from '@/assets/shared/logos/ICAFLogo';
import { NavItem, navItems } from '@/lib/navItems';
import DesktopNavDropdown from './DesktopNavDropdown';
import { Link } from 'react-router-dom';
import DonateButton from '@/components/ui/donateButton';

type DropdownAnimationState = {
  progress: number;
  zIndex: number;
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
        next[key] = {
          progress: 0,
          zIndex: 0,
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

      const newZIndex = zCounterRef.current++;

      for (const key of Object.keys(prev)) {
        const state = prev[key];

        if (key === item.label) {
          next[key] = {
            progress: 1,
            zIndex: newZIndex,
            isOpening: true,
            openingFromClosed,
          };
        } else {
          if (state.progress > 0) {
            next[key] = {
              ...state,
              progress: 0,
              zIndex: state.zIndex,
              isOpening: false,
              openingFromClosed: false,
            };
          } else {
            next[key] = {
              ...state,
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
      className="relative mx-auto h-full w-full max-w-screen-2xl items-center justify-between px-8 md:px-12 lg:px-16 xl:flex xl:px-20"
    >
      {navItems.map((item: NavItem) => {
        const state = dropdownState[item.label];

        if (!state) {
          return null;
        }

        return (
          <DesktopNavDropdown
            key={`dropdown-${item.key}`}
            item={item}
            progress={state.progress}
            zIndex={state.zIndex}
            isOpening={state.isOpening}
            openingFromClosed={state.openingFromClosed}
            onItemSelected={handleDropdownItemSelected}
          />
        );
      })}

      <div className="absolute left-0 top-0 z-30 h-full w-full bg-white"></div>
      <Link to="/" className="z-50 my-2 cursor-pointer">
        <ICAFlogo />
      </Link>

      <div
        className="relative z-30 flex h-full items-center space-x-6"
        aria-label="Main navigation"
      >
        {navItems.map((item: NavItem) => {
          const isActive = currentItemLabel === item.label;
          const hasHref = !!item.href;
          const internal = hasHref && isInternalHref(item.href!);
          const hasChildren = !!item.children && item.children.length > 0;
          const state = dropdownState[item.label];

          const expanded = hasChildren && !!state && state.progress > 0;

          const baseClassName = `group relative text-lg hover:cursor-pointer hover:text-primary z-50 ${
            isActive ? 'text-primary' : 'text-black'
          }`;

          const commonProps = {
            onMouseEnter: () => handleItemHover(item),
            onFocus: () => handleItemHover(item),
            'aria-haspopup': hasChildren ? true : undefined,
            'aria-expanded': expanded,
          };

          const content = (
            <>
              {item.navLabel}
              <span className="bg-primary absolute left-1/2 top-7 z-[200] h-[1px] w-0 -translate-x-1/2 transform transition-all duration-300 ease-in-out group-hover:w-full" />
            </>
          );

          let trigger: React.ReactNode;

          if (!hasHref) {
            trigger = (
              <button
                type="button"
                {...commonProps}
                onClick={collapseDropdowns}
                className={baseClassName}
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
                className={baseClassName}
              >
                {content}
              </Link>
            );
          } else {
            trigger = (
              <a
                href={item.href}
                {...commonProps}
                onClick={collapseDropdowns}
                className={baseClassName}
              >
                {content}
              </a>
            );
          }

          return (
            <div key={item.key} className="relative z-40">
              {trigger}
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
