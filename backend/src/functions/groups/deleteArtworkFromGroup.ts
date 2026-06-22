import { GetCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  ArtworkEntity,
  GroupEntity,
} from "@icaf/shared";
import { getCurrentUser } from "../../utils/auth";
import { reviewPk, reviewGsiSk } from "../../dynamo/reviewGsi";
import { EntityType } from "../../dynamo/ddbSchemaConsts";
import { Status } from "../../dynamo/shared";
import { GROUP_GSI_ATTRS_TO_REMOVE } from "../../dynamo/groupGsis";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    const userId = currentUser.user.user_id;

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

    const newMemberIds = group.member_art_ids.filter((id) => id !== artId);
    const nowMs = Date.now();

    await dynamodb.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Delete: {
              TableName: TABLE_NAME,
              Key: { PK: `ART#${artId}`, SK: "-" },
              ConditionExpression: "group_id = :groupId AND user_id = :userId",
              ExpressionAttributeValues: { ":groupId": groupId, ":userId": userId },
            },
          },
          {
            Update: {
              TableName: TABLE_NAME,
              Key: { PK: `GROUP#${groupId}`, SK: "-" },
              UpdateExpression:
                "SET member_art_ids = :members, #status = :pending, REV_PK = :revPk, " +
                "REV_SK = :revSk, rev_num = if_not_exists(rev_num, :one) + :one " +
                `REMOVE ${GROUP_GSI_ATTRS_TO_REMOVE.join(", ")}`,
              ConditionExpression:
                "user_id = :userId AND (rev_num = :revision OR (attribute_not_exists(rev_num) AND :revision = :one))",
              ExpressionAttributeNames: { "#status": "status" },
              ExpressionAttributeValues: {
                ":members": newMemberIds,
                ":pending": Status.Pending,
                ":revPk": reviewPk(),
                ":revSk": reviewGsiSk(Status.Pending, EntityType.Group, nowMs, groupId),
                ":userId": userId,
                ":revision": group.rev_num ?? 1,
                ":one": 1,
              },
            },
          },
        ],
      }),
    );

    return {
      statusCode: HTTP_STATUS.NO_CONTENT,
      body: "",
      headers: COMMON_HEADERS,
    };
  } catch (error: unknown) {
    if ((error as { name?: string }).name === "TransactionCanceledException") {
      return CommonErrors.conflict("The group changed while the artwork was being removed. Refresh and try again.");
    }
    console.error("Error deleting artwork from group:", error);
    return CommonErrors.internalServerError();
  }
};
