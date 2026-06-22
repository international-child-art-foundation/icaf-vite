import { afterEach, describe, expect, it, vi } from "vitest";
import worker, { buildTargetUrl, type Env } from "../src/index";

const stagingEnv: Env = {
  ENVIRONMENT: "staging",
  TARGET_API_ORIGIN: "https://staging-api.execute-api.us-east-1.amazonaws.com/v1",
};

const productionEnv: Env = {
  ENVIRONMENT: "production",
  TARGET_API_ORIGIN: "https://production-api.execute-api.us-east-1.amazonaws.com/v1",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockUpstream(response = new Response(null, { status: 204 })) {
  const fetchMock = vi.fn(async (..._args: unknown[]) => response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function firstProxiedRequest(fetchMock: ReturnType<typeof mockUpstream>): Request {
  const call = fetchMock.mock.calls[0];
  expect(call).toBeDefined();
  return call![0] as Request;
}

describe("ICAF API proxy Worker", () => {
  it.each([
    ["staging", "https://staging.icaf.org/api/health", stagingEnv, "https://staging-api.execute-api.us-east-1.amazonaws.com/v1/api/health"],
    ["production", "https://icaf.org/api/health", productionEnv, "https://production-api.execute-api.us-east-1.amazonaws.com/v1/api/health"],
  ])("proxies the %s host to its configured target", async (_name, requestUrl, env, targetUrl) => {
    const fetchMock = mockUpstream();

    expect((await worker.fetch(new Request(requestUrl), env)).status).toBe(204);
    expect(firstProxiedRequest(fetchMock).url).toBe(targetUrl);
  });

  it("preserves an API Gateway stage path and query string", () => {
    const target = buildTargetUrl(
      new URL("https://staging.icaf.org/api/health?check=deep&x=1"),
      stagingEnv.TARGET_API_ORIGIN,
    );

    expect(target.toString()).toBe(
      "https://staging-api.execute-api.us-east-1.amazonaws.com/v1/api/health?check=deep&x=1",
    );
  });

  it.each(["POST", "PUT", "PATCH"])("preserves the %s method and body", async (method) => {
    const fetchMock = mockUpstream();
    const body = JSON.stringify({ title: "test" });

    await worker.fetch(
      new Request("https://staging.icaf.org/api/items", {
        method,
        body,
        headers: { "Content-Type": "application/json" },
      }),
      stagingEnv,
    );

    const proxiedRequest = firstProxiedRequest(fetchMock);
    expect(proxiedRequest.method).toBe(method);
    expect(await proxiedRequest.text()).toBe(body);
  });

  it("forwards cookies and relevant request headers", async () => {
    const fetchMock = mockUpstream();

    await worker.fetch(
      new Request("https://staging.icaf.org/api/auth/status", {
        headers: {
          Authorization: "Bearer token",
          Cookie: "session=abc",
          "X-Request-Id": "request-1",
        },
      }),
      stagingEnv,
    );

    const headers = firstProxiedRequest(fetchMock).headers;
    expect(headers.get("Authorization")).toBe("Bearer token");
    expect(headers.get("Cookie")).toBe("session=abc");
    expect(headers.get("X-Request-Id")).toBe("request-1");
    expect(headers.get("X-Forwarded-Host")).toBe("staging.icaf.org");
    expect(headers.get("X-Forwarded-Proto")).toBe("https");
  });

  it("preserves Set-Cookie and disables response caching", async () => {
    mockUpstream(new Response("ok", {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Set-Cookie": "session=abc; HttpOnly; Secure; SameSite=Lax",
      },
    }));

    const response = await worker.fetch(
      new Request("https://staging.icaf.org/api/auth/login"),
      stagingEnv,
    );

    expect(response.headers.get("Set-Cookie")).toBe(
      "session=abc; HttpOnly; Secure; SameSite=Lax",
    );
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("rejects non-api paths without calling upstream", async () => {
    const fetchMock = mockUpstream();
    const response = await worker.fetch(
      new Request("https://staging.icaf.org/about"),
      stagingEnv,
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects the wrong hostname without calling upstream", async () => {
    const fetchMock = mockUpstream();
    const response = await worker.fetch(
      new Request("https://staging.icaf.org/api/health"),
      productionEnv,
    );

    expect(response.status).toBe(421);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("strips hop-by-hop request and response headers", async () => {
    const fetchMock = mockUpstream(new Response("ok", {
      headers: { Connection: "close", "X-Upstream": "value" },
    }));

    const response = await worker.fetch(
      new Request("https://staging.icaf.org/api/health", {
        headers: { Connection: "keep-alive", "X-Client": "value" },
      }),
      stagingEnv,
    );

    const proxiedRequest = firstProxiedRequest(fetchMock);
    expect(proxiedRequest.headers.get("Connection")).toBeNull();
    expect(proxiedRequest.headers.get("X-Client")).toBe("value");
    expect(response.headers.get("Connection")).toBeNull();
    expect(response.headers.get("X-Upstream")).toBe("value");
  });

  it("returns a non-cached error for an invalid target", async () => {
    const response = await worker.fetch(
      new Request("https://staging.icaf.org/api/health"),
      { ...stagingEnv, TARGET_API_ORIGIN: "not a URL" },
    );

    expect(response.status).toBe(500);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it.each([
    "http://staging-api.execute-api.us-east-1.amazonaws.com/v1",
    "https://example.com/v1",
    "https://user:password@staging-api.execute-api.us-east-1.amazonaws.com/v1",
    "https://staging-api.execute-api.us-east-1.amazonaws.com/v1?target=other",
  ])("rejects an unsafe target origin: %s", (targetOrigin) => {
    expect(() => buildTargetUrl(
      new URL("https://staging.icaf.org/api/health"),
      targetOrigin,
    )).toThrow();
  });
});
