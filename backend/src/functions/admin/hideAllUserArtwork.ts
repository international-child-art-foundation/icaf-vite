import { QueryCommand, UpdateCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
} from "@icaf/shared";
import { ARTWORK_GSI_ATTRS_TO_REMOVE } from "../../dynamo/artGsis";
import { GROUP_GSI_ATTRS_TO_REMOVE } from "../../dynamo/groupGsis";
import { reviewPk, reviewGsiSk } from "../../dynamo/reviewGsi";
import { EntityType, GSI } from "../../dynamo/ddbSchemaConsts";
import { byOwnerPk } from "../../dynamo/ownerGsi";
import { Status } from "../../dynamo/shared";
import { randomUUID } from "crypto";
import { getCurrentUser } from "../../utils/auth";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    const adminId = currentUser.user.user_id;

    const targetUserId = event.pathParameters?.user_id;
    if (!targetUserId) {
      return CommonErrors.badRequest("user_id path parameter is required");
    }

    const nowMs = Date.now();
    const nowSeconds = Math.floor(nowMs / 1000);

    // ── Find all owned ART + GROUP entities ───────────────────────────────
    const ownedItems: { pk: string; sk: string; type: "ART" | "GROUP"; id: string }[] = [];
    let ownerLastKey: Record<string, unknown> | undefined;

    do {
      const ownerResult = await dynamodb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: GSI.ByOwner,
          KeyConditionExpression: "OWN_PK = :pk",
          ExpressionAttributeValues: { ":pk": byOwnerPk(targetUserId) },
          ...(ownerLastKey && { ExclusiveStartKey: ownerLastKey }),
        }),
      );

      for (const item of ownerResult.Items ?? []) {
        const type = item.type as string;
        if (type === "ART") {
          ownedItems.push({ pk: `ART#${item.art_id}`, sk: "-", type: "ART", id: item.art_id as string });
        } else if (type === "GROUP") {
          ownedItems.push({ pk: `GROUP#${item.group_id}`, sk: "-", type: "GROUP", id: item.group_id as string });
        }
      }

      ownerLastKey = ownerResult.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (ownerLastKey);

    // ── Hide each entity ───────────────────────────────────────────────────
    for (const { pk, sk, type, id } of ownedItems) {
      const isArt = type === "ART";
      const entityType = isArt ? EntityType.Art : EntityType.Group;
      const galleryAttrs = isArt
        ? ARTWORK_GSI_ATTRS_TO_REMOVE.join(", ")
        : GROUP_GSI_ATTRS_TO_REMOVE.join(", ");

      await dynamodb.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: pk, SK: sk },
          UpdateExpression: `SET #status = :status, REV_PK = :revPk, REV_SK = :revSk REMOVE ${galleryAttrs}`,
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: {
            ":status": "hidden",
            ":revPk": reviewPk(),
            ":revSk": reviewGsiSk(Status.Hidden, entityType, nowMs, id),
          },
        }),
      );
    }

    // ── Write ACCOUNT_ACTION audit record ─────────────────────────────────
    const actionId = randomUUID();

    await dynamodb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${targetUserId}`,
          SK: `AA#${nowSeconds}`,
          user_id: targetUserId,
          timestamp: nowSeconds,
          initiator_id: adminId,
          action: "hide_all",
          type: "ACCOUNT_ACTION",
        },
      }),
    );

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({
        success: true,
        user_id: targetUserId,
        items_hidden: ownedItems.length,
        admin_action_id: actionId,
      }),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error hiding all user artwork:", error);
    return CommonErrors.internalServerError();
  }
};
