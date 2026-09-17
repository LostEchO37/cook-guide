/** Recipe ratings — persisted in localStorage. */

const STORAGE_KEY = 'ember-ratings';
const LEGACY_KEY = 'simmr-ratings';
const DEFAULT_BASE = 4.0;

export function loadAllRatings() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) raw = localStorage.getItem(LEGACY_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

/** Returns { avg, count } — blends base rating with user submissions. */
export function getRecipeRating(recipeId, baseRating = DEFAULT_BASE) {
  const data = loadAllRatings();
  const entry = data[recipeId];
  if (!entry || !entry.count) {
    return { avg: baseRating, count: 0, isDefault: true };
  }
  const userAvg = entry.sum / entry.count;
  const weight = Math.min(entry.count / 5, 1);
  const avg = baseRating * (1 - weight) + userAvg * weight;
  return { avg: Math.round(avg * 10) / 10, count: entry.count, isDefault: false };
}

export function rateRecipe(recipeId, stars) {
  const data = loadAllRatings();
  if (!data[recipeId]) data[recipeId] = { sum: 0, count: 0 };
  data[recipeId].sum += stars;
  data[recipeId].count += 1;
  saveAll(data);
  return getRecipeRating(recipeId);
}

export function formatStars(avg) {
  const full = Math.floor(avg);
  const half = avg - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}
