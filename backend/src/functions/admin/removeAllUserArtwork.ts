import { QueryCommand, DeleteCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  RemoveAllUserArtworkRequest,
  RemoveAllUserArtworkResponse,
} from "@icaf/shared";
import { GSI } from "../../dynamo/ddbSchemaConsts";
import { byOwnerPk } from "../../dynamo/ownerGsi";
import { randomUUID } from "crypto";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    if (event.httpMethod !== "DELETE") {
      return CommonErrors.methodNotAllowed();
    }

    const adminId = event.requestContext?.authorizer?.claims?.sub;
    if (!adminId) {
      return CommonErrors.unauthorized();
    }

    const targetUserId = event.pathParameters?.user_id;
    if (!targetUserId) {
      return CommonErrors.badRequest("user_id path parameter is required");
    }

    const body: RemoveAllUserArtworkRequest = JSON.parse(event.body ?? "{}");
    if (!body.reason?.trim()) {
      return CommonErrors.badRequest("reason is required");
    }

    // ── Find all ART and GROUP entities via ByOwner GSI ───────────────────
    const ownedItems: { pk: string; sk: string }[] = [];
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
          ownedItems.push({ pk: `ART#${item.art_id}`, sk: "-" });
        } else if (type === "GROUP") {
          ownedItems.push({ pk: `GROUP#${item.group_id}`, sk: "-" });
        }
      }

      ownerLastKey = ownerResult.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (ownerLastKey);

    // ── Delete each entity ─────────────────────────────────────────────────
    const failedDeletions: { art_id: string; reason: string }[] = [];
    let deletedCount = 0;

    for (const { pk, sk } of ownedItems) {
      try {
        await dynamodb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: pk, SK: sk } }));
        deletedCount++;
      } catch (err: unknown) {
        const errObj = err as { message?: string };
        failedDeletions.push({ art_id: pk, reason: errObj.message ?? "Unknown error" });
      }
    }

    // ── Write ACCOUNT_ACTION audit record ─────────────────────────────────
    const nowSeconds = Math.floor(Date.now() / 1000);
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
          action: "delete_artwork",
          reason: body.reason.trim(),
          action_id: actionId,
          type: "ACCOUNT_ACTION",
        },
      }),
    );

    const response: RemoveAllUserArtworkResponse = {
      message: "User artwork removed successfully",
      user_id: targetUserId,
      artworks_removed: deletedCount,
      failed_deletions: failedDeletions,
      admin_action_id: actionId,
      timestamp: nowSeconds,
    };

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error removing all user artwork:", error);
    return CommonErrors.internalServerError();
  }
};
