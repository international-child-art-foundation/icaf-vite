import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  UserEntity,
  GroupEntity,
  UpdateGroupRequest,
  validateUpdateGroupRequest,
} from "@icaf/shared";
import { reviewPk, reviewGsiSk } from "../../dynamo/reviewGsi";
import { EntityType } from "../../dynamo/ddbSchemaConsts";
import { Status } from "../../dynamo/shared";
import { parseJsonBody } from "../../utils/request";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
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

    // ── Verify group ownership ─────────────────────────────────────────────
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
      return CommonErrors.forbidden("Not authorized to update this group");
    }

    const parsedBody = parseJsonBody<UpdateGroupRequest>(event);
    if (!parsedBody.ok) {
      return parsedBody.response;
    }

    const body = parsedBody.value;
    const groupErrors = validateUpdateGroupRequest(body);
    if (groupErrors.length > 0) {
      return CommonErrors.badRequest(groupErrors.join("; "));
    }

    // ── Build update expression ────────────────────────────────────────────
    const nowMs = Date.now();

    const setExprParts: string[] = [
      "status = :status",
      "REV_PK = :revPk",
      "REV_SK = :revSk",
    ];

    const exprValues: Record<string, unknown> = {
      ":status": "pending_review",
      ":revPk": reviewPk(),
      ":revSk": reviewGsiSk(Status.Pending, EntityType.Group, nowMs, groupId),
    };

    if (body.title !== undefined) { setExprParts.push("title = :title"); exprValues[":title"] = body.title; }
    if (body.description !== undefined) { setExprParts.push("description = :desc"); exprValues[":desc"] = body.description; }
    if (body.class_name !== undefined) { setExprParts.push("class_name = :cn"); exprValues[":cn"] = body.class_name; }
    if (body.teacher_display_name !== undefined) { setExprParts.push("teacher_display_name = :tdn"); exprValues[":tdn"] = body.teacher_display_name; }
    if (body.theme_family !== undefined) { setExprParts.push("theme_family = :tf"); exprValues[":tf"] = body.theme_family; }
    if (body.theme_instance !== undefined) { setExprParts.push("theme_instance = :ti"); exprValues[":ti"] = body.theme_instance; }
    if (body.cover_art_ids !== undefined) { setExprParts.push("cover_art_ids = :covers"); exprValues[":covers"] = body.cover_art_ids; }

    // Remove gallery GSI attrs (group is no longer approved)
    const updateExpr =
      `SET ${setExprParts.join(", ")} REMOVE GRP_PK, FGRP_PK, IGRP_PK, GRP_GSI_SK`;

    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `GROUP#${groupId}`, SK: "-" },
        UpdateExpression: updateExpr,
        ExpressionAttributeValues: exprValues,
        ConditionExpression: "attribute_exists(PK)",
      }),
    );

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ success: true, group_id: groupId, status: "pending_review" }),
      headers: COMMON_HEADERS,
    };
  } catch (error: unknown) {
    const ddbErr = error as { name?: string };
    if (ddbErr.name === "ConditionalCheckFailedException") {
      return CommonErrors.notFound("Group not found");
    }
    console.error("Error updating group:", error);
    return CommonErrors.internalServerError();
  }
};
