import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ dynamoSend: vi.fn() }));

vi.mock("../../config/aws-clients", () => ({
  dynamodb: { send: mocks.dynamoSend },
  TABLE_NAME: "test-table",
}));

import { handler } from "./getCreateAndVerifyStatus";

const userId = "00000000-0000-4000-8000-000000000001";
const event = {
  httpMethod: "GET",
  queryStringParameters: {
    user_id: userId,
    auth_action_token: "invite-token",
  },
};

describe("getCreateAndVerifyStatus", () => {
  beforeEach(() => {
    mocks.dynamoSend.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-20T12:00:00.000Z"));
  });

  it("reports an expired matching token", async () => {
    mocks.dynamoSend.mockResolvedValue({
      Item: {
        user_id: userId,
        auth_action_token: "invite-token",
        auth_action_token_exp: 1,
      },
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ status: "expired" });
  });

  it("does not report expiration for a mismatched token", async () => {
    mocks.dynamoSend.mockResolvedValue({
      Item: {
        user_id: userId,
        auth_action_token: "different-token",
        auth_action_token_exp: 1,
      },
    });

    const response = await handler(event);

    expect(JSON.parse(response.body)).toEqual({ status: "invalid" });
  });
});
