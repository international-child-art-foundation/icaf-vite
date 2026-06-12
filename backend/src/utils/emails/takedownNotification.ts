import { SendEmailCommand } from "@aws-sdk/client-ses";
import {
  sesClient,
  SES_CONFIGURATION_SET,
  SES_FROM_EMAIL,
  TAKEDOWN_NOTIFICATION_EMAILS,
} from "../../config/aws-clients";
import { emailTags } from "./tags";
import { buildTakedownNotificationEmail } from "./templates/takedownNotification";

export async function sendTakedownNotificationEmail(args: {
  tdrId: string;
  submittedAt: number;
  scheduledExecutionAt: number;
  requesterEmail: string;
  requesterName: string;
  reason: string;
  artId?: string;
  groupId?: string;
}): Promise<string | undefined> {
  if (TAKEDOWN_NOTIFICATION_EMAILS.length === 0) {
    console.warn("Skipping takedown notification email: no recipients configured");
    return undefined;
  }

  const email = buildTakedownNotificationEmail(args);
  const result = await sesClient.send(
    new SendEmailCommand({
      Source: SES_FROM_EMAIL,
      ...(SES_CONFIGURATION_SET ? { ConfigurationSetName: SES_CONFIGURATION_SET } : {}),
      Destination: { ToAddresses: TAKEDOWN_NOTIFICATION_EMAILS },
      ReplyToAddresses: [args.requesterEmail],
      Tags: emailTags("takedown_request"),
      Message: {
        Subject: { Data: email.subject },
        Body: {
          Text: {
            Data: email.text,
          },
          Html: {
            Data: email.html,
          },
        },
      },
    }),
  );

  return result.MessageId;
}
