import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ThemeListItem } from '@icaf/shared';
import { Check, ChevronDown } from 'lucide-react';
import { GalleryThemeVisual } from './themeVisuals';
import type { ThemeFamilyCardModel } from './themeFamilies';
import { themeStartDate } from './themeFamilies';

export const GALLERY_THEME_CARD_SIZE =
  'h-[80px] w-[300px] sm:h-[88px] sm:w-[340px]';

type GalleryThemeCardProps = {
  active: boolean;
  family: ThemeFamilyCardModel;
  onSelectFamily: () => void;
  onSelectInstance?: (theme: ThemeListItem) => void;
  selectedThemeInstance?: string | null;
};

function formatStartDate(value: number): string {
  if (!value) return 'No start date';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function GalleryThemeCard({
  active,
  family,
  onSelectFamily,
  onSelectInstance,
  selectedThemeInstance,
}: GalleryThemeCardProps) {
  const [open, setOpen] = useState(false);
  const [isThemeHovered, setIsThemeHovered] = useState(false);
  const dropdownButtonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    left: 0,
    top: 0,
  });
  const instances = [...family.themes].sort(
    (a, b) => themeStartDate(b) - themeStartDate(a),
  );

  useLayoutEffect(() => {
    if (!open) return;

    function updateDropdownPosition() {
      const button = dropdownButtonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        left: Math.min(window.innerWidth - 272, Math.max(8, rect.right - 256)),
        top: rect.bottom + 8,
      });
    }

    updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);
    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

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
  }, [open]);

  return (
    <div
      className="relative flex-none"
      onMouseEnter={() => setIsThemeHovered(true)}
      onMouseLeave={() => setIsThemeHovered(false)}
    >
      <button
        type="button"
        onClick={onSelectFamily}
        className={`group relative ${GALLERY_THEME_CARD_SIZE} overflow-hidden rounded-md p-3 text-left shadow-sm transition duration-200 ${
          active
            ? 'ring-2 ring-black/90'
            : 'hover:-translate-y-0.5 hover:shadow-md'
        }`}
      >
        <GalleryThemeVisual
          family={family.theme_family}
          isActive={isThemeHovered}
        />
        <span className="relative z-10 grid h-full grid-cols-[minmax(0,1fr)_2.25rem] gap-3">
          <span className="flex min-w-0 flex-col justify-center">
            <span>
              <span className="font-montserrat block text-lg font-bold leading-tight">
                {family.display_name}
              </span>
              {family.description && (
                <span
                  className={`mt-1 line-clamp-1 block text-[13px] leading-5`}
                >
                  {family.description}
                </span>
              )}
            </span>
          </span>
        </span>
      </button>

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

      {open &&
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
