import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  dynamoSend: vi.fn(async () => ({})),
  sendTakedownNotificationEmail: vi.fn(async () => "message-1"),
}));

vi.mock("../../config/aws-clients", () => ({
  dynamodb: { send: mocks.dynamoSend },
  TABLE_NAME: "test-table",
}));

vi.mock("../../utils/emails/takedownNotification", () => ({
  sendTakedownNotificationEmail: mocks.sendTakedownNotificationEmail,
}));

import { handler } from "./initiateTakedown";

function event(body: unknown) {
  return {
    httpMethod: "POST",
    path: "/api/takedown",
    headers: {},
    body: JSON.stringify(body),
  };
}

const validRequest = {
  art_id: "00000000-0000-4000-8000-000000000002",
  requester_email: "requester@example.com",
  requester_name: "Requester",
  reason: "This artwork should be reviewed.",
};

describe("initiateTakedown", () => {
  beforeEach(() => {
    mocks.dynamoSend.mockClear();
    mocks.sendTakedownNotificationEmail.mockClear();
    mocks.sendTakedownNotificationEmail.mockResolvedValue("message-1");
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-12T12:00:00.000Z"));
  });

  it("stores the request and sends a notification email", async () => {
    const response = await handler(event(validRequest));
    const body = JSON.parse(response.body) as { success: boolean; scheduled_execution_at: number };

    expect(response.statusCode).toBe(201);
    expect(body).toMatchObject({
      success: true,
      scheduled_execution_at: 1781697600,
    });
    expect(mocks.dynamoSend).toHaveBeenCalledOnce();
    expect(mocks.sendTakedownNotificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        submittedAt: 1781265600,
        scheduledExecutionAt: 1781697600,
        requesterEmail: "requester@example.com",
        requesterName: "Requester",
        reason: "This artwork should be reviewed.",
        artId: "00000000-0000-4000-8000-000000000002",
      }),
    );
  });

  it("still returns created when notification email fails", async () => {
    mocks.sendTakedownNotificationEmail.mockRejectedValueOnce(new Error("SES unavailable"));

    const response = await handler(event(validRequest));

    expect(response.statusCode).toBe(201);
    expect(mocks.dynamoSend).toHaveBeenCalledOnce();
    expect(mocks.sendTakedownNotificationEmail).toHaveBeenCalledOnce();
  });
});
