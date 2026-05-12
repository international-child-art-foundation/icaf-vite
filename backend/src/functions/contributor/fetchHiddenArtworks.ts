import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
} from "@icaf/shared";
import { fetchArtworkReviewPage, parseReviewParams } from "./reviewShared";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const userId = event.requestContext?.authorizer?.claims?.sub;
    if (!userId) {
      return CommonErrors.unauthorized();
    }

    const params = parseReviewParams(event);
    if (!params.ok) {
      return params.response;
    }

    const page = await fetchArtworkReviewPage("hidden", params.limit, params.lastKey);

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ artworks: page.items, has_more: page.has_more, last_key: page.last_key }),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error fetching hidden artworks:", error);
    return CommonErrors.internalServerError();
  }
};
