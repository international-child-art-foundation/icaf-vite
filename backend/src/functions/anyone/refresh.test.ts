import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cognitoSend: vi.fn(),
}));

vi.mock("../../config/aws-clients", () => ({
  cognitoClient: { send: mocks.cognitoSend },
  USER_POOL_CLIENT_ID: "test-client-id",
}));

import { handler } from "./refresh";

describe("refresh", () => {
  beforeEach(() => {
    mocks.cognitoSend.mockReset();
  });

  it("exchanges a refresh token for new one-hour session cookies", async () => {
    mocks.cognitoSend.mockResolvedValue({
      AuthenticationResult: {
        AccessToken: "new-access-token",
        IdToken: "new-id-token",
      },
    });

    const response = await handler({
      httpMethod: "POST",
      headers: { Cookie: "refreshToken=valid-refresh-token" },
    });

    expect(response.statusCode).toBe(200);
    expect(mocks.cognitoSend).toHaveBeenCalledOnce();
    expect(mocks.cognitoSend.mock.calls[0][0].input).toMatchObject({
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: "test-client-id",
      AuthParameters: { REFRESH_TOKEN: "valid-refresh-token" },
    });
    expect(response.multiValueHeaders?.["Set-Cookie"]).toEqual([
      expect.stringContaining("accessToken=new-access-token"),
      expect.stringContaining("idToken=new-id-token"),
    ]);
  });

  it("clears auth cookies when Cognito rejects the refresh token", async () => {
    mocks.cognitoSend.mockRejectedValue({ name: "NotAuthorizedException" });

    const response = await handler({
      httpMethod: "POST",
      headers: { cookie: "refreshToken=revoked-refresh-token" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.multiValueHeaders?.["Set-Cookie"]).toEqual([
      expect.stringContaining("accessToken=;"),
      expect.stringContaining("idToken=;"),
      expect.stringContaining("refreshToken=;"),
    ]);
  });

  it("clears stale auth cookies when no refresh token is present", async () => {
    const response = await handler({
      httpMethod: "POST",
      headers: { Cookie: "accessToken=expired" },
    });

    expect(response.statusCode).toBe(401);
    expect(mocks.cognitoSend).not.toHaveBeenCalled();
    expect(response.multiValueHeaders?.["Set-Cookie"]).toHaveLength(3);
  });
});
