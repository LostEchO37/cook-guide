/** API base URL — Vercel in production; same host when app is served from Node on :8787. */

function readMetaEndpoint() {
  if (typeof document === 'undefined') return '';
  return document.querySelector('meta[name="analytics-endpoint"]')?.content?.trim().replace(/\/$/, '') || '';
}

function resolveApiBase() {
  if (typeof location === 'undefined') return '';

  const { hostname, port, protocol, origin } = location;

  // Node server serves static + API together on 8787.
  if (port === '8787') return origin;

  // Local static dev (python http.server, etc.) → deployed API from meta tag.
  if (protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1')) {
    return readMetaEndpoint();
  }

  return readMetaEndpoint();
}

export const SiteConfig = {
  apiBase: resolveApiBase(),
  apiEnabled() {
    return !!this.apiBase;
  },
};
