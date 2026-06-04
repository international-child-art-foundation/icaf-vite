import type { ChangeEvent, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type {
  BulkCreateNewsItem,
  CreateNewsRequest,
  NewsKind,
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
  kind: NewsKind | '';
  link: string;
  place: string;
  source: string;
  src: string;
  ts: string;
};

type PendingAction =
  | { type: 'create' }
  | { type: 'update'; newsId: string }
  | { type: 'delete'; newsId: string }
  | { type: 'bulk' }
  | null;

const emptyDraft: NewsDraft = {
  body: '',
  date: '',
  kind: '',
  link: '',
  place: '',
  source: '',
  src: '',
  ts: '',
};

function tsFromDate(date: string): number {
  const parsed = Date.parse(date);
  if (!Number.isNaN(parsed)) return Math.floor(parsed / 1000);
  return Math.floor(Date.now() / 1000);
}

function toDraft(item: NewsListItem): NewsDraft {
  return {
    body: item.body ?? '',
    date: item.date ?? '',
    kind: item.kind ?? '',
    link: item.link ?? '',
    place: item.place ?? '',
    source: item.source ?? '',
    src: item.src ?? '',
    ts: String(item.ts),
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
    draft.ts,
  ].some((value) => value.trim());
}

function draftToCreateRequest(draft: NewsDraft): CreateNewsRequest | null {
  if (!hasDraftContent(draft)) return null;

  const source = draft.source.trim();
  if (!source) {
    throw new Error('Source is required before saving a news item.');
  }

  const tsText = draft.ts.trim();
  const ts = tsText
    ? Number(tsText)
    : tsFromDate(draft.date);

  if (!Number.isInteger(ts) || ts < 0) {
    throw new Error('ts must be a non-negative integer.');
  }

  return {
    source,
    ts,
    ...(draft.body.trim() ? { body: draft.body.trim() } : {}),
    ...(draft.date.trim() ? { date: draft.date.trim() } : {}),
    ...(draft.kind && draft.kind !== 'article' ? { kind: draft.kind } : {}),
    ...(draft.link.trim() ? { link: draft.link.trim() } : {}),
    ...(draft.place.trim() ? { place: draft.place.trim() } : {}),
    ...(draft.src.trim() ? { src: draft.src.trim() } : {}),
  };
}

function draftToUpdateRequest(
  draft: NewsDraft,
  original: NewsListItem,
): UpdateNewsRequest {
  const source = draft.source.trim() || original.source;
  const tsText = draft.ts.trim();
  const ts = tsText ? Number(tsText) : original.ts;

  if (!source) {
    throw new Error('Source is required before saving a news item.');
  }

  if (!Number.isInteger(ts) || ts < 0) {
    throw new Error('ts must be a non-negative integer.');
  }

  return {
    source,
    ts,
    body: draft.body.trim() || original.body,
    date: draft.date.trim() || original.date,
    kind: draft.kind || original.kind,
    link: draft.link.trim() || original.link,
    place: draft.place.trim() || original.place,
    src: draft.src.trim() || original.src,
  };
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edits, setEdits] = useState<NewsDraft>(emptyDraft);
  const [newItem, setNewItem] = useState<NewsDraft>(emptyDraft);
  const [bulkItems, setBulkItems] = useState<BulkCreateNewsItem[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

  const updateDraft = (
    setter: (value: NewsDraft) => void,
    draft: NewsDraft,
    field: keyof NewsDraft,
    value: string,
  ) => {
    setter({ ...draft, [field]: value });
  };

  const beginEditing = (item: NewsListItem) => {
    setEditingId(item.news_id);
    setEdits(emptyDraft);
    setPendingAction(null);
    setMessage(null);
    setError(null);
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
        const item = news.find(
          (newsItem) => newsItem.news_id === pendingAction.newsId,
        );
        if (!item) throw new Error('Select a news item before updating.');
        await updateNews(item.news_id, draftToUpdateRequest(edits, item));
        setMessage('News item updated.');
      } else if (pendingAction.type === 'delete') {
        await deleteNews(pendingAction.newsId);
        setEditingId(null);
        setEdits(emptyDraft);
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
      if (pendingAction.type === 'update') {
        setEditingId(null);
        setEdits(emptyDraft);
      }
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
            <div className="">
              {news.map((item, index) => {
                const editing = item.news_id === editingId;
                return (
                  <div key={item.news_id}>
                    {editing ? (
                      <InlineNewsEditor
                        busy={busy}
                        draft={edits}
                        item={item}
                        onCancel={() => {
                          setEditingId(null);
                          setEdits(emptyDraft);
                          setPendingAction(null);
                        }}
                        onCancelConfirm={() => setPendingAction(null)}
                        onChange={(field, value) =>
                          updateDraft(setEdits, edits, field, value)
                        }
                        onDelete={() =>
                          setPendingAction({
                            type: 'delete',
                            newsId: item.news_id,
                          })
                        }
                        onSave={() =>
                          setPendingAction({
                            type: 'update',
                            newsId: item.news_id,
                          })
                        }
                        onConfirm={handleConfirmClick}
                        pendingAction={pendingAction}
                      />
                    ) : (
                      <div
                        role="button"
                        tabIndex={0}
                        className="flex flex-col"
                        onClickCapture={(event) => {
                          event.preventDefault();
                          beginEditing(item);
                        }}
                      >
                        <NewsItem newsItem={item} idx={index} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-5">
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

          {pendingAction &&
            (pendingAction.type === 'create' ||
              pendingAction.type === 'bulk') && (
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

function InlineNewsEditor({
  busy,
  draft,
  item,
  onCancel,
  onCancelConfirm,
  onChange,
  onConfirm,
  onDelete,
  onSave,
  pendingAction,
}: {
  busy: boolean;
  draft: NewsDraft;
  item: NewsListItem;
  onCancel: () => void;
  onCancelConfirm: () => void;
  onChange: (field: keyof NewsDraft, value: string) => void;
  onConfirm: () => void;
  onDelete: () => void;
  onSave: () => void;
  pendingAction: PendingAction;
}) {
  const placeholders = toDraft(item);
  const confirmingAction =
    pendingAction?.type === 'update' || pendingAction?.type === 'delete'
      ? pendingAction.newsId === item.news_id
        ? pendingAction
        : null
      : null;

  return (
    <section className="border-primary/20 rounded-md border bg-white p-4 shadow-sm">
      <NewsFields
        draft={draft}
        disabled={busy}
        onChange={onChange}
        placeholders={placeholders}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={onSave} disabled={busy}>
          Save
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onDelete}
          disabled={busy}
        >
          Delete
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={busy}
        >
          Cancel
        </Button>
      </div>
      {confirmingAction && (
        <div className="border-primary/20 bg-primary/5 mt-4 rounded-md border p-3">
          <p className="text-sm font-semibold text-neutral-950">
            Confirm {confirmingAction.type}
          </p>
          <p className="mt-1 text-sm leading-6 text-neutral-700">
            This will write to the live news database.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" onClick={onConfirm} disabled={busy}>
              Confirm
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancelConfirm}
              disabled={busy}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function NewsFields({
  disabled,
  draft,
  onChange,
  placeholders,
}: {
  disabled: boolean;
  draft: NewsDraft;
  onChange: (field: keyof NewsDraft, value: string) => void;
  placeholders?: NewsDraft;
}) {
  return (
    <div className="grid gap-3">
      <Field label="Source">
        <Input
          value={draft.source}
          placeholder={placeholders?.source}
          onChange={(event) => onChange('source', event.target.value)}
          disabled={disabled}
        />
      </Field>
      <Field label="Body">
        <textarea
          value={draft.body}
          placeholder={placeholders?.body}
          onChange={(event) => onChange('body', event.target.value)}
          disabled={disabled}
          className="border-input bg-background focus-visible:ring-ring min-h-24 w-full rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </Field>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Place">
          <Input
            value={draft.place}
            placeholder={placeholders?.place}
            onChange={(event) => onChange('place', event.target.value)}
            disabled={disabled}
          />
        </Field>
        <Field label="Date">
          <Input
            value={draft.date}
            placeholder={placeholders?.date}
            onChange={(event) => onChange('date', event.target.value)}
            disabled={disabled}
          />
        </Field>
      </div>
      <Field label="Link">
        <Input
          value={draft.link}
          placeholder={placeholders?.link}
          onChange={(event) => onChange('link', event.target.value)}
          disabled={disabled}
        />
      </Field>
      <Field label="Audio source">
        <Input
          value={draft.src}
          placeholder={placeholders?.src}
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
            <option value="">
              {placeholders?.kind ? `Keep ${placeholders.kind}` : 'Article'}
            </option>
            <option value="article">Article</option>
            <option value="audio">Audio</option>
          </select>
        </Field>
        <Field label="Unix ts">
          <Input
            value={draft.ts}
            placeholder={placeholders?.ts}
            onChange={(event) => onChange('ts', event.target.value)}
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
