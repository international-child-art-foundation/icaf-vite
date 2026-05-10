import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, s3Client, TABLE_NAME, S3_BUCKET_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  SubmitArtworkRequest,
  SubmitArtworkResponse,
  UserEntity,
  validateSubmissionData,
} from "@icaf/shared";
import { EntityType } from "../../dynamo/ddbSchemaConsts";
import { byOwnerPk, byOwnerGsiSk } from "../../dynamo/ownerGsi";
import { reviewPk, reviewGsiSk } from "../../dynamo/reviewGsi";
import { Status } from "../../dynamo/shared";
import { randomUUID } from "crypto";

const PRESIGNED_URL_EXPIRES_SECONDS = 20 * 60; // 20 minutes

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
};

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    if (event.httpMethod !== "POST") {
      return CommonErrors.methodNotAllowed();
    }

    const userId = event.requestContext?.authorizer?.claims?.sub;
    if (!userId) {
      return CommonErrors.unauthorized();
    }

    const body: SubmitArtworkRequest = JSON.parse(event.body ?? "{}");

    // ── Validate artwork fields ────────────────────────────────────────────
    const artErrors = validateSubmissionData(body);
    if (artErrors.length > 0) {
      return CommonErrors.badRequest(artErrors.join("; "));
    }

    // ── Check user is not banned ───────────────────────────────────────────
    const userResult = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: "PROFILE" },
      }),
    );

    if (!userResult.Item) {
      return CommonErrors.notFound("User not found");
    }

    const user = userResult.Item as UserEntity;
    if (user.banned) {
      return CommonErrors.forbidden("This account is banned");
    }

    const nowMs = Date.now();
    const nowSeconds = Math.floor(nowMs / 1000);

    // ── Create ART entity ──────────────────────────────────────────────────
    const artId = randomUUID();

    await dynamodb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `ART#${artId}`,
          SK: "-",
          art_id: artId,
          user_id: userId,
          is_virtual: body.is_virtual,
          status: "pending_review" as const,
          kudos_count: 0,
          timestamp: nowSeconds,
          release_hash: body.release_hash.trim(),
          type: "ART",
          // optional fields
          ...(body.title && { title: body.title }),
          ...(body.description && { description: body.description }),
          ...(body.f_name && { f_name: body.f_name }),
          ...(body.age !== undefined && { age: body.age }),
          ...(body.country && { country: body.country }),
          ...(body.region && { region: body.region }),
          ...(body.submitter_relationship && {
            submitter_relationship: body.submitter_relationship,
          }),
          ...(body.theme_family && { theme_family: body.theme_family }),
          ...(body.theme_instance && { theme_instance: body.theme_instance }),
          ...(body.group_id && { group_id: body.group_id }),
          // Owner GSI (always written)
          OWN_PK: byOwnerPk(userId),
          OWN_SK: byOwnerGsiSk(EntityType.Art, nowMs, artId),
          // Review GSI (always written; removed on approval)
          REV_PK: reviewPk(),
          REV_SK: reviewGsiSk(Status.Pending, EntityType.Art, nowMs, artId),
        },
      }),
    );

    // ── Generate presigned S3 upload URL ──────────────────────────────────
    // Key is always {art_id}/initial (no extension). ProcessImage auto-detects format.
    const s3Key = `${artId}/initial`;
    const presignedUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: s3Key,
        ContentType: CONTENT_TYPES[body.file_type],
      }),
      { expiresIn: PRESIGNED_URL_EXPIRES_SECONDS },
    );

    const response: SubmitArtworkResponse = {
      success: true,
      art_id: artId,
      presigned_url: presignedUrl,
      message: "Artwork submitted. Upload your image using the presigned URL.",
    };

    return {
      statusCode: HTTP_STATUS.CREATED,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error submitting artwork:", error);
    return CommonErrors.internalServerError();
  }
};
