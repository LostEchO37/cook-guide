/** Recipe database and matching engine */

import { normalizeIngredient } from './ingredients.js';
import { RECIPE_CATALOG, matchesCuisineFilter } from './recipe-data.js';

const RECIPES = RECIPE_CATALOG;

/** Proteins / distinctive mains — highest match weight. */
const PROTEIN_KEYS = new Set([
  'chicken', 'beef', 'pork', 'fish', 'shrimp', 'tofu', 'eggs', 'egg',
  'lamb', 'bacon', 'sausage', 'duck', 'ground lamb', 'ground beef',
  'ground pork', 'turkey', 'crab', 'squid', 'salmon', 'tuna', 'scallop', 'clams',
]);

/** Leafy / stir-fry vegetables that often define a main dish. */
const VEG_KEYS = new Set([
  'greens', 'broccoli', 'spinach', 'cabbage', 'lettuce', 'eggplant',
  'bell pepper', 'carrot', 'tomato', 'mushroom', 'potato', 'onion',
  'green beans', 'celery', 'zucchini', 'cauliflower', 'bok choy',
  'bitter melon', 'winter melon', 'cucumber', 'peas', 'corn',
  'sweet potato', 'radish', 'bamboo shoots', 'bean sprouts',
]);

/** Staples / carbs — useful but should not dominate ranking. */
const STAPLE_KEYS = new Set([
  'rice', 'noodles', 'pasta', 'bread', 'flour', 'rice cakes',
  'rice noodles', 'rice flour', 'oats', 'couscous', 'tortilla',
]);

/** Pantry seasonings — almost always “available”; low weight. */
const SEASONING_KEYS = new Set([
  'salt', 'pepper', 'sugar', 'oil', 'olive oil', 'soy sauce', 'vinegar',
  'garlic', 'ginger', 'chili', 'cumin', 'paprika', 'sesame', 'sesame oil',
  'oyster sauce', 'honey', 'butter', 'cream', 'milk', 'flour',
  'green onion', 'scallion', 'cilantro', 'basil', 'oregano', 'rosemary',
]);

function normalize(str) {
  return String(str).toLowerCase().trim().replace(/\s+/g, ' ');
}

function ingredientMatches(userIng, recipeIng) {
  const u = normalize(userIng);
  const r = normalize(recipeIng);
  const canon = (k) => (k === 'egg' ? 'eggs' : k);
  if (canon(u) === canon(r)) return true;
  // Avoid over-broad hits like "rice" ↔ "rice cakes" when both are catalog keys
  if (u.length >= 3 && r.length >= 3 && (u.includes(r) || r.includes(u))) {
    if ((STAPLE_KEYS.has(u) || STAPLE_KEYS.has(r)) && u !== r) {
      const shorter = u.length <= r.length ? u : r;
      const longer = u.length > r.length ? u : r;
      if (longer !== shorter && longer.startsWith(`${shorter} `)) return false;
    }
    return true;
  }
  return false;
}

function ingredientWeight(key) {
  const k = normalize(key);
  if (PROTEIN_KEYS.has(k)) return 4.5;
  if (STAPLE_KEYS.has(k)) return 0.55;
  if (SEASONING_KEYS.has(k)) return 0.35;
  if (VEG_KEYS.has(k)) return 2.2;
  return 1.25;
}

function isProtein(key) {
  return PROTEIN_KEYS.has(normalize(key));
}

function isStaple(key) {
  return STAPLE_KEYS.has(normalize(key));
}

function isSeasoning(key) {
  return SEASONING_KEYS.has(normalize(key));
}

