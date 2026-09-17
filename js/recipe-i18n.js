/** Recipe name and step translations — zh-CN & zh-TW. */

import { getLanguage } from './i18n.js';
import { displayIngredientList } from './ingredients.js';

const RECIPES = {
  'garlic-butter-pasta': {
    name: {
      'zh-CN': '蒜香黄油意大利面',
      'zh-TW': '蒜香奶油義大利麵',
    },
    steps: {
      'zh-CN': [
        '将一大锅盐水烧开。',
        '烧水的同时，将 4 瓣大蒜切末。',
        '按包装说明煮意大利面至弹牙状态。',
        '平底锅中火加热，融化 3 汤匙黄油和 1 汤匙橄榄油。加入蒜末，炒至香气溢出——不要烤焦。',
        '沥干意大利面，留取 ½ 杯煮面水。将面条拌入蒜香黄油，根据需要加入煮面水使酱汁丝滑。',
        '用盐和黑胡椒调味。撒上刨碎的奶酪，立即上桌。',
      ],
      'zh-TW': [
        '將一大鍋鹽水燒開。',
        '燒水的同時，將 4 瓣大蒜切末。',
        '按包裝說明煮義大利麵至彈牙狀態。',
        '平底鍋中火加熱，融化 3 湯匙奶油和 1 湯匙橄欖油。加入蒜末，炒至香氣溢出——不要烤焦。',
        '瀝乾義大利麵，留取 ½ 杯煮麵水。將麵條拌入蒜香奶油，根據需要加入煮麵水使醬汁絲滑。',
        '用鹽和黑胡椒調味。撒上刨碎的起司，立即上桌。',
      ],
    },
  },
  'chicken-stir-fry': {
    name: {
      'zh-CN': '经典鸡肉小炒',
      'zh-TW': '經典雞肉小炒',
    },
    steps: {
      'zh-CN': [
        '将鸡肉切成一口大小的块，用盐和黑胡椒调味。',
        '准备蔬菜：甜椒和洋葱切片，大蒜和姜切末。',
        '在炒锅或大平底锅中高火加热 2 汤匙油，至油面微微冒烟。',
        '将鸡肉单层铺入。不要翻动，先煎 2 分钟，再翻面至完全熟透。',
        '将鸡肉推到一边。加入大蒜和姜，翻炒 30 秒，再加入蔬菜。',
        '快炒蔬菜至爽脆，约 3–4 分钟。',
        '加入 3 汤匙酱油，将所有食材拌匀，配米饭上桌。',
      ],
      'zh-TW': [
        '將雞肉切成一口大小的塊，用鹽和黑胡椒調味。',
        '準備蔬菜：甜椒和洋蔥切片，大蒜和薑切末。',
        '在炒鍋或大平底鍋中高火加熱 2 湯匙油，至油面微微冒煙。',
        '將雞肉單層鋪入。不要翻動，先煎 2 分鐘，再翻面至完全熟透。',
        '將雞肉推到一邊。加入大蒜和薑，翻炒 30 秒，再加入蔬菜。',
        '快炒蔬菜至爽脆，約 3–4 分鐘。',
        '加入 3 湯匙醬油，將所有食材拌勻，配米飯上桌。',
      ],
    },
  },
  'veggie-fried-rice': {
    name: {
      'zh-CN': '蔬菜炒饭',
      'zh-TW': '蔬菜炒飯',
    },
    steps: {
      'zh-CN': [
        '若使用刚煮好的米饭，先摊开在盘子上冷却。冷饭或隔夜饭效果最佳。',
        '将洋葱和胡萝卜切丁，2 瓣大蒜切末。',
        '将 2 个鸡蛋加少许盐打散。',
        '炒锅高火加热 1 汤匙油。炒散鸡蛋，划成小块后盛出备用。',
        '再加少许油，放入洋葱和胡萝卜，快炒 2 分钟，加入蒜末。',
        '加入米饭，拨散结块，快炒 3–4 分钟至热透。',
        '倒回鸡蛋，加入 2 汤匙酱油，充分拌匀后上桌。',
      ],
      'zh-TW': [
        '若使用剛煮好的米飯，先攤開在盤子上冷卻。冷飯或隔夜飯效果最佳。',
        '將洋蔥和胡蘿蔔切丁，2 瓣大蒜切末。',
        '將 2 顆雞蛋加少許鹽打散。',
        '炒鍋高火加熱 1 湯匙油。炒散雞蛋，劃成小塊後盛出備用。',
        '再加少許油，放入洋蔥和胡蘿蔔，快炒 2 分鐘，加入蒜末。',
        '加入米飯，撥散結塊，快炒 3–4 分鐘至熱透。',
        '倒回雞蛋，加入 2 湯匙醬油，充分拌勻後上桌。',
      ],
    },
  },
  'tomato-basil-pasta': {
    name: {
      'zh-CN': '新鲜番茄罗勒意大利面',
      'zh-TW': '新鮮番茄羅勒義大利麵',
    },
    steps: {
      'zh-CN': [
        '烧一锅盐水，准备煮意大利面。',
        '将 4 个成熟番茄切丁，3 瓣大蒜切末，新鲜罗勒叶撕成小块。',
        '煮意大利面至弹牙状态。沥干前留取 ½ 杯煮面水。',
        '平底锅中火加热 3 汤匙橄榄油，加入蒜末，炒 1 分钟。',
        '加入番茄，加盐调味，小火慢炖至番茄化开成酱汁。',
        '将意大利面与酱汁、罗勒拌匀。加入煮面水调整浓稠度。',
        '淋上橄榄油后上桌。',
      ],
      'zh-TW': [
        '燒一鍋鹽水，準備煮義大利麵。',
        '將 4 顆成熟番茄切丁，3 瓣大蒜切末，新鮮羅勒葉撕成小塊。',
        '煮義大利麵至彈牙狀態。瀝乾前留取 ½ 杯煮麵水。',
        '平底鍋中火加熱 3 湯匙橄欖油，加入蒜末，炒 1 分鐘。',
        '加入番茄，加鹽調味，小火慢燉至番茄化開成醬汁。',
        '將義大利麵與醬汁、羅勒拌勻。加入煮麵水調整濃稠度。',
        '淋上橄欖油後上桌。',
      ],
    },
  },
  'creamy-mushroom-pasta': {
    name: {
      'zh-CN': '奶油蘑菇意大利面',
      'zh-TW': '奶油蘑菇義大利麵',
    },
    steps: {
      'zh-CN': [
        '蘑菇切片，洋葱切丁，2 瓣大蒜切末。',
        '烧盐水煮意大利面至弹牙状态。留取 ½ 杯煮面水。',
        '平底锅中高火融化 2 汤匙黄油，将蘑菇炒至金黄，约 5 分钟。',
        '加入洋葱和大蒜，炒至变软。',
        '倒入 ½ 杯奶油，小火慢炖 3 分钟。用盐和黑胡椒调味。',
        '将沥干的意大利面与酱汁拌匀，必要时用煮面水调稀。趁热上桌。',
      ],
      'zh-TW': [
        '蘑菇切片，洋蔥切丁，2 瓣大蒜切末。',
        '燒鹽水煮義大利麵至彈牙狀態。留取 ½ 杯煮麵水。',
        '平底鍋中高火融化 2 湯匙奶油，將蘑菇炒至金黃，約 5 分鐘。',
        '加入洋蔥和大蒜，炒至變軟。',
        '倒入 ½ 杯鮮奶油，小火慢燉 3 分鐘。用鹽和黑胡椒調味。',
        '將瀝乾的義大利麵與醬汁拌勻，必要時用煮麵水調稀。趁熱上桌。',
      ],
    },
  },
  shakshuka: {
    name: {
      'zh-CN': '北非蛋（番茄炖蛋）',
      'zh-TW': '北非蛋（番茄燉蛋）',
    },
    steps: {
      'zh-CN': [
        '将洋葱和甜椒切丁，3 瓣大蒜切末。',
        '平底锅中火加热 2 汤匙橄榄油，将洋葱和甜椒炒至变软，约 5 分钟。',
        '加入大蒜和 1 茶匙孜然（可选），炒 1 分钟。',
        '加入切丁的番茄（或 1 罐罐头番茄），小火慢炖至酱汁浓稠，约 10 分钟。',
        '在酱汁中挖出 4 个坑，各打入 1 个鸡蛋。盖锅盖至蛋白凝固、蛋黄仍流心。',
        '用盐、黑胡椒和新鲜香草调味。配面包蘸食。',
      ],
      'zh-TW': [
        '將洋蔥和甜椒切丁，3 瓣大蒜切末。',
        '平底鍋中火加熱 2 湯匙橄欖油，將洋蔥和甜椒炒至變軟，約 5 分鐘。',
        '加入大蒜和 1 茶匙孜然（可選），炒 1 分鐘。',
        '加入切丁的番茄（或 1 罐罐頭番茄），小火慢燉至醬汁濃稠，約 10 分鐘。',
        '在醬汁中挖出 4 個坑，各打入 1 顆雞蛋。蓋鍋蓋至蛋白凝固、蛋黃仍流心。',
        '用鹽、黑胡椒和新鮮香草調味。配麵包蘸食。',
      ],
    },
  },
  'simple-omelette': {
    name: {
      'zh-CN': '蓬松芝士欧姆蛋',
      'zh-TW': '蓬鬆起司歐姆蛋',
    },
    steps: {
      'zh-CN': [
        '将 3 个鸡蛋加少许盐打至均匀。',
        '将奶酪刨丝或切片。如有加料（蘑菇、菠菜），一并准备好。',
        '不粘锅中火偏低加热，融化 1 汤匙黄油。',
        '倒入蛋液。边缘凝固时，轻轻将熟的部分推向中心，同时倾斜锅子。',
        '大部分凝固但表面仍略湿时，在一半上铺上奶酪。',
        '将欧姆蛋对折。再煎 30 秒后滑入盘中。',
      ],
      'zh-TW': [
        '將 3 顆雞蛋加少許鹽打至均勻。',
        '將起司刨絲或切片。如有加料（蘑菇、菠菜），一併準備好。',
        '不沾鍋中火偏低加熱，融化 1 湯匙奶油。',
        '倒入蛋液。邊緣凝固時，輕輕將熟的部分推向中心，同時傾斜鍋子。',
        '大部分凝固但表面仍略濕時，在一半上鋪上起司。',
        '將歐姆蛋對折。再煎 30 秒後滑入盤中。',
      ],
    },
  },
  'tofu-coconut-curry': {
    name: {
      'zh-CN': '豆腐椰浆咖喱',
      'zh-TW': '豆腐椰漿咖哩',
    },
    steps: {
      'zh-CN': [
        '将豆腐压干水分后切块。洋葱切丁，大蒜和姜切末。',
        '锅中热油，将豆腐块煎至四面金黄后盛出备用。',
        '同一锅中将洋葱炒至半透明。加入大蒜和姜，炒 1 分钟。',
        '加入 1 罐椰浆和 1 汤匙咖喱粉（或咖喱酱）。小火慢炖 5 分钟。',
        '加入甜椒，放回豆腐，炖至甜椒变软。',
        '用盐和柠檬汁调味。配米饭上桌。',
      ],
      'zh-TW': [
        '將豆腐壓乾水分後切塊。洋蔥切丁，大蒜和薑切末。',
        '鍋中熱油，將豆腐塊煎至四面金黃後盛出備用。',
        '同一鍋中將洋蔥炒至半透明。加入大蒜和薑，炒 1 分鐘。',
        '加入 1 罐椰漿和 1 湯匙咖哩粉（或咖哩醬）。小火慢燉 5 分鐘。',
        '加入甜椒，放回豆腐，燉至甜椒變軟。',
        '用鹽和檸檬汁調味。配米飯上桌。',
      ],
    },
  },
  'roasted-potatoes': {
    name: {
      'zh-CN': '香脆烤土豆',
      'zh-TW': '香脆烤馬鈴薯',
    },
    steps: {
      'zh-CN': [
        '烤箱预热至 220°C（425°F）。',
        '将土豆切成 2 厘米大小的块。冷水浸泡 10 分钟后沥干，用厨房纸擦干。',
        '将土豆与 2 汤匙橄榄油、盐和蒜末拌匀。',
        '单层铺在烤盘上。烤 25–30 分钟，中途翻面一次。',
        '外表金黄酥脆、内部松软即完成。调味后上桌。',
      ],
      'zh-TW': [
        '烤箱預熱至 220°C（425°F）。',
        '將馬鈴薯切成 2 公分大小的塊。冷水浸泡 10 分鐘後瀝乾，用廚房紙巾擦乾。',
        '將馬鈴薯與 2 湯匙橄欖油、鹽和蒜末拌勻。',
        '單層鋪在烤盤上。烤 25–30 分鐘，中途翻面一次。',
        '外表金黃酥脆、內部鬆軟即完成。調味後上桌。',
      ],
    },
  },
  'beef-tacos': {
    name: {
      'zh-CN': '快手牛肉塔可',
      'zh-TW': '快手牛肉塔可',
    },
    steps: {
      'zh-CN': [
        '将洋葱和番茄切丁，奶酪刨丝。如有玉米饼，先加热。',
        '平底锅中高火将牛肉末煎香，边煎边拨散。',
        '倒掉多余油脂，加入洋葱炒至变软。',
        '加入 1 汤匙塔可调料（或孜然、辣椒粉、盐），加少许水，小火慢炖 2 分钟。',
        '在玉米饼上填入牛肉，铺上番茄和奶酪。如有牛油果和香菜，可一并加入。',
      ],
      'zh-TW': [
        '將洋蔥和番茄切丁，起司刨絲。如有玉米餅，先加熱。',
        '平底鍋中高火將牛肉末煎香，邊煎邊撥散。',
        '倒掉多餘油脂，加入洋蔥炒至變軟。',
        '加入 1 湯匙塔可調料（或孜然、辣椒粉、鹽），加少許水，小火慢燉 2 分鐘。',
        '在玉米餅上填入牛肉，鋪上番茄和起司。如有酪梨和香菜，可一併加入。',
      ],
    },
  },
};

