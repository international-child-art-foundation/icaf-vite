import { AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient, USER_POOL_ID } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  GetUserCognitoInfoResponse,
} from "@icaf/shared";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const adminId = event.requestContext?.authorizer?.claims?.sub;
    if (!adminId) {
      return CommonErrors.unauthorized();
    }

    const targetUserId = event.pathParameters?.user_id;
    if (!targetUserId) {
      return CommonErrors.badRequest("user_id path parameter is required");
    }

    let cognitoUser;
    try {
      cognitoUser = await cognitoClient.send(
        new AdminGetUserCommand({ UserPoolId: USER_POOL_ID, Username: targetUserId }),
      );
    } catch (err: unknown) {
      const cognitoErr = err as { name?: string };
      if (cognitoErr.name === "UserNotFoundException") {
        return CommonErrors.notFound("User not found in Cognito");
      }
      throw err;
    }

    const getAttr = (name: string) =>
      cognitoUser.UserAttributes?.find((a) => a.Name === name)?.Value;

    const response: GetUserCognitoInfoResponse = {
      user_id: targetUserId,
      email: getAttr("email") ?? "",
      email_verified: getAttr("email_verified") === "true",
      cognito_username: cognitoUser.Username ?? targetUserId,
      user_status: cognitoUser.UserStatus ?? "UNKNOWN",
      enabled: cognitoUser.Enabled !== false,
      user_create_date: cognitoUser.UserCreateDate?.toISOString(),
      user_last_modified_date: cognitoUser.UserLastModifiedDate?.toISOString(),
    };

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error getting Cognito user info:", error);
    return CommonErrors.internalServerError();
  }
};
