import { UpdateCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  BanUserRequest,
  BanUnbanUserResponse,
  MAX_BAN_REASON_LEN,
} from "@icaf/shared";
import { randomUUID } from "crypto";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    if (event.httpMethod !== "POST") {
      return CommonErrors.methodNotAllowed();
    }

    const adminId = event.requestContext?.authorizer?.claims?.sub;
    if (!adminId) {
      return CommonErrors.unauthorized();
    }

    const targetUserId = event.pathParameters?.user_id;
    if (!targetUserId) {
      return CommonErrors.badRequest("user_id path parameter is required");
    }

    const body: BanUserRequest = JSON.parse(event.body ?? "{}");
    if (!body.reason?.trim()) {
      return CommonErrors.badRequest("reason is required");
    }
    if (body.reason.length > MAX_BAN_REASON_LEN) {
      return CommonErrors.badRequest(`reason must be ${MAX_BAN_REASON_LEN} characters or less`);
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const actionId = randomUUID();

    // ── Write banned=true to USER entity ──────────────────────────────────
    try {
      await dynamodb.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${targetUserId}`, SK: "PROFILE" },
          UpdateExpression: "SET banned = :banned",
          ExpressionAttributeValues: { ":banned": true },
          ConditionExpression: "attribute_exists(PK)",
        }),
      );
    } catch (err: unknown) {
      const ddbErr = err as { name?: string };
      if (ddbErr.name === "ConditionalCheckFailedException") {
        return CommonErrors.notFound("User not found");
      }
      throw err;
    }

    // ── Write ACCOUNT_ACTION audit record ─────────────────────────────────
    await dynamodb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${targetUserId}`,
          SK: `AA#${nowSeconds}`,
          user_id: targetUserId,
          timestamp: nowSeconds,
          initiator_id: adminId,
          action: "ban",
          reason: body.reason.trim(),
          type: "ACCOUNT_ACTION",
        },
      }),
    );

    const response: BanUnbanUserResponse = {
      message: "User banned successfully",
      user_id: targetUserId,
      banned: true,
      admin_action_id: actionId,
      timestamp: nowSeconds,
    };

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error banning user:", error);
    return CommonErrors.internalServerError();
  }
};
