import type { ArtworkEntity, ArtworkListItem } from '@icaf/shared';
import type {
  TArtwork,
  TResolvedArtwork,
} from '@/modules/content/types/Gallery';

/** Derives the folder slug from a human-readable event name: spaces → hyphens. */
export function eventToSlug(event: string): string {
  return event.replace(/\s+/g, '-');
}

/** Resolve computed fields from a raw Artwork entry. */
export function resolveArtwork(a: TArtwork): TResolvedArtwork {
  const base = a.file.replace(/\.[^.]+$/, '');
  const eventSlug = eventToSlug(a.event);
  return {
    ...a,
    id: `${eventSlug}/${a.file}`,
    eventSlug,
    url: `/gallery-arts/${eventSlug}/${a.file}`,
    thumbUrl: `/gallery-arts/${eventSlug}/thumbs/${base}.webp`,
    displayUrl: `/gallery-arts/${eventSlug}/display/${base}.webp`,
    featureUrl: `/gallery-arts/${eventSlug}/feature/${base}.webp`,
    alt:
      formatArtistName(a.artists ?? [], a.lastInitial) ||
      a.country ||
      'Artwork',
  };
}

function cleanBaseUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

function getRemoteArtworkBaseUrl(): string | undefined {
  const artworkAssetBaseUrl = cleanBaseUrl(
    import.meta.env.VITE_ARTWORK_ASSET_BASE_URL,
  );
  if (artworkAssetBaseUrl) return artworkAssetBaseUrl;

  return cleanBaseUrl(import.meta.env.VITE_API_BASE_URL);
}

export function artworkAssetUrl(
  artId: string,
  variant: 'medium' | 'original' | 'thumb',
): string {
  const path = `/${artId}/${variant}.avif`;
  const remoteArtworkBaseUrl = getRemoteArtworkBaseUrl();

  if (remoteArtworkBaseUrl) {
    return new URL(path, remoteArtworkBaseUrl).toString();
  }

  return new URL(path, window.location.origin).toString();
}

export function resolveApiArtwork(
  a: ArtworkListItem | ArtworkEntity,
  groupMetadata?: Pick<
    TResolvedArtwork,
    'groupOwnerName' | 'groupTitle' | 'groupType'
  >,
): TResolvedArtwork {
  const artists = a.f_name?.trim() ? [a.f_name.trim()] : [];
  const themeLabel = [a.theme_family, a.theme_instance]
    .filter(Boolean)
    .join(' ');

  return {
    art_id: a.art_id,
    id: a.art_id,
    file: `${a.art_id}.avif`,
    event: themeLabel,
    eventSlug: a.theme_family ?? 'gallery',
    artists,
    age: a.age,
    country: a.country,
    region: a.region,
    title: a.title,
    description: a.description,
    theme_family: a.theme_family,
    theme_instance: a.theme_instance,
    groupTitle: groupMetadata?.groupTitle,
    groupOwnerName: groupMetadata?.groupOwnerName,
    groupType: groupMetadata?.groupType,
    kudos_count: a.kudos_count,
    url: artworkAssetUrl(a.art_id, 'original'),
    thumbUrl: artworkAssetUrl(a.art_id, 'thumb'),
    displayUrl: artworkAssetUrl(a.art_id, 'medium'),
    featureUrl: artworkAssetUrl(a.art_id, 'original'),
    alt: a.title || formatArtistName(artists) || a.country || 'Artwork',
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
