import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  InitiateTakedownRequest,
  InitiateTakedownResponse,
  validateInitiateTakedownRequest,
} from "@icaf/shared";
import { parseJsonBody } from "../../utils/request";
import { randomUUID } from "crypto";

// Takedown requests auto-execute 5 days after submission
const EXECUTION_WINDOW_SECONDS = 5 * 24 * 60 * 60;

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const parsedBody = parseJsonBody<InitiateTakedownRequest>(event);
    if (!parsedBody.ok) return parsedBody.response;
    const body = parsedBody.value;
    const tdrErrors = validateInitiateTakedownRequest(body);
    if (tdrErrors.length > 0) {
      return CommonErrors.badRequest(tdrErrors.join("; "));
    }

    const tdr_id = randomUUID();
    const nowSeconds = Math.floor(Date.now() / 1000);
    const scheduled_execution_at = nowSeconds + EXECUTION_WINDOW_SECONDS;

    await dynamodb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: "TDR",
          SK: `TS#${nowSeconds}#TDR_ID#${tdr_id}`,
          tdr_id,
          timestamp: nowSeconds,
          status: "requesting",
          requester_email: body.requester_email.trim(),
          requester_name: body.requester_name.trim(),
          reason: body.reason.trim(),
          scheduled_execution_at,
          ...(body.art_id && { art_id: body.art_id }),
          ...(body.group_id && { group_id: body.group_id }),
          type: "TAKEDOWN_REQUEST",
        },
      }),
    );

    const response: InitiateTakedownResponse = {
      success: true,
      tdr_id,
      message: "Takedown request submitted",
      scheduled_execution_at,
    };

    return {
      statusCode: HTTP_STATUS.CREATED,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error initiating takedown:", error);
    return CommonErrors.internalServerError();
  }
};
