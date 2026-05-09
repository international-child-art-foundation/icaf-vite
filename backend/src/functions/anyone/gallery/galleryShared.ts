import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../../config/aws-clients";
import { SortOrder } from "@icaf/shared";

export interface GsiConfig {
  IndexName: string;
  pkAttr: string;
  pk: string;
}

export interface PagedResult<T> {
  items: T[];
  has_more: boolean;
  last_key?: string;
}

export async function pagedGsiQuery<T>(
  config: GsiConfig,
  sort: SortOrder,
  limit: number,
  lastKey: string | undefined,
  mapper: (item: Record<string, unknown>) => T,
): Promise<PagedResult<T>> {
  const params: any = {
    TableName: TABLE_NAME,
    IndexName: config.IndexName,
    KeyConditionExpression: "#pk = :pk",
    ExpressionAttributeNames: { "#pk": config.pkAttr },
    ExpressionAttributeValues: { ":pk": config.pk },
    ScanIndexForward: sort === "oldest",
    Limit: limit,
  };

  if (lastKey) {
    try {
      params.ExclusiveStartKey = JSON.parse(
        Buffer.from(lastKey, "base64").toString("utf-8"),
      );
    } catch {
      // invalid pagination key — start from beginning
    }
  }

  const result = await dynamodb.send(new QueryCommand(params));

  return {
    items: (result.Items ?? []).map((item) =>
      mapper(item as Record<string, unknown>),
    ),
    has_more: !!result.LastEvaluatedKey,
    last_key: result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
      : undefined,
  };
}

export function parseGalleryParams(
  qs: Record<string, string> | null | undefined,
): { sort: SortOrder; limit: number; last_key: string | undefined } {
  const raw = qs ?? {};
  const sort: SortOrder = raw.sort === "oldest" ? "oldest" : "newest";
  const rawLimit = parseInt(raw.limit ?? "", 10);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), 100)
    : 20;
  return { sort, limit, last_key: raw.last_key };
}
