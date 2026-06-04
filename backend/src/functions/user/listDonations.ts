import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  PaymentEntity,
  UserPaymentItem,
  ListUserPaymentsResponse,
} from "@icaf/shared";
import { parseBase64JsonObject } from "../../utils/request";
import { getCurrentUser } from "../../utils/auth";

const DEFAULT_LIMIT = 20;

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    const userId = currentUser.user.user_id;

    const qp = event.queryStringParameters ?? {};
    const limit = Math.min(Math.max(parseInt(String(qp.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1), 100);
    const parsedLastKey = qp.last_key
      ? parseBase64JsonObject(qp.last_key, "last_key is invalid")
      : undefined;
    if (parsedLastKey && !parsedLastKey.ok) {
      return parsedLastKey.response;
    }
    const lastKey = parsedLastKey?.value;

    // Query PK=USER#<user_id>, begins_with(SK, "PAYMENT")
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":skPrefix": "PAYMENT",
        },
        Limit: limit + 1,
        ScanIndexForward: false, // most recent first
        ...(lastKey && { ExclusiveStartKey: lastKey }),
      }),
    );

    const items = result.Items ?? [];
    const has_more = items.length > limit;
    const page = has_more ? items.slice(0, limit) : items;

    const payments: UserPaymentItem[] = page.map((item) => {
      const p = item as PaymentEntity;
      return {
        payment_id: p.payment_id,
        amount_cents: p.amount_cents,
        currency: p.currency,
        ts: p.ts,
      };
    });

    const lastEvaluatedKey = has_more ? items[limit - 1] : result.LastEvaluatedKey;
    const response: ListUserPaymentsResponse = {
      payments,
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
    console.error("Error listing payments:", error);
    return CommonErrors.internalServerError();
  }
};
