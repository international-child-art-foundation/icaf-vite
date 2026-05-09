import { GlobalSignOutCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
} from "@icaf/shared";
import { parseCookies, deleteCookie } from "../../utils/cookies";

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
  try {
    if (event.httpMethod !== "POST") {
      return CommonErrors.methodNotAllowed();
    }

    const cookies = parseCookies(
      event.headers?.["Cookie"] ?? event.headers?.["cookie"],
    );

    if (cookies["accessToken"]) {
      try {
        await cognitoClient.send(
          new GlobalSignOutCommand({ AccessToken: cookies["accessToken"] }),
        );
      } catch (error: any) {
        // Token already invalid — continue with cookie deletion
        if (error.name !== "NotAuthorizedException") {
          console.error("GlobalSignOut error:", error);
        }
      }
    }

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ message: "Logged out successfully" }),
      headers: {
        ...COMMON_HEADERS,
        "Access-Control-Allow-Credentials": "true",
      },
      multiValueHeaders: {
        "Set-Cookie": [
          deleteCookie("accessToken"),
          deleteCookie("idToken"),
          deleteCookie("refreshToken"),
        ],
      },
    };
  } catch (error) {
    console.error("Logout error:", error);
    return CommonErrors.internalServerError();
  }
};
