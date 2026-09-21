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
  lamb: { en: 'lamb', 'zh-CN': '羊肉', 'zh-TW': '羊肉', aliases: ['羊', '羊排', '羊扒', '羊肋排', '新西兰羊排', '新西蘭羊排', 'lamb chop', 'lamb chops'] },
  greens: { en: 'greens', 'zh-CN': '时蔬', 'zh-TW': '時蔬', aliases: ['荠菜', '薺菜', '青菜', '蔬菜', '嫩菜', '菜心', '菜芯', '芥兰', '芥蘭', '小白菜', '上海青', 'choy sum', 'gai lan'] },
  'bitter melon': { en: 'bitter melon', 'zh-CN': '苦瓜', 'zh-TW': '苦瓜', aliases: [] },
  'winter melon': { en: 'winter melon', 'zh-CN': '冬瓜', 'zh-TW': '冬瓜', aliases: [] },
  salt: { en: 'salt', 'zh-CN': '盐', 'zh-TW': '鹽', aliases: [] },
  pepper: { en: 'pepper', 'zh-CN': '胡椒', 'zh-TW': '胡椒', aliases: ['黑胡椒', '白胡椒'] },
  oil: { en: 'oil', 'zh-CN': '油', 'zh-TW': '油', aliases: ['食用油', '植物油'] },
  sesame: { en: 'sesame', 'zh-CN': '芝麻', 'zh-TW': '芝麻', aliases: ['白芝麻', '黑芝麻'] },
  'sesame oil': { en: 'sesame oil', 'zh-CN': '香油', 'zh-TW': '香油', aliases: ['芝麻油', '荏油'] },
  'green onion': { en: 'green onion', 'zh-CN': '葱', 'zh-TW': '蔥', aliases: ['葱花', '蔥花', '大葱', '大蔥', 'scallion'] },
  scallion: { en: 'scallion', 'zh-CN': '葱', 'zh-TW': '蔥', aliases: [] },
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
  allspice: { en: 'allspice', 'zh-CN': '多香果', 'zh-TW': '多香果', aliases: [] },
  anchovies: { en: 'anchovies', 'zh-CN': '鳀鱼', 'zh-TW': '鯷魚', aliases: [] },
  aspic: { en: 'aspic', 'zh-CN': '肉冻', 'zh-TW': '肉凍', aliases: [] },
  'bay leaf': { en: 'bay leaf', 'zh-CN': '月桂叶', 'zh-TW': '月桂葉', aliases: [] },
  'beef gravy': { en: 'beef gravy', 'zh-CN': '牛肉肉汁', 'zh-TW': '牛肉肉汁', aliases: [] },
  'beef stock': { en: 'beef stock', 'zh-CN': '牛肉高汤', 'zh-TW': '牛肉高湯', aliases: [] },
  'black beans': { en: 'black beans', 'zh-CN': '黑豆', 'zh-TW': '黑豆', aliases: [] },
  'bread rolls': { en: 'bread rolls', 'zh-CN': '小面包', 'zh-TW': '小麵包', aliases: [] },
  breadcrumbs: { en: 'breadcrumbs', 'zh-CN': '面包糠', 'zh-TW': '麵包糠', aliases: [] },
  caraway: { en: 'caraway', 'zh-CN': '葛缕子', 'zh-TW': '葛縷子', aliases: [] },
  celery: { en: 'celery', 'zh-CN': '芹菜', 'zh-TW': '芹菜', aliases: [] },
  'cheese curds': { en: 'cheese curds', 'zh-CN': '奶酪块', 'zh-TW': '起司塊', aliases: [] },
  'chickpea flour': { en: 'chickpea flour', 'zh-CN': '鹰嘴豆粉', 'zh-TW': '鷹嘴豆粉', aliases: [] },
  chocolate: { en: 'chocolate', 'zh-CN': '巧克力', 'zh-TW': '巧克力', aliases: [] },
  clams: { en: 'clams', 'zh-CN': '蛤蜊', 'zh-TW': '蛤蜊', aliases: [] },
  cornmeal: { en: 'cornmeal', 'zh-CN': '玉米粉', 'zh-TW': '玉米粉', aliases: [] },
  'cured pork': { en: 'cured pork', 'zh-CN': '腊肉', 'zh-TW': '臘肉', aliases: [] },
  'curry powder': { en: 'curry powder', 'zh-CN': '咖喱粉', 'zh-TW': '咖哩粉', aliases: [] },
  'dried chili': { en: 'dried chili', 'zh-CN': '干辣椒', 'zh-TW': '乾辣椒', aliases: [] },
  'fermented black beans': { en: 'fermented black beans', 'zh-CN': '豆豉', 'zh-TW': '豆豉', aliases: [] },
  'fish cake': { en: 'fish cake', 'zh-CN': '鱼糕', 'zh-TW': '魚糕', aliases: [] },
  'fish sauce': { en: 'fish sauce', 'zh-CN': '鱼露', 'zh-TW': '魚露', aliases: [] },
  'five spice': { en: 'five spice', 'zh-CN': '五香粉', 'zh-TW': '五香粉', aliases: [] },
  ginseng: { en: 'ginseng', 'zh-CN': '人参', 'zh-TW': '人參', aliases: [] },
  gluten: { en: 'gluten', 'zh-CN': '面筋', 'zh-TW': '麵筋', aliases: [] },
  'green onions': { en: 'green onions', 'zh-CN': '葱', 'zh-TW': '蔥', aliases: [] },
  'green papaya': { en: 'green papaya', 'zh-CN': '青木瓜', 'zh-TW': '青木瓜', aliases: [] },
  'ground beef': { en: 'ground beef', 'zh-CN': '牛肉末', 'zh-TW': '牛肉末', aliases: [] },
  'ground lamb': { en: 'ground lamb', 'zh-CN': '羊肉末', 'zh-TW': '羊肉末', aliases: [] },
  'ground pork': { en: 'ground pork', 'zh-CN': '猪肉末', 'zh-TW': '豬肉末', aliases: [] },
  herbs: { en: 'herbs', 'zh-CN': '香草', 'zh-TW': '香草', aliases: [] },
  hoisin: { en: 'hoisin', 'zh-CN': '海鲜酱', 'zh-TW': '海鮮醬', aliases: [] },
  'holy basil': { en: 'holy basil', 'zh-CN': '圣罗勒', 'zh-TW': '聖羅勒', aliases: [] },
  hominy: { en: 'hominy', 'zh-CN': '玉米粒', 'zh-TW': '玉米粒', aliases: [] },
  ice: { en: 'ice', 'zh-CN': '冰', 'zh-TW': '冰', aliases: [] },
  intestines: { en: 'intestines', 'zh-CN': '猪大肠', 'zh-TW': '豬大腸', aliases: [] },
  'kidney beans': { en: 'kidney beans', 'zh-CN': '芸豆', 'zh-TW': '芸豆', aliases: [] },
  kimchi: { en: 'kimchi', 'zh-CN': '泡菜', 'zh-TW': '泡菜', aliases: [] },
  lychee: { en: 'lychee', 'zh-CN': '荔枝', 'zh-TW': '荔枝', aliases: [] },
  mayo: { en: 'mayo', 'zh-CN': '蛋黄酱', 'zh-TW': '蛋黃醬', aliases: [] },
  mayonnaise: { en: 'mayonnaise', 'zh-CN': '蛋黄酱', 'zh-TW': '蛋黃醬', aliases: [] },
  millet: { en: 'millet', 'zh-CN': '小米', 'zh-TW': '小米', aliases: [] },
  'mustard seeds': { en: 'mustard seeds', 'zh-CN': '芥末籽', 'zh-TW': '芥末籽', aliases: [] },
  nori: { en: 'nori', 'zh-CN': '海苔', 'zh-TW': '海苔', aliases: [] },
  olive: { en: 'olive', 'zh-CN': '橄榄', 'zh-TW': '橄欖', aliases: [] },
  oyster: { en: 'oyster', 'zh-CN': '牡蛎', 'zh-TW': '牡蠣', aliases: [] },
  panko: { en: 'panko', 'zh-CN': '面包糠', 'zh-TW': '麵包糠', aliases: [] },
  parsley: { en: 'parsley', 'zh-CN': '欧芹', 'zh-TW': '歐芹', aliases: [] },
  peppercorn: { en: 'peppercorn', 'zh-CN': '胡椒粒', 'zh-TW': '胡椒粒', aliases: [] },
  pickles: { en: 'pickles', 'zh-CN': '腌菜', 'zh-TW': '醃菜', aliases: [] },
  pomelo: { en: 'pomelo', 'zh-CN': '柚子', 'zh-TW': '柚子', aliases: [] },
  'pork belly': { en: 'pork belly', 'zh-CN': '五花肉', 'zh-TW': '五花肉', aliases: [] },
  'puff pastry': { en: 'puff pastry', 'zh-CN': '千层酥皮', 'zh-TW': '千層酥皮', aliases: [] },
  'quail egg': { en: 'quail egg', 'zh-CN': '鹌鹑蛋', 'zh-TW': '鵪鶉蛋', aliases: [] },
  radish: { en: 'radish', 'zh-CN': '萝卜', 'zh-TW': '蘿蔔', aliases: [] },
  'red bean': { en: 'red bean', 'zh-CN': '红豆', 'zh-TW': '紅豆', aliases: [] },
  'red lentils': { en: 'red lentils', 'zh-CN': '红扁豆', 'zh-TW': '紅扁豆', aliases: [] },
  'red wine': { en: 'red wine', 'zh-CN': '红酒', 'zh-TW': '紅酒', aliases: [] },
  'rice cakes': { en: 'rice cakes', 'zh-CN': '年糕', 'zh-TW': '年糕', aliases: [] },
  'rice flour': { en: 'rice flour', 'zh-CN': '米粉', 'zh-TW': '米粉', aliases: [] },
  'rice noodles': { en: 'rice noodles', 'zh-CN': '河粉', 'zh-TW': '河粉', aliases: [] },
  rose: { en: 'rose', 'zh-CN': '玫瑰', 'zh-TW': '玫瑰', aliases: [] },
  saffron: { en: 'saffron', 'zh-CN': '藏红花', 'zh-TW': '藏紅花', aliases: [] },
  sauce: { en: 'sauce', 'zh-CN': '酱汁', 'zh-TW': '醬汁', aliases: [] },
  scallop: { en: 'scallop', 'zh-CN': '扇贝', 'zh-TW': '扇貝', aliases: [] },
  'sesame paste': { en: 'sesame paste', 'zh-CN': '芝麻酱', 'zh-TW': '芝麻醬', aliases: [] },
  shallot: { en: 'shallot', 'zh-CN': '红葱头', 'zh-TW': '紅蔥頭', aliases: [] },
  'shaoxing wine': { en: 'shaoxing wine', 'zh-CN': '绍兴酒', 'zh-TW': '紹興酒', aliases: [] },
  'sichuan pepper': { en: 'sichuan pepper', 'zh-CN': '花椒', 'zh-TW': '花椒', aliases: [] },
  'sour cream': { en: 'sour cream', 'zh-CN': '酸奶油', 'zh-TW': '酸奶油', aliases: [] },
  spice: { en: 'spice', 'zh-CN': '香料', 'zh-TW': '香料', aliases: [] },
  'spring roll wrappers': { en: 'spring roll wrappers', 'zh-CN': '春卷皮', 'zh-TW': '春卷皮', aliases: [] },
  'star anise': { en: 'star anise', 'zh-CN': '八角', 'zh-TW': '八角', aliases: [] },
  tahini: { en: 'tahini', 'zh-CN': '芝麻酱', 'zh-TW': '芝麻醬', aliases: [] },
  tamarind: { en: 'tamarind', 'zh-CN': '罗望子', 'zh-TW': '羅望子', aliases: [] },
  thyme: { en: 'thyme', 'zh-CN': '百里香', 'zh-TW': '百里香', aliases: [] },
  'tofu skin': { en: 'tofu skin', 'zh-CN': '腐皮', 'zh-TW': '腐皮', aliases: [] },
  tortilla: { en: 'tortilla', 'zh-CN': '玉米饼', 'zh-TW': '玉米餅', aliases: [] },
  tuna: { en: 'tuna', 'zh-CN': '金枪鱼', 'zh-TW': '鮪魚', aliases: [] },
  turmeric: { en: 'turmeric', 'zh-CN': '姜黄', 'zh-TW': '薑黃', aliases: [] },
  vermicelli: { en: 'vermicelli', 'zh-CN': '粉丝', 'zh-TW': '粉絲', aliases: [] },
  walnut: { en: 'walnut', 'zh-CN': '核桃', 'zh-TW': '核桃', aliases: [] },
  worcestershire: { en: 'worcestershire', 'zh-CN': '伍斯特酱', 'zh-TW': '伍斯特醬', aliases: [] },
  yeast: { en: 'yeast', 'zh-CN': '酵母', 'zh-TW': '酵母', aliases: [] },
  zaatar: { en: 'zaatar', 'zh-CN': '扎塔尔', 'zh-TW': '扎塔爾', aliases: [] },
  zucchini: { en: 'zucchini', 'zh-CN': '西葫芦', 'zh-TW': '西葫蘆', aliases: [] },
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


