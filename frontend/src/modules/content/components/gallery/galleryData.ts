import type { GalleryQueryParams, GroupListItem, SortOrder } from '@icaf/shared';
import {
  getArtwork,
  getGroup,
  listGalleryArtworks,
  listGalleryArtworksByFamily,
  listGalleryArtworksByInstance,
  listGalleryGroups,
  listGalleryGroupsByFamily,
  listGalleryGroupsByInstance,
} from '@/api/public';
import type { TResolvedArtwork } from '@/modules/content/types/Gallery';
import { artworkAssetUrl, resolveApiArtwork } from '@/utils/galleryProcessing';
import { mapWithConcurrency } from '@/shared/utils/concurrency';

const API_PAGE_LIMIT = 100;

export function toSortOrder(sortValue: string): SortOrder {
  return sortValue === 'Oldest Event' ? 'oldest' : 'newest';
}

export async function fetchAllGalleryArtworks(
  themeFamily: string | null,
  themeInstanceType: string | null,
  themeInstance: string | null,
  sort: SortOrder,
): Promise<TResolvedArtwork[]> {
  const artworks: TResolvedArtwork[] = [];
  let lastKey: string | undefined;

  do {
    const query: GalleryQueryParams = {
      sort,
      limit: API_PAGE_LIMIT,
      ...(lastKey ? { last_key: lastKey } : {}),
    };
    const response =
      themeFamily && themeInstanceType && themeInstance
        ? await listGalleryArtworksByInstance(themeFamily, themeInstanceType, themeInstance, query)
        : themeFamily
          ? await listGalleryArtworksByFamily(themeFamily, query)
          : await listGalleryArtworks(query);

    artworks.push(
      ...response.artworks.map((artwork) => resolveApiArtwork(artwork)),
    );
    lastKey = response.last_key;
  } while (lastKey);

  return artworks;
}

export async function fetchAllGalleryGroups(
  themeFamily: string | null,
  themeInstanceType: string | null,
  themeInstance: string | null,
  sort: SortOrder,
): Promise<GroupListItem[]> {
  const groups: GroupListItem[] = [];
  let lastKey: string | undefined;

  do {
    const query: GalleryQueryParams = {
      sort,
      limit: API_PAGE_LIMIT,
      ...(lastKey ? { last_key: lastKey } : {}),
    };
    const response =
      themeFamily && themeInstanceType && themeInstance
        ? await listGalleryGroupsByInstance(themeFamily, themeInstanceType, themeInstance, query)
        : themeFamily
          ? await listGalleryGroupsByFamily(themeFamily, query)
          : await listGalleryGroups(query);

    groups.push(...response.groups);
    lastKey = response.last_key;
  } while (lastKey);

  return groups;
}

export type LazyGroupArtworks = {
  artworks: TResolvedArtwork[];
  loadArtwork: (artworkId: string) => Promise<TResolvedArtwork | null>;
};

/**
 * Loads only the selected group artwork up front. The remaining ordered
 * entries use their already-known asset URLs until the slideshow asks for
 * their metadata.
 */
export async function fetchGroupArtworksLazily(
  group: GroupListItem,
  initialArtworkId?: string,
  hydrateInitial = true,
): Promise<LazyGroupArtworks> {
  const response = await getGroup(group.group_id);
  const groupEntity = response.group;
  const groupMetadata = {
    groupTitle: groupEntity.class_name || groupEntity.title,
    groupOwnerName: groupEntity.submitter_display_name,
    groupType: groupEntity.group_type,
    groupCountry: groupEntity.country,
    groupRegion: groupEntity.region,
  };
  const artworkIds = groupEntity.member_art_ids;
  const selectedId =
    initialArtworkId && artworkIds.includes(initialArtworkId)
      ? initialArtworkId
      : artworkIds[0];
  const cache = new Map<string, TResolvedArtwork | null>();
  const inFlight = new Map<string, Promise<TResolvedArtwork | null>>();

  const loadArtwork = (artworkId: string) => {
    if (cache.has(artworkId)) {
      return Promise.resolve(cache.get(artworkId) ?? null);
    }
    const existing = inFlight.get(artworkId);
    if (existing) return existing;

    const request = getArtwork(artworkId)
      .then(({ artwork }) => {
        const resolved =
          artwork.status === 'approved'
            ? resolveApiArtwork(artwork, groupMetadata)
            : null;
        cache.set(artworkId, resolved);
        return resolved;
      })
      .finally(() => inFlight.delete(artworkId));
    inFlight.set(artworkId, request);
    return request;
  };

  if (selectedId && hydrateInitial) {
    try {
      await loadArtwork(selectedId);
    } catch {
      // The deterministic asset URL is enough to open the slideshow. Metadata
      // hydration will retry once the selected artwork is on screen.
    }
  }

  const placeholders = artworkIds.map<TResolvedArtwork>((artworkId) => ({
    id: artworkId,
    art_id: artworkId,
    file: `${artworkId}.avif`,
    event: '',
    eventSlug: 'gallery',
    group_id: group.group_id,
    ...groupMetadata,
    url: artworkAssetUrl(artworkId, 'original'),
    thumbUrl: artworkAssetUrl(artworkId, 'thumb'),
    displayUrl: artworkAssetUrl(artworkId, 'medium'),
    featureUrl: artworkAssetUrl(artworkId, 'original'),
    alt: '',
  }));

  return {
    artworks: placeholders.map((artwork) => cache.get(artwork.id) ?? artwork),
    loadArtwork,
  };
}

export async function fetchArtworkGroupMetadata(
  artworks: TResolvedArtwork[],
): Promise<TResolvedArtwork[]> {
  const groupIds = Array.from(
    new Set(
      artworks
        .map((artwork) => artwork.group_id)
        .filter((groupId): groupId is string => Boolean(groupId)),
    ),
  );

  if (groupIds.length === 0) return artworks;

  const groupEntries = await mapWithConcurrency(
    groupIds,
    3,
    async (groupId) => {
      try {
        const response = await getGroup(groupId);
        return [groupId, response.group] as const;
      } catch {
        return [groupId, null] as const;
      }
    },
  );
  const groupsById = new Map(groupEntries);

  return artworks.map((artwork) => {
    if (!artwork.group_id) return artwork;
    const group = groupsById.get(artwork.group_id);
    if (!group) return artwork;

    return {
      ...artwork,
      groupTitle: group.class_name || group.title || artwork.groupTitle,
      groupOwnerName: group.submitter_display_name ?? artwork.groupOwnerName,
      groupType: group.group_type ?? artwork.groupType,
      groupCountry: group.country ?? artwork.groupCountry,
      groupRegion: group.region ?? artwork.groupRegion,
    };
  });
}
