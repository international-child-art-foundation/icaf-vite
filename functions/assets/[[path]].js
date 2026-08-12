function isHtmlResponse(response) {
  const contentType = response.headers.get('Content-Type');

  return contentType?.toLowerCase().includes('text/html') ?? false;
}

function notFoundResponse(request) {
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

export async function onRequest({ request, next }) {
  const assetResponse = await next();

  // Pages applies the SPA fallback to missing assets. Preserve real asset
  // responses, but never expose the HTML app shell as JavaScript, CSS, etc.
  return isHtmlResponse(assetResponse)
    ? notFoundResponse(request)
    : assetResponse;
}
