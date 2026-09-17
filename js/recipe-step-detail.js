/**
 * Expand thin recipe steps into clear, beginner-friendly cooking guidance.
 * Covers prep → cook → doneness cues → plating, in zh-CN / zh-TW / en.
 */

import { displayIngredient } from './ingredients.js';

const MIN_STEPS = 6;
const MIN_CHARS = 280;

const PROTEINS = new Set([
  'chicken', 'beef', 'pork', 'lamb', 'fish', 'shrimp', 'egg', 'eggs', 'tofu',
  'duck', 'crab', 'sausage', 'bacon',
]);
const CARBS = new Set([
  'rice', 'noodles', 'pasta', 'bread', 'potato', 'flour', 'wonton', 'dumpling',
]);
const AROMATICS = new Set(['garlic', 'ginger', 'onion', 'scallion', 'shallot', 'chili']);

function blob(recipe) {
  return [
    recipe.id,
    recipe.name,
    recipe.names?.['zh-CN'],
    recipe.names?.['zh-TW'],
    ...(recipe.aliases || []),
    ...(recipe.tags || []),
    ...(recipe.ingredients || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function hasAny(text, words) {
  return words.some((w) => text.includes(w));
}

function detectMethod(recipe) {
  const b = blob(recipe);
  if (hasAny(b, ['汤', 'soup', 'broth', 'stew', '煲', '羹', 'hotpot', '火锅', '锅'])) return 'soup';
  if (hasAny(b, ['面', 'noodle', 'ramen', 'udon', 'pasta', '意面', '米粉', '河粉'])) return 'noodle';
  if (hasAny(b, ['饭', 'rice', 'risotto', '丼', '盖饭', '炒饭'])) return 'rice';
  if (hasAny(b, ['蒸', 'steam', 'dumpling', 'wonton', '包子', '饺子', '抄手', '烧卖'])) return 'steam';
  if (hasAny(b, ['红烧', 'braise', 'stew', '卤', '酱', '焖'])) return 'braise';
  if (hasAny(b, ['炸', 'fry', 'crispy', '油炸', 'tempura'])) return 'fry';
  if (hasAny(b, ['烤', 'roast', 'bake', 'grill', 'oven', 'bbq'])) return 'roast';
  if (hasAny(b, ['凉拌', 'salad', 'cold', 'pickle', '泡'])) return 'cold';
  if (hasAny(b, ['curry', '咖喱', 'masala'])) return 'curry';
  if (hasAny(b, ['炒', 'stir', 'wok', '小炒', '翻炒'])) return 'stirfry';
  return 'general';
}

function listIngredients(recipe, lang) {
  const ings = recipe.ingredients || [];
  if (!ings.length) return lang.startsWith('zh') ? '所需食材' : 'listed ingredients';
  const sep = lang.startsWith('zh') ? '、' : ', ';
  return ings.slice(0, 8).map((key) => displayIngredient(key, lang) || key).join(sep);
}

function proteinCue(ings) {
  return (ings || []).find((i) => PROTEINS.has(String(i).toLowerCase())) || null;
}

function step(en, zhCN, zhTW, timer = null) {
  return {
    instruction: en,
    instructions: { en, 'zh-CN': zhCN, 'zh-TW': zhTW || zhCN },
    timer,
  };
}

function originalHints(recipe) {
  return (recipe.steps || [])
    .map((s) => s.instruction || s.instructions?.en || '')
    .filter(Boolean);
}

function buildSteps(recipe) {
  const method = detectMethod(recipe);
  const ings = recipe.ingredients || [];
  const protein = proteinCue(ings);
  const hasCarb = ings.some((i) => CARBS.has(String(i).toLowerCase()));
  const hasAromatic = ings.some((i) => AROMATICS.has(String(i).toLowerCase()));
  const hints = originalHints(recipe);
  const hintLine = hints.length
    ? hints.join(' → ')
    : '';

  const nameCN = recipe.names?.['zh-CN'] || recipe.name;
  const ingEN = listIngredients(recipe, 'en');
  const ingCN = listIngredients(recipe, 'zh-CN');
  const ingTW = listIngredients(recipe, 'zh-TW');

  const out = [];

  // 1. Mise en place
  out.push(step(
    `Read the dish once: ${recipe.name}. Lay out ${ingEN}. Wash produce, pat protein dry, and measure sauces before the stove goes on.`,
    `先通读一遍「${nameCN}」。备齐${ingCN}：蔬菜洗净沥干，肉类用厨房纸吸干表面水分，酱料提前量好。灶台开火前完成全部准备工作。`,
    `先通讀一遍「${nameCN}」。備齊${ingTW}：蔬菜洗淨瀝乾，肉類用廚房紙吸乾表面水分，醬料提前量好。開火前完成全部準備。`,
    300,
  ));

  // 2. Prep protein / main ingredient
  if (protein) {
    const proteinEN = displayIngredient(protein, 'en');
    const proteinCN = displayIngredient(protein, 'zh-CN');
    const proteinTW = displayIngredient(protein, 'zh-TW');
    out.push(step(
      `Prep the ${proteinEN}: trim, cut into even pieces (about 1–2 cm for stir-fries; thicker for braises). Season lightly with salt and a splash of soy sauce if used in this dish. Rest 5–10 minutes.`,
      protein === 'egg' || protein === 'eggs'
        ? '处理蛋类：打散或切好备用，可加少许盐抓匀，让味道更容易进去。'
        : `处理${proteinCN}：切成均匀块（快炒约 1–2 厘米；炖煮可稍大）。可加少许盐/酱油抓匀腌 5–10 分钟，让味道更容易进去。`,
      protein === 'egg' || protein === 'eggs'
        ? '處理蛋類：打散或切好備用，可加少許鹽抓勻。'
        : `處理${proteinTW}：切成均勻塊（快炒約 1–2 公分；燉煮可稍大）。可加少許鹽/醬油抓勻醃 5–10 分鐘。`,
      420,
    ));
  } else {
    out.push(step(
      `Prep the main ingredients into even sizes so they cook at the same rate. Keep aromatics, sauces, and vegetables in separate bowls.`,
      `把主要食材切成大小相近的块，保证受热均匀。香料、酱汁、蔬菜分开放，方便按顺序下锅。`,
      `把主要食材切成大小相近的塊，保證受熱均勻。香料、醬汁、蔬菜分開放。`,
      300,
    ));
  }

  // 3. Aromatics / sauce mix
  if (hasAromatic || hasAny(blob(recipe), ['sauce', '酱', '油', '醋', 'soy'])) {
    out.push(step(
      `Mince garlic/ginger/scallion as needed. Mix a quick sauce bowl (soy sauce, sugar, vinegar, chili oil, starch slurry — whatever this recipe uses) so you can pour in one go.`,
      `按需切好蒜末、姜丝、葱花。把酱油、糖、醋、辣油、水淀粉等调成一碗料汁，下锅时一次倒入，避免手忙脚乱。`,
      `按需切好蒜末、薑絲、蔥花。把醬油、糖、醋、辣油、水澱粉等調成一碗料汁，下鍋時一次倒入。`,
      180,
    ));
  }

  // Method-specific core (steps 4–7)
  const cores = {
    stirfry: [
      step(
        'Heat a wok or large pan over medium-high until a drop of water skitters. Add 1–2 tbsp oil and swirl to coat.',
        '炒锅中大火烧热，滴水可快速滚动。倒入 1–2 勺油，晃锅让油布满锅底。',
        '炒鍋中大火燒熱，滴水可快速滾動。倒入 1–2 匙油，晃鍋讓油布滿鍋底。',
        90,
      ),
      step(
        protein
          ? `Stir-fry the ${protein} first until the outside turns opaque/lightly browned and it is about 80% cooked. Scoop out.`
          : 'Stir-fry the main ingredients first until they soften and pick up color. Scoop out if the pan is crowded.',
        protein
          ? '先下肉类大火快炒，表面变色、八成熟即可盛出，避免出水变老。'
          : '先下主料大火翻炒至变软上色；锅太满就分批炒，盛出备用。',
        protein
          ? '先下肉類大火快炒，表面變色、八成熟即可盛出。'
          : '先下主料大火翻炒至變軟上色；鍋太滿就分批炒。',
        240,
      ),
      step(
        'In the same pan, stir aromatics 20–30 seconds until fragrant (do not burn). Add vegetables hard-to-soft order (carrot/pepper before leafy greens).',
        '原锅下葱姜蒜爆香约 20–30 秒（别糊）。再按先硬后软下菜：胡萝卜/青椒先下，叶菜最后。',
        '原鍋下蔥薑蒜爆香約 20–30 秒。再按先硬後軟下菜。',
        180,
      ),
      step(
        'Return protein, pour in the sauce, and toss 30–60 seconds until glossy and everything is hot. If too dry, splash a spoon of water.',
        '倒回肉类，淋入料汁，快速翻匀 30–60 秒至裹汁发亮、全部热透。偏干就少许补水。',
        '倒回肉類，淋入料汁，快速翻勻 30–60 秒至裹汁發亮。',
        90,
      ),
    ],
    soup: [
      step(
        'Bring water or stock to a boil in a pot. Skim any foam later for a clearer broth.',
        '锅中加水或高汤大火烧开。煮的过程随时撇去浮沫，汤会更清。',
        '鍋中加水或高湯大火燒開。隨時撇去浮沫，湯會更清。',
        300,
      ),
      step(
        'Add bones/protein or hardy vegetables first; simmer gently (small bubbles, not a rolling boil) so the broth stays clear and tender.',
        '先下骨头/肉类或不易熟的蔬菜；转小火保持轻轻冒泡（不要剧烈沸腾），肉更嫩、汤更清。',
        '先下骨頭/肉類或不易熟的蔬菜；轉小火保持輕輕冒泡。',
        900,
      ),
      step(
        'Add remaining ingredients and seasonings. Taste the broth and adjust salt — soup should taste savory, not flat.',
        '再下其余食材和调味。尝一口汤：应鲜咸合适；淡就补盐/酱油，咸就补一点热水。',
        '再下其餘食材和調味。嘗一口湯並調整鹹淡。',
        480,
      ),
      step(
        'Finish with greens/scallion/sesame oil in the last 1–2 minutes so they stay bright.',
        '叶菜、葱花、香油放最后 1–2 分钟，颜色翠绿、香气才足。',
        '葉菜、蔥花、香油放最後 1–2 分鐘。',
        120,
      ),
    ],
    noodle: [
      step(
        'Boil a large pot of water. Cook noodles until just shy of done (they will finish in the sauce). Reserve a cup of cooking water, then drain.',
        '大锅水烧开下面。煮到还差一点点全熟（还要拌酱），留一碗面汤再捞出沥干。',
        '大鍋水燒開下面。煮到還差一點點全熟，留一碗麵湯再撈出瀝乾。',
        480,
      ),
      step(
        'Meanwhile cook toppings/sauce in a pan: brown meat or soften vegetables, then stir in seasonings until aromatic.',
        '同时做浇头/酱汁：肉炒香或蔬菜炒软，再下调味炒出香味。',
        '同時做澆頭/醬汁：肉炒香或蔬菜炒軟，再下調味。',
        360,
      ),
      step(
        'Toss noodles with sauce over medium heat 30–60 seconds. Loosen with noodle water until every strand is coated.',
        '中火把面与酱汁拌匀 30–60 秒；偏干就加面汤，直到每根面条都裹上汁。',
        '中火把麵與醬汁拌勻 30–60 秒；偏乾就加麵湯。',
        90,
      ),
      step(
        'Plate and add toppings (meat, egg, herbs, chili oil). Serve immediately while hot.',
        '盛碗，铺上肉末/蛋/香菜/红油等。趁热吃，面放久会吸干酱汁。',
        '盛碗，舖上肉末/蛋/香菜/紅油等。趁熱吃。',
        60,
      ),
    ],
    rice: [
      step(
        hasCarb
          ? 'Cook rice ahead or use day-old cold rice (best for fried rice). Fluff so grains separate.'
          : 'Prepare the rice base: rinse until water runs clearer, cook, then rest 5 minutes covered.',
        hasCarb
          ? '米饭最好用隔夜冷饭（炒饭不易黏）。先拨散成粒。'
          : '米洗净至水较清，按比例煮熟，焖 5 分钟再开盖。',
        hasCarb
          ? '米飯最好用隔夜冷飯。先撥散成粒。'
          : '米洗淨煮熟，燜 5 分鐘再開蓋。',
        600,
      ),
      step(
        'Cook protein and vegetables in a hot oiled pan until nearly done; push aside or set aside.',
        '热锅凉油，先炒肉和菜至将熟，推到一边或盛出。',
        '熱鍋涼油，先炒肉和菜至將熟，推到一邊或盛出。',
        300,
      ),
      step(
        'Add rice, break clumps, and stir-fry on high heat until grains are hot and lightly toasted.',
        '下饭，压散饭团，大火翻炒至粒粒分明、锅气出来。',
        '下飯，壓散飯團，大火翻炒至粒粒分明。',
        240,
      ),
      step(
        'Season (soy/salt/pepper), toss with aromatics, taste, and serve hot.',
        '加酱油/盐/胡椒调味，撒葱花翻匀，尝味后趁热上桌。',
        '加醬油/鹽/胡椒調味，撒蔥花翻勻，趁熱上桌。',
        90,
      ),
    ],
    braise: [
      step(
        'Sear protein in a little oil until the surface browns — this builds flavor for the sauce.',
        '少许油把肉块表面煎上色，香味和酱色都会更好。',
        '少許油把肉塊表面煎上色。',
        300,
      ),
      step(
        'Add aromatics, then liquid (water/stock/soy). Bring to a boil, skim foam, then lower to a gentle simmer.',
        '下葱姜蒜与汤水/酱油。大火烧开撇沫，转小火慢慢煨。',
        '下蔥薑蒜與湯水/醬油。大火燒開撇沫，轉小火慢慢煨。',
        180,
      ),
      step(
        'Cover and braise until tender (chopsticks pierce easily). Flip halfway so both sides take color.',
        '盖盖焖至筷子能轻松插入。中途翻面，让两面都上色入味。',
        '蓋蓋燜至筷子能輕鬆插入。中途翻面。',
        1800,
      ),
      step(
        'Uncover, raise heat, and reduce sauce until it coats a spoon and clings to the food. Taste salt/sweet balance.',
        '开盖转中大火收汁，至酱汁能挂勺、裹在食材上。尝咸甜是否合适。',
        '開蓋轉中大火收汁，至醬汁能掛勺。嘗鹹甜是否合適。',
        360,
      ),
    ],
    steam: [
      step(
        'Set up a steamer: water boiling before food goes in. Oil the plate lightly so food releases easily.',
        '蒸锅水要先烧开再放食材。盘底可抹薄油，熟了更好取出。',
        '蒸鍋水要先燒開再放食材。盤底可抹薄油。',
        300,
      ),
      step(
        'Arrange food in one layer with space between pieces. Season lightly on top.',
        '食材平铺一层，不要堆太厚；表面轻轻调味。',
        '食材平鋪一層，不要堆太厚；表面輕輕調味。',
        120,
      ),
      step(
        'Steam over continuous rolling steam. Do not keep lifting the lid — temperature drops and food turns watery.',
        '保持足气蒸制，少开盖。频繁开盖会掉温、出水，口感变差。',
        '保持足氣蒸製，少開蓋。',
        720,
      ),
      step(
        'Check doneness: protein is opaque/firm; dumplings float and wrappers look translucent. Rest 1 minute, then dress with sauce/oil.',
        '判断熟度：肉不透红、鱼肉变白可轻松拨开；饺子浮起、皮呈半透明。静置 1 分钟再淋汁/热油。',
        '判斷熟度：肉不透紅；餃子浮起、皮呈半透明。靜置 1 分鐘再淋汁。',
        60,
      ),
    ],
    fry: [
      step(
        'Pat food very dry. Dust with starch/flour if the recipe calls for a coating — wet food spatters and stays soggy.',
        '食材表面务必擦干。如需裹粉/淀粉，粉层要均匀；太湿会爆油且不脆。',
        '食材表面務必擦乾。如需裹粉要均勻。',
        180,
      ),
      step(
        'Heat oil to about 170–180°C (a chopstick tip sizzles steadily). Fry in small batches — crowding cools the oil.',
        '油温约 170–180°C（筷子尖插入连续冒小泡）。少量分批炸，一次太多油温会掉。',
        '油溫約 170–180°C。少量分批炸。',
        300,
      ),
      step(
        'Fry until golden and crisp. Drain on a rack/paper. For extra crunch, fry a second time 30–45 seconds.',
        '炸至金黄酥脆，捞出沥油。想更脆可复炸 30–45 秒。',
        '炸至金黃酥脆，撈出瀝油。想更脆可復炸 30–45 秒。',
        360,
      ),
      step(
        'Toss with seasoning salt/sauce while hot so it sticks. Serve immediately.',
        '趁热拌椒盐或淋汁，更容易挂味。立刻上桌，放凉会回软。',
        '趁熱拌椒鹽或淋汁。立刻上桌。',
        60,
      ),
    ],
    roast: [
      step(
        'Preheat oven/grill fully. Line the tray and lightly oil. Room-temperature protein browns more evenly.',
        '烤箱/烤架先充分预热。烤盘垫纸并薄油。肉回温后再烤，上色更均匀。',
        '烤箱/烤架先充分預熱。肉回溫後再烤。',
        600,
      ),
      step(
        'Season or brush glaze. Leave space between pieces for hot air to circulate.',
        '均匀抹腌料/酱汁。块与块留缝，热气才能流通、外皮更香。',
        '均勻抹醃料/醬汁。塊與塊留縫。',
        120,
      ),
      step(
        'Roast, flipping once halfway. Look for deep browning and rendered juices — not pale and wet.',
        '烤制中途翻面一次。外表应呈深金黄色、边缘焦香，而不是发白出水。',
        '烤製中途翻面一次。外表應呈深金黃色。',
        1200,
      ),
      step(
        'Rest 5 minutes before cutting so juices stay inside. Check thickest part is cooked through (chicken 74°C / 165°F).',
        '出炉静置 5 分钟再切，肉汁才锁得住。鸡类最厚处应达 74°C，切开无血水。',
        '出爐靜置 5 分鐘再切。雞類最厚處應達 74°C。',
        300,
      ),
    ],
    cold: [
      step(
        'Cook or blanch ingredients that need heat; plunge in cold water to stop cooking and keep crunch/color.',
        '需要加热的食材焯水后立刻过冷水，保持脆嫩和颜色。',
        '需要加熱的食材焯水後立刻過冷水。',
        300,
      ),
      step(
        'Drain thoroughly — leftover water dilutes the dressing.',
        '务必沥干水分，否则凉拌汁会被冲淡、口味发飘。',
        '務必瀝乾水分，否則涼拌汁會被沖淡。',
        60,
      ),
      step(
        'Whisk dressing (salt, vinegar, soy, sesame oil, chili, sugar) until balanced: salty, tangy, fragrant.',
        '调汁：盐、醋、酱油、香油、辣椒、糖。目标是咸酸香平衡，可先蘸一点菜尝。',
        '調汁：鹽、醋、醬油、香油、辣椒、糖。目標是鹹酸香平衡。',
        120,
      ),
      step(
        'Toss well, rest 5–10 minutes for flavor to soak in, then serve cold or cool room temperature.',
        '拌匀后放置 5–10 分钟入味，再冷藏或室温食用。上桌前可再淋一点香油。',
        '拌勻後放置 5–10 分鐘入味。',
        300,
      ),
    ],
    curry: [
      step(
        'Bloom spices/paste in oil over medium heat until fragrant (1–2 minutes). Do not burn.',
        '中火用油炒香咖喱酱/香料 1–2 分钟，香味出来即可，避免糊锅发苦。',
        '中火用油炒香咖喱醬/香料 1–2 分鐘。',
        120,
      ),
      step(
        'Add protein and coat in the paste, then pour coconut milk/stock. Simmer gently.',
        '下肉翻匀裹酱，再倒椰浆/汤水，小火慢慢煮。',
        '下肉翻勻裹醬，再倒椰漿/湯水，小火慢慢煮。',
        600,
      ),
      step(
        'Add vegetables and simmer until tender and sauce thickens enough to coat a spoon.',
        '下蔬菜续煮至软熟，酱汁收稠到能挂勺。',
        '下蔬菜續煮至軟熟，醬汁收稠到能掛勺。',
        720,
      ),
      step(
        'Taste: balance salt, sweetness, and heat. Finish with lime/herbs if using. Serve with rice.',
        '尝味：调咸、甜、辣的平衡。可挤柠檬、撒香草。配米饭趁热吃。',
        '嘗味並調整鹹甜辣。配米飯趁熱吃。',
        60,
      ),
    ],
    general: [
      step(
        'Heat the pan/pot with a little oil over medium heat until ready for the first ingredients.',
        '中火热锅，倒少许油，油面流动发亮后再下第一批食材。',
        '中火熱鍋，倒少許油，油面發亮後再下第一批食材。',
        90,
      ),
      step(
        'Cook in stages: aromatics → main ingredients → seasonings. Do not dump everything in at once.',
        '分步下锅：先香料 → 再主料 → 最后调味。不要一股脑全倒进去。',
        '分步下鍋：先香料 → 再主料 → 最後調味。',
        480,
      ),
      step(
        'Keep the heat appropriate: high for searing/stir-frying, medium-low for simmering so nothing burns outside while raw inside.',
        '火候要对：爆香快炒用大火；焖煮用中小火，避免外焦里生。',
        '火候要對：爆香快炒用大火；燜煮用中小火。',
        300,
      ),
      step(
        'Taste and adjust seasoning near the end — salt, acid, sweetness, heat — until the flavor feels complete.',
        '出锅前尝味，用盐、酸、甜、辣微调，直到味道完整。',
        '出鍋前嘗味，用鹽、酸、甜、辣微調。',
        60,
      ),
    ],
  };

  out.push(...(cores[method] || cores.general));

  // Weave original hints for English only — avoid leaking English into zh UI
  if (hintLine && hintLine.length < 220) {
    out.push(step(
      `Key points from the classic method: ${hintLine}`,
      '本菜传统要点已融入以上各步；动手前再确认备料齐全、总时长充足即可。',
      '本菜傳統要點已融入以上各步；動手前再確認備料齊全、總時長充足即可。',
      null,
    ));
  }

  // Doneness
  out.push(step(
    protein
      ? `Doneness check: cut the thickest piece — juices should run clear (poultry), beef/pork should match your preferred color, shrimp pink and curled, fish flakes easily. Nothing should taste raw or rubbery.`
      : `Doneness check: vegetables should be tender-crisp or soft as the dish intends; starches cooked through; sauce should cling, not be watery or burnt.`,
    protein
      ? '判断熟了没有：切开最厚处——鸡肉应无血水；虾变红卷曲；鱼肉可轻松拨开。口感不该发腥或过老发柴。'
      : '判断熟了没有：蔬菜达到该脆或该软的程度；淀粉类已熟透；酱汁能裹住食材，不稀不糊不焦苦。',
    protein
      ? '判斷熟了沒有：切開最厚處——雞肉應無血水；蝦變紅捲曲；魚肉可輕鬆撥開。'
      : '判斷熟了沒有：蔬菜達到該脆或該軟的程度；醬汁能裹住食材。',
    null,
  ));

  // Serve
  out.push(step(
    `Plate while hot. Garnish with scallion/sesame/chili if you like. Serve ${recipe.name} immediately — most home dishes taste best fresh from the pan.`,
    `趁热装盘，按喜好撒葱花/芝麻/辣椒。立刻上桌——「${nameCN}」刚出锅时香味和口感最好。`,
    `趁熱裝盤，按喜好撒蔥花/芝麻/辣椒。立刻上桌——「${nameCN}」剛出鍋最好吃。`,
    null,
  ));

  return out;
}

export function needsDetailedSteps(recipe) {
  const steps = recipe?.steps || [];
  if (steps.length < MIN_STEPS) return true;
  const chars = steps.reduce((n, s) => n + String(s.instruction || '').length, 0);
  return chars < MIN_CHARS;
}

/** Return recipe with detailed bilingual steps when the original is too thin. */
export function withDetailedSteps(recipe) {
  if (!recipe) return recipe;
  if (needsDetailedSteps(recipe)) {
    return { ...recipe, steps: buildSteps(recipe) };
  }
  return {
    ...recipe,
    steps: (recipe.steps || []).map((s) => ({
      ...s,
      instructions: {
        en: s.instructions?.en || s.instruction,
        'zh-CN': s.instructions?.['zh-CN'] || s.instructions?.en || s.instruction,
        'zh-TW': s.instructions?.['zh-TW'] || s.instructions?.['zh-CN'] || s.instructions?.en || s.instruction,
      },
    })),
  };
}
