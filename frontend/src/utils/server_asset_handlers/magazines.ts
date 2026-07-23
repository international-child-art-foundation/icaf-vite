import type { IMagazine } from '@/modules/content/types/Magazines';

const LEGACY_MAG_URL = '/data/childArtMagazineData.json';

let _cache: IMagazine[] | null = null;

function guessCoverFromLink(link: string) {
  const clean = link.replace(/\/+$/, '');
  if (clean.toLowerCase().endsWith('.pdf')) {
    const lastSlash = clean.lastIndexOf('/');
    if (lastSlash > 0) {
      return clean.slice(0, lastSlash) + '/cover.webp';
    }
    return '/cover.webp';
  }
  return clean + '/cover.webp';
}

async function readJsonArray<T>(url: string): Promise<T[]> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load ${url}: ${res.status} ${res.statusText}`);
  }
  const raw = (await res.json()) as unknown;
  return Array.isArray(raw) ? (raw as T[]) : [];
}

async function loadLegacyMagazines(): Promise<IMagazine[]> {
  const raw = await readJsonArray<IMagazine>(LEGACY_MAG_URL);
  return raw.map((m) => ({
    ...m,
    cover: m.cover ?? guessCoverFromLink(m.link),
  }));
}

export async function getMagazines(): Promise<IMagazine[]> {
  if (_cache) return _cache;

  try {
    _cache = await loadLegacyMagazines();
    return _cache;
  } catch (err) {
    console.error(err);
    _cache = [];
    return _cache;
  }
}
