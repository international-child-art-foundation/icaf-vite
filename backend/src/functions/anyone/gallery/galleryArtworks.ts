import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  GalleryArtworksResponse,
  ArtworkListItem,
  ArtworkStatus,
} from "@icaf/shared";
import {
  queryGallery,
  queryFamilyGallery,
  queryInstanceGallery,
} from "../../../dynamo/artGsis";
import { pagedGsiQuery, parseGalleryParams } from "./galleryShared";

function mapArtwork(item: Record<string, unknown>): ArtworkListItem {
  return {
    art_id: item.art_id as string,
    f_name: item.f_name as string | undefined,
    age: item.age as number | undefined,
    country: item.country as string | undefined,
    region: item.region as string | undefined,
    title: item.title as string | undefined,
    description: item.description as string | undefined,
    l_name: item.l_name as string | undefined,
    theme_family: item.theme_family as string | undefined,
    theme_instance: item.theme_instance as string | undefined,
    group_id: item.group_id as string | undefined,
    status: item.status as ArtworkStatus,
    kudos_count: item.kudos_count as number,
    ts: item.ts as number,
    promotional_use: (item.promotional_use as boolean | undefined) ?? false,
  };
}

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const parsedParams = parseGalleryParams(
      event.queryStringParameters,
    );
    if (!parsedParams.ok) return parsedParams.response;

    const { sort, limit, last_key } = parsedParams.value;
    const family = event.pathParameters?.family;
    const instance = event.pathParameters?.instance;

    const gsiConfig =
      family && instance
        ? queryInstanceGallery(family, instance)
        : family
          ? queryFamilyGallery(family)
          : queryGallery();

    const { items, has_more, last_key: nextKey } = await pagedGsiQuery(
      gsiConfig,
      sort,
      limit,
      last_key,
      mapArtwork,
    );

    const response: GalleryArtworksResponse = {
      artworks: items,
      count: items.length,
      sort,
      theme_family: family,
      theme_instance: instance,
      has_more,
      last_key: nextKey,
    };

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error querying artwork gallery:", error);
    return CommonErrors.internalServerError();
  }
};
