/** Ingredient names, Chinese aliases, and normalization. */

export const INGREDIENTS = {
  chicken: { en: 'chicken', 'zh-CN': '鸡肉', 'zh-TW': '雞肉', aliases: ['鸡', '雞'] },
  beef: { en: 'beef', 'zh-CN': '牛肉', 'zh-TW': '牛肉', aliases: ['牛'] },
  pork: { en: 'pork', 'zh-CN': '猪肉', 'zh-TW': '豬肉', aliases: ['猪', '豬'] },
  fish: { en: 'fish', 'zh-CN': '鱼', 'zh-TW': '魚', aliases: ['鱼肉', '魚肉'] },
  shrimp: { en: 'shrimp', 'zh-CN': '虾', 'zh-TW': '蝦', aliases: ['虾仁', '蝦仁'] },
  tofu: { en: 'tofu', 'zh-CN': '豆腐', 'zh-TW': '豆腐', aliases: [] },
  eggs: { en: 'eggs', 'zh-CN': '鸡蛋', 'zh-TW': '雞蛋', aliases: ['蛋', '雞蛋'] },
  rice: { en: 'rice', 'zh-CN': '米饭', 'zh-TW': '米飯', aliases: ['米', '饭', '飯', '白米'] },
  pasta: { en: 'pasta', 'zh-CN': '意大利面', 'zh-TW': '義大利麵', aliases: ['意面', '義麵', '通心粉'] },
  noodles: { en: 'noodles', 'zh-CN': '面条', 'zh-TW': '麵條', aliases: ['面', '麵'] },
  bread: { en: 'bread', 'zh-CN': '面包', 'zh-TW': '麵包', aliases: [] },
  potato: { en: 'potato', 'zh-CN': '土豆', 'zh-TW': '馬鈴薯', aliases: ['马铃薯', '馬鈴薯'] },
  onion: { en: 'onion', 'zh-CN': '洋葱', 'zh-TW': '洋蔥', aliases: ['葱', '蔥'] },
  garlic: { en: 'garlic', 'zh-CN': '大蒜', 'zh-TW': '大蒜', aliases: ['蒜', '蒜头', '蒜頭'] },
  tomato: { en: 'tomato', 'zh-CN': '番茄', 'zh-TW': '番茄', aliases: ['西红柿', '西紅柿'] },
  'bell pepper': { en: 'bell pepper', 'zh-CN': '甜椒', 'zh-TW': '甜椒', aliases: ['彩椒', '灯笼椒', '燈籠椒', '青椒', '甜椒'] },
  carrot: { en: 'carrot', 'zh-CN': '胡萝卜', 'zh-TW': '胡蘿蔔', aliases: ['红萝卜', '紅蘿蔔'] },
  broccoli: { en: 'broccoli', 'zh-CN': '西兰花', 'zh-TW': '西蘭花', aliases: ['花椰菜'] },
  spinach: { en: 'spinach', 'zh-CN': '菠菜', 'zh-TW': '菠菜', aliases: [] },
  mushroom: { en: 'mushroom', 'zh-CN': '蘑菇', 'zh-TW': '蘑菇', aliases: ['香菇', '口蘑'] },
  cheese: { en: 'cheese', 'zh-CN': '奶酪', 'zh-TW': '起司', aliases: ['芝士', '乳酪'] },
  butter: { en: 'butter', 'zh-CN': '黄油', 'zh-TW': '奶油', aliases: ['牛油'] },
  'olive oil': { en: 'olive oil', 'zh-CN': '橄榄油', 'zh-TW': '橄欖油', aliases: [] },
  'soy sauce': { en: 'soy sauce', 'zh-CN': '酱油', 'zh-TW': '醬油', aliases: ['生抽', '老抽'] },
  lemon: { en: 'lemon', 'zh-CN': '柠檬', 'zh-TW': '檸檬', aliases: [] },
  ginger: { en: 'ginger', 'zh-CN': '姜', 'zh-TW': '薑', aliases: ['生姜', '生薑'] },
  chili: { en: 'chili', 'zh-CN': '辣椒', 'zh-TW': '辣椒', aliases: [' chilli', '辣椒'] },
  cream: { en: 'cream', 'zh-CN': '奶油', 'zh-TW': '鮮奶油', aliases: ['淡奶油'] },
  milk: { en: 'milk', 'zh-CN': '牛奶', 'zh-TW': '牛奶', aliases: [] },
  flour: { en: 'flour', 'zh-CN': '面粉', 'zh-TW': '麵粉', aliases: [] },
  basil: { en: 'basil', 'zh-CN': '罗勒', 'zh-TW': '羅勒', aliases: ['九层塔', '九層塔'] },
  cilantro: { en: 'cilantro', 'zh-CN': '香菜', 'zh-TW': '香菜', aliases: ['芫荽'] },
  bacon: { en: 'bacon', 'zh-CN': '培根', 'zh-TW': '培根', aliases: [] },
  sausage: { en: 'sausage', 'zh-CN': '香肠', 'zh-TW': '香腸', aliases: [] },
  avocado: { en: 'avocado', 'zh-CN': '牛油果', 'zh-TW': '酪梨', aliases: ['鳄梨', '鱷梨'] },
  corn: { en: 'corn', 'zh-CN': '玉米', 'zh-TW': '玉米', aliases: [] },
  beans: { en: 'beans', 'zh-CN': '豆子', 'zh-TW': '豆子', aliases: ['豆'] },
  lentils: { en: 'lentils', 'zh-CN': '扁豆', 'zh-TW': '扁豆', aliases: [] },
  'coconut milk': { en: 'coconut milk', 'zh-CN': '椰浆', 'zh-TW': '椰漿', aliases: ['椰奶', '椰汁'] },
  peas: { en: 'peas', 'zh-CN': '豌豆', 'zh-TW': '豌豆', aliases: ['青豆'] },
  rosemary: { en: 'rosemary', 'zh-CN': '迷迭香', 'zh-TW': '迷迭香', aliases: [] },
  eggplant: { en: 'eggplant', 'zh-CN': '茄子', 'zh-TW': '茄子', aliases: ['紫茄'] },
  cucumber: { en: 'cucumber', 'zh-CN': '黄瓜', 'zh-TW': '小黃瓜', aliases: ['青瓜', '黃瓜'] },
  peanuts: { en: 'peanuts', 'zh-CN': '花生', 'zh-TW': '花生', aliases: ['花生米'] },
  vinegar: { en: 'vinegar', 'zh-CN': '醋', 'zh-TW': '醋', aliases: ['米醋', '陈醋', '陳醋'] },
  sugar: { en: 'sugar', 'zh-CN': '糖', 'zh-TW': '糖', aliases: ['白糖', '冰糖', '砂糖'] },
  lettuce: { en: 'lettuce', 'zh-CN': '生菜', 'zh-TW': '生菜', aliases: ['莴苣', '萵苣'] },
  'green beans': { en: 'green beans', 'zh-CN': '四季豆', 'zh-TW': '四季豆', aliases: ['豆角', '长豆角', '長豆角'] },
  miso: { en: 'miso', 'zh-CN': '味噌', 'zh-TW': '味噌', aliases: ['味增'] },
  gochujang: { en: 'gochujang', 'zh-CN': '韩式辣酱', 'zh-TW': '韓式辣醬', aliases: ['韩国辣酱', '韓國辣醬', '辣酱'] },
  chickpeas: { en: 'chickpeas', 'zh-CN': '鹰嘴豆', 'zh-TW': '鷹嘴豆', aliases: ['鹰嘴豆', '鷹嘴豆'] },
  yogurt: { en: 'yogurt', 'zh-CN': '酸奶', 'zh-TW': '優格', aliases: ['优格', '優格', '希腊酸奶'] },
  lime: { en: 'lime', 'zh-CN': '青柠', 'zh-TW': '青檸', aliases: ['柠檬青', 'lime'] },
  cabbage: { en: 'cabbage', 'zh-CN': '卷心菜', 'zh-TW': '高麗菜', aliases: ['包菜', '高丽菜', '白菜'] },
  honey: { en: 'honey', 'zh-CN': '蜂蜜', 'zh-TW': '蜂蜜', aliases: ['蜜'] },
  oregano: { en: 'oregano', 'zh-CN': '牛至', 'zh-TW': '牛至', aliases: ['奥regano'] },
  cumin: { en: 'cumin', 'zh-CN': '孜然', 'zh-TW': '孜然', aliases: ['小茴香'] },
  paprika: { en: 'paprika', 'zh-CN': '红椒粉', 'zh-TW': '紅椒粉', aliases: ['paprika粉'] },
  mango: { en: 'mango', 'zh-CN': '芒果', 'zh-TW': '芒果', aliases: [] },
  'sweet potato': { en: 'sweet potato', 'zh-CN': '红薯', 'zh-TW': '地瓜', aliases: ['番薯', '地瓜', 'sweet potato'] },
  lamb: { en: 'lamb', 'zh-CN': '羊肉', 'zh-TW': '羊肉', aliases: ['羊'] },
  greens: { en: 'greens', 'zh-CN': '时蔬', 'zh-TW': '時蔬', aliases: ['荠菜', '薺菜', '青菜', '蔬菜', '嫩菜'] },
  'bitter melon': { en: 'bitter melon', 'zh-CN': '苦瓜', 'zh-TW': '苦瓜', aliases: [] },
  'winter melon': { en: 'winter melon', 'zh-CN': '冬瓜', 'zh-TW': '冬瓜', aliases: [] },
  salt: { en: 'salt', 'zh-CN': '盐', 'zh-TW': '鹽', aliases: [] },
  pepper: { en: 'pepper', 'zh-CN': '胡椒', 'zh-TW': '胡椒', aliases: ['黑胡椒', '白胡椒'] },
  oil: { en: 'oil', 'zh-CN': '油', 'zh-TW': '油', aliases: ['食用油', '植物油'] },
  sesame: { en: 'sesame', 'zh-CN': '芝麻', 'zh-TW': '芝麻', aliases: ['白芝麻', '黑芝麻'] },
  'sesame oil': { en: 'sesame oil', 'zh-CN': '香油', 'zh-TW': '香油', aliases: ['芝麻油', '荏油'] },
  'green onion': { en: 'green onion', 'zh-CN': '葱', 'zh-TW': '蔥', aliases: ['葱花', '蔥花', '大葱', '大蔥'] },
  'oyster sauce': { en: 'oyster sauce', 'zh-CN': '蚝油', 'zh-TW': '蠔油', aliases: [] },
  egg: { en: 'egg', 'zh-CN': '鸡蛋', 'zh-TW': '雞蛋', aliases: ['蛋'] },
  'bamboo shoots': { en: 'bamboo shoots', 'zh-CN': '竹笋', 'zh-TW': '竹筍', aliases: ['笋', '筍'] },
  'bean sprouts': { en: 'bean sprouts', 'zh-CN': '豆芽', 'zh-TW': '豆芽', aliases: [] },
  beer: { en: 'beer', 'zh-CN': '啤酒', 'zh-TW': '啤酒', aliases: [] },
  'blood tofu': { en: 'blood tofu', 'zh-CN': '血豆腐', 'zh-TW': '血豆腐', aliases: ['血旺'] },
  dates: { en: 'dates', 'zh-CN': '红枣', 'zh-TW': '紅棗', aliases: ['枣', '棗'] },
  ham: { en: 'ham', 'zh-CN': '火腿', 'zh-TW': '火腿', aliases: [] },
  ketchup: { en: 'ketchup', 'zh-CN': '番茄酱', 'zh-TW': '番茄醬', aliases: ['番茄沙司'] },
  lemongrass: { en: 'lemongrass', 'zh-CN': '香茅', 'zh-TW': '香茅', aliases: [] },
  lotus: { en: 'lotus', 'zh-CN': '莲藕', 'zh-TW': '蓮藕', aliases: ['莲', '蓮'] },
  mustard: { en: 'mustard', 'zh-CN': '芥末', 'zh-TW': '芥末', aliases: ['黄芥末'] },
  pineapple: { en: 'pineapple', 'zh-CN': '菠萝', 'zh-TW': '鳳梨', aliases: ['凤梨', '鳳梨'] },
  tea: { en: 'tea', 'zh-CN': '茶叶', 'zh-TW': '茶葉', aliases: ['茶'] },
  water: { en: 'water', 'zh-CN': '水', 'zh-TW': '水', aliases: [] },
  wine: { en: 'wine', 'zh-CN': '料酒', 'zh-TW': '料酒', aliases: ['酒', '黄酒', '黃酒'] },
};

