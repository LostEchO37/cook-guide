/** Update journal — add a new entry at the top for each release. */

export const APP_VERSION = '2.2.0';

export const CHANGELOG = [
  {
    version: '2.2.0',
    date: '2026-09-18',
    notes: {
      'zh-CN': [
        '新增社区厨房：本周 Top 5 菜品榜',
        '烹饪完成后可上传成品照片，其他人可浏览与点赞',
        '导航与首页可打开社区；分享需登录账号',
      ],
      'zh-TW': [
        '新增社區廚房：本週 Top 5 菜品榜',
        '烹飪完成後可上傳成品照片，其他人可瀏覽與按讚',
        '導航與首頁可打開社區；分享需登入帳號',
      ],
      en: [
        'Community kitchen: weekly Top 5 dishes',
        'After cooking, share a dish photo; others can view and like',
        'Open community from nav or home; sharing requires sign-in',
      ],
    },
  },
  {
    version: '2.1.0',
    date: '2026-09-18',
    notes: {
      'zh-CN': [
        '新增用户账号：注册、登录、退出，云端同步烹饪记录与评分',
        '支持访客模式，无需注册即可使用全部功能',
        '个人资料页展示最近做过的菜；首页与导航显示登录状态',
        '分析 API 新增 /api/auth 账号接口（Vercel 部署）',
      ],
      'zh-TW': [
        '新增使用者帳號：註冊、登入、登出，雲端同步烹飪記錄與評分',
        '支援訪客模式，無需註冊即可使用全部功能',
        '個人資料頁展示最近做過的菜；首頁與導航顯示登入狀態',
        '分析 API 新增 /api/auth 帳號接口（Vercel 部署）',
      ],
      en: [
        'User accounts: sign up, log in, log out — cook history and ratings sync to the cloud',
        'Guest mode: full app access without registration',
        'Profile page with recent dishes; home dock and nav reflect sign-in state',
        'Analytics API adds /api/auth routes (Vercel deployment)',
      ],
    },
  },
  {
    version: '1.9.1',
    date: '2025-09-18',
    notes: {
      'zh-CN': [
        '公开地址恢复为 https://lostecho37.github.io/cook-guide/',
        '分析服务器部署至 HTTPS（Render），GitHub Pages 可上报访问数据',
        '门户：https://ember-analytics.onrender.com/portal',
      ],
      'zh-TW': [
        '公開地址恢復為 https://lostecho37.github.io/cook-guide/',
        '分析伺服器部署至 HTTPS（Render），GitHub Pages 可上報訪問數據',
        '門戶：https://ember-analytics.onrender.com/portal',
      ],
      en: [
        'Public site back at https://lostecho37.github.io/cook-guide/',
        'Analytics deployed to HTTPS on Render — GitHub Pages sends live events',
        'Portal: https://ember-analytics.onrender.com/portal',
      ],
    },
  },
  {
    version: '1.9.0',
    date: '2025-09-18',
    notes: {
      'zh-CN': [
        '浏览器标题与主屏幕名称统一为 Ember 品牌',
        '分析门户说明更新：家庭用 GitHub Pages，本地开发用 8787',
      ],
      'zh-TW': [
        '瀏覽器標題與主畫面名稱統一為 Ember 品牌',
        '分析門戶說明更新：家庭用 GitHub Pages，本地開發用 8787',
      ],
      en: [
        'Browser tab and home-screen label use Ember branding',
        'Analytics docs: family site on Pages, live counts via local :8787 or deployed HTTPS',
      ],
    },
  },
  {
    version: '1.8.9',
    date: '2025-09-18',
    notes: {
      'zh-CN': [
        '修复烹饪步骤中英文食材名混用（如百里香）',
        '分析服务器与门户数字实时更新；请从 http://127.0.0.1:8787/ 打开应用',
        '新增 80+ 食材中文翻译，覆盖各国菜谱',
      ],
      'zh-TW': [
        '修復烹飪步驟中英文食材名混用（如百里香）',
        '分析伺服器與門戶數字即時更新；請從 http://127.0.0.1:8787/ 開啟應用',
        '新增 80+ 食材中文翻譯，涵蓋各國菜譜',
      ],
      en: [
        'Fix English ingredient names leaking into Chinese step text',
        'Analytics portal counts update live; open the app at http://127.0.0.1:8787/',
        '80+ ingredient translations added for international dishes',
      ],
    },
  },
  {
    version: '1.8.8',
    date: '2025-09-18',
    notes: {
      'zh-CN': [
        '删除「蛋炒饭变奏」等重复变体菜，改为各国各地不同菜品',
        '地图新增菲律宾、印尼、马来西亚、新加坡、南美、摩洛哥、埃塞俄比亚、尼日利亚、法国、西班牙等',
        '菜谱库补充阿斗波、仁当、椰浆饭、酸橘汁腌鱼、塔吉锅等真实地方菜',
      ],
      'zh-TW': [
        '刪除「蛋炒飯變奏」等重複變體菜，改為各國各地不同菜品',
        '地圖新增菲律賓、印尼、馬來西亞、新加坡、南美、摩洛哥、衣索比亞、奈及利亞、法國、西班牙等',
        '菜譜庫補充阿斗波、仁當、椰漿飯、酸橘汁醃魚、塔吉鍋等真實地方菜',
      ],
      en: [
        'Removed clone “Variant” dishes; replaced with distinct recipes',
        'Map adds Philippines, Indonesia, Malaysia, Singapore, South America, Morocco, Ethiopia, Nigeria, France, Spain, and more',
        'Catalog gains real regional dishes like adobo, rendang, nasi lemak, ceviche, and tagine',
      ],
    },
  },
  {
    version: '1.8.7',
    date: '2025-09-18',
    notes: {
      'zh-CN': [
        '修复华为等设备上地区菜谱列表拖影与帧率骤降',
        '设置下拉菜单改为自定义列表，避免白底白字',
        '降低动画与毛玻璃负载，减少界面卡顿与崩溃',
      ],
      'zh-TW': [
        '修復華為等裝置上地區菜譜列表殘影與幀率驟降',
        '設定下拉選單改為自訂列表，避免白底白字',
        '降低動畫與毛玻璃負載，減少介面卡頓與崩潰',
      ],
      en: [
        'Fix region dish-list ghost trails and FPS drops on Huawei devices',
        'Custom settings menus to avoid white-on-white dropdowns',
        'Lower animation and blur load to reduce stutter and crashes',
      ],
    },
  },
  {
    version: '1.8.6',
    date: '2025-09-18',
    notes: {
      'zh-CN': [
        '闹钟按钮可可靠开关；关闭后不再响铃与弹窗',
        '评分后按钮由「跳过」改为「关闭」',
        '菜谱扩充至 500+，中国地图新增山西，步骤教程更完整',
      ],
      'zh-TW': [
        '鬧鐘按鈕可可靠開關；關閉後不再響鈴與彈窗',
        '評分後按鈕由「跳過」改為「關閉」',
        '菜譜擴充至 500+，中國地圖新增山西，步驟教學更完整',
      ],
      en: [
        'Alarm button toggles off reliably; no beep or overlay when off',
        'After rating, Skip is now Close',
        '500+ dishes, Shan Xi on the China map, fuller step tutorials',
      ],
    },
  },
  {
    version: '1.8.5',
    date: '2025-09-18',
    notes: {
      'zh-CN': [
        '修复闹钟按钮打开后无法关闭的问题',
        '关闭闹钟后不再弹出计时结束提示与通知',
      ],
      'zh-TW': [
        '修復鬧鐘按鈕打開後無法關閉的問題',
        '關閉鬧鐘後不再彈出計時結束提示與通知',
      ],
      en: [
        'Fixed alarm button that could not be turned off after enabling',
        'With alarms off, timer-done overlay and notifications stay quiet',
      ],
    },
  },
  {
    version: '1.8.4',
    date: '2025-09-18',
    notes: {
      'zh-CN': [
        '修复 Android 食材页大片空白、碗图显示不全的问题',
        '手机端布局更紧凑，底部按钮不易被系统栏挡住',
        '优化 Android App 内网页缩放与安全区适配',
      ],
      'zh-TW': [
        '修復 Android 食材頁大片空白、碗圖顯示不全的問題',
        '手機端布局更緊湊，底部按鈕不易被系統欄擋住',
        '優化 Android App 內網頁縮放與安全區適配',
      ],
      en: [
        'Fixed Android ingredients page empty space and incomplete bowl graphic',
        'Tighter phone layout; bottom actions clearer above system bars',
        'Improved Android app WebView scaling and safe-area handling',
      ],
    },
  },
  {
    version: '1.8.3',
    date: '2025-09-18',
    notes: {
      'zh-CN': [
        '修复手机/平板上首页名言与标题重叠的问题',
        '左下角新增「添加到主屏幕」与「下载 APK」按钮（仅首页显示）',
        '创作者的话弹窗：赞赏说明移至二维码上方',
        'Android 用户可下载 APK 安装包使用',
      ],
      'zh-TW': [
        '修復手機/平板上首頁名言與標題重疊的問題',
        '左下角新增「添加到主畫面」與「下載 APK」按鈕（僅首頁顯示）',
        '創作者的話彈窗：讚賞說明移至二維碼上方',
        'Android 用戶可下載 APK 安裝包使用',
      ],
      en: [
        'Fixed hero quote overlap on phones and tablets',
        'Home-screen shortcuts: Add to Home + Download APK (hero only)',
        'Creator\'s words: reward caption moved above the QR code',
        'Android APK available for sideload install',
      ],
    },
  },
  {
    version: '1.8.2',
    date: '2025-09-18',
    notes: {
      'zh-CN': [
        '首页右下角新增「创作者的话」与「更新日志」快捷入口',
        '创作者的话含个人说明与微信赞赏二维码',
        '037、署名位置上移，首页布局更清爽',
      ],
      'zh-TW': [
        '首頁右下角新增「創作者的話」與「更新日誌」快捷入口',
        '創作者的話含個人說明與微信讚賞二維碼',
        '037、署名位置上移，首頁布局更清爽',
      ],
      en: [
        'Hero bottom-right shortcuts: Creator\'s words & Update journal',
        'Creator\'s words modal with a note from 037、 and WeChat Pay QR',
        'Moved the presented-by credit higher on the home page',
      ],
    },
  },
  {
    version: '1.8.1',
    date: '2025-09-18',
    notes: {
      'zh-CN': [
        '修复中文界面仍显示英文食材名（如 greens、bitter melon）的问题',
        '菜谱步骤扩展更稳定：浏览/烹饪时均保证 8–10 步完整指引',
        '中文步骤不再混入英文原文提示',
      ],
      'zh-TW': [
        '修復中文介面仍顯示英文食材名（如 greens、bitter melon）的問題',
        '菜譜步驟擴展更穩定：瀏覽/烹飪時均保證 8–10 步完整指引',
        '中文步驟不再混入英文原文提示',
      ],
      en: [
        'Fixed English ingredient names leaking into Chinese UI',
        'Step expansion now applied consistently when browsing and cooking',
        'Chinese steps no longer embed raw English hint text',
      ],
    },
  },
  {
    version: '1.8.0',
    date: '2025-09-18',
    notes: {
      'zh-CN': [
        '全部菜谱步骤大幅完善：从备料、下锅到判断熟度、装盘，每道菜都有清晰指引',
        '短步骤菜谱自动扩展为 8–10 步详细流程（中/英/繁）',
        '中国地图新增海南地区；川菜标签更正为「川菜」',
        '食材页空白间距收紧，浏览菜谱更顺手',
      ],
      'zh-TW': [
        '全部菜譜步驟大幅完善：從備料、下鍋到判斷熟度、裝盤，每道菜都有清晰指引',
        '短步驟菜譜自動擴展為 8–10 步詳細流程（中/英/繁）',
        '中國地圖新增海南地區；川菜標籤更正為「川菜」',
        '食材頁空白間距收緊，瀏覽菜譜更順手',
      ],
      en: [
        'Every recipe now has detailed steps: prep → cook → doneness cues → plating',
        'Short recipes auto-expand to 8–10 clear bilingual steps',
        'Added Hainan on the China map; Sichuan label reads 川菜',
        'Tighter spacing on the ingredients page',
      ],
    },
  },
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
