import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  UserEntity,
} from "@icaf/shared";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    if (event.httpMethod !== "GET") {
      return CommonErrors.methodNotAllowed();
    }

    const adminId = event.requestContext?.authorizer?.claims?.sub;
    if (!adminId) {
      return CommonErrors.unauthorized();
    }

    const targetUserId = event.pathParameters?.user_id;
    if (!targetUserId) {
      return CommonErrors.badRequest("user_id path parameter is required");
    }

    const result = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${targetUserId}`, SK: "PROFILE" },
      }),
    );

    if (!result.Item) {
      return CommonErrors.notFound("User not found");
    }

    const user = result.Item as UserEntity;

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ user_id: targetUserId, email: user.email }),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error getting user email:", error);
    return CommonErrors.internalServerError();
  }
};
