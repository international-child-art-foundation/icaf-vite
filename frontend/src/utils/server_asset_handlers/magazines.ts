import type { IMagazine } from '@/modules/content/types/Magazines';
import { listMagazines } from '@/api/public';
import { childArtMagazineHints } from '@/modules/content/data/childArtMagazineHints';

const LEGACY_MAG_URL = '/data/childArtMagazineData.json';

let _cache: IMagazine[] | null = null;

type MagazineHint = Partial<IMagazine> & {
  slug?: string;
};

function slugFromLink(link: string): string | null {
  const clean = link.replace(/\/+$/, '');
  const lastSlash = clean.lastIndexOf('/');
  if (lastSlash < 0 || lastSlash === clean.length - 1) return null;
  return decodeURIComponent(clean.slice(lastSlash + 1));
}

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

function linkFromApiMagazine(magazine: { link_url?: string; thumbnail_url: string; slug: string }): string {
  if (magazine.link_url) return magazine.link_url;
  const marker = `/${magazine.slug}/`;
  const markerIndex = magazine.thumbnail_url.indexOf(marker);
  if (markerIndex >= 0) {
    return `${magazine.thumbnail_url.slice(0, markerIndex)}${marker}`;
  }
  return `/${magazine.slug}/`;
}

async function readJsonArray<T>(url: string): Promise<T[]> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load ${url}: ${res.status} ${res.statusText}`);
  }
  const raw = (await res.json()) as unknown;
  return Array.isArray(raw) ? (raw as T[]) : [];
}

function loadHints(): Map<string, MagazineHint> {
  const bySlug = new Map<string, MagazineHint>();

  for (const hint of childArtMagazineHints) {
    const slug = hint.slug ?? (hint.link ? slugFromLink(hint.link) : null);
    if (slug) bySlug.set(slug, hint);
  }

  return bySlug;
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
    const [response, hints] = await Promise.all([
      listMagazines(),
      Promise.resolve(loadHints()),
    ]);
    _cache = response.magazines.map((magazine) => {
      const hint = hints.get(magazine.slug);
      const link = linkFromApiMagazine(magazine);

      return {
        period: magazine.period,
        name: hint?.name?.trim() || magazine.name,
        volume: magazine.volume,
        link,
        cover: hint?.cover?.trim() || magazine.thumbnail_url,
      };
    });
    return _cache;
  } catch (err) {
    console.error(err);
    try {
      _cache = await loadLegacyMagazines();
    } catch {
      _cache = [];
    }
    return _cache;
  }
}
