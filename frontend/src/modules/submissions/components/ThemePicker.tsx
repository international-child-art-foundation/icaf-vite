import { useEffect, useMemo, useState } from 'react';
import { parseThemeSK, type ThemeListItem } from '@icaf/shared';
import { listGalleryThemes } from '@/api/public';
import { GalleryThemeCard } from '@/modules/content/components/gallery/GalleryThemeCard';
import { buildThemeFamilies } from '@/modules/content/components/gallery/themeFamilies';
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

export function ThemePicker({ onChange, value }: ThemePickerProps) {
  const [themes, setThemes] = useState<ThemeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const themeFamilies = useMemo(() => buildThemeFamilies(themes), [themes]);
  const selectedTheme = useMemo(
    () => (value.theme ? parseThemeSK(value.theme) : null),
    [value.theme],
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
                      family.themes.length === 1
                        ? family.themes[0].theme_sk
                        : family.theme_sk,
                  });
                }}
                onDeselectThemeFamily={() =>
                  onChange({ theme: '' })
                }
                onSelectInstance={(theme) => {
                  if (theme.theme_sk === value.theme) {
                    onChange({ theme: '' });
                    return;
                  }
                  onChange({ theme: theme.theme_sk });
                }}
                onDeselectInstance={() =>
                  onChange({ theme: '' })
                }
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
