import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  COMMON_HEADERS,
  HTTP_STATUS,
} from "@icaf/shared";
import { getCurrentUser } from "../../utils/auth";

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
  const currentUser = await getCurrentUser(event);

  return {
    statusCode: HTTP_STATUS.OK,
    body: JSON.stringify(
      currentUser.ok
        ? {
            authenticated: true,
            user_id: currentUser.user.user_id,
            email: currentUser.user.email,
            role: currentUser.auth.role,
            f_name: currentUser.user.f_name,
            l_name: currentUser.user.l_name,
          }
        : { authenticated: false },
    ),
    headers: { ...COMMON_HEADERS, "Access-Control-Allow-Credentials": "true" },
  };
};
