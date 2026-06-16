import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { createHash, randomUUID } from "crypto";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  normalizeEmail,
  UserEntity,
} from "@icaf/shared";
import { EntityType, GSI } from "../../dynamo/ddbSchemaConsts";
import { emailGsiSk, emailPk } from "../../dynamo/emailGsi";
import {
  sendActivateAccountFromForgotPasswordEmail,
  sendResetPasswordEmail,
} from "../../utils/emails/resetPassword";
import { parseJsonBody } from "../../utils/request";

const AUTH_ACTION_TOKEN_TTL_SECONDS = 60 * 60;

function emailDebugFingerprint(email: string) {
  const trimmed = email.trim();
  return {
    email_hash: createHash("sha256").update(trimmed.toLowerCase()).digest("hex").slice(0, 12),
    has_uppercase: /[A-Z]/.test(trimmed),
    length: trimmed.length,
  };
}

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
      body: JSON.stringify({
        message: "If this email is registered, a password reset link has been sent",
        account_status: "email_sent",
        delivery_medium: "EMAIL",
      }),
      headers: COMMON_HEADERS,
    };

    const debugEmail = emailDebugFingerprint(body.email);
    const email = normalizeEmail(body.email);
    console.info("ForgotPassword lookup started", debugEmail);

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
      console.info("ForgotPassword lookup complete", {
        ...debugEmail,
        result: "no_user",
      });
      return CommonErrors.notFound("No ICAF account was found for that email address");
    }

    if (user.email_blocked === true) {
      console.info("ForgotPassword lookup complete", {
        ...debugEmail,
        result: "blocked",
        user_id: user.user_id,
      });
      return CommonErrors.forbidden("This email address cannot receive ICAF emails");
    }

    if (user.is_virtual) {
      console.info("ForgotPassword lookup complete", {
        ...debugEmail,
        result: "virtual",
        user_id: user.user_id,
      });
      return {
        statusCode: HTTP_STATUS.OK,
        body: JSON.stringify({
          message: "We found your email in our system, but you do not yet have an account.",
          account_status: "virtual",
        }),
        headers: COMMON_HEADERS,
      };
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

    if (user.verified_at) {
      const messageId = await sendResetPasswordEmail({
        toEmail: user.email,
        userId: user.user_id,
        authActionToken,
      });
      console.info("ForgotPassword email sent", {
        ...debugEmail,
        result: "verified_reset_email_sent",
        user_id: user.user_id,
        ses_message_id: messageId,
      });
    } else {
      const messageId = await sendActivateAccountFromForgotPasswordEmail({
        toEmail: user.email,
        userId: user.user_id,
        authActionToken,
      });
      console.info("ForgotPassword email sent", {
        ...debugEmail,
        result: "unverified_activation_email_sent",
        user_id: user.user_id,
        ses_message_id: messageId,
      });
    }

    return okResponse;
  } catch (error: any) {
    console.error("ForgotPassword error", {
      name: error?.name,
      message: error?.message,
      http_status_code: error?.$metadata?.httpStatusCode,
      request_id: error?.$metadata?.requestId,
      fault: error?.$fault,
    });
    return CommonErrors.internalServerError();
  }
};
