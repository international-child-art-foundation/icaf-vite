import { APP_URL } from "../../../config/aws-clients";
import {
  htmlParagraphs,
  renderButton,
  renderEmailDocument,
  renderInfoBox,
  textParagraphs,
} from "../templateUtils";

export function buildTakedownNotificationEmail(args: {
  tdrId: string;
  submittedAt: number;
  scheduledExecutionAt: number;
  requesterEmail: string;
  requesterName: string;
  reason: string;
  artId?: string;
  groupId?: string;
}): { subject: string; text: string; html: string } {
  const adminUrl = `${APP_URL}/my-icaf?tab=admin`;
  const submittedAt = new Date(args.submittedAt * 1000).toISOString();
  const scheduledExecutionAt = new Date(args.scheduledExecutionAt * 1000).toISOString();
  const targetLines = [
    args.artId ? `Artwork ID: ${args.artId}` : undefined,
    args.groupId ? `Group ID: ${args.groupId}` : undefined,
  ];

  const subject = "New ICAF takedown request submitted";
  const text = textParagraphs([
    "A new takedown request was submitted through the ICAF website.",
    `Takedown request ID: ${args.tdrId}`,
    `Submitted at: ${submittedAt}`,
    `Scheduled execution at: ${scheduledExecutionAt}`,
    `Requester: ${args.requesterName} <${args.requesterEmail}>`,
    targetLines.filter(Boolean).join("\n"),
    "Reason:",
    args.reason,
    `Review requests in My ICAF: ${adminUrl}`,
  ]);

  const html = renderEmailDocument({
    preheader: "A new takedown request needs admin review.",
    title: subject,
    headline: "New takedown request",
    bodyHtml: [
      htmlParagraphs(["A new takedown request was submitted through the ICAF website."]),
      renderButton("Open My ICAF", adminUrl),
      renderInfoBox("Request details", [
        `Takedown request ID: ${args.tdrId}`,
        `Submitted at: ${submittedAt}`,
        `Scheduled execution at: ${scheduledExecutionAt}`,
      ]),
      renderInfoBox("Requester", [
        `Name: ${args.requesterName}`,
        `Email: ${args.requesterEmail}`,
      ]),
      renderInfoBox("Target", targetLines.filter((line): line is string => Boolean(line))),
      htmlParagraphs(["Reason:", args.reason]),
    ].join(""),
  });

  return {
    subject,
    text,
    html,
  };
}
