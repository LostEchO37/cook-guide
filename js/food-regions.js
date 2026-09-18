/** Geographic food culture map — countries, regions, and linked recipes. */

export const FOOD_COUNTRIES = [
  { id: 'china', lat: 35, lng: 103, emoji: '🇨🇳', names: { en: 'China', 'zh-CN': '中国', 'zh-TW': '中國' } },
  { id: 'thailand', lat: 14, lng: 101, emoji: '🇹🇭', names: { en: 'Thailand', 'zh-CN': '泰国', 'zh-TW': '泰國' } },
  { id: 'korea', lat: 36.5, lng: 128, emoji: '🇰🇷', names: { en: 'Korea', 'zh-CN': '韩国', 'zh-TW': '韓國' } },
  { id: 'japan', lat: 36, lng: 138, emoji: '🇯🇵', names: { en: 'Japan', 'zh-CN': '日本', 'zh-TW': '日本' } },
  { id: 'vietnam', lat: 16, lng: 108, emoji: '🇻🇳', names: { en: 'Vietnam', 'zh-CN': '越南', 'zh-TW': '越南' } },
  { id: 'india', lat: 22, lng: 79, emoji: '🇮🇳', names: { en: 'India', 'zh-CN': '印度', 'zh-TW': '印度' } },
  { id: 'mexico', lat: 23, lng: -102, emoji: '🇲🇽', names: { en: 'Mexico', 'zh-CN': '墨西哥', 'zh-TW': '墨西哥' } },
  { id: 'middle-east', lat: 31, lng: 45, emoji: '🕌', names: { en: 'Middle East', 'zh-CN': '中东', 'zh-TW': '中東' } },
  { id: 'mediterranean', lat: 40, lng: 18, emoji: '🫒', names: { en: 'Mediterranean', 'zh-CN': '地中海', 'zh-TW': '地中海' } },
  { id: 'western', lat: 42, lng: -96, emoji: '🍔', names: { en: 'Americas & Europe', 'zh-CN': '欧美', 'zh-TW': '歐美' } },
  { id: 'philippines', lat: 12, lng: 122, emoji: '🇵🇭', names: { en: 'Philippines', 'zh-CN': '菲律宾', 'zh-TW': '菲律賓' } },
  { id: 'indonesia', lat: -2, lng: 118, emoji: '🇮🇩', names: { en: 'Indonesia', 'zh-CN': '印度尼西亚', 'zh-TW': '印尼' } },
  { id: 'malaysia', lat: 4, lng: 102, emoji: '🇲🇾', names: { en: 'Malaysia', 'zh-CN': '马来西亚', 'zh-TW': '馬來西亞' } },
  { id: 'singapore', lat: 1.3, lng: 103.8, emoji: '🇸🇬', names: { en: 'Singapore', 'zh-CN': '新加坡', 'zh-TW': '新加坡' } },
  { id: 'south-america', lat: -15, lng: -60, emoji: '🌎', names: { en: 'South America', 'zh-CN': '南美洲', 'zh-TW': '南美洲' } },
  { id: 'morocco', lat: 32, lng: -5, emoji: '🇲🇦', names: { en: 'Morocco', 'zh-CN': '摩洛哥', 'zh-TW': '摩洛哥' } },
  { id: 'ethiopia', lat: 9, lng: 40, emoji: '🇪🇹', names: { en: 'Ethiopia', 'zh-CN': '埃塞俄比亚', 'zh-TW': '衣索比亞' } },
  { id: 'nigeria', lat: 9, lng: 8, emoji: '🇳🇬', names: { en: 'Nigeria', 'zh-CN': '尼日利亚', 'zh-TW': '奈及利亞' } },
  { id: 'france', lat: 46, lng: 2, emoji: '🇫🇷', names: { en: 'France', 'zh-CN': '法国', 'zh-TW': '法國' } },
  { id: 'spain', lat: 40, lng: -3, emoji: '🇪🇸', names: { en: 'Spain', 'zh-CN': '西班牙', 'zh-TW': '西班牙' } },
];

