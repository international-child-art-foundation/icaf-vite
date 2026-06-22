import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient, SES_CONFIGURATION_SET, SES_FROM_EMAIL } from "../../config/aws-clients";
import { emailTags } from "./tags";
import { buildCreateAndVerifyEmail } from "./templates/createAndVerify";

/**
 * Sent when an existing app-side user requests a login account.
 * The link lets them set a password and verify ownership of the email address.
 */
export async function sendCreateAndVerifyEmail(args: {
  toEmail: string;
  userId: string;
  authActionToken: string;
}): Promise<void> {
  const email = buildCreateAndVerifyEmail({
    userId: args.userId,
    authActionToken: args.authActionToken,
  });

  await sesClient.send(
    new SendEmailCommand({
      Source: SES_FROM_EMAIL,
      ...(SES_CONFIGURATION_SET ? { ConfigurationSetName: SES_CONFIGURATION_SET } : {}),
      Destination: { ToAddresses: [args.toEmail] },
      Tags: emailTags("create_and_verify"),
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
