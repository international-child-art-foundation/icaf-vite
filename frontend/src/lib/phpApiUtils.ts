import { ApiResponse, ApiSuccess } from '@/types/phpApiTypes';

export function isApiSuccess(r: ApiResponse): r is ApiSuccess {
  return 'ok' in r && r.ok === true;
}

export function parseApiResponse(text: string): ApiResponse | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      (('ok' in parsed && (parsed as { ok?: unknown }).ok === true) ||
        ('error' in parsed &&
          typeof (parsed as { error?: unknown }).error === 'string'))
    ) {
      return parsed as ApiResponse;
    }
    return null;
  } catch {
    return null;
  }
}

export function getString(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v : '';
}

export function clamp(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) : s;
}
