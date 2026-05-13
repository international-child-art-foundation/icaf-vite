import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  COMMON_HEADERS,
  HTTP_STATUS,
} from "@icaf/shared";
import { getOptionalAuth } from "../../utils/auth";

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
  const auth = await getOptionalAuth(event);

  return {
    statusCode: HTTP_STATUS.OK,
    body: JSON.stringify(
      auth
        ? {
            authenticated: true,
            user_id: auth.user_id,
            email: auth.email,
            role: auth.role,
          }
        : { authenticated: false },
    ),
    headers: { ...COMMON_HEADERS, "Access-Control-Allow-Credentials": "true" },
  };
};
