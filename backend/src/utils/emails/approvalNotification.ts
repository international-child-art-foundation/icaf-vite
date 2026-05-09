import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient, SES_FROM_EMAIL, APP_URL } from "../../config/aws-clients";

/**
 * Sent to the submitter when their artwork or group submission is approved.
 * For group submissions: one email per group approval (not per constituent artwork).
 * TODO: The gallery URL format should be updated when the frontend routes are finalized.
 */
export async function sendApprovalEmail(args: {
  toEmail: string;
  type: "art" | "group";
  id: string;
  title?: string;
}): Promise<void> {
  const isGroup = args.type === "group";
  const label = isGroup ? "group submission" : "artwork";
  const galleryUrl = isGroup
    ? `${APP_URL}/gallery/group/${encodeURIComponent(args.id)}`
    : `${APP_URL}/gallery/artwork/${encodeURIComponent(args.id)}`;

  const titleLine = args.title ? `"${args.title}"` : `Your ${label}`;

  await sesClient.send(
    new SendEmailCommand({
      Source: SES_FROM_EMAIL,
      Destination: { ToAddresses: [args.toEmail] },
      Message: {
        Subject: { Data: `${titleLine} has been approved!` },
        Body: {
          Text: {
            Data: [
              `Great news! ${titleLine} has been reviewed and approved by the ICAF team.`,
              "",
              `It is now visible in the ICAF gallery:`,
              "",
              galleryUrl,
              "",
              "Thank you for your contribution to ICAF!",
            ].join("\n"),
          },
        },
      },
    }),
  );
}
