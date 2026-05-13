import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  GroupEntity,
  GroupStatus,
  UserEntity,
} from "@icaf/shared";
import { sendApprovalEmail } from "../../utils/emails/approvalNotification";
import { buildApprovedGroupGsiAttrs, GROUP_GSI_ATTRS_TO_REMOVE } from "../../dynamo/groupGsis";
import { reviewPk, reviewGsiSk } from "../../dynamo/reviewGsi";
import { EntityType } from "../../dynamo/ddbSchemaConsts";
import { Status } from "../../dynamo/shared";
import { parseJsonBody } from "../../utils/request";
import { getCurrentUser } from "../../utils/auth";

const VALID_STATUSES: GroupStatus[] = ["approved", "hidden", "rejected"];

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;

    const groupId = event.pathParameters?.group_id;
    if (!groupId) {
      return CommonErrors.badRequest("group_id path parameter is required");
    }

    const parsedBody = parseJsonBody<{ status?: string }>(event);
    if (!parsedBody.ok) {
      return parsedBody.response;
    }

    const body = parsedBody.value;
    const newStatus = body.status as GroupStatus | undefined;

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return CommonErrors.badRequest(`status must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    // ── Read GROUP entity to get theme attrs for gallery GSI construction ──
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
    const nowMs = Date.now();

    let updateExpr: string;
    const exprValues: Record<string, unknown> = { ":status": newStatus };
    const exprNames: Record<string, string> = { "#status": "status" };

    if (newStatus === "approved") {
      const gsiAttrs = buildApprovedGroupGsiAttrs({
        timestampMs: group.timestamp * 1000,
        groupId,
        family: group.theme_family,
        instance: group.theme_instance,
      });

      const setAttrs = Object.entries(gsiAttrs)
        .map(([k, v], i) => { exprValues[`:gsi${i}`] = v; return `${k} = :gsi${i}`; })
        .join(", ");

      updateExpr = `SET #status = :status, ${setAttrs} REMOVE REV_PK, REV_SK`;
    } else {
      const reviewSkStatus = newStatus === "hidden" ? Status.Hidden : Status.Rejected;
      exprValues[":revPk"] = reviewPk();
      exprValues[":revSk"] = reviewGsiSk(reviewSkStatus, EntityType.Group, nowMs, groupId);

      updateExpr = `SET #status = :status, REV_PK = :revPk, REV_SK = :revSk REMOVE ${GROUP_GSI_ATTRS_TO_REMOVE.join(", ")}`;
    }

    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `GROUP#${groupId}`, SK: "-" },
        UpdateExpression: updateExpr,
        ExpressionAttributeNames: exprNames,
        ExpressionAttributeValues: exprValues,
        ConditionExpression: "attribute_exists(PK)",
      }),
    );

    // ── Send approval email (non-blocking) ────────────────────────────────
    if (newStatus === "approved") {
      dynamodb.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${group.user_id}`, SK: "PROFILE" },
        }),
      ).then((userResult) => {
        const user = userResult.Item as UserEntity | undefined;
        if (user?.email) {
          sendApprovalEmail({
            toEmail: user.email,
            type: "group",
            id: groupId,
            title: group.title,
          }).catch((err) => console.error("Approval email failed:", err));
        }
      }).catch((err) => console.error("User lookup for approval email failed:", err));
    }

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ success: true, group_id: groupId, status: newStatus }),
      headers: COMMON_HEADERS,
    };
  } catch (error: unknown) {
    const ddbErr = error as { name?: string };
    if (ddbErr.name === "ConditionalCheckFailedException") {
      return CommonErrors.notFound("Group not found");
    }
    console.error("Error changing group status:", error);
    return CommonErrors.internalServerError();
  }
};
