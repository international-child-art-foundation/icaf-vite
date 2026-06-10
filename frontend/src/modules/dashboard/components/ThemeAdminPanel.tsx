import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PatchTheme, ThemeListItem } from '@icaf/shared';
import { buildThemeSK } from '@icaf/shared';
import { CalendarDays, RefreshCw, Save, X } from 'lucide-react';
import { updateTheme } from '@/api/contributor';
import { listGalleryThemes } from '@/api/public';
import {
  FuzzyTextDropdown,
  type FuzzyDropdownOption,
} from '@/shared/components/FuzzyTextDropdown';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { routes } from '@/shared/data/routes';
import { DashboardModule, ModuleState } from './DashboardModule';
import { CreateThemePanel } from './CreateThemePanel';

type ThemeDraft = {
  description: string;
  display_name: string;
  featured_on: string[];
  start_date: string;
};

const extraPageOptions = [
  { main: '/gallery', aliases: [] },
  { main: '/my-icaf', aliases: ['/dashboard'] },
];

function dateInputValue(timestamp: number): string {
  return Number.isFinite(timestamp)
    ? new Date(timestamp).toISOString().slice(0, 10)
    : '';
}

function dateToTimestamp(value: string) {
  return new Date(`${value}T00:00:00`).getTime();
}

function themeValue(theme: ThemeListItem): string {
  return `${theme.theme_family}#${theme.theme_instance}`;
}

function themeDescription(theme: ThemeListItem): string {
  return dateInputValue(theme.start_date);
}

function themeToDraft(theme: ThemeListItem): ThemeDraft {
  return {
    description: theme.description ?? '',
    display_name: theme.display_name,
    featured_on: theme.featured_on ?? [],
    start_date: dateInputValue(theme.start_date),
  };
}

function routeName(path: string): string {
  return path.replace(/^\/+/, '') || 'home';
}

function publicPageOptions(): FuzzyDropdownOption[] {
  return [...extraPageOptions, ...routes]
    .map(({ aliases, main }) => ({
      value: routeName(main),
      label: routeName(main),
      description: main,
      searchText: aliases.map(routeName).join(' '),
    }))
    .filter(
      (option, index, allOptions) =>
        allOptions.findIndex((item) => item.value === option.value) === index,
    );
}