/** Simplified map outlines (viewBox 0 0 100 100) + region pin positions. */
export const COUNTRY_MAPS = {
  china: {
    viewBox: '0 0 100 100',
    // Mainland + Hainan + Taiwan (simplified but recognizable silhouette)
    paths: [
      {
        // Mainland incl. northeast — single contiguous shape
        d: 'M 14,36 L 13,28 L 18,20 L 28,15 L 40,13 L 52,14 L 64,16 L 74,19 L 80,16 L 87,17 L 90,23 L 88,29 L 82,30 L 81,38 L 78,46 L 74,54 L 69,62 L 62,70 L 52,76 L 42,74 L 34,68 L 26,60 L 20,50 L 16,42 Z',
      },
      {
        d: 'M 52,78 L 56,76 L 58,80 L 55,83 Z',
      },
      {
        d: 'M 84,64 L 88,62 L 91,67 L 90,73 L 86,76 L 83,71 Z',
      },
    ],
  },
  thailand: {
    outline: 'M48,8 L58,25 L62,45 L55,65 L50,88 L45,65 L42,45 L46,25 Z',
    viewBox: '0 0 100 100',
  },
  korea: {
    outline: 'M46,12 L54,12 L56,45 L54,88 L46,88 L44,45 Z',
    viewBox: '0 0 100 100',
  },
  japan: {
    outline: 'M52,15 L58,30 L56,55 L54,80 L50,80 L48,55 L46,30 Z M62,25 L66,45 L64,70 L60,70 L58,45 Z',
    viewBox: '0 0 100 100',
  },
  vietnam: {
    outline: 'M48,10 L56,35 L52,60 L48,90 L44,60 L42,35 Z',
    viewBox: '0 0 100 100',
  },
  india: {
    outline: 'M35,15 L55,12 L70,25 L75,45 L68,70 L50,85 L30,75 L22,50 L28,28 Z',
    viewBox: '0 0 100 100',
  },
  mexico: {
    outline: 'M25,20 L45,15 L65,22 L72,40 L68,65 L50,80 L30,72 L20,50 Z',
    viewBox: '0 0 100 100',
  },
  'middle-east': {
    outline: 'M15,35 L45,25 L75,30 L88,50 L80,70 L50,78 L25,68 L12,50 Z',
    viewBox: '0 0 100 100',
  },
  mediterranean: {
    outline: 'M10,40 L35,25 L60,20 L85,35 L90,55 L70,75 L40,80 L15,65 Z',
    viewBox: '0 0 100 100',
  },
  western: {
    outline: 'M12,30 L40,18 L68,28 L85,48 L78,72 L48,82 L22,70 L8,50 Z',
    viewBox: '0 0 100 100',
  },
  philippines: { outline: 'M55,20 L70,35 L65,70 L50,85 L40,60 L45,35 Z', viewBox: '0 0 100 100' },
  indonesia: { outline: 'M10,45 L40,40 L70,48 L90,55 L75,65 L40,60 L15,55 Z', viewBox: '0 0 100 100' },
  malaysia: { outline: 'M20,40 L55,35 L70,45 L60,55 L30,55 Z M72,55 L85,60 L80,70 L70,65 Z', viewBox: '0 0 100 100' },
  singapore: { outline: 'M40,45 L60,42 L65,55 L45,58 Z', viewBox: '0 0 100 100' },
  'south-america': { outline: 'M45,10 L60,20 L58,55 L50,90 L40,70 L38,40 Z', viewBox: '0 0 100 100' },
  morocco: { outline: 'M30,25 L55,20 L70,40 L60,70 L35,65 L25,45 Z', viewBox: '0 0 100 100' },
  ethiopia: { outline: 'M35,25 L65,22 L75,45 L60,75 L35,70 L25,45 Z', viewBox: '0 0 100 100' },
  nigeria: { outline: 'M30,30 L70,28 L75,60 L50,75 L28,60 Z', viewBox: '0 0 100 100' },
  france: { outline: 'M35,20 L60,18 L70,40 L55,75 L35,70 L28,45 Z', viewBox: '0 0 100 100' },
  spain: { outline: 'M25,35 L55,30 L75,45 L60,70 L30,65 Z', viewBox: '0 0 100 100' },
};

