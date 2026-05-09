import { ForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
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

    if (!body.email?.trim()) {
      return CommonErrors.badRequest("email is required");
    }

    const result = await cognitoClient.send(
      new ForgotPasswordCommand({
        ClientId: USER_POOL_CLIENT_ID,
        Username: body.email.trim(),
      }),
    );

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({
        message: "Password reset code sent",
        delivery_medium: result.CodeDeliveryDetails?.DeliveryMedium ?? "EMAIL",
        destination: result.CodeDeliveryDetails?.Destination,
      }),
      headers: COMMON_HEADERS,
    };
  } catch (error: any) {
    console.error("ForgotPassword error:", error);
    if (error.name === "UserNotFoundException") {
      // Don't reveal whether the email is registered
      return {
        statusCode: HTTP_STATUS.OK,
        body: JSON.stringify({ message: "If this email is registered, a reset code has been sent" }),
        headers: COMMON_HEADERS,
      };
    }
    if (error.name === "LimitExceededException") {
      return CommonErrors.tooManyRequests("Too many requests. Please try again later.");
    }
    return CommonErrors.internalServerError();
  }
};
