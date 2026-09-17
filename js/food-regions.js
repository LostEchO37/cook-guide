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
      recipes: ["tomato-scrambled-eggs", "chicken-stir-fry", "veggie-fried-rice", "braised-eggplant", "garlic-broccoli", "bell-pepper-pork", "braised-tofu", "curry-chicken", "dry-fried-green-beans", "tomato-egg-noodles", "honey-garlic-chicken", "egg-drop-soup", "stir-fried-tomato-beef", "garlic-cucumber", "potato-silk", "soy-eggs", "cabbage-stir", "tofu-skin-salad", "minced-pork-tofu", "corn-ribs", "lotus-root-salad", "pepper-potato", "steamed-egg-meat", "bitter-melon-eggs", "winter-melon-soup", "claypot-tofu", "guilin-rice-noodles", "tomato-egg-extra", "egg-fried-rice-extra", "garlic-ribs-extra", "pepper-pork-extra", "braised-potato-beef", "sour-soup-fish-home", "hot-dry-noodles", "baozi-pork", "jiaozi-boiled", "tangyuan-sweet"],
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
      recipes: ['pad-thai', 'tom-yum-soup', 'thai-basil-chicken', 'thai-coconut-chicken-soup', 'thai-larb-chicken'],
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
      recipes: ['korean-gochujang-chicken', 'korean-karaage-chicken', 'korean-spicy-pork', 'kimchi-fried-rice-style', 'korean-dakgalbi'],
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
      recipes: ['japanese-okonomiyaki', 'chicken-katsu-rice', 'japanese-karaage', 'miso-glazed-fish'],
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
      recipes: ['vietnamese-lemongrass-chicken', 'vietnamese-spring-roll-bowl', 'vietnamese-caramel-fish'],
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
      recipes: ['chana-masala', 'indian-aloo-gobi', 'indian-palak-paneer-style'],
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
      recipes: ['mexican-fish-tacos', 'chicken-burrito-bowl', 'mexican-huevos-rancheros', 'mexican-chilaquiles'],
    },
  ],
  'middle-east': [
    {
      id: 'me-levant',
      x: 38, y: 42,
      names: { en: 'Levant', 'zh-CN': '黎凡特', 'zh-TW': '黎凡特' },
      tagline: { en: 'Shawarma, falafel, and mezze culture', 'zh-CN': '沙威玛、鹰嘴豆球与沙拉', 'zh-TW': '沙威瑪、鷹嘴豆球與沙拉' },
      recipes: ['chicken-shawarma', 'falafel-bowl', 'middle-eastern-hummus-bowl', 'middle-eastern-fattoush'],
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
      recipes: ['greek-chicken-bowl', 'caprese-salad', 'mediterranean-baked-feta-pasta', 'mediterranean-ratatouille', 'lemon-garlic-fish'],
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
      recipes: ['bbq-glazed-chicken', 'french-toast', 'simple-omelette', 'roasted-potatoes', 'honey-garlic-chicken', 'beef-tacos'],
    },
    {
      id: 'west-fusion',
      x: 48, y: 32,
      names: { en: 'Global Fusion', 'zh-CN': '全球融合', 'zh-TW': '全球融合' },
      tagline: { en: 'Viral crossover hits from social media', 'zh-CN': 'Instagram 网红融合菜', 'zh-TW': 'Instagram 網紅融合菜' },
      recipes: ['miso-mushroom-carbonara', 'gochujang-butter-pasta', 'tofu-coconut-curry'],
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
