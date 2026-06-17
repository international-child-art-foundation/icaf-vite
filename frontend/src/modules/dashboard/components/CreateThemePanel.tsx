import type { ReactNode } from 'react';
import { useState } from 'react';
import { CalendarDays, PlusCircle } from 'lucide-react';
import { createTheme } from '@/api/contributor';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { DashboardModule, ModuleState } from './DashboardModule';

type ThemeDraft = {
  description: string;
  featuredGallery: boolean;
  kind: 'family' | 'instance';
  instance_type: string;
  retired_at: string;
  start_date: string;
  theme_family: string;
  theme_instance: string;
};

const today = new Date().toISOString().slice(0, 10);

const initialDraft: ThemeDraft = {
  description: '',
  featuredGallery: true,
  kind: 'family',
  instance_type: 'year',
  retired_at: '',
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
  return value.trim();
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
    const instance_type = draft.instance_type.trim().toLowerCase();
    const theme_instance = normalizeInstance(draft.theme_instance);
    const start_date = dateToTimestamp(draft.start_date);
    const retired_at = draft.retired_at
      ? dateToTimestamp(draft.retired_at)
      : undefined;

    const validationError =
      !theme_family
        ? 'Theme collection is required.'
        : draft.kind === 'instance' && !instance_type
          ? 'Instance type is required.'
          : draft.kind === 'instance' && !theme_instance
            ? 'Theme instance is required.'
            : !Number.isFinite(start_date)
              ? 'Start date is required.'
              : retired_at !== undefined && !Number.isFinite(retired_at)
                ? 'Retired date is invalid.'
                : null;
    if (validationError) {
      setBusy(false);
      setError(validationError);
      return;
    }

    const baseTheme = {
      featured_on: draft.featuredGallery ? ['gallery'] : [],
      description: draft.description.trim() || undefined,
      start_date,
      ...(retired_at !== undefined && { retired_at }),
      theme_family,
    };
    const request =
      draft.kind === 'instance'
        ? {
            ...baseTheme,
            instance_type,
            theme_instance,
          }
        : baseTheme;

    void createTheme(request)
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
          <Field label="Theme type">
            <select
              value={draft.kind}
              onChange={(event) =>
                updateDraft('kind', event.target.value as ThemeDraft['kind'])
              }
              disabled={busy}
              className="border-input bg-background h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="family">Family</option>
              <option value="instance">Instance</option>
            </select>
          </Field>
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
            {draft.kind === 'instance' && (
              <Field label="Instance type">
                <Input
                  value={draft.instance_type}
                  placeholder="year"
                  onBlur={() =>
                    updateDraft(
                      'instance_type',
                      draft.instance_type.trim().toLowerCase(),
                    )
                  }
                  onChange={(event) =>
                    updateDraft('instance_type', event.target.value)
                  }
                  disabled={busy}
                />
              </Field>
            )}
          </div>
          {draft.kind === 'instance' && (
            <Field label="Theme instance">
              <Input
                value={draft.theme_instance}
                placeholder="2026"
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
          )}
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
          <Field label="Retired date">
            <span className="relative block">
              <CalendarDays
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
              />
              <Input
                type="date"
                value={draft.retired_at}
                onChange={(event) =>
                  updateDraft('retired_at', event.target.value)
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
