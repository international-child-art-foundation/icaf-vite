import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { QueryCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, s3Client, TABLE_NAME, S3_BUCKET_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  GuestSubmitArtworkRequest,
  SubmitArtworkResponse,
  UserEntity,
  validateSubmissionData,
} from "@icaf/shared";
import { GSI, EntityType } from "../../dynamo/ddbSchemaConsts";
import { emailPk, emailGsiSk } from "../../dynamo/emailGsi";
import { byOwnerPk, byOwnerGsiSk } from "../../dynamo/ownerGsi";
import { reviewPk, reviewGsiSk } from "../../dynamo/reviewGsi";
import { Status } from "../../dynamo/shared";
import { sendArtworkSubmissionEmail } from "../../utils/emails/artworkSubmission";
import { randomUUID } from "crypto";

const PRESIGNED_URL_EXPIRES_SECONDS = 15 * 60; // 15 minutes
const VERIFY_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

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

    const body: GuestSubmitArtworkRequest = JSON.parse(event.body ?? "{}");

    // ── Validate identity ──────────────────────────────────────────────────
    const hasEmail = typeof body.email === "string" && body.email.trim().length > 0;
    const hasUserId = typeof body.user_id === "string" && body.user_id.trim().length > 0;

    if (!hasEmail && !hasUserId) {
      return CommonErrors.badRequest("Either email or user_id is required");
    }
    if (hasEmail && hasUserId) {
      return CommonErrors.badRequest("Provide either email or user_id, not both");
    }

    // ── Validate artwork fields ────────────────────────────────────────────
    const artErrors = validateSubmissionData(body);
    if (artErrors.length > 0) {
      return CommonErrors.badRequest(artErrors.join("; "));
    }

    const nowMs = Date.now();
    const nowSeconds = Math.floor(nowMs / 1000);

    // ── Step 1: Find or create virtual USER entity ─────────────────────────
    let user: UserEntity;

    if (hasUserId) {
      // Returning guest — look up by user_id directly
      const result = await dynamodb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND SK = :sk",
          ExpressionAttributeValues: {
            ":pk": `USER#${body.user_id!.trim()}`,
            ":sk": "PROFILE",
          },
          Limit: 1,
        }),
      );
      if (!result.Items?.length) {
        return CommonErrors.notFound("User not found");
      }
      user = result.Items[0] as UserEntity;

      if (user.banned) {
        return CommonErrors.forbidden("This account is banned");
      }
      if (!user.is_virtual) {
        return CommonErrors.conflict(
          "This account already exists. Please log in to submit artwork.",
        );
      }
    } else {
      // New or returning email-based guest — query Email GSI
      const email = body.email!.trim();
      const emailResult = await dynamodb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: GSI.Email,
          KeyConditionExpression: "EMAIL_PK = :pk AND EMAIL_SK = :sk",
          ExpressionAttributeValues: {
            ":pk": emailPk(email),
            ":sk": emailGsiSk(EntityType.User),
          },
          Limit: 1,
        }),
      );

      if (emailResult.Items?.length) {
        const existing = emailResult.Items[0] as UserEntity;
        if (existing.banned) {
          return CommonErrors.forbidden("This account is banned");
        }
        if (!existing.is_virtual) {
          return CommonErrors.conflict(
            "An account with this email already exists. Please log in to submit artwork.",
          );
        }
        user = existing;
      } else {
        // Create new virtual USER entity
        const userId = randomUUID();
        const newUser = {
          PK: `USER#${userId}`,
          SK: "PROFILE",
          user_id: userId,
          email,
          is_virtual: true,
          timestamp: nowSeconds,
          banned: false,
          has_magazine_subscription: false,
          has_newsletter_subscription: false,
          type: "USER" as const,
          // Email GSI
          EMAIL_PK: emailPk(email),
          EMAIL_SK: emailGsiSk(EntityType.User),
        };

        await dynamodb.send(new PutCommand({ TableName: TABLE_NAME, Item: newUser }));
        user = newUser as unknown as UserEntity;
      }
    }

    // ── Step 2: Create ART entity ──────────────────────────────────────────
    const artId = randomUUID();

    await dynamodb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `ART#${artId}`,
          SK: "-",
          art_id: artId,
          user_id: user.user_id,
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
          OWN_PK: byOwnerPk(user.user_id),
          OWN_SK: byOwnerGsiSk(EntityType.Art, nowMs, artId),
          // Review GSI (always written; removed on approval)
          REV_PK: reviewPk(),
          REV_SK: reviewGsiSk(Status.Pending, EntityType.Art, nowMs, artId),
        },
      }),
    );

    // ── Step 3: Generate presigned S3 upload URL ───────────────────────────
    // Key is always {art_id}/initial (no extension). ProcessImage is triggered
    // by the S3 ObjectCreated event on this key and auto-detects the format via Sharp.
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

    // ── Step 4: Write verify token to USER entity ──────────────────────────
    const verifyToken = randomUUID();
    const verifyTokenExpiration = nowSeconds + VERIFY_TOKEN_TTL_SECONDS;

    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${user.user_id}`, SK: "PROFILE" },
        UpdateExpression:
          "SET verify_token = :token, verify_token_expiration = :exp",
        ExpressionAttributeValues: {
          ":token": verifyToken,
          ":exp": verifyTokenExpiration,
        },
      }),
    );

    // ── Step 5: Send artwork submission email ─────────────────────────────
    await sendArtworkSubmissionEmail({
      toEmail: user.email,
      userId: user.user_id,
      verifyToken,
    });

    const response: SubmitArtworkResponse = {
      success: true,
      art_id: artId,
      presigned_url: presignedUrl,
      message:
        "Artwork submitted. Upload your image using the presigned URL. Check your email to verify your account.",
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
