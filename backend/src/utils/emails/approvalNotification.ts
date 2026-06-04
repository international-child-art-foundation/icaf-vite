import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient, SES_CONFIGURATION_SET, SES_FROM_EMAIL } from "../../config/aws-clients";
import { emailTags } from "./tags";
import { buildApprovalEmail } from "./templates/approvalNotification";

/**
 * Sent to the submitter when their artwork or group submission is approved.
 * For group submissions: one email per group approval (not per constituent artwork).
 * TODO: The gallery URL format should be updated when the frontend routes are finalized.
 */
export async function sendApprovalEmail(args: {
  toEmail: string;
  userId: string;
  unsubscribeToken: string;
  type: "art" | "group";
  id: string;
  title?: string;
}): Promise<void> {
  const email = buildApprovalEmail(args);

  await sesClient.send(
    new SendEmailCommand({
      Source: SES_FROM_EMAIL,
      ...(SES_CONFIGURATION_SET ? { ConfigurationSetName: SES_CONFIGURATION_SET } : {}),
      Destination: { ToAddresses: [args.toEmail] },
      Tags: emailTags(`approval_${args.type}`),
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
}