/** Collapse near-duplicate keys used across the catalog. */
const CANONICAL_KEYS = {
  egg: 'eggs',
  scallion: 'green onion',
  'spring onion': 'green onion',
  'green onions': 'green onion',
};

export function normalizeIngredient(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;

  const direct = lookup.get(raw) || lookup.get(raw.toLowerCase());
  if (direct) return CANONICAL_KEYS[direct] || direct;

  for (const [key, data] of Object.entries(INGREDIENTS)) {
    const terms = [key, data.en, data['zh-CN'], data['zh-TW'], ...(data.aliases || [])];
    for (const term of terms) {
      if (raw.toLowerCase() === term.toLowerCase() || raw === term) {
        return CANONICAL_KEYS[key] || key;
      }
    }
  }

  for (const [key, data] of Object.entries(INGREDIENTS)) {
    const terms = [key, data.en, data['zh-CN'], data['zh-TW'], ...(data.aliases || [])];
    for (const term of terms) {
      if (raw.includes(term) || term.includes(raw)) {
        return CANONICAL_KEYS[key] || key;
      }
    }
  }

  const fallback = raw.toLowerCase().replace(/\s+/g, ' ');
  return CANONICAL_KEYS[fallback] || fallback;
}

const INGREDIENT_ALIASES = {
  egg: 'eggs',
  scallion: 'green onion',
  'spring onion': 'green onion',
  'sesame seeds': 'sesame',
  'green onions': 'green onion',
  mayo: 'mayonnaise',
  shallot: 'onion',
};

export function displayIngredient(key, lang = 'en') {
  const normalized = normalizeIngredient(key) || key;
  const canonical = INGREDIENT_ALIASES[normalized] || normalized;
  const data = INGREDIENTS[canonical];
  if (!data) {
    if (lang.startsWith('zh')) return String(key);
    return String(key).replace(/_/g, ' ');
  }
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
