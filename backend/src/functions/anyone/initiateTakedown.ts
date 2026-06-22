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
import { sendTakedownNotificationEmail } from "../../utils/emails/takedownNotification";

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
    const requesterEmail = body.requester_email.trim();
    const requesterName = body.requester_name.trim();
    const reason = body.reason.trim();

    await dynamodb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: "TDR",
          SK: `TS#${nowSeconds}#TDR_ID#${tdr_id}`,
          tdr_id,
          ts: nowSeconds,
          status: "requesting",
          requester_email: requesterEmail,
          requester_name: requesterName,
          reason,
          scheduled_execution_at,
          ...(body.art_id && { art_id: body.art_id }),
          ...(body.group_id && { group_id: body.group_id }),
          type: "TAKEDOWN_REQUEST",
        },
      }),
    );

    try {
      const messageId = await sendTakedownNotificationEmail({
        tdrId: tdr_id,
        submittedAt: nowSeconds,
        scheduledExecutionAt: scheduled_execution_at,
        requesterEmail,
        requesterName,
        reason,
        artId: body.art_id,
        groupId: body.group_id,
      });
      console.info("Takedown notification email sent", {
        tdr_id,
        ses_message_id: messageId,
      });
    } catch (error) {
      console.error("Takedown notification email failed:", error);
    }

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
