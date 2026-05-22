export type ApiQueryParams = object | undefined;

export type ApiRequestOptions<TBody> = {
  body?: TBody;
  headers?: HeadersInit;
  method?: string;
  query?: ApiQueryParams;
  signal?: AbortSignal;
};

export type ApiClientConfig = {
  baseUrl?: string;
};

const DEFAULT_API_BASE_URL = '/';

function resolveApiBaseUrl(config?: ApiClientConfig): string {
  // TODO: Before production, proxy the API to here and replace base url
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

  return responseBody as TResponse;
}
