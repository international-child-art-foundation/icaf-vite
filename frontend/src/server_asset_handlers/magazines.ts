import { IMagazine } from '@/types/Magazines';
const MAG_URL = '/data/childArtMagazineData.json';

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

export async function getMagazines(): Promise<IMagazine[]> {
  if (_cache) return _cache;
  const res = await fetch(MAG_URL, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(
      `Failed to load ${MAG_URL}: ${res.status} ${res.statusText}`,
    );
  }
  const raw = (await res.json()) as IMagazine[];
  _cache = raw.map((m) => ({
    ...m,
    cover: m.cover ?? guessCoverFromLink(m.link),
  }));
  return _cache;
}
