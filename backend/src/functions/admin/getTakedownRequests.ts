import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  TakedownRequestListItem,
  ListTakedownRequestsResponse,
} from "@icaf/shared";

const DEFAULT_LIMIT = 20;

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    if (event.httpMethod !== "GET") {
      return CommonErrors.methodNotAllowed();
    }

    const adminId = event.requestContext?.authorizer?.claims?.sub;
    if (!adminId) {
      return CommonErrors.unauthorized();
    }

    const qp = event.queryStringParameters ?? {};
    const limit = Math.min(
      Math.max(parseInt(String(qp.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
      100,
    );
    const lastKey = qp.last_key
      ? JSON.parse(Buffer.from(qp.last_key, "base64").toString("utf-8"))
      : undefined;

    // Query TDR partition — all takedown requests
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": "TDR" },
        Limit: limit + 1,
        ScanIndexForward: false, // newest first
        ...(lastKey && { ExclusiveStartKey: lastKey }),
      }),
    );

    const items = result.Items ?? [];
    const has_more = items.length > limit;
    const page = has_more ? items.slice(0, limit) : items;

    const requests: TakedownRequestListItem[] = page.map((item) => ({
      tdr_id: item.tdr_id as string,
      timestamp: item.timestamp as number,
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

    const lastEvaluatedKey = has_more ? items[limit - 1] : result.LastEvaluatedKey;
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
