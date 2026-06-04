import { QueryCommand, GetCommand, UpdateCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  ArtworkEntity,
  GroupEntity,
  hasMinimumRole,
} from "@icaf/shared";
import { buildApprovedArtworkGsiAttrs } from "../../dynamo/artGsis";
import { buildApprovedGroupGsiAttrs } from "../../dynamo/groupGsis";
import { GSI } from "../../dynamo/ddbSchemaConsts";
import { byOwnerPk } from "../../dynamo/ownerGsi";
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

    // ── Restore each entity to 'approved' + rebuild gallery GSI attrs ─────
    for (const { pk, sk, type, id } of ownedItems) {
      const entityResult = await dynamodb.send(
        new GetCommand({ TableName: TABLE_NAME, Key: { PK: pk, SK: sk } }),
      );

      if (!entityResult.Item) continue;

      const exprValues: Record<string, unknown> = { ":status": "approved" };

      let setAttrs: string;
      if (type === "ART") {
        const art = entityResult.Item as ArtworkEntity;
        const gsiAttrs = buildApprovedArtworkGsiAttrs({
          tsMs: art.ts * 1000,
          artId: id,
          family: art.theme_family,
          instance: art.theme_instance,
        });
        const gsiParts = Object.entries(gsiAttrs).map(([k, v], i) => {
          exprValues[`:gsi${i}`] = v;
          return `${k} = :gsi${i}`;
        });
        setAttrs = `#status = :status, ${gsiParts.join(", ")}`;
      } else {
        const group = entityResult.Item as GroupEntity;
        const gsiAttrs = buildApprovedGroupGsiAttrs({
          tsMs: group.ts * 1000,
          groupId: id,
          family: group.theme_family,
          instance: group.theme_instance,
        });
        const gsiParts = Object.entries(gsiAttrs).map(([k, v], i) => {
          exprValues[`:gsi${i}`] = v;
          return `${k} = :gsi${i}`;
        });
        setAttrs = `#status = :status, ${gsiParts.join(", ")}`;
      }

      await dynamodb.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: pk, SK: sk },
          UpdateExpression: `SET ${setAttrs} REMOVE REV_PK, REV_SK`,
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: exprValues,
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
          ts: nowSeconds,
          initiator_id: adminId,
          action: "unhide_all",
          type: "ACCOUNT_ACTION",
        },
      }),
    );

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({
        success: true,
        user_id: targetUserId,
        items_unhidden: ownedItems.length,
        admin_action_id: actionId,
      }),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error unhiding all user artwork:", error);
    return CommonErrors.internalServerError();
  }
};
