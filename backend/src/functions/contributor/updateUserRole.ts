import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  UpdateUserRoleRequest,
} from "@icaf/shared";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    if (event.httpMethod !== "PATCH") {
      return CommonErrors.methodNotAllowed();
    }

    const callerId = event.requestContext?.authorizer?.claims?.sub;
    if (!callerId) {
      return CommonErrors.unauthorized();
    }

    const targetUserId = event.pathParameters?.user_id;
    if (!targetUserId) {
      return CommonErrors.badRequest("user_id path parameter is required");
    }

    const body: UpdateUserRoleRequest = JSON.parse(event.body ?? "{}");
    if (!body.new_role) {
      return CommonErrors.badRequest("new_role is required");
    }

    // UpdateUserRoleRequest excludes 'admin' — enforced by type
    const allowedRoles = ["user", "guardian", "contributor"] as const;
    if (!(allowedRoles as readonly string[]).includes(body.new_role)) {
      return CommonErrors.badRequest(`new_role must be one of: ${allowedRoles.join(", ")}`);
    }

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

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ success: true, user_id: targetUserId, new_role: body.new_role }),
      headers: COMMON_HEADERS,
    };
  } catch (error: unknown) {
    const ddbErr = error as { name?: string };
    if (ddbErr.name === "ConditionalCheckFailedException") {
      return CommonErrors.notFound("User not found");
    }
    console.error("Error updating user role:", error);
    return CommonErrors.internalServerError();
  }
};
