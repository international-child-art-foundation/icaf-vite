import { useState } from 'react';
import type { ThemeListItem } from '@icaf/shared';
import { Check, ChevronDown } from 'lucide-react';
import { GalleryThemeVisual } from './GalleryThemeVisuals';

export const GALLERY_THEME_CARD_SIZE =
  'h-[132px] w-[320px] sm:h-[144px] sm:w-[360px]';

export type ThemeFamilyCardModel = {
  description?: string;
  display_name: string;
  latest_start_date: number;
  theme_family: string;
  themes: ThemeListItem[];
};

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

function themeStartDate(theme: ThemeListItem): number {
  const value = (theme as { start_date?: unknown }).start_date;
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function GalleryThemeCard({
  active,
  family,
  onSelectFamily,
  onSelectInstance,
  selectedThemeInstance,
}: GalleryThemeCardProps) {
  const [open, setOpen] = useState(false);
  const instances = [...family.themes].sort(
    (a, b) => themeStartDate(b) - themeStartDate(a),
  );

  return (
    <div className="relative flex-none">
      <button
        type="button"
        onClick={onSelectFamily}
        className={`group relative ${GALLERY_THEME_CARD_SIZE} overflow-hidden rounded-md p-4 text-left text-white shadow-sm transition duration-200 ${
          active
            ? 'ring-4 ring-black/25'
            : 'hover:-translate-y-0.5 hover:shadow-md'
        }`}
      >
        <GalleryThemeVisual family={family.theme_family} />
        <span className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-black/10" />
        <span className="relative z-10 grid h-full grid-cols-[minmax(0,1fr)_2.25rem] gap-3">
          <span className="flex min-w-0 flex-col justify-between">
            <span>
              <span className="font-montserrat block text-xl font-bold leading-tight">
                {family.display_name}
              </span>
              {family.description && (
                <span className="mt-2 line-clamp-2 block text-sm leading-5 text-white/90">
                  {family.description}
                </span>
              )}
            </span>
            <span className="text-xs font-semibold uppercase text-white/75">
              {instances.length} instance{instances.length === 1 ? '' : 's'}
            </span>
          </span>
        </span>
      </button>

      <button
        type="button"
        aria-expanded={open}
        aria-label={`Show ${family.display_name} instances`}
        onClick={() => setOpen((current) => !current)}
        className="absolute right-4 top-1/2 z-20 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/18 text-white backdrop-blur-sm transition hover:bg-white/28"
      >
        <ChevronDown
          aria-hidden="true"
          className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-2 top-[calc(100%+0.5rem)] z-30 w-64 overflow-hidden rounded-md border border-black/10 bg-white text-neutral-800 shadow-lg">
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
                  theme.theme_instance === selectedThemeInstance
                    ? 'text-[#0286C3]'
                    : 'text-transparent'
                }`}
              />
              <span className="min-w-0">
                <span className="block font-semibold leading-5">
                  {theme.display_name}
                </span>
                <span className="block text-xs text-neutral-500">
                  {theme.theme_instance} / {formatStartDate(themeStartDate(theme))}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
