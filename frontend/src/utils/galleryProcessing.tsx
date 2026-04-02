import { TArtwork, TResolvedArtwork } from '@/types/Gallery';
/** Resolve computed fields from a raw Artwork entry. */
export function resolveArtwork(a: TArtwork): TResolvedArtwork {
  const base = a.file.replace(/\.[^.]+$/, '');
  return {
    ...a,
    id: `${a.event}/${a.file}`,
    url: `/gallery-arts/${a.event}/${a.file}`,
    thumbUrl: `/gallery-arts/${a.event}/thumbs/${base}.webp`,
    displayUrl: `/gallery-arts/${a.event}/display/${base}.webp`,
    alt:
      formatArtistName(a.artists ?? [], a.lastInitial) ||
      a.country ||
      'Artwork',
  };
}

/**
 * Formats artists with the last initial appended to the first artist's name.
 *   ["Anwita"], "K"            → "Anwita K."
 *   ["Anwita", "Nicolas"], "K" → "Anwita K. & Nicolas"
 *   ["Anwita"], undefined      → "Anwita"
 *   [], undefined              → ""
 */
export function formatArtistName(
  artists: string[],
  lastInitial?: string,
): string {
  if (artists.length === 0) return '';
  const withInitial = lastInitial
    ? [`${artists[0]} ${lastInitial}.`, ...artists.slice(1)]
    : artists;
  return withInitial.join(' & ');
}
