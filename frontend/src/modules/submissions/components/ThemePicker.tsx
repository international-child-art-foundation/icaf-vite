import { useEffect, useMemo, useState } from 'react';
import type { ThemeListItem } from '@icaf/shared';
import { listGalleryThemes } from '@/api/public';
import { GalleryThemeCard } from '@/modules/content/components/gallery/GalleryThemeCard';
import { buildThemeFamilies } from '@/modules/content/components/gallery/themeFamilies';

type ThemePickerValue = {
  theme_family: string;
  theme_instance: string;
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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listGalleryThemes()
      .then((response) => {
        if (cancelled) return;
        setThemes(response.themes);
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
          onClick={() => onChange({ theme_family: '', theme_instance: '' })}
          className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
          disabled={!value.theme_family}
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
                active={family.theme_family === value.theme_family}
                family={family}
                selectedThemeInstance={value.theme_instance}
                onSelectFamily={() => {
                  const latestTheme = family.themes[0];
                  onChange({
                    theme_family: family.theme_family,
                    theme_instance: latestTheme?.theme_instance ?? '',
                  });
                }}
                onSelectInstance={(theme) =>
                  onChange({
                    theme_family: theme.theme_family,
                    theme_instance: theme.theme_instance,
                  })
                }
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
