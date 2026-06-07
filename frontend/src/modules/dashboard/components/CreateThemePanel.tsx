import type { ReactNode } from 'react';
import { useState } from 'react';
import { CalendarDays, PlusCircle } from 'lucide-react';
import { createTheme } from '@/api/contributor';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { DashboardModule, ModuleState } from './DashboardModule';

type ThemeDraft = {
  description: string;
  display_name: string;
  featuredGallery: boolean;
  start_date: string;
  theme_family: string;
  theme_instance: string;
};

const today = new Date().toISOString().slice(0, 10);

const initialDraft: ThemeDraft = {
  description: '',
  display_name: '',
  featuredGallery: true,
  start_date: today,
  theme_family: '',
  theme_instance: '',
};

function normalizeFamily(value: string) {
  return value
    .trim()
    .replace(/[^a-z0-9_]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toUpperCase();
}

function normalizeInstance(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits ? digits.padStart(4, '0') : '';
}

function dateToTimestamp(value: string) {
  return new Date(`${value}T00:00:00`).getTime();
}

export function CreateThemePanel() {
  const [draft, setDraft] = useState(initialDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const updateDraft = <Key extends keyof ThemeDraft>(
    field: Key,
    value: ThemeDraft[Key],
  ) => setDraft((current) => ({ ...current, [field]: value }));

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    const theme_family = normalizeFamily(draft.theme_family);
    const theme_instance = normalizeInstance(draft.theme_instance);
    const start_date = dateToTimestamp(draft.start_date);

    if (!theme_family) throw new Error('Theme collection is required.');
    if (!theme_instance) throw new Error('Theme year is required.');
    if (!draft.display_name.trim())
      throw new Error('Display name is required.');
    if (!Number.isFinite(start_date))
      throw new Error('Start date is required.');

    void createTheme({
      display_name: draft.display_name.trim(),
      featured_on: draft.featuredGallery ? ['gallery'] : [],
      description: draft.description.trim() || undefined,
      start_date,
      theme_family,
      theme_instance,
    })
      .then((response) => {
        setMessage(response.message);
        setDraft(initialDraft);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Theme creation failed.');
      })
      .finally(() => {
        setBusy(false);
      });
  }

  return (
    <DashboardModule
      title="Create theme"
      description="Create theme identity and timing metadata. Visual design is handled in frontend theme animation modules."
    >
      <form className="grid gap-5" onSubmit={handleSubmit}>
        {error && <ModuleState tone="error">{error}</ModuleState>}
        {message && <ModuleState tone="success">{message}</ModuleState>}

        <section className="grid gap-4 border-t border-black/10 pt-4 first:border-t-0 first:pt-0">
          <h3 className="font-montserrat text-lg font-bold text-neutral-950">
            Theme details
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Theme collection">
              <Input
                value={draft.theme_family}
                placeholder="CHERRY_BLOSSOM"
                onBlur={() =>
                  updateDraft(
                    'theme_family',
                    normalizeFamily(draft.theme_family),
                  )
                }
                onChange={(event) =>
                  updateDraft('theme_family', event.target.value)
                }
                disabled={busy}
              />
            </Field>
            <Field label="Theme year">
              <Input
                value={draft.theme_instance}
                placeholder="2026"
                inputMode="numeric"
                onBlur={() =>
                  updateDraft(
                    'theme_instance',
                    normalizeInstance(draft.theme_instance),
                  )
                }
                onChange={(event) =>
                  updateDraft('theme_instance', event.target.value)
                }
                disabled={busy}
              />
            </Field>
          </div>
          <Field label="Display name">
            <Input
              value={draft.display_name}
              placeholder="Cherry Blossom 2026"
              onChange={(event) =>
                updateDraft('display_name', event.target.value)
              }
              disabled={busy}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={draft.description}
              onChange={(event) =>
                updateDraft('description', event.target.value)
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
                  updateDraft('start_date', event.target.value)
                }
                disabled={busy}
                className="pl-9"
              />
            </span>
          </Field>
          <label className="flex items-center gap-3 rounded-md bg-neutral-50 px-3 py-2 text-sm font-semibold text-neutral-700">
            <input
              checked={draft.featuredGallery}
              className="accent-primary h-4 w-4"
              type="checkbox"
              onChange={(event) =>
                updateDraft('featuredGallery', event.target.checked)
              }
              disabled={busy}
            />
            Feature in gallery theme list
          </label>
        </section>

        <div>
          <Button type="submit" disabled={busy}>
            <PlusCircle aria-hidden="true" />
            {busy ? 'Creating theme...' : 'Create theme'}
          </Button>
        </div>
      </form>
    </DashboardModule>
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
