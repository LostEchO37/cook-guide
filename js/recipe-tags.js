/** Flavor & spice tags for every recipe in the catalog. */

import { t } from './i18n.js';
import { CHINA_RECIPE_META } from './recipe-data-china.js';
import { EXTRA_RECIPE_META } from './recipe-data-extra.js';
import { NATION_RECIPE_META } from './recipe-data-nations.js';

export const SPICY_LEVELS = ['none', 'mild', 'medium', 'hot'];

export const FLAVOR_KEYS = [
  'savory', 'sweet', 'sour', 'spicy', 'umami', 'fresh', 'rich', 'light', 'smoky',
];

/** Per-recipe metadata keyed by recipe id. */
export const RECIPE_META = {
  'garlic-butter-pasta': { spicy: 'none', flavors: ['savory', 'rich'] },
  'chicken-stir-fry': { spicy: 'mild', flavors: ['savory', 'umami'] },
  'veggie-fried-rice': { spicy: 'none', flavors: ['savory', 'umami'] },
  'tomato-basil-pasta': { spicy: 'none', flavors: ['fresh', 'savory'] },
  'creamy-mushroom-pasta': { spicy: 'none', flavors: ['rich', 'savory'] },
  'shakshuka': { spicy: 'mild', flavors: ['savory', 'umami'] },
  'simple-omelette': { spicy: 'none', flavors: ['savory', 'rich'] },
  'tofu-coconut-curry': { spicy: 'medium', flavors: ['rich', 'savory'] },
  'roasted-potatoes': { spicy: 'none', flavors: ['savory', 'rich'] },
  'beef-tacos': { spicy: 'medium', flavors: ['savory', 'spicy'] },
  'tomato-scrambled-eggs': { spicy: 'none', flavors: ['sweet', 'savory', 'fresh'] },
  'red-braised-pork': { spicy: 'mild', flavors: ['sweet', 'savory', 'rich'] },
  'kung-pao-chicken': { spicy: 'hot', flavors: ['spicy', 'savory', 'umami'] },
  'twice-cooked-pork': { spicy: 'medium', flavors: ['spicy', 'savory'] },
  'sweet-sour-pork-ribs': { spicy: 'none', flavors: ['sweet', 'sour'] },
  'cola-chicken-wings': { spicy: 'none', flavors: ['sweet', 'savory'] },
  'mapo-tofu': { spicy: 'hot', flavors: ['spicy', 'savory', 'umami'] },
  'fish-fragrant-pork': { spicy: 'medium', flavors: ['sour', 'sweet', 'spicy', 'umami'] },
  'hot-sour-potato-shreds': { spicy: 'medium', flavors: ['sour', 'spicy'] },
  'braised-eggplant': { spicy: 'mild', flavors: ['savory', 'rich'] },
  'garlic-broccoli': { spicy: 'none', flavors: ['savory', 'fresh'] },
  'di-san-xian': { spicy: 'none', flavors: ['savory'] },
  'bell-pepper-pork': { spicy: 'mild', flavors: ['savory'] },
  'yangzhou-fried-rice': { spicy: 'none', flavors: ['savory', 'umami'] },
  'egg-fried-rice': { spicy: 'none', flavors: ['savory'] },
  'scallion-oil-noodles': { spicy: 'none', flavors: ['savory', 'rich'] },
  'steamed-fish': { spicy: 'none', flavors: ['fresh', 'umami'] },
  'braised-tofu': { spicy: 'mild', flavors: ['savory', 'umami'] },
  'curry-chicken': { spicy: 'medium', flavors: ['rich', 'savory'] },
  'smashed-cucumber': { spicy: 'mild', flavors: ['sour', 'fresh'] },
  'ants-climbing-tree': { spicy: 'medium', flavors: ['spicy', 'savory'] },
  'oyster-lettuce': { spicy: 'none', flavors: ['fresh', 'savory'] },
  'dry-fried-green-beans': { spicy: 'medium', flavors: ['savory'] },
  'tomato-egg-noodles': { spicy: 'none', flavors: ['sweet', 'savory', 'fresh'] },
  'hot-sour-soup': { spicy: 'medium', flavors: ['sour', 'spicy'] },
  'carbonara': { spicy: 'none', flavors: ['rich', 'savory'] },
  'caprese-salad': { spicy: 'none', flavors: ['fresh'] },
  'honey-garlic-chicken': { spicy: 'none', flavors: ['sweet', 'savory'] },
  'teriyaki-chicken-bowl': { spicy: 'none', flavors: ['sweet', 'savory', 'umami'] },
  'french-toast': { spicy: 'none', flavors: ['sweet', 'rich'] },
  'mushroom-risotto': { spicy: 'none', flavors: ['rich', 'savory', 'umami'] },
  'bbq-glazed-chicken': { spicy: 'mild', flavors: ['sweet', 'smoky', 'savory'] },
  'pad-thai': { spicy: 'mild', flavors: ['sweet', 'sour', 'savory', 'umami'] },
  'thai-green-curry': { spicy: 'medium', flavors: ['rich', 'savory', 'spicy'] },
  'thai-basil-chicken': { spicy: 'medium', flavors: ['savory', 'spicy', 'umami'] },
  'tom-yum-soup': { spicy: 'medium', flavors: ['sour', 'spicy', 'fresh'] },
  'korean-bibimbap': { spicy: 'mild', flavors: ['savory', 'umami'] },
  'korean-spicy-pork': { spicy: 'hot', flavors: ['spicy', 'savory', 'sweet'] },
  'korean-gochujang-chicken': { spicy: 'medium', flavors: ['sweet', 'spicy', 'savory'] },
  'kimchi-fried-rice-style': { spicy: 'medium', flavors: ['sour', 'spicy', 'savory'] },
  'gyudon-beef-bowl': { spicy: 'none', flavors: ['sweet', 'savory', 'umami'] },
  'miso-glazed-fish': { spicy: 'none', flavors: ['umami', 'savory', 'sweet'] },
  'chicken-katsu-rice': { spicy: 'none', flavors: ['savory', 'rich'] },
  'shoyu-ramen': { spicy: 'none', flavors: ['savory', 'umami', 'rich'] },
  'chicken-burrito-bowl': { spicy: 'mild', flavors: ['savory', 'fresh'] },
  'pork-carnitas-tacos': { spicy: 'mild', flavors: ['savory', 'smoky'] },
  'mexican-street-corn': { spicy: 'mild', flavors: ['sweet', 'savory', 'rich'] },
  'butter-chicken': { spicy: 'medium', flavors: ['rich', 'savory', 'sweet'] },
  'chana-masala': { spicy: 'medium', flavors: ['savory', 'spicy', 'umami'] },
  'vegetable-biryani': { spicy: 'medium', flavors: ['savory', 'rich'] },
  'chicken-shawarma': { spicy: 'mild', flavors: ['savory', 'smoky', 'fresh'] },
  'falafel-bowl': { spicy: 'none', flavors: ['savory', 'fresh'] },
  'greek-chicken-bowl': { spicy: 'none', flavors: ['fresh', 'savory'] },
  'harissa-chicken-rice': { spicy: 'medium', flavors: ['spicy', 'savory', 'smoky'] },
  'lemon-garlic-fish': { spicy: 'none', flavors: ['fresh', 'savory', 'light'] },
  'vietnamese-pho': { spicy: 'none', flavors: ['savory', 'umami', 'fresh'] },
  'banh-mi-chicken': { spicy: 'mild', flavors: ['savory', 'fresh', 'sour'] },
  'miso-mushroom-carbonara': { spicy: 'none', flavors: ['umami', 'rich', 'savory'] },
  'gochujang-butter-pasta': { spicy: 'medium', flavors: ['spicy', 'rich', 'sweet'] },
  'mediterranean-crispy-rice-salad': { spicy: 'mild', flavors: ['fresh', 'savory', 'light'] },
  'thai-mango-sticky-rice': { spicy: 'none', flavors: ['sweet', 'rich'] },
  'thai-red-curry-tofu': { spicy: 'medium', flavors: ['rich', 'savory', 'spicy'] },
  'thai-larb-chicken': { spicy: 'medium', flavors: ['sour', 'spicy', 'fresh'] },
  'thai-coconut-chicken-soup': { spicy: 'mild', flavors: ['rich', 'savory', 'fresh'] },
  'thai-massaman-curry': { spicy: 'mild', flavors: ['rich', 'sweet', 'savory'] },
  'korean-bulgogi-beef': { spicy: 'none', flavors: ['sweet', 'savory', 'umami'] },
  'korean-army-stew': { spicy: 'medium', flavors: ['spicy', 'savory', 'rich'] },
  'korean-japchae': { spicy: 'none', flavors: ['savory', 'sweet', 'umami'] },
  'korean-karaage-chicken': { spicy: 'mild', flavors: ['savory', 'rich', 'spicy'] },
  'korean-dakgalbi': { spicy: 'hot', flavors: ['spicy', 'savory', 'sweet'] },
  'japanese-miso-soup': { spicy: 'none', flavors: ['umami', 'savory', 'light'] },
  'japanese-yakisoba': { spicy: 'none', flavors: ['savory', 'umami'] },
  'japanese-karaage': { spicy: 'none', flavors: ['savory', 'rich'] },
  'japanese-okonomiyaki': { spicy: 'none', flavors: ['savory', 'rich'] },
  'japanese-oyakodon': { spicy: 'none', flavors: ['sweet', 'savory', 'umami'] },
  'mexican-enchiladas': { spicy: 'medium', flavors: ['savory', 'spicy', 'rich'] },
  'mexican-fish-tacos': { spicy: 'mild', flavors: ['fresh', 'savory'] },
  'mexican-quesadilla': { spicy: 'mild', flavors: ['savory', 'rich'] },
  'mexican-chilaquiles': { spicy: 'medium', flavors: ['savory', 'spicy', 'rich'] },
  'mexican-huevos-rancheros': { spicy: 'medium', flavors: ['savory', 'spicy'] },
  'indian-dal-tadka': { spicy: 'medium', flavors: ['savory', 'spicy', 'rich'] },
  'indian-aloo-gobi': { spicy: 'mild', flavors: ['savory', 'spicy'] },
  'indian-chicken-tikka': { spicy: 'medium', flavors: ['savory', 'smoky'] },
  'indian-palak-paneer-style': { spicy: 'mild', flavors: ['savory', 'rich'] },
  'middle-eastern-hummus-bowl': { spicy: 'none', flavors: ['savory', 'fresh'] },
  'middle-eastern-kofta': { spicy: 'mild', flavors: ['savory', 'smoky'] },
  'middle-eastern-fattoush': { spicy: 'none', flavors: ['fresh', 'sour'] },
  'middle-eastern-mujadara': { spicy: 'none', flavors: ['savory', 'rich'] },
  'middle-eastern-stuffed-peppers': { spicy: 'mild', flavors: ['savory', 'rich'] },
  'vietnamese-bun-cha': { spicy: 'none', flavors: ['savory', 'sweet', 'fresh'] },
  'vietnamese-lemongrass-chicken': { spicy: 'none', flavors: ['fresh', 'savory'] },
  'vietnamese-spring-roll-bowl': { spicy: 'none', flavors: ['fresh', 'light'] },
  'vietnamese-caramel-fish': { spicy: 'mild', flavors: ['sweet', 'savory', 'umami'] },
  'mediterranean-ratatouille': { spicy: 'none', flavors: ['fresh', 'savory'] },
  'mediterranean-baked-feta-pasta': { spicy: 'none', flavors: ['rich', 'savory', 'fresh'] },
  ...CHINA_RECIPE_META,
  ...EXTRA_RECIPE_META,
  ...NATION_RECIPE_META,
};

