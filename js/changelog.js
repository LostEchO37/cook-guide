/** Update journal — add a new entry at the top for each release. */

export const APP_VERSION = '1.7.0';

export const CHANGELOG = [
  {
    version: '1.7.0',
    date: '2025-09-17',
    notes: {
      'zh-CN': [
        '菜谱扩充至 300+ 道，中国菜按地区大幅补全（川、粤、京、湘、鲁、苏、浙、闽、东北、西北、云南、沪、家常）',
        '世界地图地区按钮悬停抖动修复，中国地图布局更清晰',
        '四川 / 粤菜 / 京菜等区域可直接浏览当地特色菜',
      ],
      'zh-TW': [
        '菜譜擴充至 300+ 道，中國菜按地區大幅補全（川、粵、京、湘、魯、蘇、浙、閩、東北、西北、雲南、滬、家常）',
        '世界地圖地區按鈕懸停抖動修復，中國地圖佈局更清晰',
        '四川 / 粵菜 / 京菜等區域可直接瀏覽當地特色菜',
      ],
      en: [
        'Catalog expanded to 300+ recipes with deep China regional coverage (Sichuan, Cantonese, Beijing, and more)',
        'Fixed region-button hover twitch; tidier China map layout',
        'Browse local specialties by region — Sichuan, Cantonese, Beijing, etc.',
      ],
    },
  },
  {
    version: '1.6.1',
    date: '2025-09-17',
    notes: {
      'zh-CN': [
        '世界地图重做：真实地球纹理、发光地标、浮动国名标签',
        '底部国家快捷按钮，点击即可进入地区美食',
        '修复地球无法点击、只有线框的问题',
      ],
      'zh-TW': [
        '世界地圖重做：真實地球紋理、發光地標、浮動國名標籤',
        '底部國家快捷按鈕，點擊即可進入地區美食',
        '修復地球無法點擊、只有線框的問題',
      ],
      en: [
        'World map rebuilt: earth texture, glowing pins, floating country labels',
        'Quick country chips under the globe for one-tap access',
        'Fixed blank wireframe globe and broken click targets',
      ],
    },
  },
  {
    version: '1.6.0',
    date: '2025-09-17',
    notes: {
      'zh-CN': [
        '菜谱大全全新改版：搜索 + 世界地图双模式',
        '3D 地球可旋转，点击国家 zoom 进入地区地图（如中国 → 四川）',
        '每个地区展示当地特色美食，辣度与风味标签筛选保留',
      ],
      'zh-TW': [
        '菜譜大全全新改版：搜索 + 世界地圖雙模式',
        '3D 地球可旋轉，點擊國家 zoom 進入地區地圖（如中國 → 四川）',
        '每個地區展示當地特色美食，辣度與風味標籤篩選保留',
      ],
      en: [
        'Dictionary redesigned: Search + World Map modes',
        'Spin a 3D globe, tap countries, zoom into regions (e.g. China → Sichuan)',
        'Each region shows local specialties; spice & flavor tag filters kept',
      ],
    },
  },
  {
    version: '1.5.0',
    date: '2025-09-17',
    notes: {
      'zh-CN': [
        '菜谱扩充至 105 道，重点补全泰式、韩式、日式等菜系',
        '新增：芒果糯米饭、部队锅、亲子丼、Chilaquiles、Baked Feta Pasta 等 36 道',
        '新增食材：芒果、红薯',
      ],
      'zh-TW': [
        '菜譜擴充至 105 道，重點補全泰式、韓式、日式等菜系',
        '新增：芒果糯米飯、部隊鍋、親子丼、Chilaquiles、Baked Feta Pasta 等 36 道',
        '新增食材：芒果、地瓜',
      ],
      en: [
        'Catalog expanded to 105 recipes — Thai, Korean, Japanese, and more filled out',
        '36 new dishes: mango sticky rice, army stew, oyakodon, chilaquiles, baked feta pasta, and more',
        'New ingredients: mango, sweet potato',
      ],
    },
  },
  {
    version: '1.4.0',
    date: '2025-09-17',
    notes: {
      'zh-CN': [
        '新增 28 道全球菜系：泰式、韩式、日式、墨西哥、印度、中东、越南等',
        '小红书 & Instagram 热门菜：Pad Thai、沙威玛、Bibimbap、Gochujang 意面等',
        '菜谱大全新增按菜系筛选（泰式/韩式/日式/印度/墨西哥/中东…）',
        '新增食材：味噌、韩式辣酱、鹰嘴豆、酸奶、青柠、卷心菜等',
      ],
      'zh-TW': [
        '新增 28 道全球菜系：泰式、韓式、日式、墨西哥、印度、中東、越南等',
        '小紅書 & Instagram 熱門菜：Pad Thai、沙威瑪、Bibimbap、Gochujang 義麵等',
        '菜譜大全新增按菜系篩選（泰式/韓式/日式/印度/墨西哥/中東…）',
        '新增食材：味噌、韓式辣醬、鷹嘴豆、優格、青檸、高麗菜等',
      ],
      en: [
        'Added 28 world-cuisine recipes: Thai, Korean, Japanese, Mexican, Indian, Middle Eastern, Vietnamese',
        'Rednote & Instagram hits: Pad Thai, shawarma, bibimbap, gochujang pasta, and more',
        'Dictionary filters for Thai, Korean, Japanese, Indian, Mexican, Middle Eastern, and more',
        'New ingredients: miso, gochujang, chickpeas, yogurt, lime, cabbage, and more',
      ],
    },
  },
  {
    version: '1.3.0',
    date: '2025-09-17',
    notes: {
      'zh-CN': [
        '品牌焕新为 Ember 余温',
        '中文界面显示「余温」，英文显示「Ember」',
      ],
      'zh-TW': [
        '品牌煥新為 Ember 餘溫',
        '中文介面顯示「餘溫」，英文顯示「Ember」',
      ],
      en: [
        'Rebranded to Ember 余温',
        'Chinese UI shows 余温; English shows Ember',
      ],
    },
  },
  {
    version: '1.2.1',
    date: '2025-09-17',
    notes: {
      'zh-CN': [
        '每道菜新增辣度与风味标签',
        '菜谱大全支持按辣度、风味筛选与搜索',
      ],
      'zh-TW': [
        '每道菜新增辣度與風味標籤',
        '菜譜大全支持按辣度、風味篩選與搜索',
      ],
      en: [
        'Every dish now has spice level and flavor tags',
        'Dictionary supports filtering and searching by flavor and spice',
      ],
    },
  },
  {
    version: '1.2.0',
    date: '2025-09-17',
    notes: {
      'zh-CN': [
        '菜谱扩充至 42 道（含小红书热门家常菜）',
        '新增菜谱大全：支持中文/英文菜名搜索',
        '新增食材：茄子、黄瓜、花生、四季豆等',
      ],
      'zh-TW': [
        '菜譜擴充至 42 道（含小紅書熱門家常菜）',
        '新增菜譜大全：支持中文/英文菜名搜索',
        '新增食材：茄子、黃瓜、花生、四季豆等',
      ],
      en: [
        'Expanded to 42 recipes including Rednote-style home cooking',
        'Added recipe dictionary with bilingual dish name search',
        'New ingredients: eggplant, cucumber, peanuts, green beans',
      ],
    },
  },
  {
    version: '1.1.0',
    date: '2025-09-17',
    notes: {
      'zh-CN': [
        '品牌焕新为 Simmr',
        '新增设置：语言、深浅色、字号、闹钟样式',
        '首页展示「037、」出品信息',
        '新增更新日志',
      ],
      'zh-TW': [
        '品牌煥新為 Simmr',
        '新增設定：語言、深淺色、字級、鬧鐘樣式',
        '首頁展示「037、」出品資訊',
        '新增更新日誌',
      ],
      en: [
        'Rebranded to Simmr',
        'Settings: language, theme, text size, alarm style',
        'Home page credits 037、',
        'Added update journal',
      ],
    },
  },
  {
    version: '1.0.0',
    date: '2025-09-17',
    notes: {
      'zh-CN': [
        '首次发布：食材输入与偏好匹配',
        '分步烹饪指引与计时器',
        '闹钟与浏览器通知',
      ],
      'zh-TW': [
        '首次發布：食材輸入與偏好匹配',
        '分步烹飪指引與計時器',
        '鬧鐘與瀏覽器通知',
      ],
      en: [
        'Initial release: ingredient input & preference matching',
        'Step-by-step cooking with timers',
        'Alarms and browser notifications',
      ],
    },
  },
];
