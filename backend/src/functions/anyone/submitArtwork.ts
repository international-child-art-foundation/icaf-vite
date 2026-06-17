import { QueryCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  GuestSubmitArtworkRequest,
  SubmitArtworkResponse,
  UserEntity,
  normalizeEmail,
  validateGuestSubmitArtworkRequest,
} from "@icaf/shared";
import { GSI, EntityType } from "../../dynamo/ddbSchemaConsts";
import { emailPk, emailGsiSk } from "../../dynamo/emailGsi";
import { byOwnerPk, byOwnerGsiSk } from "../../dynamo/ownerGsi";
import { reviewPk, reviewGsiSk } from "../../dynamo/reviewGsi";
import { Status } from "../../dynamo/shared";
import { sendArtworkSubmissionEmail } from "../../utils/emails/artworkSubmission";
import { ensureArtworkUnsubscribeToken, shouldSuppressArtworkEmail } from "../../utils/emails/unsubscribe";
import { parseJsonBody } from "../../utils/request";
import { ensureThemeEntity } from "../shared/themeUtils";
import { hasUploadedArtworkImage } from "../shared/artworkUpload";
import { randomUUID } from "crypto";

const AUTH_ACTION_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const parsedBody = parseJsonBody<GuestSubmitArtworkRequest>(event);
    if (!parsedBody.ok) return parsedBody.response;
    const body = parsedBody.value;

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
    const artErrors = validateGuestSubmitArtworkRequest(body);
    if (artErrors.length > 0) {
      return CommonErrors.badRequest(artErrors.join("; "));
    }

    const nowMs = Date.now();
    const nowSeconds = Math.floor(nowMs / 1000);
    // ── Step 1: Find or prepare virtual USER entity ────────────────────────
    let user: UserEntity;
    let userToCreate: UserEntity | null = null;

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
      const email = normalizeEmail(body.email!);
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
        // Prepare the virtual USER entity, but do not write it until S3 is verified.
        const userId = randomUUID();
        const newUser = {
          PK: `USER#${userId}`,
          SK: "PROFILE",
          user_id: userId,
          email,
          is_virtual: true,
          ts: nowSeconds,
          banned: false,
          has_magazine_subscription: false,
          has_newsletter_subscription: false,
          artwork_emails_off: false,
          type: "USER" as const,
          // Email GSI
          EMAIL_PK: emailPk(email),
          EMAIL_SK: emailGsiSk(EntityType.User),
        };

        user = newUser as unknown as UserEntity;
        userToCreate = user;
      }
    }

    // ── Step 2: Verify the browser upload before any submission writes ─────
    const artId = body.art_id.trim();
    const imageUploaded = await hasUploadedArtworkImage(artId);
    if (!imageUploaded) {
      return CommonErrors.badRequest("Artwork image must be uploaded before submission");
    }

    const themeCheck = await ensureThemeEntity({ theme: body.theme, nowMs });
    if (!themeCheck.ok) return themeCheck.response;

    if (userToCreate) {
      await dynamodb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: userToCreate,
          ConditionExpression: "attribute_not_exists(PK)",
        }),
      );
    }

    await dynamodb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        ConditionExpression: "attribute_not_exists(PK)",
        Item: {
          PK: `ART#${artId}`,
          SK: "-",
          art_id: artId,
          user_id: user.user_id,
          status: "pending_review" as const,
          kudos_count: 0,
          ts: nowSeconds,
          release_hash: body.release_hash.trim(),
          ...(body.digital_signature && {
            digital_signature: body.digital_signature.trim(),
          }),
          promotional_use: body.promotional_use ?? false,
          type: "ART",
          notifications: body.group_id ? false : body.notifications ?? false,
          // optional fields
          ...(body.title && { title: body.title }),
          ...(body.description && { description: body.description }),
          ...(body.f_name && { f_name: body.f_name }),
          ...(body.l_name && { l_name: body.l_name }),
          ...(body.age !== undefined && { age: body.age }),
          ...(body.country && { country: body.country }),
          ...(body.region && { region: body.region }),
          ...(body.submitter_relationship && {
            submitter_relationship: body.submitter_relationship,
          }),
          ...(body.theme && { theme: body.theme }),
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

    // ── Step 3: Refresh auth-action token and email virtual users ─────────
    let sentSignupEmail = false;
    if (shouldSuppressArtworkEmail(user)) {
      const response: SubmitArtworkResponse = {
        success: true,
        art_id: artId,
        message: "Artwork submitted.",
      };

      return {
        statusCode: HTTP_STATUS.CREATED,
        body: JSON.stringify(response),
        headers: COMMON_HEADERS,
      };
    }

    if (user.emailed_signup_at) {
      const response: SubmitArtworkResponse = {
        success: true,
        art_id: artId,
        message: "Artwork submitted.",
      };

      return {
        statusCode: HTTP_STATUS.CREATED,
        body: JSON.stringify(response),
        headers: COMMON_HEADERS,
      };
    }

    const authActionToken = randomUUID();
    const authActionTokenExp = nowSeconds + AUTH_ACTION_TOKEN_TTL_SECONDS;

    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${user.user_id}`, SK: "PROFILE" },
        UpdateExpression:
          "SET auth_action_token = :token, auth_action_token_exp = :exp",
        ExpressionAttributeValues: {
          ":token": authActionToken,
          ":exp": authActionTokenExp,
        },
      }),
    );

    try {
      const unsubscribeToken = await ensureArtworkUnsubscribeToken(user);

      await sendArtworkSubmissionEmail({
        toEmail: user.email,
        userId: user.user_id,
        authActionToken,
        unsubscribeToken,
      });
      sentSignupEmail = true;

      await dynamodb.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${user.user_id}`, SK: "PROFILE" },
          UpdateExpression: "SET emailed_signup_at = :emailSignupAt",
          ExpressionAttributeValues: {
            ":emailSignupAt": nowSeconds,
          },
        }),
      );
    } catch (error) {
      console.error("Artwork submission signup email failed:", error);
    }

    const response: SubmitArtworkResponse = {
      success: true,
      art_id: artId,
      message: sentSignupEmail
        ? "Artwork submitted. Check your email to verify your account."
        : "Artwork submitted.",
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
