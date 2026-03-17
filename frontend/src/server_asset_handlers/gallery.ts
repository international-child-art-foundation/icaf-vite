import type { Artwork } from '@/data/gallery/artworks';

const GALLERY_URL = '/data/galleryData.json';

let _cache: Artwork[] | null = null;

export async function getArtworks(): Promise<Artwork[]> {
  if (_cache) return _cache;
  const res = await fetch(GALLERY_URL, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(
      `Failed to load ${GALLERY_URL}: ${res.status} ${res.statusText}`,
    );
  }
  _cache = (await res.json()) as Artwork[];
  return _cache;
}
