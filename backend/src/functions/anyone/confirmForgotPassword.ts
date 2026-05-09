import { ConfirmForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient, USER_POOL_CLIENT_ID } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
} from "@icaf/shared";

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
  try {
    if (event.httpMethod !== "POST") {
      return CommonErrors.methodNotAllowed();
    }

    const body = JSON.parse(event.body ?? "{}");

    if (!body.email?.trim()) return CommonErrors.badRequest("email is required");
    if (!body.code?.trim()) return CommonErrors.badRequest("code is required");
    if (!body.new_password) return CommonErrors.badRequest("new_password is required");

    await cognitoClient.send(
      new ConfirmForgotPasswordCommand({
        ClientId: USER_POOL_CLIENT_ID,
        Username: body.email.trim(),
        ConfirmationCode: body.code.trim(),
        Password: body.new_password,
      }),
    );

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ message: "Password reset successfully" }),
      headers: COMMON_HEADERS,
    };
  } catch (error: any) {
    console.error("ConfirmForgotPassword error:", error);
    if (error.name === "CodeMismatchException") {
      return CommonErrors.badRequest("Invalid verification code");
    }
    if (error.name === "ExpiredCodeException") {
      return CommonErrors.badRequest("Verification code has expired");
    }
    if (error.name === "InvalidPasswordException") {
      return CommonErrors.badRequest("Password does not meet requirements");
    }
    if (error.name === "LimitExceededException" || error.name === "TooManyFailedAttemptsException") {
      return CommonErrors.tooManyRequests("Too many attempts. Please try again later.");
    }
    if (error.name === "UserNotFoundException") {
      return CommonErrors.notFound("User not found");
    }
    return CommonErrors.internalServerError();
  }
};
