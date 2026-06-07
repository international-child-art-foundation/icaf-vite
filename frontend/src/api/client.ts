export type ApiQueryParams = object | undefined;

export type ApiRequestOptions<TBody> = {
  body?: TBody;
  bypassCache?: boolean;
  cacheTtlMs?: number;
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
// TODO: Update to prod-acceptable time (currently 10 minutes)
// Gallery page filter options are cached by x-many minutes before revalidation
export const DEFAULT_API_CACHE_TTL_MS = 10 * 60 * 1000;

type CachedApiResponse = {
  expiresAt: number;
  value: unknown;
};

const apiResponseCache = new Map<string, CachedApiResponse>();
const pendingApiResponseCache = new Map<string, Promise<unknown>>();

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

function buildApiCacheKey(method: string, url: string): string {
  return `${method.toUpperCase()} ${url}`;
}

function getCachedApiResponse(cacheKey: string): unknown {
  const cached = apiResponseCache.get(cacheKey);

  if (!cached) return undefined;
  if (cached.expiresAt > Date.now()) return cached.value;

  apiResponseCache.delete(cacheKey);
  return undefined;
}

async function fetchApiResponse<TBody>(
  url: string,
  options: ApiRequestOptions<TBody>,
  headers: Headers,
): Promise<{ response: Response; responseBody: unknown }> {
  const response = await fetch(url, {
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

  return { response, responseBody };
}

function validateApiResponse(
  response: Response,
  responseBody: unknown,
  validate?: (body: unknown) => boolean,
): void {
  if (responseBody !== undefined) {
    if (!isApiObject(responseBody)) {
      throw new InvalidApiResponseError(response, responseBody);
    }

    if ('success' in responseBody && responseBody.success !== true) {
      throw new InvalidApiResponseError(response, responseBody);
    }
  }

  if (validate && !validate(responseBody)) {
    throw new UnexpectedApiResponseError();
  }
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

export function hasStringProperty(body: unknown, property: string): boolean {
  return isApiObject(body) && typeof body[property] === 'string';
}

export function hasBooleanProperty(body: unknown, property: string): boolean {
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

  const method =
    options.method ?? (options.body === undefined ? 'GET' : 'POST');
  const url = buildApiUrl(path, options.query, config);
  const cacheEnabled =
    method.toUpperCase() === 'GET' &&
    options.body === undefined &&
    !options.bypassCache &&
    options.cacheTtlMs !== undefined &&
    options.cacheTtlMs > 0;
  const cacheKey = cacheEnabled ? buildApiCacheKey(method, url) : undefined;

  if (cacheKey) {
    const cached = getCachedApiResponse(cacheKey);
    if (cached !== undefined) return cached as TResponse;

    const pending = pendingApiResponseCache.get(cacheKey);
    if (pending) return (await pending) as TResponse;
  }

  const request = fetchApiResponse(url, options, headers).then(
    ({ response, responseBody }) => {
      validateApiResponse(response, responseBody, options.validate);

      if (cacheKey) {
        apiResponseCache.set(cacheKey, {
          expiresAt:
            Date.now() + (options.cacheTtlMs ?? DEFAULT_API_CACHE_TTL_MS),
          value: responseBody,
        });
      }

      return responseBody;
    },
  );

  if (cacheKey) {
    pendingApiResponseCache.set(cacheKey, request);
  }

  try {
    return (await request) as TResponse;
  } finally {
    if (cacheKey) {
      pendingApiResponseCache.delete(cacheKey);
    }
  }
}
