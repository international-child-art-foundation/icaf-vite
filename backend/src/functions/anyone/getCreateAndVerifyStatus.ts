import { GetCommand } from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  COMMON_HEADERS,
  CommonErrors,
  CreateAndVerifyStatusResponse,
  HTTP_STATUS,
  UserEntity,
  isValidUUID,
} from "@icaf/shared";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
  try {
    const userId = event.queryStringParameters?.user_id?.trim();
    const token = event.queryStringParameters?.auth_action_token?.trim();

    if (!userId || !isValidUUID(userId) || !token) {
      return CommonErrors.badRequest("user_id and authentication token are required");
    }

    const result = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: "PROFILE" },
      }),
    );
    const user = result.Item as UserEntity | undefined;

    let response: CreateAndVerifyStatusResponse;
    if (user?.verified_at) {
      response = { status: "already_verified" };
    } else if (!user || user.auth_action_token !== token) {
      response = { status: "invalid" };
    } else if (
      user.auth_action_token_exp !== undefined &&
      user.auth_action_token_exp < Math.floor(Date.now() / 1000)
    ) {
      response = { status: "expired" };
    } else {
      response = {
        status: "valid",
        ...(user.auth_action_token_exp !== undefined
          ? { expires_at: user.auth_action_token_exp }
          : {}),
      };
    }

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Create-and-verify status error:", error);
    return CommonErrors.internalServerError();
  }
};