function scoreRecipe(recipe, userIngredients) {
  const required = recipe.ingredients || [];
  const matched = required.filter((req) =>
    userIngredients.some((u) => ingredientMatches(u, req)),
  );
  const optionalMatched = (recipe.optional || []).filter((opt) =>
    userIngredients.some((u) => ingredientMatches(u, opt)),
  );

  const missing = required.filter((req) =>
    !userIngredients.some((u) => ingredientMatches(u, req)),
  );

  const weightMatched = matched.reduce((sum, ing) => sum + ingredientWeight(ing), 0);
  const weightRequired = required.reduce((sum, ing) => sum + ingredientWeight(ing), 0) || 1;
  const matchRatio = matched.length / (required.length || 1);
  const weightedRatio = weightMatched / weightRequired;

  let score = weightedRatio * 100 + optionalMatched.length * 4;

  // Prefer dishes that actually use the user's distinctive proteins
  const userProteins = userIngredients.filter(isProtein);
  const matchedUserProteins = userProteins.filter((p) =>
    matched.some((m) => ingredientMatches(p, m))
    || optionalMatched.some((m) => ingredientMatches(p, m)),
  );
  const isEggKey = (k) => {
    const n = normalize(k);
    return n === 'egg' || n === 'eggs';
  };
  // Meat/seafood left unused should outweigh egg+rice “protein” hits
  const userPremium = userProteins.filter((p) => !isEggKey(p));
  const matchedPremium = matchedUserProteins.filter((p) => !isEggKey(p));

  if (matchedPremium.length > 0) {
    score += 36 * matchedPremium.length;
    if (matched.filter((m) => isProtein(m) && !isEggKey(m)).length > 0) score += 16;
  } else if (matchedUserProteins.length > 0) {
    // Only eggs matched as protein
    score += 10 * matchedUserProteins.length;
  }

  if (userPremium.length > 0 && matchedPremium.length === 0) {
    // User clearly has a main protein (e.g. lamb) that this recipe ignores
    const requiredCore = required.filter((r) => !isSeasoning(r));
    const stapleOrEggHeavy = requiredCore.length > 0
      && requiredCore.filter((r) => isStaple(r) || isEggKey(r)).length
        >= Math.ceil(requiredCore.length * 0.5);
    score *= stapleOrEggHeavy ? 0.28 : 0.55;
  } else if (userProteins.length > 0 && matchedUserProteins.length === 0) {
    score *= 0.7;
  }

  // Prefer recipes that consume more of the user's non-staple ingredients
  const userDistinct = userIngredients.filter((u) => !isStaple(u) && !isSeasoning(u));
  const usedDistinct = userDistinct.filter((u) =>
    matched.some((m) => ingredientMatches(u, m))
    || optionalMatched.some((m) => ingredientMatches(u, m)),
  );
  if (userDistinct.length > 0) {
    score += (usedDistinct.length / userDistinct.length) * 18;
  }

  // Soft penalty for leaving most of a short required list unmatched
  if (matchRatio < 0.4) score *= 0.55;

  return {
    matched,
    missing,
    matchRatio,
    weightedRatio,
    score,
    usedUserProteins: matchedUserProteins.length,
  };
}

