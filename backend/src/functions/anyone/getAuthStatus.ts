import { GetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
} from "@icaf/shared";
import { parseCookies } from "../../utils/cookies";
import { getUserByEmail } from "../../utils/auth";

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
  try {
    const cookies = parseCookies(
      event.headers?.["Cookie"] ?? event.headers?.["cookie"],
    );
    const accessToken = cookies["accessToken"];

    if (!accessToken) {
      return {
        statusCode: HTTP_STATUS.OK,
        body: JSON.stringify({ authenticated: false }),
        headers: { ...COMMON_HEADERS, "Access-Control-Allow-Credentials": "true" },
      };
    }

    try {
      const result = await cognitoClient.send(
        new GetUserCommand({ AccessToken: accessToken }),
      );

      const getAttribute = (name: string) =>
        result.UserAttributes?.find((a) => a.Name === name)?.Value;
      const email = getAttribute("email");
      const user = email ? await getUserByEmail(email) : undefined;

      return {
        statusCode: HTTP_STATUS.OK,
        body: JSON.stringify({
          authenticated: true,
          user_id: user?.user_id ?? result.Username,
          email,
          role: user?.role ?? getAttribute("custom:role") ?? "user",
        }),
        headers: { ...COMMON_HEADERS, "Access-Control-Allow-Credentials": "true" },
      };
    } catch (error: any) {
      if (
        error.name === "NotAuthorizedException" ||
        error.name === "UserNotFoundException" ||
        error.name === "InvalidParameterException"
      ) {
        return {
          statusCode: HTTP_STATUS.OK,
          body: JSON.stringify({ authenticated: false }),
          headers: { ...COMMON_HEADERS, "Access-Control-Allow-Credentials": "true" },
        };
      }
      throw error;
    }
  } catch (error) {
    console.error("GetAuthStatus error:", error);
    return CommonErrors.internalServerError();
  }
};
