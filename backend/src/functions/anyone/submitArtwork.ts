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
import { ACCOUNT_ACTIVATION_TOKEN_TTL_SECONDS } from "../../utils/authActionToken";
import { randomUUID } from "crypto";


export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const parsedBody = parseJsonBody<GuestSubmitArtworkRequest>(event);
    if (!parsedBody.ok) return parsedBody.response;
    const body = parsedBody.value;

    if ("group_id" in body) {
      return CommonErrors.badRequest("group_id can only be assigned through a group submission");
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

    // New or returning email-based guest — query Email GSI
    const email = normalizeEmail(body.email);
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
        f_name: body.submitter_first_name.trim(),
        l_name: body.submitter_last_name.trim(),
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
    } else if (!user.f_name || !user.l_name) {
      const fName = body.submitter_first_name.trim();
      const lName = body.submitter_last_name.trim();
      await dynamodb.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${user.user_id}`, SK: "PROFILE" },
          UpdateExpression:
            "SET f_name = if_not_exists(f_name, :fName), l_name = if_not_exists(l_name, :lName)",
          ExpressionAttributeValues: {
            ":fName": fName,
            ":lName": lName,
          },
        }),
      );
      user.f_name ??= fName;
      user.l_name ??= lName;
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
          rev_num: 1,
          ...(body.digital_signature && {
            digital_signature: body.digital_signature.trim(),
          }),
          promotional_use: body.submitter_relationship === "legal_guardian",
          type: "ART",
          notifications: body.notifications ?? false,
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
          OWN_PK: byOwnerPk(user.user_id),
          OWN_SK: byOwnerGsiSk(EntityType.Art, nowMs, artId),
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
    const authActionTokenExp = nowSeconds + ACCOUNT_ACTIVATION_TOKEN_TTL_SECONDS;

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
