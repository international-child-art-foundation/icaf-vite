import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  CommonErrors,
} from "@icaf/shared";

type ParsedJsonBody<T extends object> =
  | { ok: true; value: T }
  | { ok: false; response: ApiGatewayResponse };

export function parseJsonBody<T extends object>(
  event: ApiGatewayEvent,
): ParsedJsonBody<T> {
  if (event.body === undefined || event.body === null) {
    return { ok: true, value: {} as T };
  }

  if (event.body.trim() === "") {
    return { ok: false, response: CommonErrors.badRequest("Invalid JSON body") };
  }

  try {
    const value = JSON.parse(event.body) as unknown;

    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false, response: CommonErrors.badRequest("JSON body must be an object") };
    }

    return { ok: true, value: value as T };
  } catch {
    return { ok: false, response: CommonErrors.badRequest("Invalid JSON body") };
  }
}

export function parseBase64JsonObject(
  value: string,
  invalidMessage: string,
): ParsedJsonBody<Record<string, unknown>> {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64").toString("utf-8")) as unknown;

    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, response: CommonErrors.badRequest(invalidMessage) };
    }

    return { ok: true, value: parsed as Record<string, unknown> };
  } catch {
    return { ok: false, response: CommonErrors.badRequest(invalidMessage) };
  }
}
