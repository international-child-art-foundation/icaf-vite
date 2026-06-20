import { randomUUID } from "crypto";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  COMMON_HEADERS,
  CommonErrors,
  HTTP_STATUS,
  RecoverCreateAndVerifyRequest,
  UserEntity,
  isValidUUID,
} from "@icaf/shared";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import { ACCOUNT_ACTIVATION_TOKEN_TTL_SECONDS } from "../../utils/authActionToken";
import { sendCreateAndVerifyEmail } from "../../utils/emails/createAndVerify";
import { parseJsonBody } from "../../utils/request";

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
  try {
    const parsedBody = parseJsonBody<RecoverCreateAndVerifyRequest>(event);
    if (!parsedBody.ok) return parsedBody.response;
    const userId = parsedBody.value.user_id?.trim();
    const expiredToken = parsedBody.value.auth_action_token?.trim();

    if (!userId || !isValidUUID(userId) || !expiredToken) {
      return CommonErrors.badRequest("user_id and authentication token are required");
    }

    const result = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: "PROFILE" },
      }),
    );
    const user = result.Item as UserEntity | undefined;
    const nowSeconds = Math.floor(Date.now() / 1000);

    if (
      !user ||
      user.verified_at ||
      user.email_blocked === true ||
      user.auth_action_token !== expiredToken ||
      user.auth_action_token_exp === undefined ||
      user.auth_action_token_exp >= nowSeconds
    ) {
      return CommonErrors.badRequest("This account activation link cannot be recovered");
    }

    const authActionToken = randomUUID();
    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: "PROFILE" },
        UpdateExpression:
          "SET auth_action_token = :newToken, auth_action_token_exp = :exp, emailed_signup_at = :emailedAt",
        ConditionExpression:
          "auth_action_token = :oldToken AND auth_action_token_exp < :now AND attribute_not_exists(verified_at)",
        ExpressionAttributeValues: {
          ":newToken": authActionToken,
          ":oldToken": expiredToken,
          ":exp": nowSeconds + ACCOUNT_ACTIVATION_TOKEN_TTL_SECONDS,
          ":now": nowSeconds,
          ":emailedAt": nowSeconds,
        },
      }),
    );

    await sendCreateAndVerifyEmail({
      toEmail: user.email,
      userId,
      authActionToken,
    });

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({
        message: "Account activation email sent",
        delivery_medium: "EMAIL",
      }),
      headers: COMMON_HEADERS,
    };
  } catch (error: unknown) {
    if ((error as { name?: string }).name === "ConditionalCheckFailedException") {
      return CommonErrors.badRequest("This account activation link cannot be recovered");
    }
    console.error("Create-and-verify recovery error:", error);
    return CommonErrors.internalServerError();
  }
};
