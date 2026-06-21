import {
  AuthFlowType,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  COMMON_HEADERS,
  CommonErrors,
  HTTP_STATUS,
} from "@icaf/shared";
import { cognitoClient, USER_POOL_CLIENT_ID } from "../../config/aws-clients";
import { createCookie, deleteCookie, parseCookies } from "../../utils/cookies";

const ACCESS_TOKEN_MAX_AGE = 60 * 60;
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

function unauthorizedWithClearedCookies(): ApiGatewayResponse {
  const response = CommonErrors.unauthorized();
  return {
    ...response,
    headers: {
      ...response.headers,
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
}

export const handler = async (
  event: ApiGatewayEvent,
): Promise<ApiGatewayResponse> => {
  try {
    const cookies = parseCookies(
      event.headers?.Cookie ?? event.headers?.cookie,
    );
    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      return unauthorizedWithClearedCookies();
    }

    const authResult = await cognitoClient.send(
      new InitiateAuthCommand({
        AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
        ClientId: USER_POOL_CLIENT_ID,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
      }),
    );

    const { AccessToken, IdToken, RefreshToken } =
      authResult.AuthenticationResult ?? {};

    if (!AccessToken || !IdToken) {
      return unauthorizedWithClearedCookies();
    }

    const setCookies = [
      createCookie("accessToken", AccessToken, ACCESS_TOKEN_MAX_AGE),
      createCookie("idToken", IdToken, ACCESS_TOKEN_MAX_AGE),
    ];

    if (RefreshToken) {
      setCookies.push(
        createCookie("refreshToken", RefreshToken, REFRESH_TOKEN_MAX_AGE),
      );
    }

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ message: "Session refreshed" }),
      headers: {
        ...COMMON_HEADERS,
        "Access-Control-Allow-Credentials": "true",
      },
      multiValueHeaders: {
        "Set-Cookie": setCookies,
      },
    };
  } catch (error: any) {
    if (error.name === "NotAuthorizedException") {
      return unauthorizedWithClearedCookies();
    }

    console.error("Refresh error:", error);
    return CommonErrors.internalServerError();
  }
};
