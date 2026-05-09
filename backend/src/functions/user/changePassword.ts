import { ChangePasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { cognitoClient, dynamodb, TABLE_NAME } from "../../config/aws-clients";
import { parseCookies } from "../../utils/cookies";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
} from "@icaf/shared";
import { randomUUID } from "crypto";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    if (event.httpMethod !== "POST") {
      return CommonErrors.methodNotAllowed();
    }

    const userId = event.requestContext?.authorizer?.claims?.sub;
    if (!userId) {
      return CommonErrors.unauthorized();
    }

    // Access token comes from the HTTPOnly cookie set at login
    const cookies = parseCookies(event.headers?.Cookie ?? event.headers?.cookie);
    const accessToken = cookies["accessToken"];
    if (!accessToken) {
      return CommonErrors.unauthorized();
    }

    const body = JSON.parse(event.body ?? "{}");
    const { old_password, new_password } = body as {
      old_password?: string;
      new_password?: string;
    };

    if (!old_password) {
      return CommonErrors.badRequest("old_password is required");
    }
    if (!new_password) {
      return CommonErrors.badRequest("new_password is required");
    }

    // ── Invoke Cognito ChangePassword ──────────────────────────────────────
    try {
      await cognitoClient.send(
        new ChangePasswordCommand({
          AccessToken: accessToken,
          PreviousPassword: old_password,
          ProposedPassword: new_password,
        }),
      );
    } catch (err: unknown) {
      const cognitoErr = err as { name?: string };
      if (cognitoErr.name === "NotAuthorizedException") {
        return CommonErrors.unauthorized();
      }
      if (cognitoErr.name === "InvalidPasswordException") {
        return CommonErrors.badRequest("New password does not meet requirements");
      }
      if (cognitoErr.name === "LimitExceededException") {
        return CommonErrors.badRequest("Too many attempts. Please try again later.");
      }
      throw err;
    }

    // ── Write ACCOUNT_ACTION audit record ─────────────────────────────────
    const nowSeconds = Math.floor(Date.now() / 1000);
    await dynamodb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${userId}`,
          SK: `AA#${nowSeconds}`,
          user_id: userId,
          timestamp: nowSeconds,
          action: "change_password",
          action_id: randomUUID(),
          type: "ACCOUNT_ACTION",
        },
      }),
    );

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ message: "Password changed successfully" }),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error changing password:", error);
    return CommonErrors.internalServerError();
  }
};
