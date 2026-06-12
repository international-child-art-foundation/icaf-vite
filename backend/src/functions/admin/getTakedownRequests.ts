import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  TakedownRequestListItem,
  ListTakedownRequestsResponse,
  hasMinimumRole,
} from "@icaf/shared";
import { parseBase64JsonObject } from "../../utils/request";
import { getCurrentUser } from "../../utils/auth";

const DEFAULT_LIMIT = 20;

function isTruthyQueryFlag(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    if (!hasMinimumRole(currentUser.user.role, "admin")) {
        return CommonErrors.forbidden("Admin access required");
    }
    

    const qp = event.queryStringParameters ?? {};
    const limit = Math.min(
      Math.max(parseInt(String(qp.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
      100,
    );
    const parsedLastKey = qp.last_key
      ? parseBase64JsonObject(qp.last_key, "last_key is invalid")
      : undefined;
    if (parsedLastKey && !parsedLastKey.ok) {
      return parsedLastKey.response;
    }
    const lastKey = parsedLastKey?.value;
    const activeOnly = isTruthyQueryFlag(qp.active_only);

    const items: Record<string, unknown>[] = [];
    let queryLastKey = lastKey;
    let resultLastKey: Record<string, unknown> | undefined;

    do {
      const result = await dynamodb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk",
          ...(activeOnly && {
            FilterExpression: "#status IN (:requesting, :disputing)",
            ExpressionAttributeNames: { "#status": "status" },
          }),
          ExpressionAttributeValues: {
            ":pk": "TDR",
            ...(activeOnly && {
              ":requesting": "requesting",
              ":disputing": "disputing",
            }),
          },
          Limit: limit + 1,
          ScanIndexForward: false, // newest first
          ...(queryLastKey && { ExclusiveStartKey: queryLastKey }),
        }),
      );

      items.push(...((result.Items ?? []) as Record<string, unknown>[]));
      resultLastKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
      queryLastKey = resultLastKey;
    } while (activeOnly && items.length <= limit && queryLastKey);

    const has_more = items.length > limit;
    const page = has_more ? items.slice(0, limit) : items;

    const requests: TakedownRequestListItem[] = page.map((item) => ({
      tdr_id: item.tdr_id as string,
      tdr_sk: item.SK as string,
      ts: item.ts as number,
      status: item.status as TakedownRequestListItem["status"],
      art_id: item.art_id as string | undefined,
      group_id: item.group_id as string | undefined,
      requester_email: item.requester_email as string,
      requester_name: item.requester_name as string,
      reason: item.reason as string,
      scheduled_execution_at: item.scheduled_execution_at as number,
      reviewed_by: item.reviewed_by as string | undefined,
      reviewed_at: item.reviewed_at as number | undefined,
      review_notes: item.review_notes as string | undefined,
    }));

    const lastEvaluatedKey = has_more ? items[limit - 1] : resultLastKey;
    const response: ListTakedownRequestsResponse = {
      requests,
      has_more,
      ...(lastEvaluatedKey && {
        last_key: Buffer.from(JSON.stringify(lastEvaluatedKey)).toString("base64"),
      }),
    };

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error fetching takedown requests:", error);
    return CommonErrors.internalServerError();
  }
};
