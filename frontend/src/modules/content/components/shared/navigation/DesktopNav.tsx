import { useState, useEffect, useRef, useCallback } from 'react';
import { ICAFlogo } from '@/shared/assets/logos/ICAFLogo';
import { NavItem, navItems } from '@/shared/data/navItems';
import DesktopNavDropdown from './DesktopNavDropdown';
import { Link } from 'react-router-dom';
import DonateButton from '@/shared/components/ui/donateButton';
import { preloadRoute } from '@/preloadRoutes';

type DropdownAnimationState = {
  progress: number;
  zIndex: number;
  isOpening: boolean;
  openingFromClosed: boolean;
};

type DropdownStateMap = Record<string, DropdownAnimationState>;

const VIEWPORT_EDGE_CLOSE_THRESHOLD_PX = 2;

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
  const renderedDropdownLabelsRef = useRef<Set<string>>(new Set());
  const preloadedImagesRef = useRef<Set<string>>(new Set());
  const openRequestIdRef = useRef(0);

  const preloadMenuImages = (item: NavItem) => {
    item.children?.forEach((child) => {
      if (!child.imageSrc || preloadedImagesRef.current.has(child.imageSrc)) {
        return;
      }

      const img = new Image();
      img.src = child.imageSrc;
      preloadedImagesRef.current.add(child.imageSrc);
    });
  };

  const collapseDropdowns = useCallback(() => {
    openRequestIdRef.current += 1;
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
    preloadRoute(item.href);

    const hasChildren = !!item.children && item.children.length > 0;

    if (!hasChildren) {
      setCurrentItemLabel(null);
      collapseDropdowns();
      return;
    }

    renderedDropdownLabelsRef.current.add(item.label);
    preloadMenuImages(item);

    if (currentItemLabel === item.label) {
      return;
    }

    setCurrentItemLabel(item.label);
    const requestId = (openRequestIdRef.current += 1);
    const newZIndex = zCounterRef.current++;

    setDropdownState((prev) => {
      if (openRequestIdRef.current !== requestId) {
        return prev;
      }

      const next: DropdownStateMap = {};
      const currentState = prev[item.label];

      const openingFromClosed = !currentState || currentState.progress === 0;

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
    preloadRoute('/donate');
    setCurrentItemLabel(null);
    collapseDropdowns();
  };

  const handleDropdownItemSelected = () => {
    collapseDropdowns();
  };

  useEffect(() => {
    const anyOpen = Object.values(dropdownState).some(
      (state) => state.progress > 0,
    );
    if (!anyOpen) {
      return;
    }

    const targetIsWithinNav = (target: EventTarget | null) => {
      return (
        target instanceof Node &&
        !!headerRef.current &&
        headerRef.current.contains(target)
      );
    };

    const closeIfAtViewportEscape = (clientX: number, clientY: number) => {
      const leftEdge = clientX <= VIEWPORT_EDGE_CLOSE_THRESHOLD_PX;
      const rightEdge =
        clientX >= window.innerWidth - VIEWPORT_EDGE_CLOSE_THRESHOLD_PX;
      const topEdge = clientY <= VIEWPORT_EDGE_CLOSE_THRESHOLD_PX;

      if (leftEdge || rightEdge || topEdge) {
        collapseDropdowns();
        return true;
      }

      return false;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (closeIfAtViewportEscape(event.clientX, event.clientY)) {
        return;
      }

      if (!targetIsWithinNav(event.target)) {
        collapseDropdowns();
      }
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget !== null) {
        return;
      }

      collapseDropdowns();
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerout', handlePointerOut);
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerout', handlePointerOut);
    };
  }, [dropdownState, collapseDropdowns]);

  return (
    <div
      ref={headerRef}
      className="max-w-screen-3xl relative mx-auto h-full w-full items-center justify-between px-8 md:px-12 lg:px-16 xl:flex xl:px-20"
    >
      {navItems.map((item: NavItem) => {
        const state = dropdownState[item.label];
        const hasChildren = !!item.children && item.children.length > 0;

        if (!state || !hasChildren) {
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
            shouldRenderContent={renderedDropdownLabelsRef.current.has(
              item.label,
            )}
          />
        );
      })}

      <div className="absolute left-0 top-0 z-30 h-full w-full bg-white"></div>
      <Link to="/" className="z-50 my-2 cursor-pointer" aria-label="ICAF home">
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
