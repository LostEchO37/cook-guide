/**
 * Lightweight usage analytics for Ember.
 * Sends visit / action events (device + username when available) to the analytics server.
 * No-op when no endpoint can be resolved.
 */

function resolveEndpoint() {
  if (typeof document === 'undefined') return '';
  const meta = document.querySelector('meta[name="analytics-endpoint"]')?.content?.trim();
  if (meta) return meta.replace(/\/$/, '');
  // Same-origin when the app is served by the analytics server (port 8787)
  if (typeof location !== 'undefined' && (location.port === '8787' || /\/api\/v1\//.test(location.href))) {
    return location.origin;
  }
  // Local static servers talking to the local analytics process
  if (typeof location !== 'undefined'
      && (location.hostname === '127.0.0.1' || location.hostname === 'localhost')
      && location.protocol === 'http:') {
    return 'http://127.0.0.1:8787';
  }
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
    if (Date.now() - last < 2 * 60 * 1000) return false;
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

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([json], { type: 'application/json' });
      if (navigator.sendBeacon(url, blob)) return;
    }
  } catch { /* fall through */ }

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
