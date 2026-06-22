import type { SNSEvent } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { EntityType, GSI } from "../dynamo/ddbSchemaConsts";
import { emailGsiSk, emailPk } from "../dynamo/emailGsi";

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));
const TABLE_NAME = process.env.TABLE_NAME!;

type SesFeedbackMessage = {
  notificationType?: string;
  bounce?: {
    bounceType?: string;
    bouncedRecipients?: { emailAddress?: string }[];
  };
  complaint?: {
    complainedRecipients?: { emailAddress?: string }[];
  };
  mail?: {
    destination?: string[];
  };
};

function parseMessage(record: SNSEvent["Records"][number]): SesFeedbackMessage | undefined {
  try {
    return JSON.parse(record.Sns.Message) as SesFeedbackMessage;
  } catch (error) {
    console.warn("Ignoring malformed SES feedback message", error);
    return undefined;
  }
}

function feedbackEmails(message: SesFeedbackMessage): string[] {
  const type = message.notificationType?.toLowerCase();
  const recipients =
    type === "bounce"
      ? message.bounce?.bouncedRecipients?.map((recipient) => recipient.emailAddress)
      : type === "complaint"
        ? message.complaint?.complainedRecipients?.map((recipient) => recipient.emailAddress)
        : [];
  const explicitRecipients = recipients ?? [];
  const emails = explicitRecipients.length > 0 ? explicitRecipients : (message.mail?.destination ?? []);

  return emails
    .filter((email): email is string => typeof email === "string" && email.trim().length > 0)
    .map((email) => email.trim().toLowerCase());
}

function shouldBlockEmail(message: SesFeedbackMessage): boolean {
  const type = message.notificationType?.toLowerCase();
  if (type === "complaint") return true;
  if (type !== "bounce") return false;

  return message.bounce?.bounceType?.toLowerCase() !== "transient";
}

async function markUserEmailBlocked(email: string): Promise<void> {
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

  const user = result.Items?.[0] as { user_id?: string } | undefined;
  if (!user?.user_id) return;

  await dynamodb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${user.user_id}`, SK: "PROFILE" },
      UpdateExpression: "SET email_blocked = :blocked",
      ExpressionAttributeValues: {
        ":blocked": true,
      },
    }),
  );
}

export const handler = async (event: SNSEvent): Promise<void> => {
  for (const record of event.Records) {
    const message = parseMessage(record);
    if (!message) continue;

    if (!shouldBlockEmail(message)) continue;

    const emails = Array.from(new Set(feedbackEmails(message)));
    await Promise.all(emails.map(markUserEmailBlocked));
  }
};
