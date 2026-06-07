import type { FormEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import type { ThemeColors } from '@icaf/shared';
import { ImageIcon, Palette, PlusCircle } from 'lucide-react';
import { createTheme } from '@/api/contributor';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { DashboardModule, ModuleState } from './DashboardModule';

type ThemeDraft = {
  accent: string;
  background: string;
  description: string;
  display_name: string;
  f_img_url: string;
  featuredGallery: boolean;
  i_img_url: string;
  primary: string;
  secondary: string;
  text: string;
  theme_family: string;
  theme_instance: string;
};

const initialDraft: ThemeDraft = {
  accent: '#f4c542',
  background: '#ffffff',
  description: '',
  display_name: '',
  f_img_url: '',
  featuredGallery: true,
  i_img_url: '',
  primary: '#0286c3',
  secondary: '#202020',
  text: '#111827',
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

function colorFields(draft: ThemeDraft): ThemeColors {
  return {
    accent: draft.accent,
    background: draft.background,
    primary: draft.primary,
    secondary: draft.secondary,
    text: draft.text,
  };
}

export function CreateThemePanel() {
  const [draft, setDraft] = useState(initialDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const previewStyle = useMemo(
    () => ({
      backgroundColor: draft.background,
      backgroundImage: draft.f_img_url
        ? `linear-gradient(90deg, ${draft.primary}dd, ${draft.secondary}aa), url(${draft.f_img_url})`
        : `linear-gradient(135deg, ${draft.primary}, ${draft.secondary})`,
      color: draft.text,
    }),
    [draft.background, draft.f_img_url, draft.primary, draft.secondary, draft.text],
  );

  const updateDraft = <Key extends keyof ThemeDraft>(
    field: Key,
    value: ThemeDraft[Key],
  ) => setDraft((current) => ({ ...current, [field]: value }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const theme_family = normalizeFamily(draft.theme_family);
      const theme_instance = normalizeInstance(draft.theme_instance);

      if (!theme_family) throw new Error('Theme family is required.');
      if (!theme_instance) throw new Error('Theme instance is required.');
      if (!draft.display_name.trim()) throw new Error('Display name is required.');
      if (!draft.f_img_url.trim()) throw new Error('Family image URL is required.');

      const response = await createTheme({
        colors: colorFields(draft),
        display_name: draft.display_name.trim(),
        featured_on: draft.featuredGallery ? ['gallery'] : [],
        f_img_url: draft.f_img_url.trim(),
        i_img_url: draft.i_img_url.trim() || undefined,
        description: draft.description.trim() || undefined,
        theme_family,
        theme_instance,
      });

      setMessage(response.message);
      setDraft(initialDraft);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Theme creation failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardModule
      title="Create theme"
      description="Create a gallery theme with image and color metadata."
    >
      <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]" onSubmit={handleSubmit}>
        <div className="grid gap-5">
          {error && <ModuleState tone="error">{error}</ModuleState>}
          {message && <ModuleState tone="success">{message}</ModuleState>}

          <section className="grid gap-4 border-t border-black/10 pt-4 first:border-t-0 first:pt-0">
            <h3 className="font-montserrat text-lg font-bold text-neutral-950">
              Theme details
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Theme family">
                <Input
                  value={draft.theme_family}
                  placeholder="CHERRY_BLOSSOM"
                  onBlur={() => updateDraft('theme_family', normalizeFamily(draft.theme_family))}
                  onChange={(event) => updateDraft('theme_family', event.target.value)}
                  disabled={busy}
                />
              </Field>
              <Field label="Theme instance">
                <Input
                  value={draft.theme_instance}
                  placeholder="2026"
                  inputMode="numeric"
                  onBlur={() => updateDraft('theme_instance', normalizeInstance(draft.theme_instance))}
                  onChange={(event) => updateDraft('theme_instance', event.target.value)}
                  disabled={busy}
                />
              </Field>
            </div>
            <Field label="Display name">
              <Input
                value={draft.display_name}
                placeholder="Cherry Blossom 2026"
                onChange={(event) => updateDraft('display_name', event.target.value)}
                disabled={busy}
              />
            </Field>
            <Field label="Description">
              <textarea
                value={draft.description}
                onChange={(event) => updateDraft('description', event.target.value)}
                disabled={busy}
                className="border-input bg-background focus-visible:ring-ring min-h-28 w-full rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </Field>
            <label className="flex items-center gap-3 rounded-md bg-neutral-50 px-3 py-2 text-sm font-semibold text-neutral-700">
              <input
                checked={draft.featuredGallery}
                className="accent-primary h-4 w-4"
                type="checkbox"
                onChange={(event) => updateDraft('featuredGallery', event.target.checked)}
                disabled={busy}
              />
              Feature in gallery theme list
            </label>
          </section>

          <section className="grid gap-4 border-t border-black/10 pt-4">
            <h3 className="font-montserrat flex items-center gap-2 text-lg font-bold text-neutral-950">
              <ImageIcon aria-hidden="true" className="h-5 w-5" />
              Images
            </h3>
            <Field label="Family image URL">
              <Input
                value={draft.f_img_url}
                placeholder="https://..."
                onChange={(event) => updateDraft('f_img_url', event.target.value)}
                disabled={busy}
              />
            </Field>
            <Field label="Instance image URL">
              <Input
                value={draft.i_img_url}
                placeholder="https://..."
                onChange={(event) => updateDraft('i_img_url', event.target.value)}
                disabled={busy}
              />
            </Field>
          </section>

          <section className="grid gap-4 border-t border-black/10 pt-4">
            <h3 className="font-montserrat flex items-center gap-2 text-lg font-bold text-neutral-950">
              <Palette aria-hidden="true" className="h-5 w-5" />
              Colors
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ColorField label="Primary" value={draft.primary} onChange={(value) => updateDraft('primary', value)} disabled={busy} />
              <ColorField label="Secondary" value={draft.secondary} onChange={(value) => updateDraft('secondary', value)} disabled={busy} />
              <ColorField label="Accent" value={draft.accent} onChange={(value) => updateDraft('accent', value)} disabled={busy} />
              <ColorField label="Background" value={draft.background} onChange={(value) => updateDraft('background', value)} disabled={busy} />
              <ColorField label="Text" value={draft.text} onChange={(value) => updateDraft('text', value)} disabled={busy} />
            </div>
          </section>

          <div>
            <Button type="submit" disabled={busy}>
              <PlusCircle aria-hidden="true" />
              {busy ? 'Creating theme...' : 'Create theme'}
            </Button>
          </div>
        </div>

        <aside className="min-w-0">
          <div className="sticky top-28 overflow-hidden rounded-md border border-black/10 bg-white shadow-sm">
            <div className="aspect-[4/3] bg-cover bg-center p-5" style={previewStyle}>
              <div className="flex h-full flex-col justify-end">
                <p className="text-xs font-bold uppercase">
                  {normalizeFamily(draft.theme_family) || 'THEME'}
                </p>
                <h3 className="font-montserrat mt-1 text-2xl font-bold">
                  {draft.display_name || 'Theme preview'}
                </h3>
                {draft.description && (
                  <p className="mt-2 max-h-16 overflow-hidden text-sm leading-5">
                    {draft.description}
                  </p>
                )}
              </div>
            </div>
            {draft.i_img_url && (
              <img
                alt=""
                className="h-28 w-full object-cover"
                src={draft.i_img_url}
              />
            )}
          </div>
        </aside>
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

function ColorField({
  disabled,
  label,
  onChange,
  value,
}: {
  disabled: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-neutral-700">
      <span>{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="h-10 w-12 rounded-md border border-black/10 bg-white p-1 disabled:opacity-50"
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="font-mono text-sm"
        />
      </span>
    </label>
  );
}