const DEFAULT_META = { spicy: 'none', flavors: ['savory'] };

const SPICY_ICONS = {
  none: '',
  mild: '🌶',
  medium: '🌶🌶',
  hot: '🌶🌶🌶',
};

/** Search aliases for spicy & flavor (all languages). */
const TAG_SEARCH_ALIASES = {
  none: ['不辣', '免辣', 'not spicy', 'no spice'],
  mild: ['微辣', 'little spicy', 'mild'],
  medium: ['中辣', 'medium spicy', 'medium'],
  hot: ['大辣', '重辣', '很辣', 'hot', 'spicy hot'],
  savory: ['咸鲜', '咸', '鮮鹹', 'savory', 'salty'],
  sweet: ['甜', 'sweet', '甜味'],
  sour: ['酸', 'sour', '酸辣'],
  spicy: ['辣', 'spicy', '麻辣'],
  umami: ['鲜', '鮮', 'umami', '鲜香', '鮮香'],
  fresh: ['清新', '清淡', 'fresh', 'light fresh'],
  rich: ['浓郁', '濃郁', 'rich', 'heavy'],
  light: ['轻', '輕', 'light', '清爽'],
  smoky: ['烟熏', '煙燻', 'smoky', 'bbq'],
};

export function enrichRecipe(recipe) {
  const meta = RECIPE_META[recipe.id];
  if (meta) {
    return { ...recipe, spicy: meta.spicy, flavors: [...meta.flavors] };
  }
  if (recipe.spicy || (recipe.flavors && recipe.flavors.length)) {
    return {
      ...recipe,
      spicy: recipe.spicy || DEFAULT_META.spicy,
      flavors: Array.isArray(recipe.flavors) && recipe.flavors.length
        ? [...recipe.flavors]
        : [...DEFAULT_META.flavors],
    };
  }
  return { ...recipe, spicy: DEFAULT_META.spicy, flavors: [...DEFAULT_META.flavors] };
}

