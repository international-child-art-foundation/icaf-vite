export interface Env {
  TARGET_API_ORIGIN: string;
  ENVIRONMENT: "staging" | "production";
}

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const ALLOWED_HOSTS_BY_ENV: Record<Env["ENVIRONMENT"], string> = {
  staging: "staging.icaf.org",
  production: "icaf.org",
};

type HeadersWithSetCookie = Headers & {
  getAll?: (name: string) => string[];
  getSetCookie?: () => string[];
};

function copyRequestHeaders(request: Request): Headers {
  const headers = new Headers(request.headers);

  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }

  headers.set("X-Forwarded-Proto", "https");
  headers.set("X-Forwarded-Host", new URL(request.url).host);

  return headers;
}

function getSetCookieHeaders(headers: Headers): string[] {
  const extendedHeaders = headers as HeadersWithSetCookie;

  if (typeof extendedHeaders.getSetCookie === "function") {
    return extendedHeaders.getSetCookie();
  }

  if (typeof extendedHeaders.getAll === "function") {
    return extendedHeaders.getAll("Set-Cookie");
  }

  const setCookie = headers.get("Set-Cookie");
  return setCookie === null ? [] : [setCookie];
}

function copyResponseHeaders(response: Response): Headers {
  const headers = new Headers();

  response.headers.forEach((value, name) => {
    const normalizedName = name.toLowerCase();
    if (normalizedName !== "set-cookie" && !HOP_BY_HOP_HEADERS.has(normalizedName)) {
      headers.append(name, value);
    }
  });

  for (const setCookie of getSetCookieHeaders(response.headers)) {
    headers.append("Set-Cookie", setCookie);
  }

  headers.set("Cache-Control", "no-store");
  return headers;
}

export function buildTargetUrl(requestUrl: URL, targetOrigin: string): URL {
  const baseUrl = new URL(targetOrigin);
  if (
    baseUrl.protocol !== "https:" ||
    !baseUrl.hostname.endsWith(".amazonaws.com") ||
    !baseUrl.hostname.includes(".execute-api.") ||
    baseUrl.username ||
    baseUrl.password ||
    baseUrl.search ||
    baseUrl.hash
  ) {
    throw new Error("TARGET_API_ORIGIN must be an HTTPS API Gateway stage URL.");
  }

  const basePath = baseUrl.pathname.replace(/\/$/, "");
  const requestPath = requestUrl.pathname.startsWith("/")
    ? requestUrl.pathname
    : `/${requestUrl.pathname}`;

  baseUrl.pathname = `${basePath}${requestPath}`;
  baseUrl.search = requestUrl.search;
  baseUrl.hash = "";
  return baseUrl;
}

function noStoreResponse(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestUrl = new URL(request.url);
    const expectedHost = ALLOWED_HOSTS_BY_ENV[env.ENVIRONMENT];

    if (requestUrl.hostname !== expectedHost) {
      return noStoreResponse("Unexpected host for this API proxy environment.", 421);
    }

    if (!requestUrl.pathname.startsWith("/api/")) {
      return noStoreResponse("Not found.", 404);
    }

    let targetUrl: URL;
    try {
      targetUrl = buildTargetUrl(requestUrl, env.TARGET_API_ORIGIN);
    } catch {
      return noStoreResponse("API proxy target is not configured correctly.", 500);
    }

    const proxiedRequest = new Request(targetUrl, request);
    const requestHeaders = copyRequestHeaders(request);
    requestHeaders.forEach((value, name) => {
      proxiedRequest.headers.set(name, value);
    });
    for (const header of HOP_BY_HOP_HEADERS) {
      proxiedRequest.headers.delete(header);
    }

    let response: Response;
    try {
      response = await fetch(proxiedRequest, {
        redirect: "manual",
        cf: {
          cacheTtl: 0,
          cacheEverything: false,
        },
      });
    } catch {
      return noStoreResponse("The upstream API is unavailable.", 502);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: copyResponseHeaders(response),
    });
  },
};
