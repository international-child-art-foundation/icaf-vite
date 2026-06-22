import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  SubmitArtworkRequest,
  SubmitArtworkResponse,
  validateSubmissionData,
} from "@icaf/shared";
import { EntityType } from "../../dynamo/ddbSchemaConsts";
import { byOwnerPk, byOwnerGsiSk } from "../../dynamo/ownerGsi";
import { reviewPk, reviewGsiSk } from "../../dynamo/reviewGsi";
import { Status } from "../../dynamo/shared";
import { parseJsonBody } from "../../utils/request";
import { getCurrentUser } from "../../utils/auth";
import { ensureThemeEntity } from "../shared/themeUtils";
import { hasUploadedArtworkImage } from "../shared/artworkUpload";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    const userId = currentUser.user.user_id;

    const parsedBody = parseJsonBody<SubmitArtworkRequest>(event);
    if (!parsedBody.ok) return parsedBody.response;
    const body = parsedBody.value;

    if ("group_id" in body) {
      return CommonErrors.badRequest("group_id can only be assigned through a group submission");
    }
    if (currentUser.user.role === "deleting") {
      return CommonErrors.forbidden("Account deletion is pending. Contact us if you need assistance.");
    }


    // ── Validate artwork fields ────────────────────────────────────────────
    const artErrors = validateSubmissionData(body);
    if (artErrors.length > 0) {
      return CommonErrors.badRequest(artErrors.join("; "));
    }

    // ── Check user is not banned ───────────────────────────────────────────
    const user = currentUser.user;
    if (user.banned) {
      return CommonErrors.forbidden("This account is banned");
    }

    const nowMs = Date.now();
    const nowSeconds = Math.floor(nowMs / 1000);

    const artId = body.art_id.trim();
    const imageUploaded = await hasUploadedArtworkImage(artId);
    if (!imageUploaded) {
      return CommonErrors.badRequest("Artwork image must be uploaded before submission");
    }

    const themeCheck = await ensureThemeEntity({ theme: body.theme, nowMs });
    if (!themeCheck.ok) return themeCheck.response;

    await dynamodb.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            ConditionCheck: {
              TableName: TABLE_NAME,
              Key: { PK: `USER#${userId}`, SK: "PROFILE" },
              ConditionExpression:
                "attribute_exists(PK)",
            },
          },
          {
            Put: {
              TableName: TABLE_NAME,
              ConditionExpression: "attribute_not_exists(PK)",
              Item: {
                PK: `ART#${artId}`,
                SK: "-",
                art_id: artId,
                user_id: userId,
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
                OWN_PK: byOwnerPk(userId),
                OWN_SK: byOwnerGsiSk(EntityType.Art, nowMs, artId),
                REV_PK: reviewPk(),
                REV_SK: reviewGsiSk(Status.Pending, EntityType.Art, nowMs, artId),
              },
            },
          },
        ],
      }),
    );

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
  } catch (error) {
    console.error("Error submitting artwork:", error);
    return CommonErrors.internalServerError();
  }
};
