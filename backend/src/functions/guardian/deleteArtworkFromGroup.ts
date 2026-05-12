import { GetCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  ArtworkEntity,
  GroupEntity,
} from "@icaf/shared";
import { repopulateCovers } from "../shared/groupUtils";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const userId = event.requestContext?.authorizer?.claims?.sub;
    if (!userId) {
      return CommonErrors.unauthorized();
    }

    const groupId = event.pathParameters?.group_id;
    const artId = event.pathParameters?.art_id;
    if (!groupId) {
      return CommonErrors.badRequest("group_id path parameter is required");
    }
    if (!artId) {
      return CommonErrors.badRequest("art_id path parameter is required");
    }

    // ── Read GROUP entity to verify ownership ─────────────────────────────
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
      return CommonErrors.forbidden("Not authorized to modify this group");
    }

    // ── Verify ART belongs to this group ──────────────────────────────────
    const artResult = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `ART#${artId}`, SK: "-" },
      }),
    );

    if (!artResult.Item) {
      return CommonErrors.notFound("Artwork not found");
    }

    const art = artResult.Item as ArtworkEntity;
    if (art.group_id !== groupId) {
      return CommonErrors.badRequest("Artwork does not belong to this group");
    }

    // ── Delete ART entity ─────────────────────────────────────────────────
    await dynamodb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { PK: `ART#${artId}`, SK: "-" },
      }),
    );

    // ── Update GROUP: remove art_id and repopulate covers if needed ─────────
    const newMemberIds = group.member_art_ids.filter((id) => id !== artId);
    const filteredCoverIds = group.cover_art_ids.filter((id) => id !== artId);
    const newCoverIds = repopulateCovers(newMemberIds, filteredCoverIds);

    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `GROUP#${groupId}`, SK: "-" },
        UpdateExpression: "SET member_art_ids = :members, cover_art_ids = :covers",
        ExpressionAttributeValues: {
          ":members": newMemberIds,
          ":covers": newCoverIds,
        },
      }),
    );

    return {
      statusCode: HTTP_STATUS.NO_CONTENT,
      body: "",
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error deleting artwork from group:", error);
    return CommonErrors.internalServerError();
  }
};
