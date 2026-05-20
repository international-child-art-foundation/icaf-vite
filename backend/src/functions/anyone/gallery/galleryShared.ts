import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../../config/aws-clients";
import { ApiGatewayResponse, SortOrder } from "@icaf/shared";
import { parseBase64JsonObject } from "../../../utils/request";

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
  lastKey: Record<string, unknown> | undefined,
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
    params.ExclusiveStartKey = lastKey;
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
):
  | {
      ok: true;
      value: {
        sort: SortOrder;
        limit: number;
        last_key: Record<string, unknown> | undefined;
      };
    }
  | { ok: false; response: ApiGatewayResponse } {
  const raw = qs ?? {};
  const sort: SortOrder = raw.sort === "oldest" ? "oldest" : "newest";
  const rawLimit = parseInt(raw.limit ?? "", 10);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), 100)
    : 20;

  const parsedLastKey = raw.last_key
    ? parseBase64JsonObject(raw.last_key, "last_key is invalid")
    : undefined;

  if (parsedLastKey && !parsedLastKey.ok) {
    return parsedLastKey;
  }

  return {
    ok: true,
    value: { sort, limit, last_key: parsedLastKey?.value },
  };
}
