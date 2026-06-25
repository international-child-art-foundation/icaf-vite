import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  validateCreateGroupRequest,
} from "@icaf/shared";
import type { ApiGatewayEvent, CreateGroupRequest, SubmitGroupResponse } from "@icaf/shared";
import type { UserEntity } from "@icaf/shared";
import { EntityType } from "../../dynamo/ddbSchemaConsts";
import { byOwnerPk, byOwnerGsiSk } from "../../dynamo/ownerGsi";
import { reviewPk, reviewGsiSk } from "../../dynamo/reviewGsi";
import { Status } from "../../dynamo/shared";
import { randomUUID } from "crypto";
import { parseJsonBody } from "../../utils/request";
import { getOptionalAuth } from "../../utils/auth";
import { ensureThemeEntity } from "../shared/themeUtils";
import { getOrCreateVirtualUser, sendVirtualUserSignupEmail } from "../shared/virtualUser";
import { hasUploadedArtworkImage } from "../shared/artworkUpload";
import {
  getMissingProfileNameUpdates,
  validateMissingProfileNames,
} from "../shared/profileNames";

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
    if (auth) {
      const profileNameErrors = validateMissingProfileNames(auth, body);
      if (profileNameErrors.length > 0) {
        return CommonErrors.badRequest(profileNameErrors.join("; "));
      }
    }

    const groupId = randomUUID();
    const nowMs = Date.now();
    const nowSeconds = Math.floor(nowMs / 1000);
    let userId = auth?.user_id;
    let sentSignupEmail = false;
    let virtualUserForEmail: UserEntity | undefined;

    if (auth?.banned) {
      return CommonErrors.forbidden("This account is banned");
    }
    if (auth?.role === "deleting") {
      return CommonErrors.forbidden("Account deletion is pending. Contact us if you need assistance.");
    }

    const memberArtIds = body.artworks.map((artwork) => artwork.art_id.trim());
    if (new Set(memberArtIds).size !== memberArtIds.length) {
      return CommonErrors.badRequest("artworks must use distinct art_id values");
    }

    const imageUploadResults = await Promise.all(
      memberArtIds.map((artId) => hasUploadedArtworkImage(artId)),
    );
    if (imageUploadResults.some((imageUploaded) => !imageUploaded)) {
      return CommonErrors.badRequest("All artwork images must be uploaded before group submission");
    }

    if (!userId) {
      if (!body.email) {
        return CommonErrors.badRequest("email is required");
      }

      const userResult = await getOrCreateVirtualUser(
        body.email,
        nowSeconds,
        body.submitter_first_name,
        body.submitter_last_name,
        false,
      );

      if (!userResult.ok) return userResult.response;
      userId = userResult.user.user_id;
      virtualUserForEmail = userResult.user;
    }
    const ownerUserId = userId;
    if (!ownerUserId) {
      return CommonErrors.internalServerError("Unable to resolve submission owner");
    }
    const profileNameUpdates = auth
      ? getMissingProfileNameUpdates(auth, body)
      : {};
    const profileNameUpdateEntries = Object.entries(profileNameUpdates);

    const groupThemeCheck = await ensureThemeEntity({ theme: body.theme, nowMs });
    if (!groupThemeCheck.ok) return groupThemeCheck.response;

    const artworkThemes = [
      ...new Set(body.artworks.map((artwork) => artwork.theme).filter(Boolean)),
    ];
    const artworkThemeChecks = await Promise.all(
      artworkThemes.map((theme) => ensureThemeEntity({ theme, nowMs })),
    );
    const failedArtworkThemeCheck = artworkThemeChecks.find((result) => !result.ok);
    if (failedArtworkThemeCheck && !failedArtworkThemeCheck.ok) {
      return failedArtworkThemeCheck.response;
    }

    await dynamodb.send(
      new TransactWriteCommand({
        TransactItems: [
          profileNameUpdateEntries.length > 0
            ? {
                Update: {
                  TableName: TABLE_NAME,
                  Key: { PK: `USER#${ownerUserId}`, SK: "PROFILE" },
                  UpdateExpression: `SET ${profileNameUpdateEntries
                    .map(([field]) => `${field} = :${field}`)
                    .join(", ")}`,
                  ConditionExpression: "attribute_exists(PK)",
                  ExpressionAttributeValues: Object.fromEntries(
                    profileNameUpdateEntries.map(([field, value]) => [
                      `:${field}`,
                      value,
                    ]),
                  ),
                },
              }
            : {
                ConditionCheck: {
                  TableName: TABLE_NAME,
                  Key: { PK: `USER#${ownerUserId}`, SK: "PROFILE" },
                  ConditionExpression:
                    "attribute_exists(PK)",
                },
              },
          ...body.artworks.map((artwork) => ({
            Put: {
              TableName: TABLE_NAME,
              ConditionExpression: "attribute_not_exists(PK)",
              Item: {
                PK: `ART#${artwork.art_id.trim()}`,
                SK: "-",
                art_id: artwork.art_id.trim(),
                user_id: ownerUserId,
                group_id: groupId,
                status: Status.Pending,
                kudos_count: 0,
                ts: nowSeconds,
                rev_num: 1,
                ...(artwork.digital_signature && {
                  digital_signature: artwork.digital_signature.trim(),
                }),
                promotional_use: artwork.submitter_relationship === "legal_guardian",
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
                ...(artwork.theme && { theme: artwork.theme }),
                OWN_PK: byOwnerPk(ownerUserId),
                OWN_SK: byOwnerGsiSk(EntityType.Art, nowMs, artwork.art_id.trim()),
                REV_PK: reviewPk(),
                REV_SK: reviewGsiSk(Status.Pending, EntityType.Art, nowMs, artwork.art_id.trim()),
              },
            },
          })),
          {
            Put: {
              TableName: TABLE_NAME,
              ConditionExpression: "attribute_not_exists(PK)",
              Item: {
                PK: `GROUP#${groupId}`,
                SK: "-",
                group_id: groupId,
                user_id: ownerUserId,
                ...(body.group_type !== undefined && { group_type: body.group_type }),
                status: Status.Pending,
                member_art_ids: memberArtIds,
                ts: nowSeconds,
                rev_num: 1,
                type: "GROUP",
                notifications: body.notifications ?? false,
                ...(body.theme !== undefined && { theme: body.theme }),
                ...(body.title !== undefined && { title: body.title }),
                ...(body.class_name !== undefined && { class_name: body.class_name }),
                ...(body.submitter_display_name !== undefined && { submitter_display_name: body.submitter_display_name }),
                ...(body.country !== undefined && { country: body.country }),
                ...(body.region !== undefined && { region: body.region }),
                ...(body.description !== undefined && { description: body.description }),
                OWN_PK: byOwnerPk(ownerUserId),
                OWN_SK: byOwnerGsiSk(EntityType.Group, nowMs, groupId),
                REV_PK: reviewPk(),
                REV_SK: reviewGsiSk(Status.Pending, EntityType.Group, nowMs, groupId),
              },
            },
          },
        ],
      }),
    );

    if (virtualUserForEmail) {
      try {
        sentSignupEmail = await sendVirtualUserSignupEmail(virtualUserForEmail, nowSeconds);
      } catch (error) {
        console.error("Post-submission signup email setup failed:", error);
      }
    }

    const response: SubmitGroupResponse = {
      success: true,
      group_id: groupId,
      message: sentSignupEmail
        ? "Group submitted. Check your email to verify your account."
        : "Group submitted.",
      ts: nowSeconds,
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
