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
import { randomUUID } from "crypto";

const VERIFY_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    if (event.httpMethod !== "POST") {
      return CommonErrors.methodNotAllowed();
    }

    const body = JSON.parse(event.body ?? "{}") as { email?: string };
    const email = body.email?.trim();

    if (!email) {
      return CommonErrors.badRequest("email is required");
    }

    // Always return the same response regardless of outcome — don't leak
    // whether an email address exists in the system.
    const okResponse = {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({
        message: "If an account exists for this email, a sign-up link has been sent.",
      }),
      headers: COMMON_HEADERS,
    };

    // ── Look up USER entity by email ──────────────────────────────────────
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
      // No USER entity found — donor-only users won't appear here until a
      // USER entity is created for them (e.g. by the Stripe webhook handler).
      return okResponse;
    }

    const user = emailResult.Items[0] as UserEntity;

    // Only send CreateAndVerify email to virtual users (no Cognito account yet).
    // Established users should use the standard login/forgot-password flow.
    if (!user.is_virtual) {
      return okResponse;
    }

    // ── Generate/refresh verify token ─────────────────────────────────────
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

    // ── Send CreateAndVerify email ─────────────────────────────────────────
    await sendCreateAndVerifyEmail({
      toEmail: user.email,
      userId: user.user_id,
      verifyToken,
    });

    return okResponse;
  } catch (error) {
    console.error("Error sending CreateAndVerify email:", error);
    return CommonErrors.internalServerError();
  }
};
