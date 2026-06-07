export type ApiQueryParams = object | undefined;

export type ApiRequestOptions<TBody> = {
  body?: TBody;
  headers?: HeadersInit;
  method?: string;
  query?: ApiQueryParams;
  signal?: AbortSignal;
  validate?: (body: unknown) => boolean;
};

export type ApiClientConfig = {
  baseUrl?: string;
};

const DEFAULT_API_BASE_URL = '/api';

function resolveApiBaseUrl(config?: ApiClientConfig): string {
  const configuredBaseUrl =
    config?.baseUrl ??
    import.meta.env.VITE_API_BASE_URL ??
    DEFAULT_API_BASE_URL;

  return configuredBaseUrl.endsWith('/')
    ? configuredBaseUrl.slice(0, -1)
    : configuredBaseUrl;
}

export function buildApiUrl(
  path: string,
  query?: ApiQueryParams,
  config?: ApiClientConfig,
): string {
  const apiBaseUrl = resolveApiBaseUrl(config);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${apiBaseUrl}${normalizedPath}`, window.location.origin);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (
      typeof value === 'boolean' ||
      typeof value === 'number' ||
      typeof value === 'string'
    ) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isJsonResponse(response: Response): boolean {
  return (
    response.headers.get('Content-Type')?.includes('application/json') ?? false
  );
}

export class ApiError extends Error {
  readonly body: unknown;
  readonly status: number;

  constructor(response: Response, body: unknown) {
    const message =
      typeof body === 'object' && body !== null && 'message' in body
        ? String(body.message)
        : response.statusText || 'API request failed';

    super(message);
    this.name = 'ApiError';
    this.body = body;
    this.status = response.status;
  }

  get code(): string | undefined {
    if (
      typeof this.body === 'object' &&
      this.body !== null &&
      'code' in this.body
    ) {
      return String(this.body.code);
    }

    return undefined;
  }
}

export class InvalidApiResponseError extends Error {
  readonly body: unknown;
  readonly status: number;

  constructor(response: Response, body: unknown) {
    super('The site could not reach the ICAF account service.');
    this.name = 'InvalidApiResponseError';
    this.body = body;
    this.status = response.status;
  }
}

export class UnexpectedApiResponseError extends Error {
  constructor() {
    super('The site could not reach the ICAF account service.');
    this.name = 'UnexpectedApiResponseError';
  }
}

export function isApiObject(body: unknown): body is Record<string, unknown> {
  return typeof body === 'object' && body !== null && !Array.isArray(body);
}

export function hasApiSuccess(body: unknown): body is { success: true } {
  return isApiObject(body) && body.success === true;
}

export function hasApiMessage(body: unknown): body is { message: string } {
  return isApiObject(body) && typeof body.message === 'string';
}

export function hasStringProperty(
  body: unknown,
  property: string,
): boolean {
  return isApiObject(body) && typeof body[property] === 'string';
}

export function hasBooleanProperty(
  body: unknown,
  property: string,
): boolean {
  return isApiObject(body) && typeof body[property] === 'boolean';
}

export function hasArrayProperty(body: unknown, property: string): boolean {
  return isApiObject(body) && Array.isArray(body[property]);
}

export function hasNumberProperty(body: unknown, property: string): boolean {
  return isApiObject(body) && typeof body[property] === 'number';
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof InvalidApiResponseError) return error.message;
  if (error instanceof UnexpectedApiResponseError) return error.message;
  return fallback;
}

export async function apiRequest<TResponse, TBody = never>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
  config?: ApiClientConfig,
): Promise<TResponse> {
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildApiUrl(path, options.query, config), {
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: 'include',
    headers,
    method: options.method ?? (options.body === undefined ? 'GET' : 'POST'),
    signal: options.signal,
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(response, responseBody);
  }

  if (responseBody !== undefined && !isJsonResponse(response)) {
    throw new InvalidApiResponseError(response, responseBody);
  }

  if (typeof responseBody === 'string') {
    throw new InvalidApiResponseError(response, responseBody);
  }

  if (responseBody !== undefined) {
    if (!isApiObject(responseBody)) {
      throw new InvalidApiResponseError(response, responseBody);
    }

    if ('success' in responseBody && responseBody.success !== true) {
      throw new InvalidApiResponseError(response, responseBody);
    }
  }

  if (options.validate && !options.validate(responseBody)) {
    throw new UnexpectedApiResponseError();
  }

  return responseBody as TResponse;
}
