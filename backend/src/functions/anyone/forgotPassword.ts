import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  UserEntity,
} from "@icaf/shared";
import { EntityType, GSI } from "../../dynamo/ddbSchemaConsts";
import { emailGsiSk, emailPk } from "../../dynamo/emailGsi";
import { sendResetPasswordEmail } from "../../utils/emails/resetPassword";
import { parseJsonBody } from "../../utils/request";

const AUTH_ACTION_TOKEN_TTL_SECONDS = 60 * 60;

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
  try {
    const parsedBody = parseJsonBody<{ email?: string }>(event);
    if (!parsedBody.ok) return parsedBody.response;
    const body = parsedBody.value;

    if (!body.email?.trim()) {
      return CommonErrors.badRequest("email is required");
    }

    const okResponse = {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ message: "If this email is registered, a password reset link has been sent" }),
      headers: COMMON_HEADERS,
    };

    const email = body.email.trim();
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
    if (!user || user.email_blocked === true || user.is_virtual || !user.verified_at) {
      return okResponse;
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

    await sendResetPasswordEmail({
      toEmail: user.email,
      userId: user.user_id,
      authActionToken,
    });

    return okResponse;
  } catch (error: any) {
    console.error("ForgotPassword error:", error);
    return CommonErrors.internalServerError();
  }
};
