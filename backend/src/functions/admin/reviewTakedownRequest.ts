import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  COMMON_HEADERS,
  CommonErrors,
  HTTP_STATUS,
  ReviewTakedownRequest,
  TakedownStatus,
  validateReviewTakedownRequest,
  hasMinimumRole,
} from "@icaf/shared";
import { parseJsonBody } from "../../utils/request";
import { getCurrentUser } from "../../utils/auth";
import { executeTakedownRequest } from "./takedownExecution";

type ReviewTransitionAction = Extract<ReviewTakedownRequest["action"], "cancel" | "dispute">;
type ReviewTransitionStatus = Extract<TakedownStatus, "canceled" | "disputing">;

function isReviewTransitionAction(action: ReviewTakedownRequest["action"]): action is ReviewTransitionAction {
  return action === "cancel" || action === "dispute";
}

function statusForReviewTransition(action: ReviewTransitionAction): ReviewTransitionStatus {
  return action === "cancel" ? "canceled" : "disputing";
}

function isConditionalCheckFailed(error: unknown): boolean {
  return (error as { name?: string }).name === "ConditionalCheckFailedException";
}

async function markTakedownRequestReviewed(args: {
  tdrSk: string;
  adminId: string;
  action: ReviewTransitionAction;
  reviewNotes?: string;
}): Promise<{ ok: true; status: ReviewTransitionStatus } | { ok: false; response: ApiGatewayResponse }> {
  const status = statusForReviewTransition(args.action);
  const reviewNotes = args.reviewNotes?.trim();
  const nowSeconds = Math.floor(Date.now() / 1000);

  try {
    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: "TDR", SK: args.tdrSk },
        UpdateExpression:
          "SET #status = :status, reviewed_by = :reviewer, reviewed_at = :reviewedAt" +
          (reviewNotes ? ", review_notes = :notes" : ""),
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":status": status,
          ":requesting": "requesting",
          ":disputing": "disputing",
          ":reviewer": args.adminId,
          ":reviewedAt": nowSeconds,
          ...(reviewNotes ? { ":notes": reviewNotes } : {}),
        },
        ConditionExpression: "attribute_exists(PK) AND #status IN (:requesting, :disputing)",
      }),
    );
  } catch (error: unknown) {
    if (isConditionalCheckFailed(error)) {
      return { ok: false, response: CommonErrors.badRequest("Takedown request is not active") };
    }

    throw error;
  }

  return { ok: true, status };
}

export const handler = async (
  event: ApiGatewayEvent,
): Promise<ApiGatewayResponse> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    if (!hasMinimumRole(currentUser.user.role, "admin")) {
      return CommonErrors.forbidden("Admin access required");
    }

    const adminId = currentUser.user.user_id;

    // TDR SK format: TS#<unix_ts>#TDR_ID#<tdr_id>
    // Both the ts and tdr_id must come from path params since the SK is compound.
    const tdrSk = event.pathParameters?.tdr_sk;
    if (!tdrSk) {
      return CommonErrors.badRequest("tdr_sk path parameter is required");
    }

    const parsedBody = parseJsonBody<ReviewTakedownRequest>(event);
    if (!parsedBody.ok) {
      return parsedBody.response;
    }

    const body = parsedBody.value;
    if (!body.action || !["cancel", "dispute", "execute"].includes(body.action)) {
      return CommonErrors.badRequest("action must be 'cancel', 'dispute', or 'execute'");
    }

    const tdrErrors = validateReviewTakedownRequest(body);
    if (tdrErrors.length > 0) {
      return CommonErrors.badRequest(tdrErrors.join("; "));
    }

    if (body.action === "execute") {
      const result = await executeTakedownRequest({
        tdrSk,
        adminId,
        reviewNotes: body.review_notes,
      });
      if (!result.ok) return result.response;

      return {
        statusCode: HTTP_STATUS.OK,
        body: JSON.stringify({
          success: true,
          tdr_sk: tdrSk,
          status: result.status,
          affected_art_ids: result.affectedArtIds,
          affected_group_ids: result.affectedGroupIds,
          tagged_object_count: result.taggedObjectCount,
        }),
        headers: COMMON_HEADERS,
      };
    }

    if (!isReviewTransitionAction(body.action)) {
      return CommonErrors.badRequest("action must be 'cancel', 'dispute', or 'execute'");
    }

    const result = await markTakedownRequestReviewed({
      tdrSk,
      adminId,
      action: body.action,
      reviewNotes: body.review_notes,
    });
    if (!result.ok) return result.response;

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ success: true, tdr_sk: tdrSk, status: result.status }),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error reviewing takedown request:", error);
    return CommonErrors.internalServerError();
  }
};
