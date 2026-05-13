import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  UserEntity,
} from "@icaf/shared";
import { GSI, EntityType } from "../../dynamo/ddbSchemaConsts";
import { emailPk, emailGsiSk } from "../../dynamo/emailGsi";
import { sendCreateAndVerifyEmail } from "../../utils/emails/createAndVerify";
import { parseJsonBody } from "../../utils/request";
import { randomUUID } from "crypto";

const VERIFY_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const parsedBody = parseJsonBody<{ email?: string }>(event);
    if (!parsedBody.ok) return parsedBody.response;
    const body = parsedBody.value;
    const email = body.email?.trim();

    if (!email) {
      return CommonErrors.badRequest("email is required");
    }

    const okResponse = {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({
        message: "If an account exists for this email, a create-and-verify link has been sent.",
      }),
      headers: COMMON_HEADERS,
    };

    const emailResult = await dynamodb.send(
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

    if (!emailResult.Items?.length) {
      return okResponse;
    }

    const user = emailResult.Items[0] as UserEntity;

    if (!user.is_virtual) {
      return okResponse;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const verifyToken = randomUUID();
    const verifyTokenExpiration = nowSeconds + VERIFY_TOKEN_TTL_SECONDS;

    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${user.user_id}`, SK: "PROFILE" },
        UpdateExpression:
          "SET verify_token = :token, verify_token_expiration = :exp",
        ExpressionAttributeValues: {
          ":token": verifyToken,
          ":exp": verifyTokenExpiration,
        },
      }),
    );

    await sendCreateAndVerifyEmail({
      toEmail: user.email,
      userId: user.user_id,
      verifyToken,
    });

    return okResponse;
  } catch (error) {
    console.error("Error requesting create-and-verify link:", error);
    return CommonErrors.internalServerError();
  }
};
