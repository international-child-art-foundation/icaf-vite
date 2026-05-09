import { GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  GroupEntity,
} from "@icaf/shared";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    if (event.httpMethod !== "DELETE") {
      return CommonErrors.methodNotAllowed();
    }

    const userId = event.requestContext?.authorizer?.claims?.sub;
    if (!userId) {
      return CommonErrors.unauthorized();
    }

    const groupId = event.pathParameters?.group_id;
    if (!groupId) {
      return CommonErrors.badRequest("group_id path parameter is required");
    }

    // ── Read GROUP entity to verify ownership and get member list ─────────
    const groupResult = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `GROUP#${groupId}`, SK: "-" },
      }),
    );

    if (!groupResult.Item) {
      return CommonErrors.notFound("Group not found");
    }

    const group = groupResult.Item as GroupEntity;
    if (group.user_id !== userId) {
      return CommonErrors.forbidden("Not authorized to delete this group");
    }

    // ── Delete each member ART entity ─────────────────────────────────────
    for (const artId of group.member_art_ids) {
      await dynamodb.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { PK: `ART#${artId}`, SK: "-" },
        }),
      );
    }

    // ── Delete GROUP entity ───────────────────────────────────────────────
    await dynamodb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { PK: `GROUP#${groupId}`, SK: "-" },
      }),
    );

    return {
      statusCode: HTTP_STATUS.NO_CONTENT,
      body: "",
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error deleting group:", error);
    return CommonErrors.internalServerError();
  }
};
