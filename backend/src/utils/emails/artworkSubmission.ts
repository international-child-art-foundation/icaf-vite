import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient, SES_FROM_EMAIL } from "../../config/aws-clients";
import { emailTags } from "./tags";
import { buildArtworkSubmissionEmail } from "./templates/artworkSubmission";

/**
 * Sent automatically after a guest user submits artwork.
 * Offers optional account creation via a signed link.
 */
export async function sendArtworkSubmissionEmail(args: {
  toEmail: string;
  userId: string;
  verifyToken: string;
}): Promise<void> {
  const email = buildArtworkSubmissionEmail({
    userId: args.userId,
    verifyToken: args.verifyToken,
  });

  await sesClient.send(
    new SendEmailCommand({
      Source: SES_FROM_EMAIL,
      Destination: { ToAddresses: [args.toEmail] },
      Tags: emailTags("artwork_submission"),
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
