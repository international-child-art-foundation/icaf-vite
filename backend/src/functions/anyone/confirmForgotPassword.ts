import { AdminSetUserPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { cognitoClient, dynamodb, TABLE_NAME, USER_POOL_ID } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  UserEntity,
} from "@icaf/shared";
import { parseJsonBody } from "../../utils/request";

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
  try {
    const parsedBody = parseJsonBody<{
      user_id?: string;
      auth_action_token?: string;
      new_password?: string;
    }>(event);
    if (!parsedBody.ok) return parsedBody.response;
    const body = parsedBody.value;

    if (!body.user_id?.trim()) return CommonErrors.badRequest("user_id is required");
    if (!body.auth_action_token?.trim()) return CommonErrors.badRequest("auth_action_token is required");
    if (!body.new_password) return CommonErrors.badRequest("new_password is required");

    const result = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${body.user_id}`, SK: "PROFILE" },
      }),
    );
    if (!result.Item) return CommonErrors.notFound("User not found");

    const user = result.Item as UserEntity;
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (user.auth_action_token !== body.auth_action_token) {
      return CommonErrors.badRequest("Invalid reset token");
    }
    if (user.auth_action_token_exp !== undefined && user.auth_action_token_exp < nowSeconds) {
      return CommonErrors.badRequest("Reset token has expired");
    }

    await cognitoClient.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: user.email,
        Password: body.new_password,
        Permanent: true,
      }),
    );

    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${user.user_id}`, SK: "PROFILE" },
        UpdateExpression: "REMOVE auth_action_token, auth_action_token_exp",
      }),
    );

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ message: "Password reset successfully" }),
      headers: COMMON_HEADERS,
    };
  } catch (error: any) {
    console.error("ConfirmForgotPassword error:", error);
    if (error.name === "InvalidPasswordException") {
      return CommonErrors.badRequest("Password does not meet requirements");
    }
    if (error.name === "LimitExceededException" || error.name === "TooManyRequestsException") {
      return CommonErrors.tooManyRequests("Too many attempts. Please try again later.");
    }
    return CommonErrors.internalServerError();
  }
};
