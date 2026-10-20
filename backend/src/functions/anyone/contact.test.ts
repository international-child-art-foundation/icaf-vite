import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sendContactNotificationEmail: vi.fn(async () => "message-1"),
}));

vi.mock("../../utils/emails/contactNotification", () => ({
  sendContactNotificationEmail: mocks.sendContactNotificationEmail,
}));

import { handler } from "./contact";

function event(body: unknown) {
  return {
    httpMethod: "POST",
    path: "/api/contact",
    headers: {},
    body: JSON.stringify(body),
  };
}

const artLoversRequest = {
  type: "art-lovers",
  name: "A donor",
  email: "donor@example.com",
  honoreeName: "An art lover",
  recipientEmail: "recipient@example.com",
  occasion: "Birthday",
  message: "Happy birthday!",
};

const memorialRequest = {
  type: "in-loving-memory",
  email: "donor@example.com",
  honoreeName: "Someone special",
  recipientEmail: "family@example.com",
  relationship: "Daughter",
  message: "Remembering a wonderful person.",
};

describe("contact tribute requests", () => {
  beforeEach(() => {
    mocks.sendContactNotificationEmail.mockReset();
    mocks.sendContactNotificationEmail.mockResolvedValue("message-1");
  });

  it("passes the art lover, occasion and personal message to the staff notification", async () => {
    const response = await handler(event(artLoversRequest));

    expect(response.statusCode).toBe(200);
    expect(mocks.sendContactNotificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "art-lovers",
        name: artLoversRequest.name,
        email: artLoversRequest.email,
        subject: artLoversRequest.honoreeName,
        message: artLoversRequest.message,
        fields: expect.arrayContaining([
          { label: "Art Lover", value: artLoversRequest.honoreeName },
          { label: "Art Lover’s email", value: artLoversRequest.recipientEmail },
          { label: "On the occasion of", value: artLoversRequest.occasion },
        ]),
      }),
    );
  });

  it("accepts the legacy memorial fields without requiring a sender name", async () => {
    const response = await handler(event(memorialRequest));

    expect(response.statusCode).toBe(200);
    expect(mocks.sendContactNotificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "in-loving-memory",
        email: memorialRequest.email,
        subject: memorialRequest.honoreeName,
        message: memorialRequest.message,
        fields: expect.arrayContaining([
          { label: "In loving memory of", value: memorialRequest.honoreeName },
          { label: "Family member’s email", value: memorialRequest.recipientEmail },
          { label: "Relationship of family member to the deceased", value: memorialRequest.relationship },
        ]),
      }),
    );
  });

  it.each([
    [artLoversRequest, "name"],
    [artLoversRequest, "occasion"],
    [artLoversRequest, "honoreeName"],
    [artLoversRequest, "message"],
    [memorialRequest, "relationship"],
    [memorialRequest, "honoreeName"],
    [memorialRequest, "message"],
  ])("rejects a missing required %s field: %s", async (request, field) => {
    const response = await handler(event({ ...request, [field]: "   " }));

    expect(response.statusCode).toBe(400);
    expect(mocks.sendContactNotificationEmail).not.toHaveBeenCalled();
  });

  it.each([artLoversRequest, memorialRequest])(
    "rejects invalid sender and recipient emails for $type",
    async (request) => {
      for (const field of ["email", "recipientEmail"]) {
        const response = await handler(event({ ...request, [field]: "invalid" }));
        expect(response.statusCode).toBe(400);
      }
      expect(mocks.sendContactNotificationEmail).not.toHaveBeenCalled();
    },
  );

  it("keeps honeypot submissions from sending mail", async () => {
    const response = await handler(event({ ...artLoversRequest, website: "spam" }));

    expect(response.statusCode).toBe(200);
    expect(mocks.sendContactNotificationEmail).not.toHaveBeenCalled();
  });

  it("returns an error when sending fails so the visitor can retry", async () => {
    mocks.sendContactNotificationEmail.mockRejectedValueOnce(new Error("SES unavailable"));

    const response = await handler(event(memorialRequest));

    expect(response.statusCode).toBe(500);
  });

  it("still requires a sender name on ordinary contact messages", async () => {
    const response = await handler(event({
      type: "contact-us",
      email: "donor@example.com",
      message: "A question",
    }));

    expect(response.statusCode).toBe(400);
    expect(mocks.sendContactNotificationEmail).not.toHaveBeenCalled();
  });
});
