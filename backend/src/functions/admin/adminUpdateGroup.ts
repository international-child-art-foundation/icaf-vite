import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  AdminUpdateGroupResponse,
  ApiGatewayEvent,
  COMMON_HEADERS,
  CommonErrors,
  GroupEntity,
  HTTP_STATUS,
  UpdateGroupRequest,
  hasMinimumRole,
  validateUpdateGroupRequest,
} from "@icaf/shared";
import { buildApprovedGroupGsiAttrs } from "../../dynamo/groupGsis";
import { parseJsonBody } from "../../utils/request";
import { getCurrentUser } from "../../utils/auth";

const ALLOWED_UPDATE_FIELDS = new Set([
  "title",
  "description",
  "class_name",
  "submitter_display_name",
  "country",
  "region",
  "theme_family",
  "theme_instance",
  "notifications",
]);

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    if (!hasMinimumRole(currentUser.user.role, "admin")) {
      return CommonErrors.forbidden("Admin access required");
    }

    const groupId = event.pathParameters?.group_id;
    if (!groupId) {
      return CommonErrors.badRequest("group_id path parameter is required");
    }

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
    const parsedBody = parseJsonBody<Record<string, unknown>>(event);
    if (!parsedBody.ok) return parsedBody.response;

    const unknownFields = Object.keys(parsedBody.value).filter(
      (key) => !ALLOWED_UPDATE_FIELDS.has(key),
    );
    if (unknownFields.length > 0) {
      return CommonErrors.badRequest(`Unsupported field(s): ${unknownFields.join(", ")}`);
    }

    const body = parsedBody.value as UpdateGroupRequest;
    const fieldErrors = validateUpdateGroupRequest(body);
    if (fieldErrors.length > 0) {
      return CommonErrors.badRequest(fieldErrors.join("; "));
    }
    if (Object.keys(body).length === 0) {
      return CommonErrors.badRequest("at least one field must be provided");
    }

    const setExprParts: string[] = [];
    const removeExprParts: string[] = [];
    const exprNames: Record<string, string> = {};
    const exprValues: Record<string, unknown> = {};

    if (body.title !== undefined) { setExprParts.push("title = :title"); exprValues[":title"] = body.title; }
    if (body.description !== undefined) { setExprParts.push("description = :desc"); exprValues[":desc"] = body.description; }
    if (body.class_name !== undefined) { setExprParts.push("class_name = :cn"); exprValues[":cn"] = body.class_name; }
    if (body.submitter_display_name !== undefined) { setExprParts.push("submitter_display_name = :gdn"); exprValues[":gdn"] = body.submitter_display_name; }
    if (body.country !== undefined) { setExprParts.push("country = :country"); exprValues[":country"] = body.country; }
    if (body.region !== undefined) { setExprParts.push("#region = :region"); exprNames["#region"] = "region"; exprValues[":region"] = body.region; }
    if (body.theme_family !== undefined) { setExprParts.push("theme_family = :tf"); exprValues[":tf"] = body.theme_family; }
    if (body.theme_instance !== undefined) { setExprParts.push("theme_instance = :ti"); exprValues[":ti"] = body.theme_instance; }
    if (body.notifications !== undefined) { setExprParts.push("notifications = :notifications"); exprValues[":notifications"] = body.notifications; }

    if (group.status === "approved") {
      const gsiAttrs = buildApprovedGroupGsiAttrs({
        tsMs: group.ts * 1000,
        groupId,
        family: body.theme_family ?? group.theme_family,
        instance: body.theme_instance ?? group.theme_instance,
      });

      Object.entries(gsiAttrs).forEach(([key, value], index) => {
        setExprParts.push(`${key} = :gsi${index}`);
        exprValues[`:gsi${index}`] = value;
      });

      if (!gsiAttrs.FGRP_PK) removeExprParts.push("FGRP_PK");
      if (!gsiAttrs.IGRP_PK) removeExprParts.push("IGRP_PK");
    }

    const updateExpression = [
      `SET ${setExprParts.join(", ")}`,
      removeExprParts.length > 0 ? `REMOVE ${removeExprParts.join(", ")}` : "",
    ].filter(Boolean).join(" ");

    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `GROUP#${groupId}`, SK: "-" },
        UpdateExpression: updateExpression,
        ...(Object.keys(exprNames).length > 0 && { ExpressionAttributeNames: exprNames }),
        ExpressionAttributeValues: exprValues,
        ConditionExpression: "attribute_exists(PK)",
      }),
    );

    const response: AdminUpdateGroupResponse = {
      success: true,
      group_id: groupId,
      status: group.status,
    };

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify(response),
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
