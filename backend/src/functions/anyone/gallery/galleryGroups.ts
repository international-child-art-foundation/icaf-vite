import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  GalleryGroupsResponse,
  GroupListItem,
  GroupStatus,
  GroupType,
} from "@icaf/shared";
import {
  queryGroups,
  queryFamilyGroups,
  queryInstanceGroups,
} from "../../../dynamo/groupGsis";
import { pagedGsiQuery, parseGalleryParams } from "./galleryShared";

function mapGroup(item: Record<string, unknown>): GroupListItem {
  return {
    group_id: item.group_id as string,
    theme: item.theme as string | undefined,
    group_type: item.group_type as GroupType,
    title: item.title as string | undefined,
    class_name: item.class_name as string | undefined,
    submitter_display_name: item.submitter_display_name as string | undefined,
    country: item.country as string | undefined,
    region: item.region as string | undefined,
    preview_art_ids: ((item.member_art_ids as string[]) ?? []).slice(0, 4),
    member_count: ((item.member_art_ids as string[]) ?? []).length,
    status: item.status as GroupStatus,
    ts: item.ts as number,
    rev_num: (item.rev_num as number | undefined) ?? 1,
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
    const instanceType = event.pathParameters?.instance_type;
    const instance = event.pathParameters?.instance;

    const gsiConfig =
      family && instanceType && instance
        ? queryInstanceGroups(family, instanceType, instance)
        : family
          ? queryFamilyGroups(family)
          : queryGroups();

    const { items, has_more, last_key: nextKey } = await pagedGsiQuery(
      gsiConfig,
      sort,
      limit,
      last_key,
      mapGroup,
    );

    const response: GalleryGroupsResponse = {
      groups: items,
      count: items.length,
      sort,
      theme_family: family,
      instance_type: instanceType,
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
    console.error("Error querying group gallery:", error);
    return CommonErrors.internalServerError();
  }
};
