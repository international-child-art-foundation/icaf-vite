import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  ArtworkEntity,
  ArtworkStatus,
  UserEntity,
  hasMinimumRole,
} from "@icaf/shared";
import { sendApprovalEmailToUser } from "../../utils/emails/artworkEmailControls";
import { buildApprovedArtworkGsiAttrs, ARTWORK_GSI_ATTRS_TO_REMOVE } from "../../dynamo/artGsis";
import { reviewPk, reviewGsiSk } from "../../dynamo/reviewGsi";
import { EntityType } from "../../dynamo/ddbSchemaConsts";
import { Status } from "../../dynamo/shared";
import { parseJsonBody } from "../../utils/request";
import { getCurrentUser } from "../../utils/auth";

const VALID_STATUSES: ArtworkStatus[] = ["approved", "hidden", "rejected"];

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    if (!hasMinimumRole(currentUser.user.role, "contributor")) {
        return CommonErrors.forbidden("Contributor access required");
    }

    const artId = event.pathParameters?.art_id;
    if (!artId) {
      return CommonErrors.badRequest("art_id path parameter is required");
    }

    const parsedBody = parseJsonBody<{ status?: string }>(event);
    if (!parsedBody.ok) {
      return parsedBody.response;
    }

    const body = parsedBody.value;
    const newStatus = body.status as ArtworkStatus | undefined;

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return CommonErrors.badRequest(`status must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    // ── Read ART entity to get theme attrs for gallery GSI construction ────
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
    const nowMs = Date.now();

    let updateExpr: string;
    const exprValues: Record<string, unknown> = { ":status": newStatus };
    const exprNames: Record<string, string> = { "#status": "status" };
    if (newStatus === "approved") {
      // Write gallery GSI attrs, remove review GSI attrs
      const gsiAttrs = buildApprovedArtworkGsiAttrs({
        timestampMs: art.timestamp * 1000,
        artId,
        family: art.theme_family,
        instance: art.theme_instance,
      });

      const setAttrs = Object.entries(gsiAttrs)
        .map(([k, v], i) => { exprValues[`:gsi${i}`] = v; return `${k} = :gsi${i}`; })
        .join(", ");

      updateExpr = `SET #status = :status, ${setAttrs} REMOVE REV_PK, REV_SK`;
    } else {
      // Remove gallery GSI attrs, write/update review GSI attrs
      const reviewSkStatus = newStatus === "hidden" ? Status.Hidden : Status.Rejected;
      exprValues[":revPk"] = reviewPk();
      exprValues[":revSk"] = reviewGsiSk(reviewSkStatus, EntityType.Art, nowMs, artId);

      updateExpr = `SET #status = :status, REV_PK = :revPk, REV_SK = :revSk REMOVE ${ARTWORK_GSI_ATTRS_TO_REMOVE.join(", ")}`;
    }

    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `ART#${artId}`, SK: "-" },
        UpdateExpression: updateExpr,
        ExpressionAttributeNames: exprNames,
        ExpressionAttributeValues: exprValues,
        ConditionExpression: "attribute_exists(PK)",
      }),
    );

    // ── Send approval email (non-blocking) ────────────────────────────────
    if (newStatus === "approved" && !art.group_id && art.notifications === true) {
      dynamodb.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${art.user_id}`, SK: "PROFILE" },
        }),
      ).then((userResult) => {
        const user = userResult.Item as UserEntity | undefined;
        if (user) {
          sendApprovalEmailToUser({
            user,
            type: "art",
            id: artId,
            title: art.title,
          }).catch((err) => console.error("Approval email failed:", err));
        }
      }).catch((err) => console.error("User lookup for approval email failed:", err));
    }

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ success: true, art_id: artId, status: newStatus }),
      headers: COMMON_HEADERS,
    };
  } catch (error: unknown) {
    const ddbErr = error as { name?: string };
    if (ddbErr.name === "ConditionalCheckFailedException") {
      return CommonErrors.notFound("Artwork not found");
    }
    console.error("Error changing artwork status:", error);
    return CommonErrors.internalServerError();
  }
};
