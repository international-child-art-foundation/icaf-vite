import {
  ApiGatewayEvent,
  COMMON_HEADERS,
  CommonErrors,
  HTTP_STATUS,
  isValidEmail,
} from "@icaf/shared";
import { parseJsonBody } from "../../utils/request";
import { sendContactNotificationEmail } from "../../utils/emails/contactNotification";
import type { ContactNotificationKind } from "../../utils/emails/contactNotification";

type ContactRequest = {
  type?: unknown;
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  organization?: unknown;
  expertise?: unknown;
  contribution?: unknown;
  motivation?: unknown;
  age_13_or_older?: unknown;
  website?: unknown;
};

const CONTACT_TYPES = new Set<ContactNotificationKind>([
  "contact-us",
  "volunteer",
  "professionals",
  "subscribe",
]);

const MAX_LENGTHS = {
  name: 100,
  email: 254,
  subject: 200,
  message: 5000,
  organization: 500,
  expertise: 1000,
  contribution: 1000,
  motivation: 1500,
} as const;

function readString(value: unknown, maxLength: number): string {
  return typeof value === "string"
    ? value.normalize("NFC").trim().slice(0, maxLength)
    : "";
}

function isContactType(value: string): value is ContactNotificationKind {
  return CONTACT_TYPES.has(value as ContactNotificationKind);
}

export const handler = async (event: ApiGatewayEvent) => {
  try {
    const parsedBody = parseJsonBody<ContactRequest>(event);
    if (!parsedBody.ok) return parsedBody.response;

    const honeypot = readString(parsedBody.value.website, 200);
    if (honeypot) {
      return {
        statusCode: HTTP_STATUS.OK,
        body: JSON.stringify({ success: true }),
        headers: COMMON_HEADERS,
      };
    }

    const type = readString(parsedBody.value.type, 40);
    if (!isContactType(type)) {
      return CommonErrors.badRequest("Invalid contact form type");
    }

    const name = readString(parsedBody.value.name, MAX_LENGTHS.name);
    const email = readString(parsedBody.value.email, MAX_LENGTHS.email);
    const subject = readString(parsedBody.value.subject, MAX_LENGTHS.subject);
    const message = readString(parsedBody.value.message, MAX_LENGTHS.message);
    const organization = readString(parsedBody.value.organization, MAX_LENGTHS.organization);
    const expertise = readString(parsedBody.value.expertise, MAX_LENGTHS.expertise);
    const contribution = readString(parsedBody.value.contribution, MAX_LENGTHS.contribution);
    const motivation = readString(parsedBody.value.motivation, MAX_LENGTHS.motivation);
    const age13OrOlder = parsedBody.value.age_13_or_older === true;

    if (!email || !isValidEmail(email)) {
      return CommonErrors.badRequest("A valid email address is required");
    }

    if (type === "subscribe") {
      if (!age13OrOlder) {
        return CommonErrors.badRequest("Newsletter signup requires age confirmation");
      }
    } else if (!name || !message) {
      return CommonErrors.badRequest("Name and message are required");
    }

    const fields = [
      { label: "Form", value: type },
      { label: "Name", value: name },
      { label: "Email", value: email },
      { label: "Subject", value: subject },
      { label: "Organization", value: organization },
      { label: "Area of expertise", value: expertise },
      { label: "Contribution", value: contribution },
      { label: "Motivation", value: motivation },
      { label: "Age 13 or older", value: type === "subscribe" ? String(age13OrOlder) : "" },
    ];

    const messageId = await sendContactNotificationEmail({
      kind: type,
      name,
      email,
      subject,
      message,
      fields,
    });

    console.info("Contact notification email sent", {
      type,
      ses_message_id: messageId,
    });

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ success: true }),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error sending contact notification:", error);
    return CommonErrors.internalServerError();
  }
};
