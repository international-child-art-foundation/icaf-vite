import type { MessageTag } from "@aws-sdk/client-ses";

const GLOBAL_EMAIL_TAGS: MessageTag[] = [
  { Name: "app", Value: "icaf" },
];

export function emailTags(emailType: string): MessageTag[] {
  return [
    ...GLOBAL_EMAIL_TAGS,
    { Name: "email_type", Value: emailType },
  ];
}
