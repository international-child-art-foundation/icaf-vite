import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import { GSI, EntityType } from "../../dynamo/ddbSchemaConsts";
import { ApiGatewayResponse, ArtworkListItem, GroupListItem } from "@icaf/shared";
import { parseBase64JsonObject } from "../../utils/request";

const DEFAULT_LIMIT = 20;

export interface ReviewQueuePage<T> {
  items: T[];
  has_more: boolean;
  last_key?: string;
}

async function queryReviewGsi(
  skPrefix: string,
  limit: number,
  lastKey: Record<string, unknown> | undefined,
): Promise<{ items: Record<string, unknown>[]; lastEvaluatedKey?: Record<string, unknown> }> {
  const result = await dynamodb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI.Review,
      KeyConditionExpression: "REV_PK = :pk AND begins_with(REV_SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk": "REVIEW",
        ":prefix": skPrefix,
      },
      Limit: limit + 1,
      ScanIndexForward: false, // newest first
      ...(lastKey && { ExclusiveStartKey: lastKey }),
    }),
  );
  return {
    items: (result.Items ?? []) as Record<string, unknown>[],
    lastEvaluatedKey: result.LastEvaluatedKey as Record<string, unknown> | undefined,
  };
}

export async function fetchArtworkReviewPage(
  statusPrefix: string,
  limit: number,
  lastKey: Record<string, unknown> | undefined,
): Promise<ReviewQueuePage<ArtworkListItem>> {
  const skPrefix = `STATUS#${statusPrefix}#TYPE#${EntityType.Art}`;
  const { items, lastEvaluatedKey } = await queryReviewGsi(skPrefix, limit, lastKey);

  const has_more = items.length > limit;
  const page = has_more ? items.slice(0, limit) : items;

  const artworks: ArtworkListItem[] = page.map((item) => ({
    art_id: item.art_id as string,
    f_name: item.f_name as string | undefined,
    age: item.age as number | undefined,
    country: item.country as string | undefined,
    region: item.region as string | undefined,
    title: item.title as string | undefined,
    description: item.description as string | undefined,
    theme_family: item.theme_family as string | undefined,
    theme_instance: item.theme_instance as string | undefined,
    group_id: item.group_id as string | undefined,
    status: item.status as ArtworkListItem["status"],
    kudos_count: (item.kudos_count as number) ?? 0,
    timestamp: item.timestamp as number,
    is_virtual: item.is_virtual as boolean,
  }));

  const cursor = has_more ? items[limit - 1] : lastEvaluatedKey;
  return {
    items: artworks,
    has_more,
    ...(cursor && { last_key: Buffer.from(JSON.stringify(cursor)).toString("base64") }),
  };
}

export async function fetchGroupReviewPage(
  statusPrefix: string,
  limit: number,
  lastKey: Record<string, unknown> | undefined,
): Promise<ReviewQueuePage<GroupListItem>> {
  const skPrefix = `STATUS#${statusPrefix}#TYPE#${EntityType.Group}`;
  const { items, lastEvaluatedKey } = await queryReviewGsi(skPrefix, limit, lastKey);

  const has_more = items.length > limit;
  const page = has_more ? items.slice(0, limit) : items;

  const groups: GroupListItem[] = page.map((item) => ({
    group_id: item.group_id as string,
    theme_family: item.theme_family as string | undefined,
    theme_instance: item.theme_instance as string | undefined,
    group_type: item.group_type as GroupListItem["group_type"],
    title: item.title as string,
    class_name: item.class_name as string | undefined,
    teacher_display_name: item.teacher_display_name as string | undefined,
    country: item.country as string,
    region: item.region as string | undefined,
    cover_art_ids: (item.cover_art_ids as string[]) ?? [],
    member_count: ((item.member_art_ids as string[]) ?? []).length,
    status: item.status as GroupListItem["status"],
    timestamp: item.timestamp as number,
  }));

  const cursor = has_more ? items[limit - 1] : lastEvaluatedKey;
  return {
    items: groups,
    has_more,
    ...(cursor && { last_key: Buffer.from(JSON.stringify(cursor)).toString("base64") }),
  };
}

export function parseReviewParams(event: { queryStringParameters?: Record<string, string> | null }): {
  ok: true;
  limit: number;
  lastKey: Record<string, unknown> | undefined;
} | {
  ok: false;
  response: ApiGatewayResponse;
} {
  const qp = event.queryStringParameters ?? {};
  const limit = Math.min(
    Math.max(parseInt(String(qp.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
    100,
  );
  const parsedLastKey = qp.last_key
    ? parseBase64JsonObject(qp.last_key, "last_key is invalid")
    : undefined;
  if (parsedLastKey && !parsedLastKey.ok) {
    return { ok: false, response: parsedLastKey.response };
  }

  return { ok: true, limit, lastKey: parsedLastKey?.value };
}
