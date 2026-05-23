import type { GalleryQueryParams, GroupListItem, SortOrder } from '@icaf/shared';
import {
  getArtwork,
  getGroup,
  listGalleryArtworks,
  listGalleryArtworksByFamily,
  listGalleryGroups,
  listGalleryGroupsByFamily,
} from '@/api/public';
import type { TResolvedArtwork } from '@/modules/content/types/Gallery';
import { resolveApiArtwork } from '@/utils/galleryProcessing';

const API_PAGE_LIMIT = 100;

export function toSortOrder(sortValue: string): SortOrder {
  return sortValue === 'Oldest Event' ? 'oldest' : 'newest';
}

export async function fetchAllGalleryArtworks(
  themeFamily: string | null,
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
    const response = themeFamily
      ? await listGalleryArtworksByFamily(themeFamily, query)
      : await listGalleryArtworks(query);

    artworks.push(...response.artworks.map(resolveApiArtwork));
    lastKey = response.last_key;
  } while (lastKey);

  return artworks;
}

export async function fetchAllGalleryGroups(
  themeFamily: string | null,
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
    const response = themeFamily
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
    groupOwnerName: groupEntity.guardian_display_name,
    groupType: groupEntity.group_type,
  };
  const artworkResponses = await Promise.all(
    groupEntity.member_art_ids.map((artId) => getArtwork(artId)),
  );

  return artworkResponses
    .filter(({ artwork }) => artwork.status === 'approved')
    .map(({ artwork }) => resolveApiArtwork(artwork, groupMetadata));
}
