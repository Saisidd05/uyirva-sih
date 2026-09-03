// Vercel serverless entry point. Restore the original path passed by the
// rewrite, then delegate to the same handler used by local Node development.
const handler = require('../server');
module.exports = (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const forwardedPath = url.searchParams.get('path');
  if (forwardedPath !== null) request.url = `/${forwardedPath}`;
  return handler(request, response);
};
