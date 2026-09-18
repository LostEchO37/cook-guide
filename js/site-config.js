/** API base URL — same host as analytics when deployed. */

function resolveApiBase() {
  if (typeof location === 'undefined') return '';

  const { hostname, port, protocol, origin } = location;

  if (port === '8787') return origin;

  if (protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1')) {
    return `${protocol}//${hostname}:8787`;
  }

  if (typeof document === 'undefined') return '';
  const meta = document.querySelector('meta[name="analytics-endpoint"]')?.content?.trim();
  if (meta) return meta.replace(/\/$/, '');

  return '';
}

export const SiteConfig = {
  apiBase: resolveApiBase(),
  apiEnabled() {
    return !!this.apiBase;
  },
};
