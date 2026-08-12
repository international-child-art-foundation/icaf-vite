export function onRequest({ request }) {
  return new Response(request.method === 'HEAD' ? null : 'Not found.', {
    status: 404,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
