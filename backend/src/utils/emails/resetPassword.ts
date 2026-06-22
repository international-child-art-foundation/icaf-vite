import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient, SES_CONFIGURATION_SET, SES_FROM_EMAIL } from "../../config/aws-clients";
import { emailTags } from "./tags";
import {
  buildActivateAccountFromForgotPasswordEmail,
  buildResetPasswordEmail,
} from "./templates/resetPassword";

export async function sendResetPasswordEmail(args: {
  toEmail: string;
  userId: string;
  authActionToken: string;
}): Promise<string | undefined> {
  const email = buildResetPasswordEmail({
    userId: args.userId,
    authActionToken: args.authActionToken,
  });

  const result = await sesClient.send(
    new SendEmailCommand({
      Source: SES_FROM_EMAIL,
      ...(SES_CONFIGURATION_SET ? { ConfigurationSetName: SES_CONFIGURATION_SET } : {}),
      Destination: { ToAddresses: [args.toEmail] },
      Tags: emailTags("reset_password"),
      Message: {
        Subject: { Data: email.subject },
        Body: {
          Text: { Data: email.text },
          Html: { Data: email.html },
        },
      },
    }),
  );

  return result.MessageId;
}

export async function sendActivateAccountFromForgotPasswordEmail(args: {
  toEmail: string;
  userId: string;
  authActionToken: string;
}): Promise<string | undefined> {
  const email = buildActivateAccountFromForgotPasswordEmail({
    userId: args.userId,
    authActionToken: args.authActionToken,
  });

  const result = await sesClient.send(
    new SendEmailCommand({
      Source: SES_FROM_EMAIL,
      ...(SES_CONFIGURATION_SET ? { ConfigurationSetName: SES_CONFIGURATION_SET } : {}),
      Destination: { ToAddresses: [args.toEmail] },
      Tags: emailTags("activate_account_from_forgot_password"),
      Message: {
        Subject: { Data: email.subject },
        Body: {
          Text: { Data: email.text },
          Html: { Data: email.html },
        },
      },
    }),
  );

  return result.MessageId;
}
