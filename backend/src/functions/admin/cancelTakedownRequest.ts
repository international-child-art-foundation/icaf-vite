import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  ReviewTakedownRequest,
  validateReviewTakedownRequest,
} from "@icaf/shared";
import { parseJsonBody } from "../../utils/request";
import { getCurrentUser } from "../../utils/auth";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    const adminId = currentUser.user.user_id;

    // TDR SK format: TS#<unix_ts>#TDR_ID#<tdr_id>
    // Both the timestamp and tdr_id must come from path params since the SK is compound
    const tdrSk = event.pathParameters?.tdr_sk;
    if (!tdrSk) {
      return CommonErrors.badRequest("tdr_sk path parameter is required");
    }

    const parsedBody = parseJsonBody<ReviewTakedownRequest>(event);
    if (!parsedBody.ok) {
      return parsedBody.response;
    }

    const body = parsedBody.value;
    if (!body.action || !["cancel", "dispute"].includes(body.action)) {
      return CommonErrors.badRequest("action must be 'cancel' or 'dispute'");
    }
    const tdrErrors = validateReviewTakedownRequest(body);
    if (tdrErrors.length > 0) {
      return CommonErrors.badRequest(tdrErrors.join("; "));
    }

    const newStatus = body.action === "cancel" ? "canceled" : "disputing";
    const nowSeconds = Math.floor(Date.now() / 1000);

    try {
      await dynamodb.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: "TDR", SK: tdrSk },
          UpdateExpression:
            "SET #status = :status, reviewed_by = :reviewer, reviewed_at = :reviewedAt" +
            (body.review_notes ? ", review_notes = :notes" : ""),
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: {
            ":status": newStatus,
            ":reviewer": adminId,
            ":reviewedAt": nowSeconds,
            ...(body.review_notes && { ":notes": body.review_notes }),
          },
          ConditionExpression: "attribute_exists(PK)",
        }),
      );
    } catch (err: unknown) {
      const ddbErr = err as { name?: string };
      if (ddbErr.name === "ConditionalCheckFailedException") {
        return CommonErrors.notFound("Takedown request not found");
      }
      throw err;
    }

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ success: true, tdr_sk: tdrSk, status: newStatus }),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error reviewing takedown request:", error);
    return CommonErrors.internalServerError();
  }
};