/** Improvised recipe names and step templates (see buildImprovisedRecipe). */
const IMPROVISED = {
  name: {
    bowl: {
      'zh-CN': '自定义蛋白质碳水碗',
      'zh-TW': '自訂蛋白質碳水碗',
    },
    protein: {
      'zh-CN': '简单香煎蛋白质',
      'zh-TW': '簡單香煎蛋白質',
    },
    veggie: {
      'zh-CN': '快手蔬菜小炒',
      'zh-TW': '快手蔬菜小炒',
    },
  },
  steps: {
    gather: {
      'zh-CN': '准备食材：{ingredients}。洗净、切好、量好，再开始烹饪。',
      'zh-TW': '準備食材：{ingredients}。洗淨、切好、量好，再開始烹飪。',
    },
    heatOil: {
      'zh-CN': '平底锅中高火加热 1–2 汤匙油，至油面微微冒烟。',
      'zh-TW': '平底鍋中高火加熱 1–2 湯匙油，至油面微微冒煙。',
    },
    protein: {
      'zh-CN': '先烹饪蛋白质——煎至表面焦香、内部熟透。若需与其他食材混合，先盛出备用。',
      'zh-TW': '先烹飪蛋白質——煎至表面焦香、內部熟透。若需與其他食材混合，先盛出備用。',
    },
    aromatics: {
      'zh-CN': '如有大蒜、洋葱、姜等香料，加入锅中，炒至香气溢出，约 1 分钟。',
      'zh-TW': '如有大蒜、洋蔥、薑等香料，加入鍋中，炒至香氣溢出，約 1 分鐘。',
    },
    veggies: {
      'zh-CN': '加入其余蔬菜和食材。快炒或香煎至你喜欢的熟度。',
      'zh-TW': '加入其餘蔬菜和食材。快炒或香煎至你喜歡的熟度。',
    },
    carb: {
      'zh-CN': '若使用米饭或意大利面，确保已煮熟并保温。与锅中内容物混合，或分盘搭配。',
      'zh-TW': '若使用米飯或義大利麵，確保已煮熟並保溫。與鍋中內容物混合，或分盤搭配。',
    },
    season: {
      'zh-CN': '用盐、黑胡椒和你手边的酱料（酱油、柠檬汁等）调味。尝味调整，立即上桌！',
      'zh-TW': '用鹽、黑胡椒和你手邊的醬料（醬油、檸檬汁等）調味。嘗味調整，立即上桌！',
    },
  },
};