export const CANONICAL_LIST = Object.keys(INGREDIENTS);
export const QUICK_ADD_KEYS = ['chicken', 'rice', 'garlic', 'onion', 'eggs', 'tomato', 'pasta', 'tofu'];

const lookup = new Map();

function addLookup(term, key) {
  if (!term) return;
  lookup.set(term.toLowerCase(), key);
  lookup.set(term, key);
}

for (const [key, data] of Object.entries(INGREDIENTS)) {
  addLookup(key, key);
  addLookup(data.en, key);
  addLookup(data['zh-CN'], key);
  addLookup(data['zh-TW'], key);
  for (const alias of data.aliases || []) addLookup(alias, key);
}

export function normalizeIngredient(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;

  const direct = lookup.get(raw) || lookup.get(raw.toLowerCase());
  if (direct) return direct;

  for (const [key, data] of Object.entries(INGREDIENTS)) {
    const terms = [key, data.en, data['zh-CN'], data['zh-TW'], ...(data.aliases || [])];
    for (const term of terms) {
      if (raw.toLowerCase() === term.toLowerCase() || raw === term) return key;
    }
  }

  for (const [key, data] of Object.entries(INGREDIENTS)) {
    const terms = [key, data.en, data['zh-CN'], data['zh-TW'], ...(data.aliases || [])];
    for (const term of terms) {
      if (raw.includes(term) || term.includes(raw)) return key;
    }
  }

  return raw.toLowerCase().replace(/\s+/g, ' ');
}

const INGREDIENT_ALIASES = {
  egg: 'eggs',
  scallion: 'green onion',
  'spring onion': 'green onion',
  'sesame seeds': 'sesame',
};

export function displayIngredient(key, lang = 'en') {
  const normalized = normalizeIngredient(key) || key;
  const canonical = INGREDIENT_ALIASES[normalized] || normalized;
  const data = INGREDIENTS[canonical];
  if (!data) return key;
  if (lang === 'zh-CN') return data['zh-CN'];
  if (lang === 'zh-TW') return data['zh-TW'];
  return data.en;
}

export function getSuggestions(lang = 'en') {
  return CANONICAL_LIST.map((key) => ({
    key,
    label: displayIngredient(key, lang),
  }));
}

export function getQuickAdd(lang = 'en') {
  return QUICK_ADD_KEYS.map((key) => ({
    key,
    label: displayIngredient(key, lang),
  }));
}

export function displayIngredientList(keys, lang = 'en') {
  return keys.map((k) => displayIngredient(k, lang)).join(lang.startsWith('zh') ? '、' : ', ');
}
