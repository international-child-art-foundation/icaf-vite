import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient, SES_FROM_EMAIL, APP_URL } from "../../config/aws-clients";
import { emailTags } from "./tags";

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
  const isGroup = args.type === "group";
  const label = isGroup ? "group submission" : "artwork";
  const galleryUrl = isGroup
    ? `${APP_URL}/gallery/group/${encodeURIComponent(args.id)}`
    : `${APP_URL}/gallery/artwork/${encodeURIComponent(args.id)}`;

  const titleLine = args.title ? `"${args.title}"` : `Your ${label}`;
  const unsubscribeUrl = `${APP_URL}/unsubscribe/artwork?u=${encodeURIComponent(args.userId)}&t=${encodeURIComponent(args.unsubscribeToken)}`;
  const escapedTitleLine = escapeHtml(titleLine);
  const escapedGalleryUrl = escapeHtml(galleryUrl);
  const escapedUnsubscribeUrl = escapeHtml(unsubscribeUrl);

  await sesClient.send(
    new SendEmailCommand({
      Source: SES_FROM_EMAIL,
      Destination: { ToAddresses: [args.toEmail] },
      Tags: emailTags(`approval_${args.type}`),
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
              "",
              "To stop receiving artwork and group notification emails from ICAF, use this link:",
              unsubscribeUrl,
            ].join("\n"),
          },
          Html: {
            Data: [
              "<!doctype html>",
              "<html>",
              "<body style=\"font-family:Arial,sans-serif;line-height:1.5;color:#202020;\">",
              `<p>Great news! ${escapedTitleLine} has been reviewed and approved by the ICAF team.</p>`,
              `<p>It is now visible in the ICAF gallery:</p>`,
              `<p><a href="${escapedGalleryUrl}">${escapedGalleryUrl}</a></p>`,
              "<p>Thank you for your contribution to ICAF!</p>",
              `<p><a href="${escapedUnsubscribeUrl}" style="display:inline-block;padding:10px 14px;background:#202020;color:#ffffff;text-decoration:none;border-radius:4px;">Unsubscribe from artwork emails</a></p>`,
              `<p style="font-size:12px;color:#666666;">This stops artwork and group notification emails for this ICAF account.</p>`,
              "</body>",
              "</html>",
            ].join(""),
          },
        },
      },
    }),
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
