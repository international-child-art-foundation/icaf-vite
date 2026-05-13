import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient, SES_FROM_EMAIL, APP_URL } from "../../config/aws-clients";

/**
 * Sent when an existing app-side user requests a login account.
 * The link lets them set a password and verify ownership of the email address.
 */
export async function sendCreateAndVerifyEmail(args: {
  toEmail: string;
  userId: string;
  verifyToken: string;
}): Promise<void> {
  const link = `${APP_URL}/create-account?id=${encodeURIComponent(args.userId)}&token=${encodeURIComponent(args.verifyToken)}`;

  await sesClient.send(
    new SendEmailCommand({
      Source: SES_FROM_EMAIL,
      Destination: { ToAddresses: [args.toEmail] },
      Message: {
        Subject: { Data: "Create your ICAF account" },
        Body: {
          Text: {
            Data: [
              "You requested to create an ICAF account associated with this email address.",
              "",
              "Click the link below to set your password and complete account creation:",
              "",
              link,
              "",
              "This link expires in 7 days. If you did not request this, you can safely ignore this email.",
              "",
              "The International Child Art Foundation",
            ].join("\n"),
          },
        },
      },
    }),
  );
}
