import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  SubmitGroupRequest,
  SubmitGroupResponse,
  validateSubmitGroupRequest,
} from "@icaf/shared";
import { EntityType } from "../../dynamo/ddbSchemaConsts";
import { byOwnerPk, byOwnerGsiSk } from "../../dynamo/ownerGsi";
import { reviewPk, reviewGsiSk } from "../../dynamo/reviewGsi";
import { Status } from "../../dynamo/shared";
import { randomUUID } from "crypto";
import { parseJsonBody } from "../../utils/request";
import { getCurrentUser } from "../../utils/auth";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    const guardian = currentUser.user;
    const userId = guardian.user_id;
    if (guardian.banned) {
      return CommonErrors.forbidden("This account is banned");
    }

    const parsedBody = parseJsonBody<SubmitGroupRequest>(event);
    if (!parsedBody.ok) {
      return parsedBody.response;
    }

    const body = parsedBody.value;
    const groupErrors = validateSubmitGroupRequest(body);
    if (groupErrors.length > 0) {
      return CommonErrors.badRequest(groupErrors.join("; "));
    }

    const groupId = randomUUID();
    const nowMs = Date.now();
    const nowSeconds = Math.floor(nowMs / 1000);

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
          member_art_ids: [],
          cover_art_ids: [],
          timestamp: nowSeconds,
          type: "GROUP",
          notifications: body.notifications ?? false,
          // optional fields
          ...(body.theme_family !== undefined && { theme_family: body.theme_family }),
          ...(body.theme_instance !== undefined && { theme_instance: body.theme_instance }),
          ...(body.title !== undefined && { title: body.title }),
          ...(body.class_name !== undefined && { class_name: body.class_name }),
          ...(body.guardian_display_name !== undefined && { guardian_display_name: body.guardian_display_name }),
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
      message: "Group created and submitted for review",
      timestamp: nowSeconds,
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
