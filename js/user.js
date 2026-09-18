/**
 * User accounts — cloud auth + local guest profile.
 * Cloud pattern matches ielts-task1; guests use localStorage only.
 */

import { SiteConfig } from './site-config.js';
import { setAnalyticsUsername } from './analytics.js';

const TOKEN_KEY = 'ember-auth-token';
const PROFILE_KEY = 'ember-user-profile';
const GUEST_KEY = 'ember-guest-mode';

function defaultProfile() {
  return {
    mode: 'guest',
    userId: null,
    username: '',
    cookHistory: [],
    ratings: {},
    updatedAt: 0,
  };
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultProfile();
    const p = JSON.parse(raw);
    return { ...defaultProfile(), ...p };
  } catch {
    return defaultProfile();
  }
}

function saveProfile(profile) {
  profile.updatedAt = Date.now();
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

let profile = loadProfile();
let syncTimer = null;

async function api(path, opts = {}) {
  const base = SiteConfig.apiBase;
  if (!base) throw new Error('api_disabled');

  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${base}${path}`, { ...opts, headers });
  } catch {
    const err = new Error('network_error');
    err.code = 'network_error';
    throw err;
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = body.error || (res.status === 404 ? 'api_not_ready' : `http_${res.status}`);
    const err = new Error(code);
    err.status = res.status;
    err.code = code;
    throw err;
  }
  return body;
}

function scheduleSync() {
  if (profile.mode !== 'cloud' || !SiteConfig.apiEnabled()) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    try {
      await api('/api/auth/data', {
        method: 'PUT',
        body: JSON.stringify({
          data: {
            cookHistory: profile.cookHistory,
            ratings: profile.ratings,
          },
        }),
      });
    } catch (e) {
      if (e.status === 401) UserAuth.logout();
    }
  }, 800);
}

function applyAnalyticsName() {
  if (profile.mode === 'guest') setAnalyticsUsername('');
  else setAnalyticsUsername(profile.username || '');
}

export const UserAuth = {
  cloudEnabled() {
    return SiteConfig.apiEnabled();
  },

  getToken,

  async register(username, password) {
    const localHistory = profile.cookHistory || [];
    const localRatings = profile.ratings || {};
    const data = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(data.token);
    profile = {
      ...defaultProfile(),
      mode: 'cloud',
      userId: data.user.id,
      username: data.user.name,
      cookHistory: localHistory,
      ratings: localRatings,
    };
    saveProfile(profile);
    localStorage.removeItem(GUEST_KEY);
    applyAnalyticsName();
    scheduleSync();
    return data.user;
  },

  async login(username, password) {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(data.token);
    profile.mode = 'cloud';
    profile.userId = data.user.id;
    profile.username = data.user.name;
    saveProfile(profile);
    localStorage.removeItem(GUEST_KEY);

    try {
      const cloud = await api('/api/auth/data');
      if (cloud.data) {
        profile.cookHistory = cloud.data.cookHistory || [];
        profile.ratings = cloud.data.ratings || {};
        saveProfile(profile);
      }
    } catch {
      /* keep local profile */
    }

    applyAnalyticsName();
    return data.user;
  },

  logout() {
    setToken('');
    profile = defaultProfile();
    saveProfile(profile);
    applyAnalyticsName();
  },

  async restoreSession() {
    if (!getToken() || !SiteConfig.apiEnabled()) return null;
    try {
      const me = await api('/api/auth/me');
      profile.mode = 'cloud';
      profile.userId = me.user.id;
      profile.username = me.user.name;
      const cloud = await api('/api/auth/data');
      if (cloud.data) {
        profile.cookHistory = cloud.data.cookHistory || [];
        profile.ratings = cloud.data.ratings || {};
      }
      saveProfile(profile);
      applyAnalyticsName();
      return me.user;
    } catch {
      setToken('');
      return null;
    }
  },
};

export const UserStore = {
  current() {
    if (profile.mode === 'guest' && !localStorage.getItem(GUEST_KEY)) return null;
    return profile;
  },

  mode() {
    return profile.mode;
  },

  isGuest() {
    return profile.mode === 'guest';
  },

  isCloudUser() {
    return profile.mode === 'cloud' && !!getToken();
  },

  displayName() {
    if (profile.mode === 'guest') return profile.username || '';
    return profile.username || '';
  },

  continueAsGuest() {
    profile = {
      ...defaultProfile(),
      mode: 'guest',
      username: '',
    };
    saveProfile(profile);
    localStorage.setItem(GUEST_KEY, '1');
    applyAnalyticsName();
  },

  setGuestNickname(name) {
    profile.mode = 'guest';
    profile.username = String(name || '').trim().slice(0, 16);
    saveProfile(profile);
    localStorage.setItem(GUEST_KEY, '1');
    applyAnalyticsName();
  },

  recordCook({ recipeId, recipeName, stars = 0, lang = '' }) {
    if (profile.mode === 'guest' && !localStorage.getItem(GUEST_KEY)) {
      localStorage.setItem(GUEST_KEY, '1');
    }

    const entry = {
      recipeId,
      recipeName,
      stars: Math.min(5, Math.max(0, Number(stars) || 0)),
      ts: Date.now(),
      lang,
    };

    profile.cookHistory = [entry, ...profile.cookHistory].slice(0, 100);

    if (entry.stars > 0 && recipeId) {
      const prev = profile.ratings[recipeId] || { sum: 0, count: 0 };
      profile.ratings[recipeId] = {
        sum: prev.sum + entry.stars,
        count: prev.count + 1,
      };
    }

    saveProfile(profile);
    scheduleSync();
    return entry;
  },

  getCookHistory() {
    return profile.cookHistory || [];
  },

  getRatings() {
    return profile.ratings || {};
  },
};

applyAnalyticsName();
