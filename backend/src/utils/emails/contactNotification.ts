import { SendEmailCommand } from "@aws-sdk/client-ses";
import {
  CONTACT_NOTIFICATION_EMAILS,
  SES_CONFIGURATION_SET,
  SES_FROM_EMAIL,
  sesClient,
} from "../../config/aws-clients";
import { emailTags } from "./tags";
import {
  htmlParagraphs,
  renderEmailDocument,
  renderInfoBox,
  textParagraphs,
} from "./templateUtils";

export type ContactNotificationKind =
  | "contact-us"
  | "volunteer"
  | "professionals"
  | "subscribe";

export type ContactNotificationField = {
  label: string;
  value: string;
};

const kindLabels: Record<ContactNotificationKind, string> = {
  "contact-us": "Contact Us",
  volunteer: "Volunteer",
  professionals: "Professionals & Partners",
  subscribe: "Newsletter Signup",
};

export async function sendContactNotificationEmail(args: {
  kind: ContactNotificationKind;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  fields: ContactNotificationField[];
}): Promise<string | undefined> {
  if (CONTACT_NOTIFICATION_EMAILS.length === 0) {
    console.warn("Skipping contact notification email: no recipients configured");
    return undefined;
  }

  const label = kindLabels[args.kind];
  const sender = args.email
    ? `${args.name || "Website visitor"} <${args.email}>`
    : args.name || "Website visitor";
  const subject = args.subject?.trim()
    ? `[ICAF Website] ${label}: ${args.subject.trim()}`
    : `[ICAF Website] ${label}`;

  const fieldLines = args.fields
    .filter((field) => field.value.trim().length > 0)
    .map((field) => `${field.label}: ${field.value}`);
  const text = textParagraphs([
    `A ${label.toLowerCase()} form was submitted on icaf.org.`,
    `Sender: ${sender}`,
    args.message ? `Message:\n${args.message}` : undefined,
    fieldLines.length > 0 ? `Details:\n${fieldLines.join("\n")}` : undefined,
  ]);

  const html = renderEmailDocument({
    preheader: `New ${label} form submission from icaf.org.`,
    title: subject,
    headline: `New ${label} submission`,
    bodyHtml: [
      htmlParagraphs([`A ${label.toLowerCase()} form was submitted on icaf.org.`]),
      renderInfoBox("Sender", [
        `Name: ${args.name || "(not provided)"}`,
        `Email: ${args.email || "(not provided)"}`,
      ]),
      args.message
        ? renderInfoBox("Message", args.message.split("\n"))
        : "",
      renderInfoBox("Details", fieldLines),
    ].join(""),
  });

  const result = await sesClient.send(
    new SendEmailCommand({
      Source: SES_FROM_EMAIL,
      ...(SES_CONFIGURATION_SET ? { ConfigurationSetName: SES_CONFIGURATION_SET } : {}),
      Destination: { ToAddresses: CONTACT_NOTIFICATION_EMAILS },
      ...(args.email ? { ReplyToAddresses: [args.email] } : {}),
      Tags: emailTags(`contact_${args.kind.replace(/-/g, "_")}`),
      Message: {
        Subject: { Data: subject },
        Body: {
          Text: { Data: text },
          Html: { Data: html },
        },
      },
    }),
  );

  return result.MessageId;
}
