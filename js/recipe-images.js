/** Hero images + intros for the recipe detail view. */

export const RECIPE_IMAGES = {
  'pan-seared-lamb-egg-greens': {
    image: 'assets/recipes/pan-seared-lamb-egg-greens.png',
    intros: {
      'zh-CN': '羊排先高温锁汁，再用同一口锅快炒菜心、煎蛋——一锅出主菜，不用再被蛋炒饭挤到前面。适合冰箱里刚好看得到羊肉和时蔬的晚餐。',
      'zh-TW': '羊排先高溫鎖汁，再用同一口鍋快炒菜心、煎蛋——一鍋出主菜，不用再被蛋炒飯擠到前面。適合冰箱裡剛好看得到羊肉和時蔬的晚餐。',
      en: 'Sear lamb chops until golden, then use the same pan for choy sum and eggs — a real main on one plate, not another rice filler. Perfect when you have lamb and greens on hand.',
    },
  },
  'cumin-lamb-chops-choy-sum': {
    image: 'assets/recipes/cumin-lamb-chops-choy-sum.png',
    intros: {
      'zh-CN': '羊排切条快炒，孜然和酱油提香，同一口锅接着炒菜心——有羊排就该做这种主菜，而不是又被蛋炒饭顶到前面。',
      'zh-TW': '羊排切條快炒，孜然和醬油提香，同一口鍋接著炒菜心——有羊排就該做這種主菜，而不是又被蛋炒飯頂到前面。',
      en: 'Lamb strips hit the wok with cumin and soy, then choy sum follows in the same pan — the kind of protein-forward main this app should surface first.',
    },
  },
  'onion-braised-lamb-chops': {
    image: 'assets/recipes/onion-braised-lamb-chops.png',
    intros: {
      'zh-CN': '先煎香羊排，再和洋葱一起焖到软烂入味——汁浓肉嫩，是典型的家常硬菜，配饭配面都合适。',
      'zh-TW': '先煎香羊排，再和洋蔥一起燜到軟爛入味——汁濃肉嫩，是典型的家常硬菜，配飯配麵都合適。',
      en: 'Sear lamb chops, then braise them with sweet onions until the gravy turns glossy — a comforting main worth the extra minutes.',
    },
  },
  'tomato-scrambled-eggs': {
    image: 'assets/recipes/tomato-scrambled-eggs.png',
    intros: {
      'zh-CN': '番茄先出汁，再下蛋划成嫩块——国民下饭菜，十分钟上桌，酸甜咸鲜刚好。',
      'zh-TW': '番茄先出汁，再下蛋劃成嫩塊——國民下飯菜，十分鐘上桌，酸甜鹹鮮剛好。',
      en: 'Tomatoes break down into a jammy sauce before eggs fold in — the classic ten-minute comfort dish that never gets old.',
    },
  },
  'crispy-skin-pan-duck': {
    image: 'assets/recipes/crispy-skin-pan-duck.png',
    intros: {
      'zh-CN': '鸭胸皮朝下慢慢逼出油脂，再翻面煎到脆皮焦香——比外卖更值得的周末主菜。',
      'zh-TW': '鴨胸皮朝下慢慢逼出油脂，再翻面煎到脆皮焦香——比外賣更值得的週末主菜。',
      en: 'Render duck breast skin-side down until shatteringly crisp, then glaze and slice — a weekend main that feels restaurant-worthy.',
    },
  },
  'black-pepper-beef-onion': {
    image: 'assets/recipes/black-pepper-beef-onion.png',
    intros: {
      'zh-CN': '牛肉大火快炒，黑椒和洋葱带出香气——港式茶餐厅同款，家里也能十分钟复刻。',
      'zh-TW': '牛肉大火快炒，黑椒和洋蔥帶出香氣——港式茶餐廳同款，家裡也能十分鐘復刻。',
      en: 'Beef and onions over high heat with cracked pepper — café-style stir-fry you can pull off on a weeknight.',
    },
  },
  'garlic-butter-scallops': {
    image: 'assets/recipes/garlic-butter-scallops.png',
    intros: {
      'zh-CN': '扇贝吸干水后大火煎到两面金黄，黄油和蒜一淋就香——宴客也拿得出手的快手中餐。',
      'zh-TW': '扇貝吸乾水後大火煎到兩面金黃，黃油和蒜一淋就香——宴客也拿得出手的快手中餐。',
      en: 'Pat scallops dry, sear until golden, then finish with garlic butter — fast enough for Tuesday, fancy enough for guests.',
    },
  },
};

export function getRecipeImageMeta(recipeId) {
  return RECIPE_IMAGES[recipeId] || null;
}

export function getRecipeIntro(recipeId, lang = 'zh-CN') {
  const meta = RECIPE_IMAGES[recipeId];
  if (!meta?.intros) return '';
  return meta.intros[lang] || meta.intros['zh-CN'] || meta.intros.en || '';
}

export function getRecipeImageUrl(recipeId) {
  return RECIPE_IMAGES[recipeId]?.image || '';
}