export const FOOD_REGIONS = {
  china: [
    {
      id: 'sichuan', x: 32, y: 54,
      names: {"en": "Sichuan", "zh-CN": "川菜", "zh-TW": "川菜"},
      tagline: {"en": "Málà heat — numbing, fiery, addictive", "zh-CN": "麻辣鲜香，一试难忘", "zh-TW": "麻辣鮮香，一試難忘"},
      recipes: ["mapo-tofu", "kung-pao-chicken", "fish-fragrant-pork", "twice-cooked-pork", "hot-sour-potato-shreds", "ants-climbing-tree", "hot-sour-soup", "sichuan-boiled-beef", "dan-dan-noodles", "sichuan-wontons", "tea-smoked-duck", "sichuan-eggplant", "laziji-chicken", "shuizhu-fish", "fuqi-feipian", "kou-shui-chicken", "ganbian-sijidou", "suan-cai-yu", "maoxuewang", "sichuan-spareribs", "bangbang-chicken", "sichuan-tofu-pudding", "huiguorou-pepper", "sichuan-cold-noodles", "peppercorn-chicken", "sichuan-mapo-variant", "sichuan-garlic-ribs", "chongqing-noodles", "sichuan-sausage-rice", "hotpot-base", "mapo-extra", "twice-cooked-extra", "kungpao-extra", "yuxiang-extra"],
    },
    {
      id: 'cantonese', x: 50, y: 74,
      names: {"en": "Cantonese", "zh-CN": "粤菜", "zh-TW": "粵菜"},
      tagline: {"en": "Fresh, steamed, dim-sum soul", "zh-CN": "清鲜本味，早茶点心", "zh-TW": "清鮮本味，早茶點心"},
      recipes: ["steamed-fish", "oyster-lettuce", "egg-fried-rice", "sweet-sour-pork-ribs", "char-siu", "cantonese-soy-chicken", "wonton-noodle-soup", "claypot-rice", "steamed-egg-custard", "ginger-scallion-lobster", "beef-chow-fun", "sweet-sour-pork", "white-cut-chicken", "cantonese-bbq-ribs", "salt-pepper-shrimp", "tomato-beef-stirfry", "steamed-spare-ribs", "congee-century", "mango-pomelo-sago", "gai-lan-oyster", "shrimp-dumpling", "siu-mai", "pineapple-bun-savory", "cantonese-roast-duck", "chaozhou-goose", "shunde-raw-fish", "claypot-beef", "char-siu-rice", "wanton-soup"],
    },
    {
      id: 'beijing', x: 56, y: 28,
      names: {"en": "Beijing", "zh-CN": "京菜", "zh-TW": "京菜"},
      tagline: {"en": "Roast duck, zhajiang, imperial comfort", "zh-CN": "烤鸭炸酱，京味厚实", "zh-TW": "烤鴨炸醬，京味厚實"},
      recipes: ["beijing-duck", "zhajiangmian", "hot-pot-beijing", "lu-zhu-huoshao", "jingjiang-rousi", "douzhi", "beijing-noodles", "sweet-garlic-ribs-bj", "mustard-cabbage", "beijing-yogurt-dessert", "donkey-burger-style", "beijing-quick-fry", "copper-hotpot", "beijing-tofu-roll", "scallion-pancake-bj", "beijing-zhajiang-vegan", "old-beijing-zhajiang-extra", "donglaishun-style", "beijing-duck-wrap", "jianbing"],
    },
    {
      id: 'hunan', x: 42, y: 60,
      names: {"en": "Hunan", "zh-CN": "湘菜", "zh-TW": "湘菜"},
      tagline: {"en": "Dry heat and chopped chili fire", "zh-CN": "干辣鲜香，剁椒过瘾", "zh-TW": "乾辣鮮香，剁椒過癮"},
      recipes: ["hunan-dry-pot-chicken", "chopped-chili-fish", "hunan-bacon-fried", "chairman-mao-pork", "hunan-tofu", "xiangxi-sour-fish", "hunan-lotus-ribs", "duojiao-eggs", "hunan-beef", "smoked-bacon-hunan", "hunan-eggplant", "changsha-stinky-tofu", "hunan-rice-noodles", "pepper-pork-hunan", "hunan-duck", "hunan-steamed-fish-head", "hunan-smoked-pork", "zuo-zongtang"],
    },
    {
      id: 'shandong', x: 68, y: 32,
      names: {"en": "Shandong", "zh-CN": "鲁菜", "zh-TW": "魯菜"},
      tagline: {"en": "Seafood, scallion, northern classics", "zh-CN": "海鲜葱香，北方根基", "zh-TW": "海鮮蔥香，北方根基"},
      recipes: ["sweet-sour-carp", "dezhou-chicken", "scallion-sea-cucumber", "shandong-dumpling", "nine-turn-intestine", "qingdao-seafood", "baodu", "shandong-braised-pork", "vinegar-carp", "garlic-hearts", "shandong-tofu", "cabbage-pork", "sweet-sour-carp-lu", "scallion-sea-cucumber-lu"],
    },
    {
      id: 'jiangsu', x: 66, y: 46,
      names: {"en": "Jiangsu", "zh-CN": "苏菜", "zh-TW": "蘇菜"},
      tagline: {"en": "Huaiyang refinement by the Yangtze", "zh-CN": "淮扬精细，江南雅味", "zh-TW": "淮揚精細，江南雅味"},
      recipes: ["yangzhou-fried-rice", "red-braised-pork", "scallion-oil-noodles", "lion-head-meatballs", "squirrel-fish", "yangzhou-fried-rice-classic", "beggars-chicken", "crystal-ribs", "suzhou-noodles", "soft-shelled-tofu", "jiangsu-shrimp", "dongpo-pork", "west-lake-beef-soup", "huaiyang-soft-tofu", "squirrel-mandarin"],
    },
    {
      id: 'zhejiang', x: 64, y: 56,
      names: {"en": "Zhejiang", "zh-CN": "浙菜", "zh-TW": "浙菜"},
      tagline: {"en": "West Lake elegance and Dongpo richness", "zh-CN": "西湖淡雅，东坡浓香", "zh-TW": "西湖淡雅，東坡濃香"},
      recipes: ["longjing-shrimp", "dongpo-tofu", "xihu-vinegar-fish", "jiaxing-zongzi", "ningbo-tangyuan", "drunk-chicken", "soy-pork-zhe", "bamboo-shoot-stir", "dongpo-classic", "westlake-fish"],
    },
    {
      id: 'fujian', x: 60, y: 64,
      names: {"en": "Fujian", "zh-CN": "闽菜", "zh-TW": "閩菜"},
      tagline: {"en": "Broths, seafood, and red wine aroma", "zh-CN": "汤鲜海味，红糟香气", "zh-TW": "湯鮮海味，紅糟香氣"},
      recipes: ["fotiaoqiang", "lychee-pork", "fujian-fishballs", "oyster-omelette-fj", "banmian", "red-wine-chicken", "satay-noodles-fj", "ginger-duck", "fotiaoqiang-home", "oyster-omelette-min"],
    },
    {
      id: 'dongbei', x: 80, y: 22,
      names: {"en": "Northeast", "zh-CN": "东北", "zh-TW": "東北"},
      tagline: {"en": "Hearty stews and crispy guo bao rou", "zh-CN": "炖菜扎实，锅包肉脆", "zh-TW": "燉菜紮實，鍋包肉脆"},
      recipes: ["di-san-xian", "cola-chicken-wings", "smashed-cucumber", "guo-bao-rou", "dijia-disanxian", "northeastern-stew", "pork-stew-vermicelli", "suancai-stew", "tieli-eggs", "dongbei-bbq", "kill-pig-stew", "potato-stew-beef", "dongbei-salad", "guobaorou-classic", "chicken-mushroom-stew"],
    },
    {
      id: 'northwest', x: 24, y: 32,
      names: {"en": "Northwest", "zh-CN": "西北", "zh-TW": "西北"},
      tagline: {"en": "Lamb, cumin, hand-pulled noodles", "zh-CN": "羊肉孜然，拉面宽油", "zh-TW": "羊肉孜然，拉麵寬油"},
      recipes: ["lamb-skewer", "dapanji", "hand-pulled-noodles", "nang-bread", "lamb-soup", "spicy-cabbage-xj", "polo-rice", "roujiamo", "biangbiang", "liangpi", "lamian-beef", "lamb-chuan", "dapanji-classic"],
    },
    {
      id: 'shanxi', x: 48, y: 36,
      names: {"en": "Shan Xi", "zh-CN": "山西", "zh-TW": "山西"},
      tagline: {"en": "Aged vinegar, knife-cut noodles, Jin cuisine", "zh-CN": "老陈醋香，刀削面与晋菜", "zh-TW": "老陳醋香，刀削麵與晉菜"},
      recipes: ["daoxiaomian", "shanxi-vinegar-noodles", "guoyourou", "tomao-eggs-shanxi", "youmian-kaolao", "shanxi-lamb-soup", "pingyao-beef", "taigu-cake", "shanxi-cold-noodles", "fen-zheng-rou", "shanxi-tofu-stew", "cat-ear-noodles", "shanxi-pickled-veg", "oil-splash-noodles-sx", "shanxi-potato-stew", "wannian-cake", "shanxi-millet-porridge", "fried-oil-cake-sx", "shredded-potato-sx", "braised-intestines-sx", "jianbing-sx", "tiaopian-sx", "mahua-sx", "liuxin-tofu", "sour-soup-sx", "cumin-potato-sx", "garlic-eggplant-sx", "scallion-pancake-sx", "millet-pancake", "beef-noodle-sx", "vinegar-cabbage", "sticky-rice-date", "pepper-pork-sx", "cold-skin-sx", "mushroom-oil-noodles", "tomato-beef-sx", "fried-tofu-sx", "egg-plants-stew", "lamb-scallion", "sweet-rice-balls", "cornmeal-porridge", "pickled-radish-sx", "steam-bun-sx", "soy-egg-sx", "cabbage-dumpling-sx"],
    },
    {
      id: 'yunnan', x: 30, y: 68,
      names: {"en": "Yunnan", "zh-CN": "云南", "zh-TW": "雲南"},
      tagline: {"en": "Crossing-bridge noodles & wild mushrooms", "zh-CN": "过桥米线，山珍菌香", "zh-TW": "過橋米線，山珍菌香"},
      recipes: ["guoqiao-mixian", "yunnan-mushroom", "steam-pot-chicken", "dai-grilled-fish", "yunnan-rice-cakes", "flower-cake", "sour-bamboo-pork", "erbai-tofu", "crossing-bridge", "wild-mushroom-hotpot"],
    },
    {
      id: 'shanghai', x: 70, y: 50,
      names: {"en": "Shanghai", "zh-CN": "沪菜", "zh-TW": "滬菜"},
      tagline: {"en": "Xiaolongbao, shengjian, red-braised pork", "zh-CN": "小笼生煎，浓油赤酱", "zh-TW": "小籠生煎，濃油赤醬"},
      recipes: ["shengjianbao", "xiaolongbao", "shanghai-red-pork", "scallion-oil-noodles-sh", "fried-pork-chop-sh", "cold-tossed-noodles", "eight-treasure-rice", "oil-eel", "cao-tou", "paigu-mian", "shengjian-classic", "xlb-classic", "hongshao-shanghai"],
    },
    {
      id: 'home-china', x: 45, y: 48,
      names: {"en": "Home Kitchen", "zh-CN": "家常", "zh-TW": "家常"},
      tagline: {"en": "Everyday Chinese home cooking", "zh-CN": "家常味道，下饭百搭", "zh-TW": "家常味道，下飯百搭"},
      recipes: ["tomato-scrambled-eggs", "chicken-stir-fry", "veggie-fried-rice", "braised-eggplant", "garlic-broccoli", "bell-pepper-pork", "braised-tofu", "curry-chicken", "dry-fried-green-beans", "tomato-egg-noodles", "honey-garlic-chicken", "egg-drop-soup", "stir-fried-tomato-beef", "garlic-cucumber", "potato-silk", "soy-eggs", "cabbage-stir", "tofu-skin-salad", "minced-pork-tofu", "corn-ribs", "lotus-root-salad", "pepper-potato", "steamed-egg-meat", "bitter-melon-eggs", "winter-melon-soup", "claypot-tofu", "guilin-rice-noodles", "tomato-egg-extra", "egg-fried-rice-extra", "garlic-ribs-extra", "pepper-pork-extra", "braised-potato-beef", "sour-soup-fish-home", "hot-dry-noodles", "baozi-pork", "jiaozi-boiled", "tangyuan-sweet", 'cn-dongpo-pork', 'cn-west-lake-fish', 'cn-larou-fried-rice', 'cn-guoqiao-mixian', 'cn-yangzhou-fried-rice', 'cn-shui-zhu-yu', 'cn-char-siu', 'cn-xiaolongbao'],
    },
    {
      id: 'hainan', x: 55, y: 80,
      names: {"en": "Hainan", "zh-CN": "海南", "zh-TW": "海南"},
      tagline: {"en": "Coconut chicken, seafood & island sunshine", "zh-CN": "椰子清鲜，热带海味", "zh-TW": "椰子清鮮，熱帶海味"},
      recipes: ["hainan-chicken-rice", "hainan-coconut-chicken", "hainan-baolu-noodles", "hainan-qingbuliang", "steamed-fish", "white-cut-chicken", "ginger-scallion-lobster", "salt-pepper-shrimp"],
    },
    {
      id: 'taiwan', x: 87, y: 70,
      names: {"en": "Taiwan", "zh-CN": "台湾", "zh-TW": "台灣"},
      tagline: {"en": "Night markets, beef noodles & gua bao", "zh-CN": "夜市小吃，牛肉面与刈包", "zh-TW": "夜市小吃，牛肉麵與刈包"},
      recipes: ["taiwan-beef-noodle", "taiwan-lu-rou-fan", "taiwan-oyster-omelette", "taiwan-three-cup-chicken", "taiwan-gua-bao", "taiwan-oyster-vermicelli", "taiwan-pepper-bun", "taiwan-scallion-pancake", "taiwan-braised-pork-rice", "taiwan-sweet-potato-balls"],
    },
  ],
  thailand: [
    {
      id: 'th-central',
      x: 50, y: 45,
      names: { en: 'Central & Bangkok', 'zh-CN': '中部 & 曼谷', 'zh-TW': '中部 & 曼谷' },
      tagline: { en: 'Street noodles, tom yum, and wok heat', 'zh-CN': '街头炒粉与冬阴功的热带风味', 'zh-TW': '街頭炒粉與冬陰功的熱帶風味' },
      recipes: ['pad-thai', 'tom-yum-soup', 'thai-basil-chicken', 'thai-coconut-chicken-soup', 'thai-larb-chicken', 'th-pad-krapow', 'th-som-tam'],
    },
    {
      id: 'th-south',
      x: 50, y: 72,
      names: { en: 'South & Islands', 'zh-CN': '南部 & 海岛', 'zh-TW': '南部 & 海島' },
      tagline: { en: 'Coconut curries and tropical sweetness', 'zh-CN': '椰浆咖喱与芒果糯米饭', 'zh-TW': '椰漿咖哩與芒果糯米飯' },
      recipes: ['thai-green-curry', 'thai-red-curry-tofu', 'thai-massaman-curry', 'thai-mango-sticky-rice'],
    },
  ],
  korea: [
    {
      id: 'kr-seoul',
      x: 50, y: 35,
      names: { en: 'Seoul', 'zh-CN': '首尔', 'zh-TW': '首爾' },
      tagline: { en: 'Bibimbap, bulgogi, and soul-warming stews', 'zh-CN': '拌饭、烤肉与部队锅', 'zh-TW': '拌飯、烤肉與部隊鍋' },
      recipes: ['korean-bibimbap', 'korean-bulgogi-beef', 'korean-army-stew', 'korean-japchae'],
    },
    {
      id: 'kr-street',
      x: 50, y: 62,
      names: { en: 'Street & Night Markets', 'zh-CN': '街头夜市', 'zh-TW': '街頭夜市' },
      tagline: { en: 'Fried chicken, gochujang, and late-night heat', 'zh-CN': '炸鸡、辣酱与辣炒猪肉', 'zh-TW': '炸雞、辣醬與辣炒豬肉' },
      recipes: ['korean-gochujang-chicken', 'korean-karaage-chicken', 'korean-spicy-pork', 'kimchi-fried-rice-style', 'korean-dakgalbi', 'kr-samgyetang', 'kr-tteokbokki', 'kr-kimchi-jjigae'],
    },
  ],
  japan: [
    {
      id: 'jp-kanto',
      x: 54, y: 38,
      names: { en: 'Kanto (Tokyo)', 'zh-CN': '关东 (东京)', 'zh-TW': '關東 (東京)' },
      tagline: { en: 'Ramen, gyudon, and salaryman classics', 'zh-CN': '拉面、牛丼与亲子丼', 'zh-TW': '拉麵、牛丼與親子丼' },
      recipes: ['gyudon-beef-bowl', 'shoyu-ramen', 'japanese-oyakodon', 'japanese-yakisoba', 'japanese-miso-soup'],
    },
    {
      id: 'jp-osaka',
      x: 48, y: 58,
      names: { en: 'Kansai (Osaka)', 'zh-CN': '关西 (大阪)', 'zh-TW': '關西 (大阪)' },
      tagline: { en: 'Okonomiyaki, katsu, and comfort bowls', 'zh-CN': '大阪烧、炸物与居酒屋', 'zh-TW': '大阪燒、炸物與居酒屋' },
      recipes: ['japanese-okonomiyaki', 'chicken-katsu-rice', 'japanese-karaage', 'miso-glazed-fish', 'jp-tonkatsu', 'jp-onigiri', 'jp-nikujaga'],
    },
  ],
  vietnam: [
    {
      id: 'vn-north',
      x: 50, y: 28,
      names: { en: 'North (Hanoi)', 'zh-CN': '北部 (河内)', 'zh-TW': '北部 (河內)' },
      tagline: { en: 'Pho, bun cha, and herb-forward bowls', 'zh-CN': '河粉、烤肉米粉与法棍', 'zh-TW': '河粉、烤肉米粉與法棍' },
      recipes: ['vietnamese-pho', 'vietnamese-bun-cha', 'banh-mi-chicken'],
    },
    {
      id: 'vn-south',
      x: 50, y: 68,
      names: { en: 'South (Saigon)', 'zh-CN': '南部 (西贡)', 'zh-TW': '南部 (西貢)' },
      tagline: { en: 'Sweet-savory caramel and fresh spring rolls', 'zh-CN': '香茅鸡、春卷碗与焦糖鱼', 'zh-TW': '香茅雞、春卷碗與焦糖魚' },
      recipes: ['vietnamese-lemongrass-chicken', 'vietnamese-spring-roll-bowl', 'vietnamese-caramel-fish', 'vn-banh-xeo', 'vn-cao-lau'],
    },
  ],
  india: [
    {
      id: 'in-north',
      x: 42, y: 32,
      names: { en: 'North India', 'zh-CN': '北印度', 'zh-TW': '北印度' },
      tagline: { en: 'Butter chicken, tikka, and tandoori warmth', 'zh-CN': '黄油鸡、烤鸡与浓郁咖喱', 'zh-TW': '奶油雞、烤雞與濃郁咖哩' },
      recipes: ['butter-chicken', 'indian-chicken-tikka', 'indian-dal-tadka', 'vegetable-biryani'],
    },
    {
      id: 'in-south',
      x: 48, y: 72,
      names: { en: 'South & West', 'zh-CN': '南印度 & 西部', 'zh-TW': '南印度 & 西部' },
      tagline: { en: 'Lentils, chickpeas, and vegetable curries', 'zh-CN': '鹰嘴豆、菠菜与素食咖喱', 'zh-TW': '鷹嘴豆、菠菜與素食咖哩' },
      recipes: ['chana-masala', 'indian-aloo-gobi', 'indian-palak-paneer-style', 'in-vada-pav', 'in-masala-dosa', 'in-rogan-josh'],
    },
  ],
  mexico: [
    {
      id: 'mx-central',
      x: 48, y: 42,
      names: { en: 'Central Mexico', 'zh-CN': '墨西哥中部', 'zh-TW': '墨西哥中部' },
      tagline: { en: 'Tacos, carnitas, and market flavors', 'zh-CN': '塔可、慢炖猪肉与街头玉米', 'zh-TW': '塔可、慢燉豬肉與街頭玉米' },
      recipes: ['pork-carnitas-tacos', 'mexican-street-corn', 'mexican-enchiladas', 'mexican-quesadilla'],
    },
    {
      id: 'mx-coastal',
      x: 55, y: 68,
      names: { en: 'Coastal & Baja', 'zh-CN': '沿海 & 下加州', 'zh-TW': '沿海 & 下加州' },
      tagline: { en: 'Fish tacos, burrito bowls, and ranchero breakfast', 'zh-CN': '炸鱼taco、碗饭与牧场蛋', 'zh-TW': '炸魚taco、碗飯與牧場蛋' },
      recipes: ['mexican-fish-tacos', 'chicken-burrito-bowl', 'mexican-huevos-rancheros', 'mexican-chilaquiles', 'mx-mole-chicken', 'mx-pozole', 'mx-elote'],
    },
  ],
  'middle-east': [
    {
      id: 'me-levant',
      x: 38, y: 42,
      names: { en: 'Levant', 'zh-CN': '黎凡特', 'zh-TW': '黎凡特' },
      tagline: { en: 'Shawarma, falafel, and mezze culture', 'zh-CN': '沙威玛、鹰嘴豆球与沙拉', 'zh-TW': '沙威瑪、鷹嘴豆球與沙拉' },
      recipes: ['chicken-shawarma', 'falafel-bowl', 'middle-eastern-hummus-bowl', 'middle-eastern-fattoush', 'tr-lahmacun', 'tr-menemen', 'lb-manakish', 'ir-ghormeh-sabzi'],
    },
    {
      id: 'me-heartland',
      x: 58, y: 55,
      names: { en: 'Heartland', 'zh-CN': '中东腹地', 'zh-TW': '中東腹地' },
      tagline: { en: 'Kofta, mujadara, and stuffed peppers', 'zh-CN': '肉丸、扁豆饭与填馅甜椒', 'zh-TW': '肉丸、扁豆飯與填餡甜椒' },
      recipes: ['middle-eastern-kofta', 'middle-eastern-mujadara', 'middle-eastern-stuffed-peppers'],
    },
  ],
  mediterranean: [
    {
      id: 'med-south',
      x: 45, y: 62,
      names: { en: 'Southern Mediterranean', 'zh-CN': '南地中海', 'zh-TW': '南地中海' },
      tagline: { en: 'Greece, Italy — sun, olive oil, and herbs', 'zh-CN': '希腊碗、意面与烤羊奶酪', 'zh-TW': '希臘碗、義麵與烤羊乳酪' },
      recipes: ['greek-chicken-bowl', 'caprese-salad', 'mediterranean-baked-feta-pasta', 'mediterranean-ratatouille', 'lemon-garlic-fish', 'gr-moussaka', 'gr-souvlaki'],
    },
    {
      id: 'med-north-africa',
      x: 55, y: 38,
      names: { en: 'North Africa & Levantine', 'zh-CN': '北非 & 黎凡特', 'zh-TW': '北非 & 黎凡特' },
      tagline: { en: 'Harissa, shakshuka, and crispy rice salads', 'zh-CN': '北非辣酱、Shakshuka 与脆米饭', 'zh-TW': '北非辣醬、Shakshuka 與脆米飯' },
      recipes: ['harissa-chicken-rice', 'shakshuka', 'mediterranean-crispy-rice-salad'],
    },
  ],
  western: [
    {
      id: 'west-italy',
      x: 58, y: 48,
      names: { en: 'Italy', 'zh-CN': '意大利', 'zh-TW': '義大利' },
      tagline: { en: 'Pasta, risotto, and la dolce vita', 'zh-CN': '意面、烩饭与经典西餐', 'zh-TW': '義麵、燴飯與經典西餐' },
      recipes: ['carbonara', 'garlic-butter-pasta', 'tomato-basil-pasta', 'creamy-mushroom-pasta', 'mushroom-risotto'],
    },
    {
      id: 'west-americas',
      x: 28, y: 55,
      names: { en: 'Americas', 'zh-CN': '美洲', 'zh-TW': '美洲' },
      tagline: { en: 'BBQ, comfort food, and diner classics', 'zh-CN': '烧烤、舒适食物与早午餐', 'zh-TW': '燒烤、舒適食物與早午餐' },
      recipes: ['bbq-glazed-chicken', 'french-toast', 'simple-omelette', 'roasted-potatoes', 'honey-garlic-chicken', 'beef-tacos', 'de-schnitzel', 'de-sauerbraten-quick', 'uk-shepherd-pie', 'uk-fish-chips', 'us-clam-chowder', 'us-shrimp-and-grits', 'ca-poutine', 'au-meat-pie', 'pl-pierogi', 'ru-beef-stroganoff', 'hu-goulash'],
    },
    {
      id: 'west-fusion',
      x: 48, y: 32,
      names: { en: 'Global Fusion', 'zh-CN': '全球融合', 'zh-TW': '全球融合' },
      tagline: { en: 'Viral crossover hits from social media', 'zh-CN': 'Instagram 网红融合菜', 'zh-TW': 'Instagram 網紅融合菜' },
      recipes: ['miso-mushroom-carbonara', 'gochujang-butter-pasta', 'tofu-coconut-curry'],
    },
  ],
  philippines: [
    {
      id: 'ph-islands',
      x: 50, y: 45,
      names: { en: 'Islands & Home Kitchens', 'zh-CN': '群岛家常', 'zh-TW': '群島家常' },
      tagline: { en: 'Adobo, sinigang, pancit, and halo-halo', 'zh-CN': '阿斗波、酸汤、炒面与刨冰', 'zh-TW': '阿斗波、酸湯、炒麵與刨冰' },
      recipes: ['ph-adobo-chicken', 'ph-sinigang', 'ph-pancit', 'ph-lumpia', 'ph-halo-halo'],
    },
  ],
  indonesia: [
    {
      id: 'id-archipelago',
      x: 50, y: 50,
      names: { en: 'Archipelago Flavors', 'zh-CN': '群岛风味', 'zh-TW': '群島風味' },
      tagline: { en: 'Nasi goreng, satay, rendang, and soto', 'zh-CN': '炒饭、沙爹、仁当与黄姜汤', 'zh-TW': '炒飯、沙爹、仁當與黃薑湯' },
      recipes: ['id-nasi-goreng', 'id-satay-chicken', 'id-rendang', 'id-gado-gado', 'id-soto-ayam'],
    },
  ],
  malaysia: [
    {
      id: 'my-peninsula',
      x: 48, y: 42,
      names: { en: 'Peninsula Classics', 'zh-CN': '半岛经典', 'zh-TW': '半島經典' },
      tagline: { en: 'Nasi lemak, laksa, and roti canai', 'zh-CN': '椰浆饭、叻沙与印度煎饼', 'zh-TW': '椰漿飯、叻沙與印度煎餅' },
      recipes: ['my-nasi-lemak', 'my-laksa', 'my-roti-canai'],
    },
  ],
  singapore: [
    {
      id: 'sg-city',
      x: 50, y: 50,
      names: { en: 'Hawker Favourites', 'zh-CN': '小贩中心', 'zh-TW': '小販中心' },
      tagline: { en: 'Chicken rice and chili crab-style shrimp', 'zh-CN': '海南鸡饭与辣椒螃蟹风味虾', 'zh-TW': '海南雞飯與辣椒螃蟹風味蝦' },
      recipes: ['sg-chicken-rice', 'sg-chili-crab-style'],
    },
  ],
  'south-america': [
    {
      id: 'sa-andes',
      x: 45, y: 35,
      names: { en: 'Andes & Pacific', 'zh-CN': '安第斯与太平洋', 'zh-TW': '安地斯與太平洋' },
      tagline: { en: 'Ceviche, lomo saltado, and aji de gallina', 'zh-CN': '酸橘汁鱼、炒牛肉与奶油辣鸡', 'zh-TW': '酸橘汁魚、炒牛肉與奶油辣雞' },
      recipes: ['pe-ceviche', 'pe-lomo-saltado', 'pe-aji-de-gallina'],
    },,
    {
      id: 'sa-brazil-cone',
      x: 52, y: 62,
      names: { en: 'Brazil & Southern Cone', 'zh-CN': '巴西与南锥', 'zh-TW': '巴西與南錐' },
      tagline: { en: 'Feijoada, picanha, empanadas, ropa vieja, jerk', 'zh-CN': '黑豆炖、牛排、饺与加勒比风味', 'zh-TW': '黑豆燉、牛排、餃與加勒比風味' },
      recipes: ['br-feijoada-style', 'br-picanha-style', 'ar-empanadas', 'jm-jerk-chicken', 'cu-ropa-vieja'],
    },
  ],
  morocco: [
    {
      id: 'ma-maghreb',
      x: 50, y: 45,
      names: { en: 'Maghreb Kitchen', 'zh-CN': '马格里布厨房', 'zh-TW': '馬格里布廚房' },
      tagline: { en: 'Tagine and harira', 'zh-CN': '塔吉锅与哈里拉汤', 'zh-TW': '塔吉鍋與哈里拉湯' },
      recipes: ['ma-tagine-chicken', 'ma-harira'],
    },
  ],
  ethiopia: [
    {
      id: 'et-highlands',
      x: 50, y: 45,
      names: { en: 'Highland Stews', 'zh-CN': '高原炖菜', 'zh-TW': '高原燉菜' },
      tagline: { en: 'Doro wat and misir wat', 'zh-CN': '炖鸡与红扁豆', 'zh-TW': '燉雞與紅扁豆' },
      recipes: ['et-doro-wat', 'et-misir-wat'],
    },
  ],
  nigeria: [
    {
      id: 'ng-west-africa',
      x: 50, y: 45,
      names: { en: 'West African Heat', 'zh-CN': '西非风味', 'zh-TW': '西非風味' },
      tagline: { en: 'Jollof rice and suya', 'zh-CN': '乔洛夫饭与苏亚烤鸡', 'zh-TW': '喬洛夫飯與蘇亞烤雞' },
      recipes: ['ng-jollof-rice', 'ng-suya-chicken'],
    },
  ],
  france: [
    {
      id: 'fr-hexagon',
      x: 50, y: 45,
      names: { en: 'French Home Table', 'zh-CN': '法式家常', 'zh-TW': '法式家常' },
      tagline: { en: 'Coq au vin, ratatouille, croque monsieur', 'zh-CN': '红酒焖鸡、蔬菜炖与火腿芝士', 'zh-TW': '紅酒燜雞、蔬菜燉與火腿起司' },
      recipes: ['fr-coq-au-vin-quick', 'fr-ratatouille', 'fr-croque-monsieur'],
    },
  ],
  spain: [
    {
      id: 'es-iberia',
      x: 50, y: 45,
      names: { en: 'Iberian Classics', 'zh-CN': '伊比利亚经典', 'zh-TW': '伊比利亞經典' },
      tagline: { en: 'Paella, tortilla, gazpacho', 'zh-CN': '海鲜饭、土豆蛋饼与冷汤', 'zh-TW': '海鮮飯、馬鈴薯蛋餅與冷湯' },
      recipes: ['es-paella-mixta', 'es-tortilla-espanola', 'es-gazpacho'],
    },
  ],
};

export function getCountry(id) {
  return FOOD_COUNTRIES.find((c) => c.id === id) || null;
}

export function getCountryRegions(countryId) {
  return FOOD_REGIONS[countryId] || [];
}

export function getRegion(countryId, regionId) {
  return getCountryRegions(countryId).find((r) => r.id === regionId) || null;
}

export function labelCountry(country, lang) {
  if (!country) return '';
  return country.names[lang] || country.names.en;
}

export function labelRegion(region, lang) {
  if (!region) return '';
  return region.names[lang] || region.names.en;
}

export function regionTagline(region, lang) {
  if (!region) return '';
  return region.tagline?.[lang] || region.tagline?.en || '';
}
