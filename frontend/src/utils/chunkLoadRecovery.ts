// Keep in sync with the inline module-script retry shim in index.html.
const CHUNK_LOAD_RETRY_KEY = 'icaf:chunk-load-retried';

function getErrorMessage(value: unknown): string {
  if (value instanceof Error) {
    return value.message;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object' && 'message' in value) {
    const { message } = value as { message?: unknown };

    if (typeof message === 'string') {
      return message;
    }

    if (message instanceof Error) {
      return message.message;
    }

    return '';
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }

  return '';
}

function isChunkLoadError(value: unknown): boolean {
  const message = getErrorMessage(value);

  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('error loading dynamically imported module') ||
    message.includes('ChunkLoadError')
  );
}

function hasRetried(): boolean {
  try {
    return window.sessionStorage.getItem(CHUNK_LOAD_RETRY_KEY) === 'true';
  } catch {
    return true;
  }
}

function markRetried(): boolean {
  try {
    window.sessionStorage.setItem(CHUNK_LOAD_RETRY_KEY, 'true');
    return true;
  } catch {
    return false;
  }
}

function clearRetryMarker(): void {
  try {
    window.sessionStorage.removeItem(CHUNK_LOAD_RETRY_KEY);
  } catch {
    // Ignore unavailable storage.
  }
}

function reloadOnceForChunkFailure(): void {
  if (hasRetried()) {
    return;
  }

  if (!markRetried()) {
    return;
  }

  window.location.replace(window.location.href);
}

export function installChunkLoadRecovery(): void {
  window.addEventListener(
    'error',
    (event) => {
      if (isChunkLoadError(event.message) || isChunkLoadError(event.error)) {
        reloadOnceForChunkFailure();
      }
    },
    true,
  );

  window.addEventListener('unhandledrejection', (event) => {
    if (isChunkLoadError(event.reason)) {
      reloadOnceForChunkFailure();
    }
  });

  window.addEventListener('load', () => {
    window.setTimeout(clearRetryMarker, 5000);
  });
}
