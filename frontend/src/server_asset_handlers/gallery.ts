import type { TArtwork, TResolvedArtwork } from '@/types/Gallery';
import { resolveArtwork } from '@/utils/galleryProcessing';

const GALLERY_URL = '/data/galleryData.json';

let _cache: TResolvedArtwork[] | null = null;

export async function getArtworks(): Promise<TResolvedArtwork[]> {
  if (_cache) return _cache;
  const res = await fetch(GALLERY_URL, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(
      `Failed to load ${GALLERY_URL}: ${res.status} ${res.statusText}`,
    );
  }
  const raw = (await res.json()) as TArtwork[];
  _cache = raw.map(resolveArtwork);
  return _cache;
}
