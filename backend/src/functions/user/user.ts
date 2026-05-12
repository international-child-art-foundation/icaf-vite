import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  UserEntity,
  UserProfileResponse,
} from "@icaf/shared";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const userId = event.requestContext?.authorizer?.claims?.sub;
    if (!userId) {
      return CommonErrors.unauthorized();
    }

    const result = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: "PROFILE" },
      }),
    );

    if (!result.Item) {
      return CommonErrors.notFound("User profile not found");
    }

    const user = result.Item as UserEntity;

    const response: UserProfileResponse = {
      user_id: user.user_id,
      email: user.email,
      f_name: user.f_name,
      l_name: user.l_name,
      role: user.role ?? "user",
      is_virtual: user.is_virtual,
      banned: user.banned,
      has_magazine_subscription: user.has_magazine_subscription,
      has_newsletter_subscription: user.has_newsletter_subscription,
      verified_at: user.verified_at,
      timestamp: user.timestamp,
    };

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return CommonErrors.internalServerError();
  }
};
