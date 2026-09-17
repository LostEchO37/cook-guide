/** Recipe database and matching engine */

import { normalizeIngredient } from './ingredients.js';
import { RECIPE_CATALOG, matchesCuisineFilter } from './recipe-data.js';

const RECIPES = RECIPE_CATALOG;

function normalize(str) {
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

function ingredientMatches(userIng, recipeIng) {
  const u = normalize(userIng);
  const r = normalize(recipeIng);
  return u.includes(r) || r.includes(u);
}

function scoreRecipe(recipe, userIngredients) {
  const required = recipe.ingredients;
  const matched = required.filter(req =>
    userIngredients.some(u => ingredientMatches(u, req))
  );
  const optionalMatched = (recipe.optional || []).filter(opt =>
    userIngredients.some(u => ingredientMatches(u, opt))
  );

  const matchRatio = matched.length / required.length;
  const missing = required.filter(req =>
    !userIngredients.some(u => ingredientMatches(u, req))
  );

  let score = matchRatio * 100 + optionalMatched.length * 5;

  return { matched, missing, matchRatio, score };
}

function passesFilters(recipe, expectations) {
  if (expectations.meal !== 'any' && !recipe.meal.includes(expectations.meal)) {
    return false;
  }

  const timeOrder = { quick: 1, medium: 2, leisurely: 3 };
  if (timeOrder[recipe.time] > timeOrder[expectations.time]) {
    return false;
  }

  const diffOrder = { easy: 1, medium: 2, advanced: 3 };
  if (diffOrder[recipe.difficulty] > diffOrder[expectations.difficulty]) {
    return false;
  }

  if (!recipe.diet.includes(expectations.diet)) {
    return false;
  }

  if (expectations.cuisine !== 'any' && !matchesCuisineFilter(recipe.cuisine, expectations.cuisine, { forPrefs: true })) {
    return false;
  }

  return true;
}

function buildImprovisedRecipe(userIngredients, expectations) {
  const hasProtein = userIngredients.some(i =>
    ['chicken', 'beef', 'pork', 'fish', 'shrimp', 'tofu', 'eggs'].some(p => ingredientMatches(i, p))
  );
  const hasCarb = userIngredients.some(i =>
    ['rice', 'pasta', 'noodles', 'bread', 'potato'].some(c => ingredientMatches(i, c))
  );

  const improvisedType = hasProtein && hasCarb
    ? 'bowl'
    : hasProtein
      ? 'protein'
      : 'veggie';

  const name = improvisedType === 'bowl'
    ? 'Custom Protein & Carb Bowl'
    : improvisedType === 'protein'
      ? 'Simple Pan-Cooked Protein'
      : 'Quick Veggie Sauté';

  const steps = [
    { instruction: `Gather and prep your ingredients: ${userIngredients.join(', ')}. Wash, chop, and measure everything before you start cooking.`, timer: 300 },
    { instruction: 'Heat 1–2 tbsp oil in a pan over medium-high heat until it shimmers.', timer: 60 },
  ];

  if (hasProtein) {
    steps.push({
      instruction: 'Cook your protein first — sear until browned and cooked through. Set aside if combining with other ingredients.',
      timer: 480,
    });
  }

  steps.push({
    instruction: 'Add aromatics (garlic, onion, ginger) if you have them. Cook until fragrant, about 1 minute.',
    timer: 60,
  });

  steps.push({
    instruction: 'Add remaining vegetables and ingredients. Stir-fry or sauté until everything is cooked to your liking.',
    timer: 360,
  });

  if (hasCarb) {
    steps.push({
      instruction: 'If using rice or pasta, make sure it\'s cooked and warm. Combine with the pan contents or serve alongside.',
      timer: 120,
    });
  }

  steps.push({
    instruction: 'Season with salt, pepper, and any sauces you have (soy sauce, lemon, etc.). Taste and adjust. Serve immediately!',
    timer: null,
  });

  return {
    id: 'improvised',
    name,
    meal: [expectations.meal === 'any' ? 'dinner' : expectations.meal],
    time: expectations.time,
    difficulty: 'easy',
    diet: [expectations.diet],
    cuisine: expectations.cuisine === 'any' ? 'comfort' : expectations.cuisine,
    servings: parseInt(expectations.servings, 10),
    ingredients: userIngredients,
    optional: [],
    steps,
    improvised: true,
    improvisedType,
    matchRatio: 1,
    score: 50,
    missing: [],
  };
}

export function findRecipes(userIngredients, expectations) {
  const canonical = userIngredients
    .map(normalizeIngredient)
    .filter(Boolean);

  if (canonical.length === 0) {
    return [];
  }

  const results = RECIPES
    .filter(r => passesFilters(r, expectations))
    .map(recipe => {
      const { matched, missing, matchRatio, score } = scoreRecipe(recipe, canonical);
      return {
        ...recipe,
        matched,
        missing,
        matchRatio,
        score: matchRatio >= 0.4 ? score : score * 0.5,
      };
    })
    .filter(r => r.matchRatio >= 0.25 || r.matched.length >= 2)
    .sort((a, b) => b.score - a.score);

  if (results.length === 0) {
    return [buildImprovisedRecipe(canonical, expectations)];
  }

  return results;
}

export function formatTime(minutes, lang = 'en') {
  if (lang.startsWith('zh')) {
    if (minutes < 60) return `${minutes} 分钟`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h} 小时 ${m} 分钟` : `${h} 小时`;
  }
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function estimateTotalTime(steps) {
  const totalSeconds = steps.reduce((sum, s) => sum + (s.timer || 0), 0);
  return Math.ceil(totalSeconds / 60);
}

export function scaleSteps(steps, recipeServings, targetServings) {
  if (recipeServings === targetServings) return steps;
  return steps.map(s => ({ ...s }));
}

export function scoreRecipeWithPantry(recipe, userIngredients) {
  const canonical = userIngredients
    .map(normalizeIngredient)
    .filter(Boolean);
  return scoreRecipe(recipe, canonical);
}
