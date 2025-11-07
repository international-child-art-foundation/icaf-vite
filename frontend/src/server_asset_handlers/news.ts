import { INewsItem } from '@/types/NewsTypes';
const NEWS_URL = '/data/newsData.json';

let _cache: INewsItem[] | null = null;

export async function getNews(): Promise<INewsItem[]> {
  if (_cache) return _cache;
  const res = await fetch(NEWS_URL, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(
      `Failed to load ${NEWS_URL}: ${res.status} ${res.statusText}`,
    );
  }
  const raw = (await res.json()) as INewsItem[];
  _cache = raw.map((m) => ({
    ...m,
  }));
  return _cache;
}
