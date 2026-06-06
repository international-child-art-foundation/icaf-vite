import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  normalizeEmail,
  UserEntity,
} from "@icaf/shared";
import { EntityType, GSI } from "../../dynamo/ddbSchemaConsts";
import { emailGsiSk, emailPk } from "../../dynamo/emailGsi";
import { sendCreateAndVerifyEmail } from "../../utils/emails/createAndVerify";
import { sendRegistrationVerificationEmail } from "../../utils/emails/registrationVerification";
import { parseJsonBody } from "../../utils/request";

const AUTH_ACTION_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

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

    const email = normalizeEmail(body.email);
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: GSI.Email,
        KeyConditionExpression: "EMAIL_PK = :pk AND EMAIL_SK = :sk",
        ExpressionAttributeValues: {
          ":pk": emailPk(email),
          ":sk": emailGsiSk(EntityType.User),
        },
        Limit: 1,
      }),
    );

    const user = result.Items?.[0] as UserEntity | undefined;
    if (!user) {
      return CommonErrors.notFound("User not found");
    }
    if (user.verified_at) {
      return CommonErrors.badRequest("User is already verified");
    }
    if (user.email_blocked === true) {
      return CommonErrors.forbidden("This email address cannot receive ICAF emails");
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const authActionToken = randomUUID();
    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${user.user_id}`, SK: "PROFILE" },
        UpdateExpression: "SET auth_action_token = :token, auth_action_token_exp = :exp",
        ExpressionAttributeValues: {
          ":token": authActionToken,
          ":exp": nowSeconds + AUTH_ACTION_TOKEN_TTL_SECONDS,
        },
      }),
    );

    const sendVerification = user.is_virtual
      ? sendCreateAndVerifyEmail
      : sendRegistrationVerificationEmail;

    await sendVerification({
      toEmail: user.email,
      userId: user.user_id,
      authActionToken,
    });

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({
        message: "Verification email resent",
        delivery_medium: "EMAIL",
      }),
      headers: COMMON_HEADERS,
    };
  } catch (error: any) {
    console.error("ResendVerificationEmail error:", error);
    return CommonErrors.internalServerError();
  }
};
