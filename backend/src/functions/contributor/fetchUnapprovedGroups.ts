import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  hasMinimumRole,
} from "@icaf/shared";
import { fetchGroupReviewPage, parseReviewParams } from "../shared/contributorUtils";
import { getCurrentUser } from "../../utils/auth";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    if (!hasMinimumRole(currentUser.user.role, "contributor")) {
        return CommonErrors.forbidden("Contributor access required");
    }
    

    const params = parseReviewParams(event);
    if (!params.ok) {
      return params.response;
    }

    const page = await fetchGroupReviewPage("pending_review", params.limit, params.lastKey);

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ groups: page.items, has_more: page.has_more, last_key: page.last_key }),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error fetching unapproved groups:", error);
    return CommonErrors.internalServerError();
  }
};
