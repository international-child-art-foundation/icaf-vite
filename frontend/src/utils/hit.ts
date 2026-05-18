export function recordHit(path: string): void {
  if (import.meta.env.DEV) return;

  const body = JSON.stringify({ path });
  const url = '/php-api/hit.php';

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
  } else {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      /* do nothing */
    });
  }
}