export function ThemeAdminPanel() {
  const [themes, setThemes] = useState<ThemeListItem[]>([]);
  const [filteredThemeOptions, setFilteredThemeOptions] = useState<
    FuzzyDropdownOption[]
  >([]);
  const [themeFilterQuery, setThemeFilterQuery] = useState('');
  const [selectedThemeValue, setSelectedThemeValue] = useState<string | null>(
    null,
  );
  const [draft, setDraft] = useState<ThemeDraft | null>(null);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const themeOptions = useMemo<FuzzyDropdownOption[]>(
    () =>
      themes.map((theme) => ({
        value: themeValue(theme),
        label: theme.display_name,
        description: themeDescription(theme),
        searchText: [
          theme.theme_family,
          theme.theme_instance,
          theme.description,
          dateInputValue(theme.start_date),
        ]
          .filter(Boolean)
          .join(' '),
      })),
    [themes],
  );

  const pageOptions = useMemo(publicPageOptions, []);
  const selectedTheme = useMemo(
    () =>
      selectedThemeValue
        ? (themes.find((theme) => themeValue(theme) === selectedThemeValue) ??
          null)
        : null,
    [selectedThemeValue, themes],
  );

  const shownThemes = useMemo(() => {
    const values = themeFilterQuery.trim()
      ? new Set(filteredThemeOptions.map((option) => option.value))
      : new Set(themeOptions.map((option) => option.value));
    return themes.filter((theme) => values.has(themeValue(theme)));
  }, [filteredThemeOptions, themeFilterQuery, themeOptions, themes]);

  const loadThemes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listGalleryThemes();
      setThemes(response.themes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load themes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadThemes();
  }, [loadThemes]);

  useEffect(() => {
    setDraft(selectedTheme ? themeToDraft(selectedTheme) : null);
    setSelectedPage(null);
    setMessage(null);
    setError(null);
  }, [selectedTheme]);

  const updateDraftField = <Key extends keyof ThemeDraft>(
    field: Key,
    value: ThemeDraft[Key],
  ) => {
    setDraft((current) => (current ? { ...current, [field]: value } : current));
  };

  const handlePageSelect = (value: string | null) => {
    setSelectedPage(value);
    if (!value) return;
    setDraft((current) => {
      if (!current || current.featured_on.includes(value)) return current;
      return { ...current, featured_on: [...current.featured_on, value] };
    });
  };

  const removeFeaturedPage = (value: string) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            featured_on: current.featured_on.filter((item) => item !== value),
          }
        : current,
    );
    if (selectedPage === value) setSelectedPage(null);
  };

  const saveTheme = async () => {
    if (!selectedTheme || !draft) return;

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const start_date = dateToTimestamp(draft.start_date);
      const request: PatchTheme = {
        description: draft.description.trim() || undefined,
        display_name: draft.display_name.trim(),
        featured_on: draft.featured_on,
        start_date,
      };

      if (!request.display_name) throw new Error('Display name is required.');
      if (!Number.isFinite(start_date))
        throw new Error('Start date is required.');

      const response = await updateTheme(
        buildThemeSK(selectedTheme.theme_family, selectedTheme.theme_instance),
        request,
      );
      setMessage(response.message);
      await loadThemes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Theme update failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleFilterChange = useCallback(
    (options: FuzzyDropdownOption[], query: string) => {
      setThemeFilterQuery(query);
      setFilteredThemeOptions(options);
    },
    [],
  );

  return (
    <div className="grid gap-6">
      <DashboardModule
        title="Edit theme"
        description="Update theme names, descriptions, featured surfaces, and start dates."
        aside={
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadThemes()}
            disabled={busy || loading}
          >
            <RefreshCw aria-hidden="true" />
            Refresh
          </Button>
        }
      >
        <div className="grid gap-6">
          {error && <ModuleState tone="error">{error}</ModuleState>}
          {message && <ModuleState tone="success">{message}</ModuleState>}
          {loading ? (
            <ModuleState>Loading themes...</ModuleState>
          ) : themes.length === 0 ? (
            <ModuleState>No themes found.</ModuleState>
          ) : (
            <>
              <FuzzyTextDropdown
                collapseAfterSelect
                label="Theme"
                options={themeOptions}
                placeholder="Search themes by name, collection, year, or date"
                selectedValue={selectedThemeValue}
                onSelect={setSelectedThemeValue}
                onFilterChange={handleFilterChange}
                disabled={busy}
              />

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {shownThemes.map((theme) => (
                  <button
                    key={themeValue(theme)}
                    type="button"
                    className={`rounded-md border p-3 text-left transition ${
                      themeValue(theme) === selectedThemeValue
                        ? 'border-[#0286C3] bg-sky-50'
                        : 'border-black/10 bg-white hover:bg-neutral-50'
                    }`}
                    onClick={() => setSelectedThemeValue(themeValue(theme))}
                    disabled={busy}
                  >
                    <span className="font-montserrat block font-bold text-neutral-950">
                      {theme.display_name}
                    </span>
                    <span className="mt-1 block text-xs font-semibold uppercase text-neutral-500">
                      {themeDescription(theme)} /{' '}
                      {dateInputValue(theme.start_date)}
                    </span>
                  </button>
                ))}
              </div>

              {draft && selectedTheme ? (
                <div className="grid gap-5 border-t border-black/10 pt-4">
                  <h3 className="font-montserrat text-lg font-bold text-neutral-950">
                    Theme details
                  </h3>
                  <Field label="Display name">
                    <Input
                      value={draft.display_name}
                      onChange={(event) =>
                        updateDraftField('display_name', event.target.value)
                      }
                      disabled={busy}
                    />
                  </Field>
                  <Field label="Description">
                    <textarea
                      value={draft.description}
                      onChange={(event) =>
                        updateDraftField('description', event.target.value)
                      }
                      disabled={busy}
                      className="border-input bg-background focus-visible:ring-ring min-h-28 w-full rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </Field>
                  <Field label="Start date">
                    <span className="relative block">
                      <CalendarDays
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
                      />
                      <Input
                        type="date"
                        value={draft.start_date}
                        onChange={(event) =>
                          updateDraftField('start_date', event.target.value)
                        }
                        disabled={busy}
                        className="pl-9"
                      />
                    </span>
                  </Field>

                  <section className="grid gap-3 border-t border-black/10 pt-4">
                    <h3 className="font-montserrat text-lg font-bold text-neutral-950">
                      Featured pages
                    </h3>
                    <FuzzyTextDropdown
                      label="Page"
                      options={pageOptions}
                      placeholder="Search"
                      selectedValue={selectedPage}
                      onSelect={handlePageSelect}
                      disabled={busy}
                    />
                    <div className="flex flex-wrap gap-2">
                      {draft.featured_on.map((page) => (
                        <button
                          key={page}
                          type="button"
                          className="flex items-center gap-2 rounded-full border border-black/10 bg-neutral-50 px-3 py-1.5 text-sm font-semibold text-neutral-700"
                          onClick={() => removeFeaturedPage(page)}
                          disabled={busy}
                        >
                          {page}
                          <X aria-hidden="true" className="h-3.5 w-3.5" />
                        </button>
                      ))}
                    </div>
                  </section>

                  <div>
                    <Button
                      type="button"
                      onClick={() => void saveTheme()}
                      disabled={busy}
                    >
                      <Save aria-hidden="true" />
                      {busy ? 'Saving theme...' : 'Save theme'}
                    </Button>
                  </div>
                </div>
              ) : (
                <ModuleState>Select a theme to edit.</ModuleState>
              )}
            </>
          )}
        </div>
      </DashboardModule>

      <CreateThemePanel />
    </div>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-neutral-700">
        {label}
      </span>
      {children}
    </label>
  );
}