function fillTemplate(template, params = {}) {
  let str = template;
  Object.entries(params).forEach(([k, v]) => {
    str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  });
  return str;
}

export function localizeRecipe(recipe, lang) {
  if (!recipe) return recipe;
  const tr = RECIPES[recipe.id];
  const name = lang === 'en'
    ? (recipe.name || recipe.names?.en)
    : (tr?.name?.[lang] || recipe.names?.[lang] || recipe.name);
  return {
    ...recipe,
    name,
    steps: recipe.steps.map((s, i) => ({
      ...s,
      instruction:
        tr?.steps?.[lang]?.[i]
        || s.instructions?.[lang]
        || (lang === 'en' ? s.instruction : (s.instructions?.['zh-CN'] || s.instruction)),
    })),
  };
}

export function getImprovisedName(type, lang) {
  return IMPROVISED.name[type]?.[lang] || IMPROVISED.name[type]?.['zh-CN'] || null;
}

/** Localize a single improvised step template by key. */
export function getImprovisedStep(key, lang, params = {}) {
  const template = IMPROVISED.steps[key]?.[lang] || IMPROVISED.steps[key]?.['zh-CN'];
  if (!template) return null;
  return fillTemplate(template, params);
}

/** Localize an improvised recipe (name + all steps). */
export function localizeImprovisedRecipe(recipe, lang) {
  if (!recipe?.improvised || lang === 'en') return recipe;

  let nameType = recipe.improvisedType;
  if (!nameType) {
    const hasProtein = recipe.steps.some((s) =>
      s.instruction.includes('Cook your protein first')
    );
    const hasCarb = recipe.steps.some((s) =>
      s.instruction.includes('If using rice or pasta')
    );
    nameType = hasProtein && hasCarb ? 'bowl' : hasProtein ? 'protein' : 'veggie';
  }

  const ingredientKeys = recipe.ingredients || [];
  const localizedName = getImprovisedName(nameType, lang) || recipe.name;

  const stepKeys = ['gather', 'heatOil'];
  if (nameType === 'bowl' || nameType === 'protein') stepKeys.push('protein');
  stepKeys.push('aromatics', 'veggies');
  if (nameType === 'bowl') stepKeys.push('carb');
  stepKeys.push('season');

  const localizedSteps = recipe.steps.map((step, i) => {
    const key = stepKeys[i];
    if (!key) return step;
    const params = key === 'gather'
      ? { ingredients: displayIngredientList(ingredientKeys, lang) }
      : {};
    const instruction = getImprovisedStep(key, lang, params) || step.instruction;
    return { ...step, instruction };
  });

  return { ...recipe, name: localizedName, steps: localizedSteps };
}

/** Resolve language from argument or current app setting. */
export function resolveRecipeLang(lang) {
  return lang || getLanguage();
}
