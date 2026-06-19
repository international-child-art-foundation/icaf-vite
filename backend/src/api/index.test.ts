import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.ALLOWED_ORIGINS = "https://staging.icaf.org,http://localhost:5173";
});

const authMocks = vi.hoisted(() => ({
  requireAuth: vi.fn(async () => ({
    user_id: "00000000-0000-4000-8000-000000000001",
    email: "user@example.com",
    role: "user",
    banned: false,
  })),
  requireRole: vi.fn(async () => ({
    user_id: "00000000-0000-4000-8000-000000000001",
    email: "admin@example.com",
    role: "admin",
    banned: false,
  })),
}));

vi.mock("../utils/auth", () => ({
  isApiGatewayResponse: (value: unknown) => Boolean(value && typeof value === "object" && "statusCode" in value),
  requireAuth: authMocks.requireAuth,
  getOptionalAuth: vi.fn(async () => null),
  requireRole: authMocks.requireRole,
}));

import { handler } from "./index";

function event(method: string, path: string, body?: string) {
  return {
    httpMethod: method,
    path,
    headers: {},
    ...(body !== undefined ? { body } : {}),
  };
}

function responseBody(response: Awaited<ReturnType<typeof handler>>) {
  return JSON.parse(response.body) as { code: string; message: string; allowed_methods?: string[] };
}

describe("api router", () => {
  beforeEach(() => {
    authMocks.requireRole.mockClear();
    authMocks.requireAuth.mockClear();
  });

  it("rejects empty internal path segments instead of collapsing them", async () => {
    const response = await handler(event("POST", "/api/user/groups//artworks", "{}"));

    expect(response.statusCode).toBe(400);
    expect(responseBody(response)).toMatchObject({
      code: "BAD_REQUEST",
      message: "Malformed path",
    });
    expect(authMocks.requireRole).not.toHaveBeenCalled();
    expect(authMocks.requireAuth).not.toHaveBeenCalled();
  });

  it("routes valid user group artwork submissions", async () => {
    const response = await handler(
      event("POST", "/api/user/groups/00000000-0000-4000-8000-000000000002/artworks", "{"),
    );

    expect(response.statusCode).toBe(400);
    expect(responseBody(response)).toMatchObject({
      code: "BAD_REQUEST",
      message: "Invalid JSON body",
    });
    expect(authMocks.requireAuth).toHaveBeenCalledOnce();
  });

  it("does not treat the literal artworks segment as a group id", async () => {
    const response = await handler(event("POST", "/api/user/groups/artworks", "{}"));

    expect(response.statusCode).toBe(400);
    expect(responseBody(response)).toMatchObject({
      code: "BAD_REQUEST",
      message: "Invalid group_id path parameter",
    });
    expect(authMocks.requireRole).not.toHaveBeenCalled();
    expect(authMocks.requireAuth).not.toHaveBeenCalled();
  });

  it("rejects invalid compound takedown request keys before auth", async () => {
    const response = await handler(event("PATCH", "/api/admin/takedowns/TS%231%23TDR_ID%23not-a-uuid", "{}"));

    expect(response.statusCode).toBe(400);
    expect(responseBody(response)).toMatchObject({
      code: "BAD_REQUEST",
      message: "Invalid tdr_sk path parameter",
    });
    expect(authMocks.requireRole).not.toHaveBeenCalled();
  });

  it("rejects invalid compound news keys before auth", async () => {
    const response = await handler(event("DELETE", "/api/admin/news/TS%231%23ID%23not-a-uuid"));

    expect(response.statusCode).toBe(400);
    expect(responseBody(response)).toMatchObject({
      code: "BAD_REQUEST",
      message: "Invalid news_sk path parameter",
    });
    expect(authMocks.requireRole).not.toHaveBeenCalled();
  });

  it("rejects invalid admin group ids before auth", async () => {
    const response = await handler(event("PATCH", "/api/admin/groups/not-a-uuid", "{}"));

    expect(response.statusCode).toBe(400);
    expect(responseBody(response)).toMatchObject({
      code: "BAD_REQUEST",
      message: "Invalid group_id path parameter",
    });
    expect(authMocks.requireRole).not.toHaveBeenCalled();
  });

  it("routes valid admin group updates", async () => {
    const response = await handler(
      event("PATCH", "/api/admin/groups/00000000-0000-4000-8000-000000000002", "{"),
    );

    expect(response.statusCode).toBe(400);
    expect(responseBody(response)).toMatchObject({
      code: "BAD_REQUEST",
      message: "Invalid JSON body",
    });
    expect(authMocks.requireRole).toHaveBeenCalledOnce();
  });

  it("rejects invalid theme keys before auth", async () => {
    const response = await handler(event("PATCH", "/api/contributor/themes/FAMILY%23bad%23INSTANCE%230001", "{}"));

    expect(response.statusCode).toBe(400);
    expect(responseBody(response)).toMatchObject({
      code: "BAD_REQUEST",
      message: "Invalid theme_sk path parameter",
    });
    expect(authMocks.requireRole).not.toHaveBeenCalled();
  });

  it("rejects invalid magazine slugs before auth", async () => {
    const response = await handler(event("DELETE", "/api/admin/magazines/bad%20slug"));

    expect(response.statusCode).toBe(400);
    expect(responseBody(response)).toMatchObject({
      code: "BAD_REQUEST",
      message: "Invalid slug path parameter",
    });
    expect(authMocks.requireRole).not.toHaveBeenCalled();
  });

  it("preserves method-not-allowed for valid paths with unsupported methods", async () => {
    const response = await handler(
      event("GET", "/api/user/groups/00000000-0000-4000-8000-000000000002/artworks"),
    );

    expect(response.statusCode).toBe(405);
    expect(response.headers.Allow).toBe("POST");
    expect(responseBody(response)).toMatchObject({
      code: "METHOD_NOT_ALLOWED",
      allowed_methods: ["POST"],
    });
    expect(authMocks.requireRole).not.toHaveBeenCalled();
    expect(authMocks.requireAuth).not.toHaveBeenCalled();
  });

  it("allows the staging frontend origin with credentials", async () => {
    const response = await handler({
      ...event("OPTIONS", "/api/auth/login"),
      headers: { Origin: "https://staging.icaf.org" },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers["Access-Control-Allow-Origin"]).toBe("https://staging.icaf.org");
    expect(response.headers["Access-Control-Allow-Credentials"]).toBe("true");
  });

  it("omits CORS allow headers for a disallowed origin", async () => {
    const response = await handler({
      ...event("OPTIONS", "/api/auth/login"),
      headers: { Origin: "https://attacker.example" },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers["Access-Control-Allow-Origin"]).toBeUndefined();
    expect(response.headers["Access-Control-Allow-Credentials"]).toBeUndefined();
    expect(response.headers.Vary).toBe("Origin");
  });
});
