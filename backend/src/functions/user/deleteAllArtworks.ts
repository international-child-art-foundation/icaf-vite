import { QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { dynamodb, s3Client, TABLE_NAME, S3_BUCKET_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
} from "@icaf/shared";
import { GSI } from "../../dynamo/ddbSchemaConsts";
import { byOwnerPk } from "../../dynamo/ownerGsi";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const userId = event.requestContext?.authorizer?.claims?.sub;
    if (!userId) {
      return CommonErrors.unauthorized();
    }

    // ── Sweep ByOwner GSI for all owned ART and GROUP entities ────────────
    const artIds: string[] = [];
    const keysToDelete: { PK: string; SK: string }[] = [];
    let lastKey: Record<string, unknown> | undefined;

    do {
      const result = await dynamodb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: GSI.ByOwner,
          KeyConditionExpression: "OWN_PK = :pk",
          ExpressionAttributeValues: { ":pk": byOwnerPk(userId) },
          ...(lastKey && { ExclusiveStartKey: lastKey }),
        }),
      );

      for (const item of result.Items ?? []) {
        if (item.type === "ART") {
          artIds.push(item.art_id as string);
          keysToDelete.push({ PK: `ART#${item.art_id}`, SK: "-" });
        } else if (item.type === "GROUP") {
          keysToDelete.push({ PK: `GROUP#${item.group_id}`, SK: "-" });
        }
      }

      lastKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (lastKey);

    // ── Delete all ART and GROUP DDB records ──────────────────────────────
    for (const key of keysToDelete) {
      await dynamodb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: key }));
    }

    // ── S3 cleanup for each artwork (non-fatal) ───────────────────────────
    for (const artId of artIds) {
      try {
        const listed = await s3Client.send(
          new ListObjectsV2Command({ Bucket: S3_BUCKET_NAME, Prefix: `${artId}/` }),
        );
        const objects = listed.Contents ?? [];
        if (objects.length > 0) {
          await s3Client.send(
            new DeleteObjectsCommand({
              Bucket: S3_BUCKET_NAME,
              Delete: { Objects: objects.map((o) => ({ Key: o.Key! })) },
            }),
          );
        }
      } catch (s3Err) {
        console.error(`S3 cleanup failed for art ${artId}:`, s3Err);
      }
    }

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({
        success: true,
        artworks_deleted: artIds.length,
        total_deleted: keysToDelete.length,
      }),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error deleting all user artworks:", error);
    return CommonErrors.internalServerError();
  }
};
