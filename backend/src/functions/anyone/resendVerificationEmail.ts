import { ResendConfirmationCodeCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient, USER_POOL_CLIENT_ID } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
} from "@icaf/shared";
import { parseJsonBody } from "../../utils/request";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const parsedBody = parseJsonBody<{ email?: string }>(event);
    if (!parsedBody.ok) return parsedBody.response;
    const body = parsedBody.value;

    if (!body.email?.trim()) {
      return CommonErrors.badRequest("email is required");
    }

    const result = await cognitoClient.send(
      new ResendConfirmationCodeCommand({
        ClientId: USER_POOL_CLIENT_ID,
        Username: body.email.trim(),
      }),
    );

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({
        message: "Verification email resent",
        delivery_medium: result.CodeDeliveryDetails?.DeliveryMedium ?? "EMAIL",
        destination: result.CodeDeliveryDetails?.Destination,
      }),
      headers: COMMON_HEADERS,
    };
  } catch (error: any) {
    console.error("ResendVerificationEmail error:", error);
    if (error.name === "UserNotFoundException") {
      return CommonErrors.notFound("User not found");
    }
    if (error.name === "InvalidParameterException") {
      return CommonErrors.badRequest("User is already confirmed");
    }
    if (error.name === "LimitExceededException") {
      return CommonErrors.tooManyRequests("Too many requests. Please try again later.");
    }
    return CommonErrors.internalServerError();
  }
};
