import { UpdateCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  BanUnbanUserResponse,
  hasMinimumRole,
} from "@icaf/shared";
import { randomUUID } from "crypto";
import { getCurrentUser } from "../../utils/auth";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    if (!hasMinimumRole(currentUser.user.role, "admin")) {
        return CommonErrors.forbidden("Admin access required");
    }
    
    const adminId = currentUser.user.user_id;

    const targetUserId = event.pathParameters?.user_id;
    if (!targetUserId) {
      return CommonErrors.badRequest("user_id path parameter is required");
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const actionId = randomUUID();

    // ── Write banned=false to USER entity ─────────────────────────────────
    try {
      await dynamodb.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${targetUserId}`, SK: "PROFILE" },
          UpdateExpression: "SET banned = :banned",
          ExpressionAttributeValues: { ":banned": false },
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
          action: "unban",
          type: "ACCOUNT_ACTION",
        },
      }),
    );

    const response: BanUnbanUserResponse = {
      message: "User unbanned successfully",
      user_id: targetUserId,
      banned: false,
      admin_action_id: actionId,
      timestamp: nowSeconds,
    };

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error unbanning user:", error);
    return CommonErrors.internalServerError();
  }
};