function passesFilters(recipe, expectations) {
  // Meal is soft-ranked (see preferenceBoost) so breakfast isn't an empty wall.
  // Still keep a light gate: snack/breakfast recipes shouldn't vanish under dinner,
  // but extreme mismatches are handled via score, not hard drop.

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

/** Soft boost so breakfast / time / servings actually reshuffle results. */
function preferenceBoost(recipe, expectations) {
  let boost = 0;
  const meal = expectations.meal || 'any';
  const meals = recipe.meal || [];

  if (meal === 'any') {
    boost += 4;
  } else if (meals.includes(meal)) {
    boost += 32;
  } else if (
    (meal === 'lunch' || meal === 'dinner')
    && (meals.includes('lunch') || meals.includes('dinner'))
  ) {
    // Lunch ↔ dinner are interchangeable for most family cooking
    boost += 14;
  } else if (meal === 'breakfast' && (meals.includes('snack') || meals.includes('brunch'))) {
    boost += 12;
  } else if (meal === 'snack' && meals.includes('breakfast')) {
    boost += 10;
  } else if (meal === 'breakfast' || meal === 'snack') {
    // Wrong meal type for a breakfast/snack seeker — strongly demote dinner mains
    const looksBreakfastFriendly = (recipe.tags || []).some((t) => /早餐|breakfast|brunch|快手/i.test(t))
      || (recipe.ingredients || []).some((i) => ['eggs', 'egg', 'bread', 'oats', 'yogurt', 'milk', 'banana', 'avocado'].includes(i));
    const isHeavyMain = (recipe.ingredients || []).some((i) =>
      ['lamb', 'beef', 'pork', 'duck', 'chicken', 'fish'].includes(i),
    ) && !meals.includes('breakfast');
    if (meals.includes('breakfast') || meals.includes('snack')) boost += 0; // already handled
    else if (looksBreakfastFriendly && !isHeavyMain) boost += 8;
    else if (isHeavyMain) boost -= 55;
    else boost -= 32;
  } else {
    boost -= 18;
  }

  const timeOrder = { quick: 1, medium: 2, leisurely: 3 };
  const rt = timeOrder[recipe.time] || 2;
  const et = timeOrder[expectations.time] || 2;
  if (rt === et) boost += 16;
  else if (rt < et) boost += 9; // finished sooner than asked — fine
  else boost -= 8;

  const diffOrder = { easy: 1, medium: 2, advanced: 3 };
  const rd = diffOrder[recipe.difficulty] || 1;
  const ed = diffOrder[expectations.difficulty] || 1;
  if (rd === ed) boost += 10;
  else if (rd < ed) boost += 5;

  const want = parseInt(expectations.servings, 10) || 2;
  const got = recipe.servings || 2;
  const delta = Math.abs(want - got);
  if (delta === 0) boost += 14;
  else if (delta === 1) boost += 7;
  else if (delta <= 2) boost += 2;
  else boost -= 6;

  // Slight preference for recipes that scale well: larger requested servings
  // favor stews / one-pots tagged as such
  if (want >= 4 && (recipe.tags || []).some((t) => /家常|炖|焖|stew|one.?pot|煲/i.test(String(t)))) {
    boost += 6;
  }

  return boost;
}

function buildImprovisedRecipe(userIngredients, expectations) {
  const hasProtein = userIngredients.some((i) =>
    [...PROTEIN_KEYS].some((p) => ingredientMatches(i, p)),
  );
  const hasCarb = userIngredients.some((i) =>
    [...STAPLE_KEYS].some((c) => ingredientMatches(i, c)),
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
    servings: parseInt(expectations.servings, 10) || 2,
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
    .filter((r) => passesFilters(r, expectations))
    .map((recipe) => {
      const scored = scoreRecipe(recipe, canonical);
      const pref = preferenceBoost(recipe, expectations);
      let score = scored.matchRatio >= 0.4 ? scored.score : scored.score * 0.5;
      score += pref;

      // Meal mismatch multiplier — breakfast/snack prefs must visibly reshape ranking
      const wantMeal = expectations.meal || 'any';
      const recipeMeals = recipe.meal || [];
      if (
        (wantMeal === 'breakfast' || wantMeal === 'snack')
        && !recipeMeals.includes(wantMeal)
        && !recipeMeals.includes('breakfast')
        && !recipeMeals.includes('snack')
      ) {
        const hasDinnerMeat = (recipe.ingredients || []).some((i) =>
          ['lamb', 'beef', 'pork', 'duck', 'chicken', 'fish', 'shrimp'].includes(i),
        );
        score *= hasDinnerMeat ? 0.22 : 0.45;
      }

      return {
        ...recipe,
        matched: scored.matched,
        missing: scored.missing,
        matchRatio: scored.matchRatio,
        weightedRatio: scored.weightedRatio,
        usedUserProteins: scored.usedUserProteins,
        preferenceBoost: pref,
        score,
      };
    })
    .filter((r) => r.matchRatio >= 0.25 || r.matched.length >= 2 || r.usedUserProteins > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.usedUserProteins !== a.usedUserProteins) return b.usedUserProteins - a.usedUserProteins;
      if ((b.preferenceBoost || 0) !== (a.preferenceBoost || 0)) {
        return (b.preferenceBoost || 0) - (a.preferenceBoost || 0);
      }
      return b.matchRatio - a.matchRatio;
    });

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
  return steps.map((s) => ({ ...s }));
}

export function scoreRecipeWithPantry(recipe, userIngredients) {
  const canonical = userIngredients
    .map(normalizeIngredient)
    .filter(Boolean);
  return scoreRecipe(recipe, canonical);
}
