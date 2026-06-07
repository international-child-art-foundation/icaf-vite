import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, s3Client, TABLE_NAME, S3_BUCKET_NAME } from "../../config/aws-clients";
import {
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  validateCreateGroupRequest,
} from "@icaf/shared";
import type { ApiGatewayEvent, CreateGroupRequest, SubmitGroupResponse } from "@icaf/shared";
import { EntityType } from "../../dynamo/ddbSchemaConsts";
import { byOwnerPk, byOwnerGsiSk } from "../../dynamo/ownerGsi";
import { reviewPk, reviewGsiSk } from "../../dynamo/reviewGsi";
import { Status } from "../../dynamo/shared";
import { randomUUID } from "crypto";
import { parseJsonBody } from "../../utils/request";
import { getOptionalAuth } from "../../utils/auth";
import { ensureThemeEntity } from "../shared/themeUtils";
import { getOrCreateVirtualUser } from "../shared/virtualUser";

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
    const parsedBody = parseJsonBody<CreateGroupRequest>(event);
    if (!parsedBody.ok) {
      return parsedBody.response;
    }

    const body = parsedBody.value;
    const auth = await getOptionalAuth(event);
    const groupErrors = validateCreateGroupRequest(body, !auth);
    if (groupErrors.length > 0) {
      return CommonErrors.badRequest(groupErrors.join("; "));
    }

    const groupId = randomUUID();
    const nowMs = Date.now();
    const nowSeconds = Math.floor(nowMs / 1000);
    let userId = auth?.user_id;
    let sentSignupEmail = false;

    if (auth?.banned) {
      return CommonErrors.forbidden("This account is banned");
    }

    if (!userId) {
      if (!body.email) {
        return CommonErrors.badRequest("email is required");
      }

      const userResult = await getOrCreateVirtualUser(body.email, nowSeconds);

      if (!userResult.ok) return userResult.response;
      userId = userResult.user.user_id;
      sentSignupEmail = userResult.sentSignupEmail;
    }

    await ensureThemeEntity({
      family: body.theme_family,
      instance: body.theme_instance,
    });

    const artUploads: NonNullable<SubmitGroupResponse["art_uploads"]> = [];
    const memberArtIds: string[] = [];

    for (const artwork of body.artworks) {
      const artId = randomUUID();
      memberArtIds.push(artId);

      await ensureThemeEntity({
        family: artwork.theme_family,
        instance: artwork.theme_instance,
      });

      await dynamodb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `ART#${artId}`,
            SK: "-",
            art_id: artId,
            user_id: userId,
            group_id: groupId,
            status: Status.Pending,
            kudos_count: 0,
            ts: nowSeconds,
            release_hash: artwork.release_hash.trim(),
            ...(artwork.digital_signature && {
              digital_signature: artwork.digital_signature.trim(),
            }),
            promotional_use: artwork.promotional_use ?? false,
            type: "ART",
            notifications: false,
            ...(artwork.f_name && { f_name: artwork.f_name }),
            ...(artwork.l_name && { l_name: artwork.l_name }),
            ...(artwork.age !== undefined && { age: artwork.age }),
            ...(artwork.country && { country: artwork.country }),
            ...(artwork.region && { region: artwork.region }),
            ...(artwork.title && { title: artwork.title }),
            ...(artwork.description && { description: artwork.description }),
            ...(artwork.submitter_relationship && { submitter_relationship: artwork.submitter_relationship }),
            ...(artwork.theme_family && { theme_family: artwork.theme_family }),
            ...(artwork.theme_instance && { theme_instance: artwork.theme_instance }),
            OWN_PK: byOwnerPk(userId),
            OWN_SK: byOwnerGsiSk(EntityType.Art, nowMs, artId),
            REV_PK: reviewPk(),
            REV_SK: reviewGsiSk(Status.Pending, EntityType.Art, nowMs, artId),
          },
        }),
      );

      const presignedUrl = await getSignedUrl(
        s3Client,
        new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: `${artId}/initial`,
          ContentType: CONTENT_TYPES[artwork.file_type],
        }),
        { expiresIn: PRESIGNED_URL_EXPIRES_SECONDS },
      );

      artUploads.push({ art_id: artId, presigned_url: presignedUrl });
    }

    await dynamodb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `GROUP#${groupId}`,
          SK: "-",
          group_id: groupId,
          user_id: userId,
          group_type: body.group_type,
          status: Status.Pending,
          member_art_ids: memberArtIds,
          ts: nowSeconds,
          type: "GROUP",
          notifications: body.notifications ?? false,
          // optional fields
          ...(body.theme_family !== undefined && { theme_family: body.theme_family }),
          ...(body.theme_instance !== undefined && { theme_instance: body.theme_instance }),
          ...(body.title !== undefined && { title: body.title }),
          ...(body.class_name !== undefined && { class_name: body.class_name }),
          ...(body.submitter_display_name !== undefined && { submitter_display_name: body.submitter_display_name }),
          ...(body.country !== undefined && { country: body.country }),
          ...(body.region !== undefined && { region: body.region }),
          ...(body.description !== undefined && { description: body.description }),
          // ByOwner GSI
          OWN_PK: byOwnerPk(userId),
          OWN_SK: byOwnerGsiSk(EntityType.Group, nowMs, groupId),
          // Review GSI
          REV_PK: reviewPk(),
          REV_SK: reviewGsiSk(Status.Pending, EntityType.Group, nowMs, groupId),
        },
      }),
    );

    const response: SubmitGroupResponse = {
      success: true,
      group_id: groupId,
      message: sentSignupEmail
        ? "Group created. Upload images using the presigned URLs. Check your email to verify your account."
        : "Group created. Upload images using the presigned URLs.",
      ts: nowSeconds,
      art_uploads: artUploads,
    };

    return {
      statusCode: HTTP_STATUS.CREATED,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error creating group:", error);
    return CommonErrors.internalServerError();
  }
};
