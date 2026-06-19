import {
  formatThemeDisplayName,
  formatThemeFamilyName,
  parseThemeSK,
  type ArtworkEntity,
  type ArtworkListItem,
} from '@icaf/shared';
import type {
  TArtwork,
  TResolvedArtwork,
} from '@/modules/content/types/Gallery';

export const MYSTERY_ARTIST_NAME = 'Mystery Artist';

/** Derives the folder slug from a human-readable event name: spaces → hyphens. */
export function eventToSlug(event: string): string {
  return event.replace(/\s+/g, '-');
}

/** Resolve computed fields from a raw Artwork entry. */
export function resolveArtwork(a: TArtwork): TResolvedArtwork {
  const base = a.file.replace(/\.[^.]+$/, '');
  const eventSlug = eventToSlug(a.event);
  const resolvedArtwork = {
    ...a,
    id: `${eventSlug}/${a.file}`,
    eventSlug,
    url: `/gallery-arts/${eventSlug}/${a.file}`,
    thumbUrl: `/gallery-arts/${eventSlug}/thumbs/${base}.webp`,
    displayUrl: `/gallery-arts/${eventSlug}/display/${base}.webp`,
    featureUrl: `/gallery-arts/${eventSlug}/feature/${base}.webp`,
    alt: '',
  };
  return {
    ...resolvedArtwork,
    alt: getArtistDisplayNameWithAge(resolvedArtwork),
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
  const browserOrigin = window.location.origin;

  if (remoteArtworkBaseUrl) {
    // VITE_API_BASE_URL is intentionally relative in deployed builds. Resolve
    // any configured base against the browser origin before using it as a URL
    // base so a missing asset-specific setting cannot crash artwork lists.
    const resolvedBaseUrl = new URL(remoteArtworkBaseUrl, browserOrigin);
    return new URL(path, resolvedBaseUrl).toString();
  }

  return new URL(path, browserOrigin).toString();
}

export function resolveApiArtwork(
  a: ArtworkListItem | ArtworkEntity,
  groupMetadata?: Pick<
    TResolvedArtwork,
    | 'groupCountry'
    | 'groupOwnerName'
    | 'groupRegion'
    | 'groupTitle'
    | 'groupType'
  >,
): TResolvedArtwork {
  const artists = a.f_name?.trim() ? [a.f_name.trim()] : [];
  const parsedTheme = a.theme ? parseThemeSK(a.theme) : null;
  const themeLabel = parsedTheme
    ? formatThemeDisplayName(parsedTheme)
    : '';

  const resolvedArtwork = {
    art_id: a.art_id,
    id: a.art_id,
    file: `${a.art_id}.avif`,
    event: themeLabel,
    eventSlug: parsedTheme?.theme_family ?? 'gallery',
    artists,
    age: a.age,
    country: a.country,
    region: a.region,
    title: a.title,
    description: a.description,
    theme: a.theme,
    group_id: a.group_id,
    groupTitle: groupMetadata?.groupTitle,
    groupOwnerName: groupMetadata?.groupOwnerName,
    groupType: groupMetadata?.groupType,
    groupCountry: groupMetadata?.groupCountry,
    groupRegion: groupMetadata?.groupRegion,
    kudos_count: a.kudos_count,
    url: artworkAssetUrl(a.art_id, 'original'),
    thumbUrl: artworkAssetUrl(a.art_id, 'thumb'),
    displayUrl: artworkAssetUrl(a.art_id, 'medium'),
    featureUrl: artworkAssetUrl(a.art_id, 'original'),
    alt: '',
  };
  return {
    ...resolvedArtwork,
    alt: a.title || getArtistDisplayNameWithAge(resolvedArtwork),
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

export function getArtistDisplayName(
  artists: string[],
  lastInitial?: string,
): string {
  return formatArtistName(artists, lastInitial) || MYSTERY_ARTIST_NAME;
}

export function getArtistDisplayNameWithAge(
  artwork: Pick<TResolvedArtwork, 'age' | 'artists' | 'lastInitial'>,
): string {
  const artist = getArtistDisplayName(
    artwork.artists ?? [],
    artwork.lastInitial,
  );

  return artwork.age != null ? `${artist}, ${artwork.age}` : artist;
}

export function formatGalleryLocation(
  region?: string,
  country?: string,
): string {
  return [region, country].filter(Boolean).join(', ');
}

export function formatGalleryThemeName(value?: string): string {
  return formatThemeFamilyName(value);
}

export function formatGalleryTheme(artwork: TResolvedArtwork): string {
  const parsedTheme = artwork.theme ? parseThemeSK(artwork.theme) : null;
  if (parsedTheme) return formatThemeDisplayName(parsedTheme);

  return formatGalleryThemeName(artwork.event);
}

export function getArtworkDisplayTitle(artwork: TResolvedArtwork): string {
  const artist = getArtistDisplayNameWithAge(artwork);
  return artwork.title?.trim() || artist || MYSTERY_ARTIST_NAME;
}

export function getArtworkSecondaryTitle(artwork: TResolvedArtwork): string {
  if (!artwork.title?.trim()) return 'Untitled';

  const artist = getArtistDisplayNameWithAge(artwork);
  return artist === MYSTERY_ARTIST_NAME ? '' : artist;
}

export function formatGalleryGroup(artwork: TResolvedArtwork): string {
  const groupLocation = formatGalleryLocation(
    artwork.groupRegion,
    artwork.groupCountry,
  );

  if (artwork.groupTitle) return artwork.groupTitle;

  if (artwork.groupType === 'classroom' && artwork.groupOwnerName) {
    return `${artwork.groupOwnerName}'s classroom`;
  }

  if (groupLocation) return `Group from ${groupLocation}`;

  return '';
}

export function formatArtworkByline(artwork: TResolvedArtwork): string {
  const location = formatGalleryLocation(artwork.region, artwork.country);
  if (location) return `${location}`;

  const groupLocation = formatGalleryLocation(
    artwork.groupRegion,
    artwork.groupCountry,
  );
  if (groupLocation) return `Part of a group from ${groupLocation}`;

  if (artwork.groupType === 'classroom' && artwork.groupOwnerName) {
    return `Part of ${artwork.groupOwnerName}'s classroom`;
  }

  if (artwork.groupTitle) return `Part of ${artwork.groupTitle}`;

  return 'Artist details unavailable';
}

export function formatArtworkContext(artwork: TResolvedArtwork): string | null {
  const groupLocation = formatGalleryLocation(
    artwork.groupRegion,
    artwork.groupCountry,
  );

  if (artwork.groupType === 'classroom') {
    if (artwork.groupTitle && groupLocation) {
      return `Part of ${artwork.groupTitle} in ${groupLocation}`;
    }
    if (artwork.groupOwnerName && groupLocation) {
      return `Part of ${artwork.groupOwnerName}'s classroom in ${groupLocation}`;
    }
  }

  if (artwork.groupTitle && groupLocation) {
    return `Part of ${artwork.groupTitle} in ${groupLocation}`;
  }

  if (artwork.groupTitle) return `Part of ${artwork.groupTitle}`;
  if (groupLocation) return `Part of a group from ${groupLocation}`;

  return null;
}