export function labelSpicy(spicy, lang) {
  const key = `tag.spicy.${spicy}`;
  const label = t(key);
  const icon = SPICY_ICONS[spicy] || '';
  return icon ? `${icon} ${label}` : label;
}

export function labelFlavor(flavor) {
  return t(`tag.flavor.${flavor}`);
}

export function getSpicyFilters() {
  return ['all', ...SPICY_LEVELS];
}

export function getFlavorFilters() {
  return FLAVOR_KEYS;
}

export function tagSearchTerms(recipe, lang) {
  const r = enrichRecipe(recipe);
  const terms = [
    labelSpicy(r.spicy, lang),
    ...r.flavors.map(labelFlavor),
  ];
  terms.push(r.spicy, ...r.flavors);
  r.flavors.forEach((f) => {
    (TAG_SEARCH_ALIASES[f] || []).forEach((a) => terms.push(a));
  });
  (TAG_SEARCH_ALIASES[r.spicy] || []).forEach((a) => terms.push(a));
  return terms;
}

export function renderRecipeTagHtml(recipe, lang) {
  const r = enrichRecipe(recipe);
  const spicyHtml = r.spicy !== 'none'
    ? `<span class="recipe-card__tag recipe-card__tag--spicy recipe-card__tag--${r.spicy}">${labelSpicy(r.spicy, lang)}</span>`
    : `<span class="recipe-card__tag recipe-card__tag--spicy recipe-card__tag--none">${labelSpicy('none', lang)}</span>`;
  const flavorHtml = r.flavors.slice(0, 3).map((f) =>
    `<span class="recipe-card__tag recipe-card__tag--flavor">${labelFlavor(f)}</span>`,
  ).join('');
  return spicyHtml + flavorHtml;
}

export function matchesTagFilters(recipe, { spicy = 'all', flavors = [] } = {}) {
  const r = enrichRecipe(recipe);
  if (spicy !== 'all' && r.spicy !== spicy) return false;
  if (flavors.length && !flavors.some((f) => r.flavors.includes(f))) return false;
  return true;
}

export function queryMatchesTags(query, recipe, lang) {
  const q = String(query).trim().toLowerCase();
  if (!q) return false;
  return tagSearchTerms(recipe, lang).some((term) =>
    term.toLowerCase().includes(q) || q.includes(term.toLowerCase()),
  );
}
