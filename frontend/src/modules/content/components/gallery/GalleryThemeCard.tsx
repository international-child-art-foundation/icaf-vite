import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ThemeListItem } from '@icaf/shared';
import { Check, ChevronDown } from 'lucide-react';
import { GalleryThemeVisual } from './themeVisuals';
import {
  GALLERY_THEME_CARD_HEIGHT_CLASS,
  GALLERY_THEME_VISUAL_SIZE_CLASS,
} from './themeVisuals/constants';
import type {
  GalleryThemeMenuItem,
  ThemeFamilyCardModel,
  VirtualThemeMenuItem,
} from './themeFamilies';
import { themeStartDate } from './themeFamilies';

type GalleryThemeCardProps = {
  active: boolean;
  item: GalleryThemeMenuItem;
  onSelectThemeFamily: (family: ThemeFamilyCardModel) => void;
  onDeselectThemeFamily?: (family: ThemeFamilyCardModel) => void;
  onSelectInstance?: (theme: ThemeListItem) => void;
  onDeselectInstance?: (theme: ThemeListItem) => void;
  onSelectVirtualItem?: (item: VirtualThemeMenuItem) => void;
  selectedThemeInstance?: string | null;
};

const startDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function formatStartDate(value: number): string {
  if (!value) return 'No start date';
  return startDateFormatter.format(new Date(value));
}

const virtualThemeWidthClasses: Record<
  NonNullable<VirtualThemeMenuItem['width']>,
  string
> = {
  compact: 'w-[180px]',
  icon: 'w-[80px]',
  theme: 'w-[300px]',
};

function getVirtualThemeWidth(item: VirtualThemeMenuItem) {
  return virtualThemeWidthClasses[
    item.width ?? (item.display_name || item.title ? 'compact' : 'icon')
  ];
}

function useMobileThemeActivation() {
  const [usesMobileActivation, setUsesMobileActivation] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: none), (pointer: coarse)');

    function updateMobileActivation() {
      setUsesMobileActivation(mediaQuery.matches);
    }

    updateMobileActivation();
    mediaQuery.addEventListener('change', updateMobileActivation);
    return () => {
      mediaQuery.removeEventListener('change', updateMobileActivation);
    };
  }, []);

  return usesMobileActivation;
}

