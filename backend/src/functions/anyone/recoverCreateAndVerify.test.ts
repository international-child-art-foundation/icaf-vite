import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  dynamoSend: vi.fn(),
  sendCreateAndVerifyEmail: vi.fn(),
}));

vi.mock("../../config/aws-clients", () => ({
  dynamodb: { send: mocks.dynamoSend },
  TABLE_NAME: "test-table",
}));

vi.mock("../../utils/emails/createAndVerify", () => ({
  sendCreateAndVerifyEmail: mocks.sendCreateAndVerifyEmail,
}));

import { handler } from "./recoverCreateAndVerify";

const userId = "00000000-0000-4000-8000-000000000001";
const event = {
  httpMethod: "POST",
  body: JSON.stringify({
    user_id: userId,
    auth_action_token: "expired-token",
  }),
};

describe("recoverCreateAndVerify", () => {
  beforeEach(() => {
    mocks.dynamoSend.mockReset();
    mocks.sendCreateAndVerifyEmail.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-20T12:00:00.000Z"));
  });

  it("rotates an expired token for 30 days and sends the existing setup email", async () => {
    mocks.dynamoSend
      .mockResolvedValueOnce({
        Item: {
          user_id: userId,
          email: "artist@example.com",
          auth_action_token: "expired-token",
          auth_action_token_exp: 1,
        },
      })
      .mockResolvedValueOnce({});
    mocks.sendCreateAndVerifyEmail.mockResolvedValue(undefined);

    const response = await handler(event);
    const updateCommand = mocks.dynamoSend.mock.calls[1][0];

    expect(response.statusCode).toBe(200);
    expect(updateCommand.input.ExpressionAttributeValues[":exp"]).toBe(
      Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    );
    expect(mocks.sendCreateAndVerifyEmail).toHaveBeenCalledWith({
      toEmail: "artist@example.com",
      userId,
      authActionToken: expect.any(String),
    });
  });

  it("rejects a token that has not expired", async () => {
    mocks.dynamoSend.mockResolvedValueOnce({
      Item: {
        user_id: userId,
        email: "artist@example.com",
        auth_action_token: "expired-token",
        auth_action_token_exp: Math.floor(Date.now() / 1000) + 1,
      },
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(mocks.sendCreateAndVerifyEmail).not.toHaveBeenCalled();
  });
});
