/** Recipe dictionary — search by dish name, flavor, and spice level. */

import { RECIPE_CATALOG, matchesCuisineFilter } from './recipe-data.js';
import { withDetailedSteps } from './recipe-step-detail.js';
import { getLanguage } from './i18n.js';
import { displayIngredient } from './ingredients.js';
import {
  enrichRecipe,
  getSpicyFilters,
  getFlavorFilters,
  labelSpicy,
  labelFlavor,
  matchesTagFilters,
  queryMatchesTags,
  tagSearchTerms,
} from './recipe-tags.js';

function displayName(recipe, lang) {
  if (lang === 'en') return recipe.name;
  return recipe.names?.[lang] || recipe.name;
}

function searchBlob(recipe, lang) {
  const r = enrichRecipe(recipe);
  return [
    recipe.name,
    recipe.names?.['zh-CN'],
    recipe.names?.['zh-TW'],
    ...(recipe.aliases || []),
    ...(recipe.tags || []),
    recipe.cuisine,
    recipe.id.replace(/-/g, ' '),
    ...recipe.ingredients,
    r.spicy,
    ...r.flavors,
    ...tagSearchTerms(recipe, lang),
  ].filter(Boolean).join('\n').toLowerCase();
}

export function getAllRecipes() {
  return RECIPE_CATALOG.map(enrichRecipe);
}

export function getRecipeById(id) {
  const recipe = RECIPE_CATALOG.find((r) => r.id === id);
  return recipe ? enrichRecipe(withDetailedSteps(recipe)) : null;
}

export function searchDictionary(query = '', options = {}) {
  const lang = options.lang || getLanguage();
  const filter = options.filter || 'all';
  const spicy = options.spicy || 'all';
  const flavors = options.flavors || [];
  const q = String(query).trim().toLowerCase();

  let pool = RECIPE_CATALOG.map(enrichRecipe);

  if (filter === 'quick') pool = pool.filter((r) => r.time === 'quick');
  else if (filter === 'vegetarian') {
    pool = pool.filter((r) => r.diet.includes('vegetarian') || r.diet.includes('vegan'));
  } else if (filter !== 'all') pool = pool.filter((r) => matchesCuisineFilter(r.cuisine, filter));

  pool = pool.filter((r) => matchesTagFilters(r, { spicy, flavors }));

  if (!q) {
    return pool.map((r) => ({ recipe: r, score: 0 }));
  }

  const terms = q.split(/\s+/).filter(Boolean);

  return pool
    .map((recipe) => {
      const blob = searchBlob(recipe, lang);
      const name = displayName(recipe, lang).toLowerCase();
      let score = 0;

      if (name === q || name.includes(q)) score += 100;
      if (recipe.name.toLowerCase() === q) score += 90;
      if (recipe.names?.['zh-CN'] === query.trim()) score += 100;
      if (recipe.aliases?.some((a) => a.toLowerCase() === q || a.includes(q))) score += 80;
      if (queryMatchesTags(q, recipe, lang)) score += 70;
      if (blob.includes(q)) score += 40;

      terms.forEach((term) => {
        if (name.includes(term)) score += 25;
        if (blob.includes(term)) score += 10;
        if (queryMatchesTags(term, recipe, lang)) score += 20;
        if (recipe.ingredients.some((ing) => ing.includes(term) || displayIngredient(ing, lang).includes(term))) {
          score += 8;
        }
      });

      return { recipe, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
}

export function getRecipeDisplayName(recipe, lang) {
  return displayName(recipe, lang || getLanguage());
}

export function getDictionaryFilters(lang) {
  const L = (en, cn, tw) => (lang === 'en' ? en : lang === 'zh-TW' ? tw : cn);
  return [
    { id: 'all', label: L('All', '全部', '全部'), group: 'category' },
    { id: 'asian', label: L('Chinese', '中餐', '中餐'), group: 'category' },
    { id: 'thai', label: L('Thai', '泰式', '泰式'), group: 'category' },
    { id: 'korean', label: L('Korean', '韩式', '韓式'), group: 'category' },
    { id: 'japanese', label: L('Japanese', '日式', '日式'), group: 'category' },
    { id: 'vietnamese', label: L('Vietnamese', '越南', '越南'), group: 'category' },
    { id: 'indian', label: L('Indian', '印度', '印度'), group: 'category' },
    { id: 'mexican', label: L('Mexican', '墨西哥', '墨西哥'), group: 'category' },
    { id: 'middle-eastern', label: L('Middle Eastern', '中东', '中東'), group: 'category' },
    { id: 'western', label: L('Western', '西式', '西式'), group: 'category' },
    { id: 'mediterranean', label: L('Mediterranean', '地中海', '地中海'), group: 'category' },
    { id: 'comfort', label: L('Comfort', '家常', '家常'), group: 'category' },
    { id: 'quick', label: L('Quick', '快手', '快手'), group: 'category' },
    { id: 'vegetarian', label: L('Vegetarian', '素食', '素食'), group: 'category' },
  ];
}

export function getDictionarySpicyFilters(lang) {
  return getSpicyFilters().map((id) => ({
    id,
    label: id === 'all' ? (lang === 'en' ? 'Any spice' : lang === 'zh-TW' ? '任意辣度' : '任意辣度') : labelSpicy(id, lang),
    group: 'spicy',
  }));
}

export function getDictionaryFlavorFilters(lang) {
  return getFlavorFilters().map((id) => ({
    id,
    label: labelFlavor(id),
    group: 'flavor',
  }));
}
