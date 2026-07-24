import { useEffect, useMemo, useState } from 'react';
import {
  formatThemeDisplayName,
  parseThemeSK,
  type ThemeListItem,
} from '@icaf/shared';
import { listGalleryThemes } from '@/api/public';
import { GalleryThemeCard } from '@/modules/content/components/gallery/GalleryThemeCard';
import {
  buildThemeFamilies,
  themeStartDate,
  type ThemeFamilyCardModel,
} from '@/modules/content/components/gallery/themeFamilies';
import { getThemeVisualPalette } from '@/modules/content/components/gallery/themeVisuals';
import {
  filterThemesForSurface,
  THEME_SURFACES,
} from '@/modules/content/components/gallery/themeVisibility';

type ThemePickerValue = {
  theme: string;
};

type ThemePickerProps = {
  onChange: (theme: ThemePickerValue) => void;
  value: ThemePickerValue;
};

type ThemeInstancePickerProps = {
  family: ThemeFamilyCardModel;
  onChange: (theme: ThemePickerValue) => void;
  selectedThemeSk: string;
};

function ThemeInstancePicker({
  family,
  onChange,
  selectedThemeSk,
}: ThemeInstancePickerProps) {
  const instances = useMemo(
    () =>
      [...family.themes].sort(
        (first, second) => themeStartDate(second) - themeStartDate(first),
      ),
    [family.themes],
  );
  const palette = getThemeVisualPalette(family.theme_family);

  if (!instances.length) return null;

  return (
    <div
      aria-label={`${family.display_name} options`}
      className="-mx-1 overflow-x-auto px-1 pb-2"
      role="group"
    >
      <p className="text-slate-850 mb-2 px-1 text-sm font-semibold">
        Choose your theme version
      </p>
      <div className="my-1 flex w-max gap-3">
        {instances.map((theme, index) => {
          const isSelected = theme.theme_sk === selectedThemeSk;
          const accentColor =
            index % 2 === 0
              ? palette.primary
              : (palette.secondary ?? palette.primary);

          return (
            <button
              key={theme.theme_sk}
              type="button"
              aria-pressed={isSelected}
              className={`group relative h-12 w-[320px] overflow-hidden rounded-md bg-white px-5 pl-7 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/90 ${
                isSelected ? 'ring-2 ring-black/90' : ''
              }`}
              onClick={() =>
                onChange({
                  theme: isSelected ? family.theme_sk : theme.theme_sk,
                })
              }
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-2"
                style={{ backgroundColor: accentColor }}
              />
              <span className="font-montserrat relative z-10 block truncate pr-20 text-sm font-semibold leading-tight text-slate-950">
                {formatThemeDisplayName(theme)}
              </span>
              {isSelected && (
                <span className="font-montserrat absolute right-5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-700">
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ThemePicker({ onChange, value }: ThemePickerProps) {
  const [themes, setThemes] = useState<ThemeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const themeFamilies = useMemo(() => buildThemeFamilies(themes), [themes]);
  const selectedTheme = useMemo(
    () => (value.theme ? parseThemeSK(value.theme) : null),
    [value.theme],
  );
  const selectedFamily = useMemo(
    () =>
      themeFamilies.find(
        (family) => family.theme_family === selectedTheme?.theme_family,
      ) ?? null,
    [selectedTheme?.theme_family, themeFamilies],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listGalleryThemes()
      .then((response) => {
        if (cancelled) return;
        const now = Date.now();
        setThemes(
          filterThemesForSurface(
            response.themes,
            THEME_SURFACES.submitArtwork,
          ).filter((theme) => !theme.retired_at || theme.retired_at > now),
        );
      })
      .catch((requestError: unknown) => {
        if (cancelled) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Themes could not be loaded.',
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-montserrat text-lg font-semibold text-slate-950">
            Theme
          </h2>
          <p className="text-xs leading-5 text-slate-500">
            Choose a theme for this submission, or leave it unselected.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ theme: '' })}
          className="rounded-md border border-2 border-black/10 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 opacity-50 transition disabled:border-gray-800 disabled:bg-gray-50 disabled:text-gray-800 disabled:opacity-100"
          disabled={!value.theme}
        >
          No theme
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading themes...</p>
      ) : error ? (
        <p className="text-sm font-semibold text-red-600">{error}</p>
      ) : (
        <div className="-mx-1 overflow-x-auto px-1 pb-2">
          <div className="my-1 flex w-max gap-3">
            {themeFamilies.map((family) => (
              <GalleryThemeCard
                key={family.theme_family}
                active={family.theme_family === selectedTheme?.theme_family}
                item={family}
                selectedThemeSk={value.theme}
                onSelectThemeFamily={() => {
                  if (family.theme_family === selectedTheme?.theme_family) {
                    onChange({ theme: '' });
                    return;
                  }
                  onChange({
                    theme:
                      [...family.themes].sort(
                        (first, second) =>
                          themeStartDate(second) - themeStartDate(first),
                      )[0]?.theme_sk ?? family.theme_sk,
                  });
                }}
                onDeselectThemeFamily={() => onChange({ theme: '' })}
                onSelectInstance={(theme) => {
                  if (theme.theme_sk === value.theme) {
                    onChange({ theme: '' });
                    return;
                  }
                  onChange({ theme: theme.theme_sk });
                }}
                onDeselectInstance={() => onChange({ theme: family.theme_sk })}
              />
            ))}
          </div>
        </div>
      )}

      {selectedFamily && (
        <ThemeInstancePicker
          family={selectedFamily}
          selectedThemeSk={value.theme}
          onChange={onChange}
        />
      )}
    </section>
  );
}
