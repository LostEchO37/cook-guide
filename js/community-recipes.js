/**
 * Community-published user recipes — merge into the local dictionary.
 */

import { SiteConfig } from './site-config.js';
import { UserAuth } from './user.js';

let cache = [];
let loadedAt = 0;

function toCatalogRecipe(r) {
  return {
    id: r.id,
    name: r.title,
    names: { 'zh-CN': r.title, 'zh-TW': r.title, en: r.title },
    cuisine: 'community',
    time: 'medium',
    difficulty: 'easy',
    diet: ['omnivore'],
    meal: ['dinner'],
    ingredients: r.ingredients || [],
    optional: [],
    steps: (r.steps || []).map((text) => ({ text })),
    tags: ['community', ...(r.tags || [])],
    spicy: 'none',
    flavors: r.tags || [],
    servings: 2,
    community: true,
    author: r.username,
    photoUrl: r.photoUrl || '',
    description: r.description || '',
  };
}

export async function refreshCommunityRecipes() {
  const base = SiteConfig.apiBase;
  if (!base) {
    cache = [];
    return cache;
  }
  try {
    const res = await fetch(`${base}/api/community/recipes?limit=100`);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || 'load_failed');
    cache = (body.recipes || []).map(toCatalogRecipe);
    loadedAt = Date.now();
  } catch {
    /* keep previous cache */
  }
  return cache;
}

export function getCommunityRecipes() {
  return cache.slice();
}

export async function fetchPublicProfile(username) {
  const base = SiteConfig.apiBase;
  if (!base) throw Object.assign(new Error('api_disabled'), { code: 'api_disabled' });
  const headers = {};
  const token = UserAuth.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}/api/community/profile/${encodeURIComponent(username)}`, { headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(body.error || 'not_found'), {
      code: body.error || 'not_found',
      status: res.status,
    });
  }
  return body.profile;
}

export async function createCommunityRecipe(payload) {
  const base = SiteConfig.apiBase;
  if (!base) throw Object.assign(new Error('api_disabled'), { code: 'api_disabled' });
  const token = UserAuth.getToken();
  if (!token) throw Object.assign(new Error('unauthorized'), { code: 'unauthorized' });
  const res = await fetch(`${base}/api/community/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(body.error || 'create_failed'), {
      code: body.error || 'create_failed',
      status: res.status,
    });
  }
  await refreshCommunityRecipes();
  return body.recipe;
}

export function communityRecipesLoadedAt() {
  return loadedAt;
}
