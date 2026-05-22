import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  ArtworkEntity,
  UpdateArtworkRequest,
  validateUpdateArtworkRequest,
} from "@icaf/shared";
import { buildApprovedArtworkGsiAttrs } from "../../dynamo/artGsis";
import { parseJsonBody } from "../../utils/request";
import { getCurrentUser } from "../../utils/auth";
import { hasMinimumRole } from "@icaf/shared";

const ALLOWED_UPDATE_FIELDS = new Set([
  "title",
  "description",
  "f_name",
  "age",
  "country",
  "region",
  "submitter_relationship",
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

    const artId = event.pathParameters?.art_id;
    if (!artId) {
      return CommonErrors.badRequest("art_id path parameter is required");
    }

    // ── Read ART entity to verify ownership ───────────────────────────────
    const artResult = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `ART#${artId}`, SK: "-" },
      }),
    );

    if (!artResult.Item) {
      return CommonErrors.notFound("Artwork not found");
    }

    const art = artResult.Item as ArtworkEntity;

    const parsedBody = parseJsonBody<Record<string, unknown>>(event);
    if (!parsedBody.ok) return parsedBody.response;
    const unknownFields = Object.keys(parsedBody.value).filter((key) => !ALLOWED_UPDATE_FIELDS.has(key));
    if (unknownFields.length > 0) {
      return CommonErrors.badRequest(`Unsupported field(s): ${unknownFields.join(", ")}`);
    }

    const body = parsedBody.value as UpdateArtworkRequest;
    const fieldErrors = validateUpdateArtworkRequest(body);
    if (fieldErrors.length > 0) {
      return CommonErrors.badRequest(fieldErrors.join("; "));
    }
    if (Object.keys(body).length === 0) {
      return CommonErrors.badRequest("at least one field must be provided");
    }

    // ── Build update expression ────────────────────────────────────────────
    const setExprParts: string[] = [];
    const removeExprParts: string[] = [];
    const exprNames: Record<string, string> = {};
    const exprValues: Record<string, unknown> = {};

    if (body.title !== undefined) { setExprParts.push("title = :title"); exprValues[":title"] = body.title; }
    if (body.description !== undefined) { setExprParts.push("description = :desc"); exprValues[":desc"] = body.description; }
    if (body.f_name !== undefined) { setExprParts.push("f_name = :f_name"); exprValues[":f_name"] = body.f_name; }
    if (body.age !== undefined) { setExprParts.push("age = :age"); exprValues[":age"] = body.age; }
    if (body.country !== undefined) { setExprParts.push("country = :country"); exprValues[":country"] = body.country; }
    if (body.region !== undefined) { setExprParts.push("#region = :region"); exprNames["#region"] = "region"; exprValues[":region"] = body.region; }
    if (body.submitter_relationship !== undefined) { setExprParts.push("submitter_relationship = :rel"); exprValues[":rel"] = body.submitter_relationship; }
    if (body.theme_family !== undefined) { setExprParts.push("theme_family = :tf"); exprValues[":tf"] = body.theme_family; }
    if (body.theme_instance !== undefined) { setExprParts.push("theme_instance = :ti"); exprValues[":ti"] = body.theme_instance; }
    if (art.group_id) {
      setExprParts.push("notifications = :notifications");
      exprValues[":notifications"] = false;
    } else if (body.notifications !== undefined) {
      setExprParts.push("notifications = :notifications");
      exprValues[":notifications"] = body.notifications;
    }
    if (art.status === "approved") {
      const gsiAttrs = buildApprovedArtworkGsiAttrs({
        timestampMs: art.timestamp * 1000,
        artId,
        family: body.theme_family ?? art.theme_family,
        instance: body.theme_instance ?? art.theme_instance,
      });

      Object.entries(gsiAttrs).forEach(([key, value], index) => {
        setExprParts.push(`${key} = :gsi${index}`);
        exprValues[`:gsi${index}`] = value;
      });

      if (!gsiAttrs.FAM_PK) {
        removeExprParts.push("FAM_PK");
      }
      if (!gsiAttrs.INST_PK) {
        removeExprParts.push("INST_PK");
      }
    }

    if (setExprParts.length === 0) {
      return CommonErrors.badRequest("at least one field must be provided");
    }

    const updateExpression = [
      `SET ${setExprParts.join(", ")}`,
      removeExprParts.length > 0 ? `REMOVE ${removeExprParts.join(", ")}` : "",
    ].filter(Boolean).join(" ");

    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `ART#${artId}`, SK: "-" },
        UpdateExpression: updateExpression,
        ...(Object.keys(exprNames).length > 0 && { ExpressionAttributeNames: exprNames }),
        ExpressionAttributeValues: exprValues,
        ConditionExpression: "attribute_exists(PK)",
      }),
    );

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ success: true, art_id: artId, status: art.status }),
      headers: COMMON_HEADERS,
    };
  } catch (error: unknown) {
    const ddbErr = error as { name?: string };
    if (ddbErr.name === "ConditionalCheckFailedException") {
      return CommonErrors.notFound("Artwork not found");
    }
    console.error("Error updating artwork:", error);
    return CommonErrors.internalServerError();
  }
};
