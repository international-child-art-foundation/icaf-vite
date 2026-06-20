import type { AuthenticatedUserSummary } from '@icaf/shared';

const LAST_KNOWN_USER_KEY = 'icaf:lastKnownUser';
const LAST_VISITED_PATH_KEY = 'icaf:lastVisitedPath';

export type LastKnownUser = AuthenticatedUserSummary & {
  savedAt: string;
};

export function normalizeInternalPath(value: string | null | undefined): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('://')) {
    return null;
  }

  return trimmed;
}

export function getLastKnownUser(): LastKnownUser | null {
  if (typeof window === 'undefined') return null;

  const rawValue = window.localStorage.getItem(LAST_KNOWN_USER_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as Partial<LastKnownUser>;
    if (
      typeof parsed.user_id !== 'string' ||
      typeof parsed.email !== 'string' ||
      typeof parsed.role !== 'string' ||
      typeof parsed.savedAt !== 'string'
    ) {
      return null;
    }

    return {
      user_id: parsed.user_id,
      email: parsed.email,
      role: parsed.role,
      f_name: typeof parsed.f_name === 'string' ? parsed.f_name : undefined,
      l_name: typeof parsed.l_name === 'string' ? parsed.l_name : undefined,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

export function saveLastKnownUser(user: AuthenticatedUserSummary): void {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    LAST_KNOWN_USER_KEY,
    JSON.stringify({
      ...user,
      savedAt: new Date().toISOString(),
    }),
  );
}

export function clearLastKnownUser(): void {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(LAST_KNOWN_USER_KEY);
}

export function getLastVisitedPath(): string | null {
  if (typeof window === 'undefined') return null;

  return normalizeInternalPath(window.sessionStorage.getItem(LAST_VISITED_PATH_KEY));
}

export function saveLastVisitedPath(path: string): void {
  if (typeof window === 'undefined') return;

  const normalizedPath = normalizeInternalPath(path);
  if (!normalizedPath) return;

  window.sessionStorage.setItem(LAST_VISITED_PATH_KEY, normalizedPath);
}

export function clearLastVisitedPath(): void {
  if (typeof window === 'undefined') return;

  window.sessionStorage.removeItem(LAST_VISITED_PATH_KEY);
}

export function buildLoginRedirectPath(
  returnTo: string,
  reason: 'auth-required' | 'stale-auth',
): string {
  const safeReturnTo = normalizeInternalPath(returnTo) ?? '/my-icaf';
  const searchParams = new URLSearchParams({
    reason,
    returnTo: safeReturnTo,
  });

  return `/login?${searchParams.toString()}`;
}
