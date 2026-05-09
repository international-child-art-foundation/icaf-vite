import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
} from "@icaf/shared";
import { fetchGroupReviewPage, parseReviewParams } from "./reviewShared";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    if (event.httpMethod !== "GET") {
      return CommonErrors.methodNotAllowed();
    }

    const userId = event.requestContext?.authorizer?.claims?.sub;
    if (!userId) {
      return CommonErrors.unauthorized();
    }

    const { limit, lastKey } = parseReviewParams(event);
    const page = await fetchGroupReviewPage("pending_review", limit, lastKey);

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