export function GalleryThemeCard({
  active,
  item,
  onDeselectThemeFamily,
  onSelectThemeFamily,
  onDeselectInstance,
  onSelectInstance,
  onSelectVirtualItem,
  selectedThemeInstance,
}: GalleryThemeCardProps) {
  const [open, setOpen] = useState(false);
  const [isThemeHovered, setIsThemeHovered] = useState(false);
  const usesMobileActivation = useMobileThemeActivation();
  const dropdownButtonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);
  const positionRafRef = useRef<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    left: 0,
    top: 0,
  });
  const family = item.kind === 'theme' ? item : null;
  const instances = useMemo(
    () =>
      [...(family?.themes ?? [])].sort(
        (a, b) => themeStartDate(b) - themeStartDate(a),
      ),
    [family?.themes],
  );

  useLayoutEffect(() => {
    if (!open || !family) return;

    function updateDropdownPosition() {
      const button = dropdownButtonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const nextPosition = {
        left: Math.min(window.innerWidth - 272, Math.max(8, rect.right - 256)),
        top: rect.bottom + 8,
      };
      setDropdownPosition((current) => {
        if (
          current.left === nextPosition.left &&
          current.top === nextPosition.top
        ) {
          return current;
        }
        return nextPosition;
      });
    }

    function requestDropdownPositionUpdate() {
      if (positionRafRef.current !== null) return;
      positionRafRef.current = requestAnimationFrame(() => {
        positionRafRef.current = null;
        updateDropdownPosition();
      });
    }

    updateDropdownPosition();
    window.addEventListener('resize', requestDropdownPositionUpdate);
    window.addEventListener('scroll', requestDropdownPositionUpdate, true);
    return () => {
      window.removeEventListener('resize', requestDropdownPositionUpdate);
      window.removeEventListener('scroll', requestDropdownPositionUpdate, true);
      if (positionRafRef.current !== null) {
        cancelAnimationFrame(positionRafRef.current);
        positionRafRef.current = null;
      }
    };
  }, [family, open]);

  useEffect(() => {
    if (!open || !family) return;

    function closeOnPagePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (dropdownButtonRef.current?.contains(target)) return;
      if (dropdownMenuRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener('pointerdown', closeOnPagePointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', closeOnPagePointerDown, true);
    };
  }, [family, open]);

  const cardSizeClass =
    item.kind === 'theme'
      ? GALLERY_THEME_VISUAL_SIZE_CLASS
      : `${GALLERY_THEME_CARD_HEIGHT_CLASS} ${getVirtualThemeWidth(item)}`;
  const virtualTitle =
    item.kind === 'virtual-theme' ? (item.display_name ?? item.title) : null;

  return (
    <div
      data-gallery-theme-card
      className="relative flex-none"
      onMouseEnter={() => setIsThemeHovered(true)}
      onMouseLeave={() => setIsThemeHovered(false)}
    >
      <button
        type="button"
        aria-label={
          item.kind === 'virtual-theme' && !virtualTitle
            ? (item.ariaLabel ?? item.id)
            : undefined
        }
        onClick={() => {
          if (item.kind === 'theme') {
            if (active && onDeselectThemeFamily) {
              onDeselectThemeFamily(item);
              return;
            }
            onSelectThemeFamily(item);
            return;
          }
          onSelectVirtualItem?.(item);
        }}
        className={`group relative ${cardSizeClass} overflow-hidden rounded-md p-3 text-left shadow-sm transition duration-200 ${
          active
            ? 'ring-2 ring-black/90'
            : 'hover:-translate-y-0.5 hover:shadow-md'
        }`}
      >
        {item.kind === 'theme' ? (
          <>
            <GalleryThemeVisual
              family={item.theme_family}
              isActive={isThemeHovered || (usesMobileActivation && active)}
            />
            <span className="relative z-10 grid h-full grid-cols-[minmax(0,1fr)_2rem] gap-3">
              <span className="flex min-w-0 flex-col justify-center">
                <span>
                  <span className="font-montserrat block text-lg font-bold leading-tight">
                    {item.display_name}
                  </span>
                  {item.description && (
                    <span className="mt-1 line-clamp-1 block text-[13px] leading-5">
                      {item.description}
                    </span>
                  )}
                </span>
              </span>
            </span>
          </>
        ) : (
          <span
            className={`relative z-10 flex h-full min-w-0 items-center ${
              virtualTitle ? 'gap-3' : 'justify-center'
            }`}
          >
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white/85 text-neutral-900 shadow-sm">
              <item.Icon aria-hidden="true" className="h-5 w-5" />
            </span>
            {virtualTitle && (
              <span className="min-w-0">
                <span className="font-montserrat block truncate text-base font-bold leading-tight">
                  {virtualTitle}
                </span>
                {item.description && (
                  <span className="mt-1 line-clamp-1 block text-[13px] leading-5">
                    {item.description}
                  </span>
                )}
              </span>
            )}
          </span>
        )}
        {item.kind === 'virtual-theme' && (
          <span className="absolute inset-0 z-0 bg-neutral-100" />
        )}
      </button>

      {family && (
        <button
          ref={dropdownButtonRef}
          type="button"
          aria-expanded={open}
          aria-label={`Show ${family.display_name} options`}
          onClick={() => setOpen((current) => !current)}
          className={`absolute right-3 top-1/2 z-20 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur-sm transition`}
        >
          <ChevronDown
            aria-hidden="true"
            className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      {family &&
        open &&
        createPortal(
          <div
            ref={dropdownMenuRef}
            className="fixed z-[1000] w-64 overflow-hidden rounded-md border border-black/10 bg-white text-neutral-800 shadow-xl"
            style={{
              left: dropdownPosition.left,
              top: dropdownPosition.top,
            }}
          >
            {instances.map((theme) => (
              <button
                key={`${theme.theme_family}-${theme.theme_instance}`}
                type="button"
                className="flex w-full items-start gap-3 px-3 py-2 text-left text-sm transition hover:bg-neutral-50"
                onClick={() => {
                  setOpen(false);
                  if (active && theme.theme_instance === selectedThemeInstance) {
                    onDeselectInstance?.(theme);
                    return;
                  }
                  onSelectInstance?.(theme);
                }}
              >
                <Check
                  aria-hidden="true"
                  className={`mt-0.5 h-4 w-4 flex-none ${
                    active && theme.theme_instance === selectedThemeInstance
                      ? 'text-[#0286C3]'
                      : 'text-transparent'
                  }`}
                />
                <span className="min-w-0">
                  <span className="block font-semibold leading-5">
                    {theme.display_name}
                  </span>
                  <span className="block text-xs text-neutral-500">
                    {formatStartDate(themeStartDate(theme))}
                  </span>
                </span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
