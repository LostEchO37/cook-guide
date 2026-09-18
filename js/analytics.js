/**
 * Lightweight usage analytics for Ember.
 * Sends visit / action events to the analytics server on port 8787.
 */

function resolveEndpoint() {
  if (typeof document === 'undefined') return '';
  const meta = document.querySelector('meta[name="analytics-endpoint"]')?.content?.trim();
  if (meta) return meta.replace(/\/$/, '');

  if (typeof location === 'undefined') return '';

  const { hostname, port, protocol, origin } = location;

  // App + portal served together by the Python server
  if (port === '8787') return origin;

  // Local dev: talk to analytics on the same host (localhost or 127.0.0.1)
  if (protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1')) {
    return `${protocol}//${hostname}:8787`;
  }

  // GitHub Pages / other HTTPS hosts cannot reach a local HTTP server (mixed content)
  return '';
}

export const ANALYTICS_ENDPOINT = resolveEndpoint();

const SESSION_KEY = 'ember-analytics-sid';
const VISIT_KEY = 'ember-analytics-visit';
const USER_KEY = 'ember-username';

function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID().replace(/-/g, '');
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

function getSessionId() {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id || !/^[a-zA-Z0-9_-]{8,64}$/.test(id)) {
      id = uuid().slice(0, 32);
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return uuid().slice(0, 32);
  }
}

/** Call this when the user signs in / out (username feature). */
export function setAnalyticsUsername(username) {
  try {
    const name = String(username || '').trim().slice(0, 64);
    if (name) localStorage.setItem(USER_KEY, name);
    else localStorage.removeItem(USER_KEY);
  } catch { /* ignore */ }
}

export function getAnalyticsUsername() {
  try {
    return localStorage.getItem(USER_KEY) || null;
  } catch {
    return null;
  }
}

function detectDevice() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  let deviceType = 'desktop';
  if (/bot|crawl|spider|slurp/i.test(ua)) deviceType = 'bot';
  else if (/iPad|Tablet|Kindle|Silk/i.test(ua)) deviceType = 'tablet';
  else if (/Mobi|Android.*Mobile|iPhone|iPod/i.test(ua)) deviceType = 'mobile';

  let os = 'Unknown';
  if (/Windows NT/i.test(ua)) os = 'Windows';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS';
  else if (/CrOS/i.test(ua)) os = 'ChromeOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Unknown';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
  else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';

  return {
    deviceType,
    os,
    browser,
    device: `${deviceType} · ${os} · ${browser}`,
  };
}

function shouldCountVisit() {
  try {
    const last = Number(sessionStorage.getItem(VISIT_KEY) || 0);
    if (Date.now() - last < 30 * 1000) return false;
    sessionStorage.setItem(VISIT_KEY, String(Date.now()));
    return true;
  } catch {
    return true;
  }
}

/**
 * @param {string} type
 * @param {object} [payload]
 */
export function track(type, payload = {}) {
  const endpoint = resolveEndpoint();
  if (!endpoint) return;

  const body = {
    type,
    sessionId: getSessionId(),
    ts: Date.now(),
    path: typeof location !== 'undefined' ? location.pathname + location.search : '',
    referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    lang: payload.lang || (typeof document !== 'undefined' ? document.documentElement.lang : null),
    view: payload.view || null,
    recipeId: payload.recipeId || null,
    recipeName: payload.recipeName || null,
    username: payload.username || getAnalyticsUsername(),
    device: detectDevice(),
    meta: payload.meta || {},
  };

  const url = `${endpoint}/api/v1/collect`;
  const json = JSON.stringify(body);

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: json,
    keepalive: true,
    mode: 'cors',
  }).catch(() => {});
}

export function trackVisit(extra = {}) {
  if (!shouldCountVisit()) return;
  track('visit', extra);
}

export function trackView(view, extra = {}) {
  track('view', { view, ...extra });
}

/** Keep the portal alive while a tab is open. */
export function startAnalyticsHeartbeat(getLang = () => null) {
  if (!resolveEndpoint()) return;
  const tick = () => {
    if (!document.hidden) track('heartbeat', { lang: getLang() });
  };
  setInterval(tick, 15000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tick();
  });
}
