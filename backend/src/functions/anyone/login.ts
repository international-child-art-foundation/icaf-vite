import {
  InitiateAuthCommand,
  AuthFlowType,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient, USER_POOL_CLIENT_ID } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
} from "@icaf/shared";
import { createCookie, decodeJwtPayload } from "../../utils/cookies";

const ACCESS_TOKEN_MAX_AGE = 60 * 60;           // 1 hour
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
  try {
    if (event.httpMethod !== "POST") {
      return CommonErrors.methodNotAllowed();
    }

    const body = JSON.parse(event.body ?? "{}");

    if (!body.email?.trim()) return CommonErrors.badRequest("email is required");
    if (!body.password) return CommonErrors.badRequest("password is required");

    const authResult = await cognitoClient.send(
      new InitiateAuthCommand({
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        ClientId: USER_POOL_CLIENT_ID,
        AuthParameters: {
          USERNAME: body.email.trim(),
          PASSWORD: body.password,
        },
      }),
    );

    const { AccessToken, IdToken, RefreshToken } =
      authResult.AuthenticationResult ?? {};

    if (!AccessToken || !IdToken || !RefreshToken) {
      return CommonErrors.internalServerError("Authentication failed: missing tokens");
    }

    const payload = decodeJwtPayload(IdToken);
    if (!payload) {
      return CommonErrors.internalServerError("Failed to decode token");
    }

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({
        message: "Login successful",
        user_id: payload["sub"],
        email: payload["email"],
        role: payload["custom:role"] ?? "user",
      }),
      headers: {
        ...COMMON_HEADERS,
        "Access-Control-Allow-Credentials": "true",
      },
      multiValueHeaders: {
        "Set-Cookie": [
          createCookie("accessToken", AccessToken, ACCESS_TOKEN_MAX_AGE),
          createCookie("idToken", IdToken, ACCESS_TOKEN_MAX_AGE),
          createCookie("refreshToken", RefreshToken, REFRESH_TOKEN_MAX_AGE),
        ],
      },
    };
  } catch (error: any) {
    console.error("Login error:", error);
    if (error.name === "NotAuthorizedException") {
      return CommonErrors.unauthorized();
    }
    if (error.name === "UserNotConfirmedException") {
      return CommonErrors.forbidden("Please verify your email before logging in");
    }
    if (error.name === "UserNotFoundException") {
      return CommonErrors.unauthorized(); // don't reveal whether email exists
    }
    if (error.name === "TooManyRequestsException") {
      return CommonErrors.tooManyRequests("Too many login attempts. Please try again later.");
    }
    if (error.name === "PasswordResetRequiredException") {
      return CommonErrors.forbidden("Password reset required");
    }
    return CommonErrors.internalServerError();
  }
};
