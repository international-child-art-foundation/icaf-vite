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
import { resolveApiArtwork } from '@/utils/galleryProcessing';

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

export async function fetchGroupArtworks(group: GroupListItem) {
  const response = await getGroup(group.group_id);
  const groupEntity = response.group;
  const groupMetadata = {
    groupTitle: groupEntity.class_name || groupEntity.title,
    groupOwnerName: groupEntity.submitter_display_name,
    groupType: groupEntity.group_type,
    groupCountry: groupEntity.country,
    groupRegion: groupEntity.region,
  };
  const artworkResponses = await Promise.all(
    groupEntity.member_art_ids.map((artId) => getArtwork(artId)),
  );

  return artworkResponses
    .filter(({ artwork }) => artwork.status === 'approved')
    .map(({ artwork }) => resolveApiArtwork(artwork, groupMetadata));
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

  const groupEntries = await Promise.all(
    groupIds.map(async (groupId) => {
      try {
        const response = await getGroup(groupId);
        return [groupId, response.group] as const;
      } catch {
        return [groupId, null] as const;
      }
    }),
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
