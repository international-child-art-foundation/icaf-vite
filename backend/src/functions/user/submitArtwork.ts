import { PutCommand } from "@aws-sdk/lib-dynamodb";
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
      new PutCommand({
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
          ...(body.digital_signature && {
            digital_signature: body.digital_signature.trim(),
          }),
          promotional_use: body.submitter_relationship === "legal_guardian",
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
          OWN_PK: byOwnerPk(userId),
          OWN_SK: byOwnerGsiSk(EntityType.Art, nowMs, artId),
          // Review GSI (always written; removed on approval)
          REV_PK: reviewPk(),
          REV_SK: reviewGsiSk(Status.Pending, EntityType.Art, nowMs, artId),
        },
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
