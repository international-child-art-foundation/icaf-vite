import { GetCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  GroupEntity,
  SubmitArtworkResponse,
  SubmitterRelationship,
  UPLOAD_FILE_TYPES,
  validateOptionalArtworkFields,
  isValidUUID,
} from "@icaf/shared";
import { EntityType } from "../../dynamo/ddbSchemaConsts";
import { byOwnerPk, byOwnerGsiSk } from "../../dynamo/ownerGsi";
import { reviewPk, reviewGsiSk } from "../../dynamo/reviewGsi";
import { Status } from "../../dynamo/shared";
import { parseJsonBody } from "../../utils/request";
import { getCurrentUser } from "../../utils/auth";
import { ensureThemeEntity } from "../shared/themeUtils";
import { hasUploadedArtworkImage } from "../shared/artworkUpload";

interface SubmitArtworkToGroupBody {
  art_id: string;
  file_type: string;
  digital_signature?: string;
  promotional_use?: boolean;
  f_name?: string;
  l_name?: string;
  age?: number;
  country?: string;
  region?: string;
  title?: string;
  description?: string;
  submitter_relationship?: SubmitterRelationship;
  theme?: string;
  notifications?: boolean;
}

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    const user = currentUser.user;
    const userId = user.user_id;

    const groupId = event.pathParameters?.group_id;
    if (!groupId) {
      return CommonErrors.badRequest("group_id path parameter is required");
    }

    if (user.banned) {
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

    const parsedBody = parseJsonBody<SubmitArtworkToGroupBody>(event);
    if (!parsedBody.ok) {
      return parsedBody.response;
    }

    const body = parsedBody.value;

    if (!body.file_type || !(UPLOAD_FILE_TYPES as readonly string[]).includes(body.file_type)) {
      return CommonErrors.badRequest(`file_type must be one of: ${UPLOAD_FILE_TYPES.join(", ")}`);
    }
    if (typeof body.art_id !== "string" || !isValidUUID(body.art_id)) {
      return CommonErrors.badRequest("art_id must be a valid UUID");
    }
    if (body.digital_signature !== undefined) {
      if (typeof body.digital_signature !== "string" || !body.digital_signature.trim()) {
        return CommonErrors.badRequest("digital_signature, if provided, must be a non-empty string");
      }
      if (body.digital_signature.length > 200) {
        return CommonErrors.badRequest("digital_signature must be 200 characters or less");
      }
    }
    const fieldErrors = validateOptionalArtworkFields(body);
    if (fieldErrors.length > 0) {
      return CommonErrors.badRequest(fieldErrors.join("; "));
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

    // ── Create ART entity ──────────────────────────────────────────────────
    await dynamodb.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: TABLE_NAME,
              ConditionExpression: "attribute_not_exists(PK)",
              Item: {
                PK: `ART#${artId}`,
                SK: "-",
                art_id: artId,
                user_id: userId,
                group_id: groupId,
                status: "pending_review" as const,
                kudos_count: 0,
                ts: nowSeconds,
                ...(body.digital_signature && {
                  digital_signature: body.digital_signature.trim(),
                }),
                promotional_use: body.submitter_relationship === "legal_guardian",
                type: "ART",
                notifications: false,
                ...(body.f_name && { f_name: body.f_name }),
                ...(body.l_name && { l_name: body.l_name }),
                ...(body.age !== undefined && { age: body.age }),
                ...(body.country && { country: body.country }),
                ...(body.region && { region: body.region }),
                ...(body.title && { title: body.title }),
                ...(body.description && { description: body.description }),
                ...(body.submitter_relationship && { submitter_relationship: body.submitter_relationship }),
                ...(body.theme && { theme: body.theme }),
                OWN_PK: byOwnerPk(userId),
                OWN_SK: byOwnerGsiSk(EntityType.Art, nowMs, artId),
                REV_PK: reviewPk(),
                REV_SK: reviewGsiSk(Status.Pending, EntityType.Art, nowMs, artId),
              },
            },
          },
          {
            Update: {
              TableName: TABLE_NAME,
              Key: { PK: `GROUP#${groupId}`, SK: "-" },
              UpdateExpression: "SET member_art_ids = list_append(member_art_ids, :newArt)",
              ExpressionAttributeValues: { ":newArt": [artId] },
            },
          },
        ],
      }),
    );

    const response: SubmitArtworkResponse = {
      success: true,
      art_id: artId,
      message: "Artwork added to group.",
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
