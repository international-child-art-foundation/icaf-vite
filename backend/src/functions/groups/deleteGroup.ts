import { GetCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  GroupEntity,
} from "@icaf/shared";
import { getCurrentUser } from "../../utils/auth";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    const userId = currentUser.user.user_id;

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

    // Delete the group and its current membership atomically. Missing artwork
    // is tolerated, but an artwork that now belongs elsewhere aborts the delete.
    await dynamodb.send(
      new TransactWriteCommand({
        TransactItems: [
          ...group.member_art_ids.map((artId) => ({
            Delete: {
              TableName: TABLE_NAME,
              Key: { PK: `ART#${artId}`, SK: "-" },
              ConditionExpression: "attribute_not_exists(PK) OR group_id = :groupId",
              ExpressionAttributeValues: { ":groupId": groupId },
            },
          })),
          {
            Delete: {
              TableName: TABLE_NAME,
              Key: { PK: `GROUP#${groupId}`, SK: "-" },
              ConditionExpression:
                "attribute_exists(PK) AND user_id = :userId AND (rev_num = :revision OR (attribute_not_exists(rev_num) AND :revision = :one))",
              ExpressionAttributeValues: {
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
      return CommonErrors.conflict("The group changed while it was being deleted. Refresh and try again.");
    }
    console.error("Error deleting group:", error);
    return CommonErrors.internalServerError();
  }
};
