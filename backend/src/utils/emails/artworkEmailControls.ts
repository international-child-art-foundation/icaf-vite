import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { UserEntity } from "@icaf/shared";
import { randomUUID } from "crypto";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import { sendApprovalEmail } from "./approvalNotification";

export async function sendApprovalEmailToUser(args: {
  user: UserEntity;
  type: "art" | "group";
  id: string;
  title?: string;
}): Promise<void> {
  if (shouldSuppressArtworkEmail(args.user)) {
    return;
  }

  const unsubscribeToken = await ensureUnsubscribeToken(args.user);

  await sendApprovalEmail({
    toEmail: args.user.email,
    userId: args.user.user_id,
    unsubscribeToken,
    type: args.type,
    id: args.id,
    title: args.title,
  });
}

function shouldSuppressArtworkEmail(user: UserEntity): boolean {
  return (
    !user.email ||
    user.banned === true ||
    user.email_blocked === true ||
    user.artwork_emails_off === true
  );
}

async function ensureUnsubscribeToken(user: UserEntity): Promise<string> {
  if (user.unsub_token) {
    return user.unsub_token;
  }

  const token = randomUUID();
  const result = await dynamodb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${user.user_id}`, SK: "PROFILE" },
      UpdateExpression: "SET unsub_token = if_not_exists(unsub_token, :token)",
      ExpressionAttributeValues: {
        ":token": token,
      },
      ReturnValues: "ALL_NEW",
    }),
  );

  return (result.Attributes as UserEntity | undefined)?.unsub_token ?? token;
}
