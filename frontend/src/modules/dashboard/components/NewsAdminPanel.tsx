import type { ChangeEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type {
  BulkCreateNewsItem,
  CreateNewsRequest,
  NewsListItem,
  UpdateNewsRequest,
} from '@icaf/shared';
import {
  bulkCreateNews,
  createNews,
  deleteNews,
  updateNews,
} from '@/api/admin';
import { listNews } from '@/api/public';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { NewsItem } from '@/modules/content/components/news/NewsItem';
import { DashboardModule, ModuleState } from './DashboardModule';

type NewsDraft = {
  body: string;
  date: string;
  kind: 'article' | 'audio';
  link: string;
  place: string;
  source: string;
  src: string;
  timestamp: string;
};

type PendingAction =
  | { type: 'create' }
  | { type: 'update' }
  | { type: 'delete' }
  | { type: 'bulk' }
  | null;

const emptyDraft: NewsDraft = {
  body: '',
  date: '',
  kind: 'article',
  link: '',
  place: '',
  source: '',
  src: '',
  timestamp: '',
};

function timestampFromDate(date: string): number {
  const parsed = Date.parse(date);
  if (!Number.isNaN(parsed)) return Math.floor(parsed / 1000);
  return Math.floor(Date.now() / 1000);
}

function toDraft(item: NewsListItem): NewsDraft {
  return {
    body: item.body ?? '',
    date: item.date ?? '',
    kind: item.kind ?? 'article',
    link: item.link ?? '',
    place: item.place ?? '',
    source: item.source ?? '',
    src: item.src ?? '',
    timestamp: String(item.timestamp),
  };
}

function hasDraftContent(draft: NewsDraft): boolean {
  return [
    draft.body,
    draft.date,
    draft.link,
    draft.place,
    draft.source,
    draft.src,
    draft.timestamp,
  ].some((value) => value.trim());
}

function draftToCreateRequest(draft: NewsDraft): CreateNewsRequest | null {
  if (!hasDraftContent(draft)) return null;

  const source = draft.source.trim();
  if (!source) {
    throw new Error('Source is required before saving a news item.');
  }

  const timestampText = draft.timestamp.trim();
  const timestamp = timestampText
    ? Number(timestampText)
    : timestampFromDate(draft.date);

  if (!Number.isInteger(timestamp) || timestamp < 0) {
    throw new Error('Timestamp must be a non-negative integer.');
  }

  return {
    source,
    timestamp,
    ...(draft.body.trim() ? { body: draft.body.trim() } : {}),
    ...(draft.date.trim() ? { date: draft.date.trim() } : {}),
    ...(draft.kind !== 'article' ? { kind: draft.kind } : {}),
    ...(draft.link.trim() ? { link: draft.link.trim() } : {}),
    ...(draft.place.trim() ? { place: draft.place.trim() } : {}),
    ...(draft.src.trim() ? { src: draft.src.trim() } : {}),
  };
}

function draftToUpdateRequest(draft: NewsDraft): UpdateNewsRequest {
  const request = draftToCreateRequest(draft);
  if (!request) {
    throw new Error('Selected news item cannot be empty.');
  }
  return request;
}

function extractBulkItems(raw: unknown): BulkCreateNewsItem[] {
  if (Array.isArray(raw)) return raw as BulkCreateNewsItem[];
  if (
    raw &&
    typeof raw === 'object' &&
    'news' in raw &&
    Array.isArray((raw as { news?: unknown }).news)
  ) {
    return (raw as { news: BulkCreateNewsItem[] }).news;
  }
  throw new Error(
    'JSON must be an array of news items or an object with a news array.',
  );
}

export function NewsAdminPanel() {
  const [news, setNews] = useState<NewsListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [edits, setEdits] = useState<NewsDraft>(emptyDraft);
  const [newItem, setNewItem] = useState<NewsDraft>(emptyDraft);
  const [bulkItems, setBulkItems] = useState<BulkCreateNewsItem[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectedItem = useMemo(
    () => news.find((item) => item.news_id === selectedId) ?? null,
    [news, selectedId],
  );

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listNews({ limit: 100 });
      setNews(response.news);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load news.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNews();
  }, []);

  useEffect(() => {
    if (selectedItem) setEdits(toDraft(selectedItem));
  }, [selectedItem]);

  const updateDraft = (
    setter: (value: NewsDraft) => void,
    draft: NewsDraft,
    field: keyof NewsDraft,
    value: string,
  ) => {
    setter({ ...draft, [field]: value });
  };

  const processBulkFile = async (file: File, input: HTMLInputElement) => {
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const items = extractBulkItems(parsed);
      if (items.length === 0) {
        setMessage('No news items were found in that file.');
        return;
      }
      setBulkItems(items);
      setMessage(
        `${items.length} news item${items.length === 1 ? '' : 's'} ready to upload.`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to read that JSON file.',
      );
    } finally {
      input.value = '';
    }
  };

  const onBulkFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    setPendingAction(null);
    setMessage(null);
    setError(null);
    setBulkItems([]);

    if (!file) return;

    void processBulkFile(file, input);
  };

  const runPendingAction = async () => {
    if (!pendingAction) return;

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (pendingAction.type === 'create') {
        const request = draftToCreateRequest(newItem);
        if (!request) {
          setMessage('Empty news item was not uploaded.');
          return;
        }
        await createNews(request);
        setNewItem(emptyDraft);
        setMessage('News item created.');
      } else if (pendingAction.type === 'update') {
        if (!selectedItem)
          throw new Error('Select a news item before updating.');
        await updateNews(selectedItem.news_id, draftToUpdateRequest(edits));
        setMessage('News item updated.');
      } else if (pendingAction.type === 'delete') {
        if (!selectedItem)
          throw new Error('Select a news item before deleting.');
        await deleteNews(selectedItem.news_id);
        setSelectedId(null);
        setMessage('News item deleted.');
      } else if (pendingAction.type === 'bulk') {
        if (bulkItems.length === 0) {
          setMessage('No bulk news items were uploaded.');
          return;
        }
        const response = await bulkCreateNews(bulkItems);
        setBulkItems([]);
        setMessage(
          `${response.count} news item${response.count === 1 ? '' : 's'} uploaded.`,
        );
      }

      await loadNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'News update failed.');
    } finally {
      setBusy(false);
      setPendingAction(null);
    }
  };

  const handleRefreshClick = () => {
    void loadNews();
  };

  const handleConfirmClick = () => {
    void runPendingAction();
  };

  return (
    <DashboardModule
      title="News admin"
      description="Add, import, select, and update the news items shown on the public news page."
      aside={
        <Button
          type="button"
          variant="outline"
          onClick={handleRefreshClick}
          disabled={busy}
        >
          Refresh
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-4">
          {error && <ModuleState tone="error">{error}</ModuleState>}
          {message && <ModuleState tone="success">{message}</ModuleState>}
          {loading ? (
            <ModuleState>Loading news items...</ModuleState>
          ) : news.length === 0 ? (
            <ModuleState>No news items found.</ModuleState>
          ) : (
            <div className="flex flex-col gap-3">
              {news.map((item, index) => {
                const selected = item.news_id === selectedId;
                return (
                  <div
                    key={item.news_id}
                    className={`block rounded-lg border p-3 transition ${
                      selected
                        ? 'border-primary bg-primary/5'
                        : 'border-black/10 bg-white hover:border-black/30'
                    }`}
                  >
                    <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700">
                      <input
                        type="radio"
                        name="selected-news"
                        aria-label={`Select ${
                          item.body || item.source || 'news item'
                        }`}
                        checked={selected}
                        onChange={() => setSelectedId(item.news_id)}
                      />
                      Select for editing
                    </span>
                    <NewsItem newsItem={item} idx={index} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Panel title="Selected item">
            {selectedItem ? (
              <>
                <NewsFields
                  draft={edits}
                  disabled={busy}
                  onChange={(field, value) =>
                    updateDraft(setEdits, edits, field, value)
                  }
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => setPendingAction({ type: 'update' })}
                    disabled={busy}
                  >
                    Save selected
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setPendingAction({ type: 'delete' })}
                    disabled={busy}
                  >
                    Delete selected
                  </Button>
                </div>
              </>
            ) : (
              <ModuleState>Select one news item before editing.</ModuleState>
            )}
          </Panel>

          <Panel title="Add one news item">
            <NewsFields
              draft={newItem}
              disabled={busy}
              onChange={(field, value) =>
                updateDraft(setNewItem, newItem, field, value)
              }
            />
            <Button
              type="button"
              className="mt-4"
              onClick={() => setPendingAction({ type: 'create' })}
              disabled={busy || !hasDraftContent(newItem)}
            >
              Add news item
            </Button>
          </Panel>

          <Panel title="Bulk upload JSON">
            <Input
              type="file"
              accept="application/json,.json"
              onChange={onBulkFileChange}
              disabled={busy}
            />
            {bulkItems.length > 0 && (
              <div className="mt-3 rounded-md border border-black/10 bg-neutral-50 p-3 text-sm text-neutral-700">
                {bulkItems.length} item{bulkItems.length === 1 ? '' : 's'}{' '}
                parsed.
              </div>
            )}
            <Button
              type="button"
              className="mt-4"
              onClick={() => setPendingAction({ type: 'bulk' })}
              disabled={busy || bulkItems.length === 0}
            >
              Upload JSON items
            </Button>
          </Panel>

          {pendingAction && (
            <div className="border-primary/20 bg-primary/5 rounded-lg border p-4">
              <p className="text-sm font-semibold text-neutral-950">
                Confirm {pendingAction.type} action
              </p>
              <p className="mt-1 text-sm leading-6 text-neutral-700">
                This will write to the live news database.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={handleConfirmClick}
                  disabled={busy}
                >
                  Confirm
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPendingAction(null)}
                  disabled={busy}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardModule>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-black/10 pt-4 first:border-t-0 first:pt-0">
      <h3 className="font-montserrat text-lg font-bold text-neutral-950">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function NewsFields({
  disabled,
  draft,
  onChange,
}: {
  disabled: boolean;
  draft: NewsDraft;
  onChange: (field: keyof NewsDraft, value: string) => void;
}) {
  return (
    <div className="grid gap-3">
      <Field label="Source">
        <Input
          value={draft.source}
          onChange={(event) => onChange('source', event.target.value)}
          disabled={disabled}
        />
      </Field>
      <Field label="Body">
        <textarea
          value={draft.body}
          onChange={(event) => onChange('body', event.target.value)}
          disabled={disabled}
          className="border-input bg-background focus-visible:ring-ring min-h-24 w-full rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </Field>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Place">
          <Input
            value={draft.place}
            onChange={(event) => onChange('place', event.target.value)}
            disabled={disabled}
          />
        </Field>
        <Field label="Date">
          <Input
            value={draft.date}
            onChange={(event) => onChange('date', event.target.value)}
            disabled={disabled}
          />
        </Field>
      </div>
      <Field label="Link">
        <Input
          value={draft.link}
          onChange={(event) => onChange('link', event.target.value)}
          disabled={disabled}
        />
      </Field>
      <Field label="Audio source">
        <Input
          value={draft.src}
          onChange={(event) => onChange('src', event.target.value)}
          disabled={disabled}
        />
      </Field>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Kind">
          <select
            value={draft.kind}
            onChange={(event) => onChange('kind', event.target.value)}
            disabled={disabled}
            className="border-input bg-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="article">Article</option>
            <option value="audio">Audio</option>
          </select>
        </Field>
        <Field label="Timestamp">
          <Input
            value={draft.timestamp}
            onChange={(event) => onChange('timestamp', event.target.value)}
            disabled={disabled}
            inputMode="numeric"
          />
        </Field>
      </div>
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
