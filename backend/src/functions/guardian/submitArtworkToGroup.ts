import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, s3Client, TABLE_NAME, S3_BUCKET_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  UserEntity,
  GroupEntity,
  SubmitArtworkResponse,
  SubmitterRelationship,
  UPLOAD_FILE_TYPES,
  validateOptionalArtworkFields,
  SHA256_HEX,
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

interface SubmitArtworkToGroupBody {
  file_type: string;
  legal_release_hash: string;
  f_name?: string;
  age?: number;
  country?: string;
  region?: string;
  title?: string;
  description?: string;
  submitter_relationship?: SubmitterRelationship;
  theme_family?: string;
  theme_instance?: string;
}

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

    const groupId = event.pathParameters?.group_id;
    if (!groupId) {
      return CommonErrors.badRequest("group_id path parameter is required");
    }

    // ── Check guardian is not banned ───────────────────────────────────────
    const userResult = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: "PROFILE" },
      }),
    );

    if (!userResult.Item) {
      return CommonErrors.notFound("User not found");
    }

    const guardian = userResult.Item as UserEntity;
    if (guardian.banned) {
      return CommonErrors.forbidden("This account is banned");
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
      return CommonErrors.forbidden("Not authorized to add to this group");
    }

    const body: SubmitArtworkToGroupBody = JSON.parse(event.body ?? "{}");

    if (!body.file_type || !(UPLOAD_FILE_TYPES as readonly string[]).includes(body.file_type)) {
      return CommonErrors.badRequest(`file_type must be one of: ${UPLOAD_FILE_TYPES.join(", ")}`);
    }
    if (!body.legal_release_hash?.trim() || !SHA256_HEX.test(body.legal_release_hash)) {
      return CommonErrors.badRequest("legal_release_hash must be a valid SHA-256 hex string");
    }
    const fieldErrors = validateOptionalArtworkFields(body);
    if (fieldErrors.length > 0) {
      return CommonErrors.badRequest(fieldErrors.join("; "));
    }

    const nowMs = Date.now();
    const nowSeconds = Math.floor(nowMs / 1000);
    const artId = randomUUID();

    // ── Create ART entity ──────────────────────────────────────────────────
    await dynamodb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `ART#${artId}`,
          SK: "-",
          art_id: artId,
          user_id: userId, // guardian owns the record
          is_virtual: true, // constituent has no account
          group_id: groupId,
          status: "pending_review" as const,
          kudos_count: 0,
          timestamp: nowSeconds,
          legal_release_hash: body.legal_release_hash.trim(),
          type: "ART",
          // optional fields
          ...(body.f_name && { f_name: body.f_name }),
          ...(body.age !== undefined && { age: body.age }),
          ...(body.country && { country: body.country }),
          ...(body.region && { region: body.region }),
          ...(body.title && { title: body.title }),
          ...(body.description && { description: body.description }),
          ...(body.submitter_relationship && { submitter_relationship: body.submitter_relationship }),
          ...(body.theme_family && { theme_family: body.theme_family }),
          ...(body.theme_instance && { theme_instance: body.theme_instance }),
          // Owner GSI
          OWN_PK: byOwnerPk(userId),
          OWN_SK: byOwnerGsiSk(EntityType.Art, nowMs, artId),
          // Review GSI
          REV_PK: reviewPk(),
          REV_SK: reviewGsiSk(Status.Pending, EntityType.Art, nowMs, artId),
        },
      }),
    );

    // ── Update GROUP: append art_id to member_art_ids, cover if room ───────
    const currentCoverCount = group.cover_art_ids.length;
    const updateExpr =
      currentCoverCount < 4
        ? "SET member_art_ids = list_append(member_art_ids, :newArt), cover_art_ids = list_append(cover_art_ids, :newArt)"
        : "SET member_art_ids = list_append(member_art_ids, :newArt)";

    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `GROUP#${groupId}`, SK: "-" },
        UpdateExpression: updateExpr,
        ExpressionAttributeValues: { ":newArt": [artId] },
      }),
    );

    // ── Generate presigned S3 upload URL ──────────────────────────────────
    const s3Key = `${artId}/original.${body.file_type}`;
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
      message: "Artwork added to group. Upload your image using the presigned URL.",
    };

    return {
      statusCode: HTTP_STATUS.CREATED,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error submitting artwork to group:", error);
    return CommonErrors.internalServerError();
  }
};
