import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  UserEntity,
  AlterUserRoleRequest,
  AlterUserRoleResponse,
} from "@icaf/shared";
import { parseJsonBody } from "../../utils/request";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const adminId = event.requestContext?.authorizer?.claims?.sub;
    if (!adminId) {
      return CommonErrors.unauthorized();
    }

    const targetUserId = event.pathParameters?.user_id;
    if (!targetUserId) {
      return CommonErrors.badRequest("user_id path parameter is required");
    }

    const parsedBody = parseJsonBody<AlterUserRoleRequest>(event);
    if (!parsedBody.ok) {
      return parsedBody.response;
    }

    const body = parsedBody.value;
    if (!body.new_role) {
      return CommonErrors.badRequest("new_role is required");
    }

    // ── Read target user to get current role ──────────────────────────────
    const userResult = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${targetUserId}`, SK: "PROFILE" },
      }),
    );

    if (!userResult.Item) {
      return CommonErrors.notFound("User not found");
    }

    const target = userResult.Item as UserEntity;
    const oldRole = target.role ?? "user";

    // ── Update role ────────────────────────────────────────────────────────
    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${targetUserId}`, SK: "PROFILE" },
        UpdateExpression: "SET #role = :role",
        ExpressionAttributeNames: { "#role": "role" },
        ExpressionAttributeValues: { ":role": body.new_role },
        ConditionExpression: "attribute_exists(PK)",
      }),
    );

    const response: AlterUserRoleResponse = {
      message: "User role updated successfully",
      user_id: targetUserId,
      old_role: oldRole,
      new_role: body.new_role,
      updated_fields: ["role"],
    };

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error: unknown) {
    const ddbErr = error as { name?: string };
    if (ddbErr.name === "ConditionalCheckFailedException") {
      return CommonErrors.notFound("User not found");
    }
    console.error("Error altering user role:", error);
    return CommonErrors.internalServerError();
  }
};
