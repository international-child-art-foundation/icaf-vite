import { QueryCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { CommonErrors, normalizeEmail } from "@icaf/shared";
import type { ApiGatewayResponse, UserEntity } from "@icaf/shared";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import { EntityType, GSI } from "../../dynamo/ddbSchemaConsts";
import { emailGsiSk, emailPk } from "../../dynamo/emailGsi";
import { sendArtworkSubmissionEmail } from "../../utils/emails/artworkSubmission";
import { ensureArtworkUnsubscribeToken, shouldSuppressArtworkEmail } from "../../utils/emails/unsubscribe";

const AUTH_ACTION_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export type VirtualUserResult =
  | { ok: true; user: UserEntity; sentSignupEmail: boolean }
  | { ok: false; response: ApiGatewayResponse };

async function getUserByEmail(email: string): Promise<UserEntity | undefined> {
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

  return result.Items?.[0] as UserEntity | undefined;
}

export async function getOrCreateVirtualUser(
  email: string,
  nowSeconds: number,
): Promise<VirtualUserResult> {
  const normalizedEmail = normalizeEmail(email);
  let user = await getUserByEmail(normalizedEmail);

  if (!user) {
    const userId = randomUUID();
    user = {
      PK: `USER#${userId}`,
      SK: "PROFILE",
      user_id: userId,
      email: normalizedEmail,
      is_virtual: true,
      ts: nowSeconds,
      banned: false,
      has_magazine_subscription: false,
      has_newsletter_subscription: false,
      artwork_emails_off: false,
      type: "USER",
      EMAIL_PK: emailPk(normalizedEmail),
      EMAIL_SK: emailGsiSk(EntityType.User),
    } as unknown as UserEntity;

    await dynamodb.send(new PutCommand({ TableName: TABLE_NAME, Item: user }));
  }

  if (user.banned) {
    return { ok: false, response: CommonErrors.forbidden("This account is banned") };
  }

  if (!user.is_virtual) {
    return {
      ok: false,
      response: CommonErrors.conflict(
        "This account already exists. Please log in to submit artwork.",
      ),
    };
  }

  if (shouldSuppressArtworkEmail(user)) {
    return { ok: true, user, sentSignupEmail: false };
  }

  if (user.emailed_signup_at) {
    return { ok: true, user, sentSignupEmail: false };
  }

  const authActionToken = randomUUID();
  const authActionTokenExp = nowSeconds + AUTH_ACTION_TOKEN_TTL_SECONDS;

  await dynamodb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${user.user_id}`, SK: "PROFILE" },
      UpdateExpression:
        "SET auth_action_token = :token, auth_action_token_exp = :exp",
      ExpressionAttributeValues: {
        ":token": authActionToken,
        ":exp": authActionTokenExp,
      },
    }),
  );

  try {
    const unsubscribeToken = await ensureArtworkUnsubscribeToken(user);

    await sendArtworkSubmissionEmail({
      toEmail: user.email,
      userId: user.user_id,
      authActionToken,
      unsubscribeToken,
    });
  } catch (error) {
    console.error("Artwork submission signup email failed:", error);
    return { ok: true, user, sentSignupEmail: false };
  }

  try {
    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${user.user_id}`, SK: "PROFILE" },
        UpdateExpression: "SET emailed_signup_at = :emailSignupAt",
        ExpressionAttributeValues: {
          ":emailSignupAt": nowSeconds,
        },
      }),
    );
  } catch (error) {
    console.error("Failed to mark artwork signup email as sent:", error);
  }

  return { ok: true, user, sentSignupEmail: true };
}
