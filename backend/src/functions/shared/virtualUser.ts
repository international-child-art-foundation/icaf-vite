import { QueryCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { CommonErrors } from "@icaf/shared";
import type { ApiGatewayResponse, UserEntity } from "@icaf/shared";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import { EntityType, GSI } from "../../dynamo/ddbSchemaConsts";
import { emailGsiSk, emailPk } from "../../dynamo/emailGsi";
import { sendArtworkSubmissionEmail } from "../../utils/emails/artworkSubmission";

const VERIFY_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

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
  const normalizedEmail = email.trim();
  let user = await getUserByEmail(normalizedEmail);

  if (!user) {
    const userId = randomUUID();
    user = {
      PK: `USER#${userId}`,
      SK: "PROFILE",
      user_id: userId,
      email: normalizedEmail,
      is_virtual: true,
      timestamp: nowSeconds,
      banned: false,
      has_magazine_subscription: false,
      has_newsletter_subscription: false,
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

  if (user.emailed_signup_at) {
    return { ok: true, user, sentSignupEmail: false };
  }

  const verifyToken = randomUUID();
  const verifyTokenExpiration = nowSeconds + VERIFY_TOKEN_TTL_SECONDS;

  await dynamodb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${user.user_id}`, SK: "PROFILE" },
      UpdateExpression:
        "SET verify_token = :token, verify_token_expiration = :exp, emailed_signup_at = :emailSignupAt",
      ExpressionAttributeValues: {
        ":token": verifyToken,
        ":exp": verifyTokenExpiration,
        ":emailSignupAt": nowSeconds,
      },
    }),
  );

  await sendArtworkSubmissionEmail({
    toEmail: user.email,
    userId: user.user_id,
    verifyToken,
  });

  return { ok: true, user, sentSignupEmail: true };
}
