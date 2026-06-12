import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { UserEntity } from "@icaf/shared";
import { randomUUID } from "crypto";
import { APP_URL, dynamodb, TABLE_NAME } from "../../config/aws-clients";

export function shouldSuppressArtworkEmail(user: UserEntity): boolean {
  return (
    !user.email ||
    user.banned === true ||
    user.email_blocked === true ||
    user.artwork_emails_off === true
  );
}

export function buildArtworkUnsubscribeUrl(userId: string, unsubscribeToken: string): string {
  return `${APP_URL}/unsubscribe?u=${encodeURIComponent(userId)}&t=${encodeURIComponent(unsubscribeToken)}`;
}

export async function ensureArtworkUnsubscribeToken(user: UserEntity): Promise<string> {
  if (user.unsub_token) {
    return user.unsub_token;
  }

  const token = randomUUID();
  const result = await dynamodb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${user.user_id}`, SK: "PROFILE" },
      UpdateExpression:
        "SET unsub_token = if_not_exists(unsub_token, :token), artwork_emails_off = if_not_exists(artwork_emails_off, :off)",
      ExpressionAttributeValues: {
        ":token": token,
        ":off": false,
      },
      ReturnValues: "ALL_NEW",
    }),
  );

  return (result.Attributes as UserEntity | undefined)?.unsub_token ?? token;
}
