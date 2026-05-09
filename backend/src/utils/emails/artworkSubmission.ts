import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient, SES_FROM_EMAIL, APP_URL } from "../../config/aws-clients";

/**
 * Sent automatically after a guest user submits artwork.
 * Offers optional account creation via a signed link.
 */
export async function sendArtworkSubmissionEmail(args: {
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
        Subject: { Data: "Thanks for your artwork submission to ICAF!" },
        Body: {
          Text: {
            Data: [
              "The International Child Art Foundation is delighted to receive your artwork submission. After a short approval process, your artwork will be displayed in our gallery.",
              "",
              "If you would like to create an ICAF account to view and manage your artwork submissions under this email address, click the link below:",
              "",
              link,
              "",
              "Account creation is totally optional and can be completed at any time. This link expires in 7 days, but you can always visit our sign-up page and enter your email address to receive a new link.",
              "",
              "Thank you for participating in ICAF!",
            ].join("\n"),
          },
        },
      },
    }),
  );
}
