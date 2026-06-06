import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient, SES_CONFIGURATION_SET, SES_FROM_EMAIL } from "../../config/aws-clients";
import { emailTags } from "./tags";
import { buildRegistrationVerificationEmail } from "./templates/registrationVerification";

/**
 * Sent after direct registration. The app verifies the token, then marks both
 * Cognito and the DynamoDB user as verified.
 */
export async function sendRegistrationVerificationEmail(args: {
  toEmail: string;
  userId: string;
  authActionToken: string;
}): Promise<void> {
  const email = buildRegistrationVerificationEmail({
    userId: args.userId,
    authActionToken: args.authActionToken,
  });

  await sesClient.send(
    new SendEmailCommand({
      Source: SES_FROM_EMAIL,
      ...(SES_CONFIGURATION_SET ? { ConfigurationSetName: SES_CONFIGURATION_SET } : {}),
      Destination: { ToAddresses: [args.toEmail] },
      Tags: emailTags("registration_verification"),
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
