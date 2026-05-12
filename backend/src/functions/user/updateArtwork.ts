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
    if (art.user_id !== userId) {
      return CommonErrors.forbidden("Not authorized to update this artwork");
    }

    const parsedBody = parseJsonBody<UpdateArtworkRequest>(event);
    if (!parsedBody.ok) return parsedBody.response;
    const body = parsedBody.value;
    const fieldErrors = validateUpdateArtworkRequest(body);
    if (fieldErrors.length > 0) {
      return CommonErrors.badRequest(fieldErrors.join("; "));
    }

    const nowMs = Date.now();

    // ── Build update expression ────────────────────────────────────────────
    // Always set status=pending_review and restore REV GSI; remove gallery attrs
    const setExprParts: string[] = [
      "status = :status",
      "REV_PK = :revPk",
      "REV_SK = :revSk",
    ];

    const exprValues: Record<string, unknown> = {
      ":status": "pending_review",
      ":revPk": reviewPk(),
      ":revSk": reviewGsiSk(Status.Pending, EntityType.Art, nowMs, artId),
    };

    if (body.title !== undefined) { setExprParts.push("title = :title"); exprValues[":title"] = body.title; }
    if (body.description !== undefined) { setExprParts.push("description = :desc"); exprValues[":desc"] = body.description; }
    if (body.f_name !== undefined) { setExprParts.push("f_name = :f_name"); exprValues[":f_name"] = body.f_name; }
    if (body.age !== undefined) { setExprParts.push("age = :age"); exprValues[":age"] = body.age; }
    if (body.country !== undefined) { setExprParts.push("country = :country"); exprValues[":country"] = body.country; }
    if (body.region !== undefined) { setExprParts.push("region = :region"); exprValues[":region"] = body.region; }
    if (body.submitter_relationship !== undefined) { setExprParts.push("submitter_relationship = :rel"); exprValues[":rel"] = body.submitter_relationship; }
    if (body.theme_family !== undefined) { setExprParts.push("theme_family = :tf"); exprValues[":tf"] = body.theme_family; }
    if (body.theme_instance !== undefined) { setExprParts.push("theme_instance = :ti"); exprValues[":ti"] = body.theme_instance; }

    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `ART#${artId}`, SK: "-" },
        UpdateExpression: `SET ${setExprParts.join(", ")} REMOVE GALL_PK, FAM_PK, INST_PK, ART_GSI_SK`,
        ExpressionAttributeValues: exprValues,
        ConditionExpression: "attribute_exists(PK)",
      }),
    );

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ success: true, art_id: artId, status: "pending_review" }),
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
