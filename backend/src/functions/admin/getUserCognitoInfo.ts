import { AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { cognitoClient, dynamodb, TABLE_NAME, USER_POOL_ID } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  GetUserCognitoInfoResponse,
  hasMinimumRole,
} from "@icaf/shared";
import { getCurrentUser } from "../../utils/auth";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    if (!hasMinimumRole(currentUser.user.role, "admin")) {
        return CommonErrors.forbidden("Admin access required");
    }
    

    const targetUserId = event.pathParameters?.user_id;
    if (!targetUserId) {
      return CommonErrors.badRequest("user_id path parameter is required");
    }

    const userResult = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${targetUserId}`, SK: "PROFILE" },
      }),
    );
    const targetEmail = userResult.Item?.email as string | undefined;

    let cognitoUser;
    try {
      cognitoUser = await cognitoClient.send(
        new AdminGetUserCommand({ UserPoolId: USER_POOL_ID, Username: targetEmail ?? targetUserId }),
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
