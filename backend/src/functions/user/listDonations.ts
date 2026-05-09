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

const DEFAULT_LIMIT = 20;

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    if (event.httpMethod !== "GET") {
      return CommonErrors.methodNotAllowed();
    }

    const userId = event.requestContext?.authorizer?.claims?.sub;
    if (!userId) {
      return CommonErrors.unauthorized();
    }

    const qp = event.queryStringParameters ?? {};
    const limit = Math.min(Math.max(parseInt(String(qp.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1), 100);
    const lastKey = qp.last_key ? JSON.parse(Buffer.from(qp.last_key, "base64").toString("utf-8")) : undefined;

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
        timestamp: p.timestamp,
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
