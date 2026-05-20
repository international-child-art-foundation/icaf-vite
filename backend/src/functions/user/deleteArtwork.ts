import { GetCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { dynamodb, s3Client, TABLE_NAME, S3_BUCKET_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  ArtworkEntity,
  GroupEntity,
} from "@icaf/shared";
import { repopulateCovers } from "../shared/groupUtils";
import { getCurrentUser } from "../../utils/auth";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    const userId = currentUser.user.user_id;

    const artId = event.pathParameters?.art_id;
    if (!artId) {
      return CommonErrors.badRequest("art_id path parameter is required");
    }

    // ── Read ART entity to verify ownership ───────────────────────────────
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
    if (art.user_id !== userId) {
      return CommonErrors.forbidden("Not authorized to delete this artwork");
    }

    // ── Delete ART entity ─────────────────────────────────────────────────
    await dynamodb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { PK: `ART#${artId}`, SK: "-" },
      }),
    );

    // ── Remove from GROUP member/cover lists if grouped ───────────────────
    if (art.group_id) {
      const groupResult = await dynamodb.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: `GROUP#${art.group_id}`, SK: "-" },
        }),
      );

      if (groupResult.Item) {
        const group = groupResult.Item as GroupEntity;
        const newMemberIds = group.member_art_ids.filter((id) => id !== artId);
        const filteredCoverIds = group.cover_art_ids.filter((id) => id !== artId);
        const newCoverIds = repopulateCovers(newMemberIds, filteredCoverIds);

        await dynamodb.send(
          new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK: `GROUP#${art.group_id}`, SK: "-" },
            UpdateExpression: "SET member_art_ids = :members, cover_art_ids = :covers",
            ExpressionAttributeValues: {
              ":members": newMemberIds,
              ":covers": newCoverIds,
            },
          }),
        );
      }
    }

    // ── S3 cleanup (non-fatal) ─────────────────────────────────────────────
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

    return {
      statusCode: HTTP_STATUS.NO_CONTENT,
      body: "",
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error deleting artwork:", error);
    return CommonErrors.internalServerError();
  }
};
