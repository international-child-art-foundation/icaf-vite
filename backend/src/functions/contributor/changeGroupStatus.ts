import {
  BatchGetCommand,
  GetCommand,
  TransactWriteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  ArtworkEntity,
  GroupEntity,
  GroupStatus,
  UserEntity,
  hasMinimumRole,
} from "@icaf/shared";
import { sendApprovalEmailToUser } from "../../utils/emails/artworkEmailControls";
import { buildApprovedGroupGsiAttrs, GROUP_GSI_ATTRS_TO_REMOVE } from "../../dynamo/groupGsis";
import { buildApprovedArtworkGsiAttrs } from "../../dynamo/artGsis";
import { reviewPk, reviewGsiSk } from "../../dynamo/reviewGsi";
import { EntityType } from "../../dynamo/ddbSchemaConsts";
import { Status } from "../../dynamo/shared";
import { parseJsonBody } from "../../utils/request";
import { getCurrentUser } from "../../utils/auth";

const VALID_STATUSES: GroupStatus[] = ["approved", "hidden", "rejected"];

async function getPendingGroupArtworks(group: GroupEntity): Promise<ArtworkEntity[]> {
  if (group.member_art_ids.length === 0) return [];

  let keys = group.member_art_ids.map((artId) => ({ PK: `ART#${artId}`, SK: "-" }));
  const artworks: ArtworkEntity[] = [];

  while (keys.length > 0) {
    const result = await dynamodb.send(
      new BatchGetCommand({
        RequestItems: {
          [TABLE_NAME]: {
            Keys: keys,
            ConsistentRead: true,
          },
        },
      }),
    );

    artworks.push(...((result.Responses?.[TABLE_NAME] ?? []) as ArtworkEntity[]));
    keys = (result.UnprocessedKeys?.[TABLE_NAME]?.Keys ?? []).map((key) => ({
      PK: key.PK as string,
      SK: key.SK as string,
    }));
  }

  return artworks.filter(
    (artwork) => artwork.status === "pending_review" && artwork.group_id === group.group_id,
  );
}

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    if (!hasMinimumRole(currentUser.user.role, "contributor")) {
        return CommonErrors.forbidden("Contributor access required");
    }
    

    const groupId = event.pathParameters?.group_id;
    if (!groupId) {
      return CommonErrors.badRequest("group_id path parameter is required");
    }

    const parsedBody = parseJsonBody<{ status?: string }>(event);
    if (!parsedBody.ok) {
      return parsedBody.response;
    }

    const body = parsedBody.value;
    const newStatus = body.status as GroupStatus | undefined;

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return CommonErrors.badRequest(`status must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    // ── Read GROUP entity to get theme attrs for gallery GSI construction ──
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
    const nowMs = Date.now();
    const pendingArtworks = newStatus === "approved"
      ? await getPendingGroupArtworks(group)
      : [];

    let updateExpr: string;
    const exprValues: Record<string, unknown> = { ":status": newStatus };
    const exprNames: Record<string, string> = { "#status": "status" };

    if (newStatus === "approved") {
      const gsiAttrs = buildApprovedGroupGsiAttrs({
        tsMs: group.ts * 1000,
        groupId,
        theme: group.theme,
      });

      const setAttrs = Object.entries(gsiAttrs)
        .map(([k, v], i) => { exprValues[`:gsi${i}`] = v; return `${k} = :gsi${i}`; })
        .join(", ");

      updateExpr = `SET #status = :status, ${setAttrs} REMOVE REV_PK, REV_SK`;
    } else {
      const reviewSkStatus = newStatus === "hidden" ? Status.Hidden : Status.Rejected;
      exprValues[":revPk"] = reviewPk();
      exprValues[":revSk"] = reviewGsiSk(reviewSkStatus, EntityType.Group, nowMs, groupId);

      updateExpr = `SET #status = :status, REV_PK = :revPk, REV_SK = :revSk REMOVE ${GROUP_GSI_ATTRS_TO_REMOVE.join(", ")}`;
    }

    const groupUpdate = {
      TableName: TABLE_NAME,
      Key: { PK: `GROUP#${groupId}`, SK: "-" },
      UpdateExpression: updateExpr,
      ExpressionAttributeNames: exprNames,
      ExpressionAttributeValues: exprValues,
      ConditionExpression: "attribute_exists(PK)",
    };

    if (newStatus === "approved" && pendingArtworks.length > 0) {
      await dynamodb.send(
        new TransactWriteCommand({
          TransactItems: [
            { Update: groupUpdate },
            ...pendingArtworks.map((artwork) => {
              const artworkGsiAttrs = buildApprovedArtworkGsiAttrs({
                tsMs: artwork.ts * 1000,
                artId: artwork.art_id,
                theme: artwork.theme,
              });
              const artworkValues: Record<string, unknown> = {
                ":approved": "approved",
                ":pending": "pending_review",
                ":groupId": groupId,
              };
              const setAttrs = Object.entries(artworkGsiAttrs)
                .map(([key, value], index) => {
                  artworkValues[`:gsi${index}`] = value;
                  return `${key} = :gsi${index}`;
                })
                .join(", ");

              return {
                Update: {
                  TableName: TABLE_NAME,
                  Key: { PK: `ART#${artwork.art_id}`, SK: "-" },
                  UpdateExpression: `SET #status = :approved, ${setAttrs} REMOVE REV_PK, REV_SK`,
                  ExpressionAttributeNames: { "#status": "status" },
                  ExpressionAttributeValues: artworkValues,
                  ConditionExpression: "#status = :pending AND group_id = :groupId",
                },
              };
            }),
          ],
        }),
      );
    } else {
      await dynamodb.send(new UpdateCommand(groupUpdate));
    }

    // ── Send approval email (non-blocking) ────────────────────────────────
    if (newStatus === "approved" && group.notifications === true) {
      dynamodb.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${group.user_id}`, SK: "PROFILE" },
        }),
      ).then((userResult) => {
        const user = userResult.Item as UserEntity | undefined;
        if (user) {
          sendApprovalEmailToUser({
            user,
            type: "group",
            id: groupId,
            title: group.title,
            theme: group.theme,
          }).catch((err) => console.error("Approval email failed:", err));
        }
      }).catch((err) => console.error("User lookup for approval email failed:", err));
    }

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ success: true, group_id: groupId, status: newStatus }),
      headers: COMMON_HEADERS,
    };
  } catch (error: unknown) {
    const ddbErr = error as { name?: string };
    if (ddbErr.name === "ConditionalCheckFailedException") {
      return CommonErrors.notFound("Group not found");
    }
    console.error("Error changing group status:", error);
    return CommonErrors.internalServerError();
  }
};
