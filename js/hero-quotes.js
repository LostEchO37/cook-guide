/** Hero quote pairs — original language on top, English gloss below. */

export const HERO_QUOTES = [
  {
    original: { text: '人间烟火气，最抚凡人心', lang: 'zh', label: '中', script: 'cjk' },
    en: 'The warmth of home cooking comforts the soul.',
  },
  {
    original: { text: '好好吃饭，是对生活最低的温柔', lang: 'zh', label: '中', script: 'cjk' },
    en: 'Eating well is the gentlest kindness we owe ourselves.',
  },
  {
    original: { text: '一菜一世界，一味一人生', lang: 'zh', label: '中', script: 'cjk' },
    en: 'Every dish holds a world; every flavor, a life.',
  },
  {
    original: { text: '唯有爱与美食不可辜负', lang: 'zh', label: '中', script: 'cjk' },
    en: 'Love and good food are never to be wasted.',
  },
  {
    original: { text: '灶台上的温度，是家的记号', lang: 'zh', label: '中', script: 'cjk' },
    en: 'The heat of the stove is the signature of home.',
  },
  {
    original: { text: '人間煙火氣，最撫凡人心', lang: 'zh-TW', label: '繁', script: 'cjk' },
    en: 'The warmth of everyday cooking comforts the soul.',
  },
  {
    original: { text: '食物是治癒一切的良藥', lang: 'zh-TW', label: '繁', script: 'cjk' },
    en: 'Food is the medicine that heals everything.',
  },
  {
    original: { text: '食うことは生きること', lang: 'ja', label: '日', script: 'cjk' },
    en: 'To eat is to live.',
  },
  {
    original: { text: '台所に愛がある', lang: 'ja', label: '日', script: 'cjk' },
    en: 'There is love in the kitchen.',
  },
  {
    original: { text: 'お腹が減っては戦ができぬ', lang: 'ja', label: '日', script: 'cjk' },
    en: 'An army marches on its stomach.',
  },
  {
    original: { text: 'L\'amour passe par l\'estomac', lang: 'fr', label: 'FR', script: 'latin' },
    en: 'The way to the heart is through the stomach.',
  },
  {
    original: { text: 'La vie est faite de petits plaisirs', lang: 'fr', label: 'FR', script: 'latin' },
    en: 'Life is made of small pleasures.',
  },
  {
    original: { text: 'Bon repas, bonne humeur', lang: 'fr', label: 'FR', script: 'latin' },
    en: 'A good meal makes for a good mood.',
  },
  {
    original: { text: '밥심이 인심', lang: 'ko', label: '한', script: 'cjk' },
    en: 'A full meal opens the heart.',
  },
  {
    original: { text: '집밥이 최고', lang: 'ko', label: '한', script: 'cjk' },
    en: 'Nothing beats a home-cooked meal.',
  },
  {
    original: { text: 'A tavola non si invecchia', lang: 'it', label: 'IT', script: 'latin' },
    en: 'At the table, no one grows old.',
  },
  {
    original: { text: 'L\'appetito vien mangiando', lang: 'it', label: 'IT', script: 'latin' },
    en: 'Appetite comes with eating.',
  },
  {
    original: { text: 'Barriga llena, corazón contento', lang: 'es', label: 'ES', script: 'latin' },
    en: 'Full belly, happy heart.',
  },
  {
    original: { text: 'Der Appetit kommt beim Essen', lang: 'de', label: 'DE', script: 'latin' },
    en: 'Appetite comes while eating.',
  },
  {
    original: { text: 'อาหารคือภาษาแห่งความรัก', lang: 'th', label: 'TH', script: 'cjk' },
    en: 'Food is the language of love.',
  },
];

const ROTATE_MS = 8000;
const FADE_MS = 700;

let timer = null;
let fadeTimer = null;
let pool = [];
let poolIdx = 0;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function nextPair() {
  const pair = pool[poolIdx % pool.length];
  poolIdx += 1;
  if (poolIdx >= pool.length) {
    poolIdx = 0;
    shuffle(pool);
  }
  return pair;
}

function lineHtml(line, tag) {
  const body = line.script === 'cjk' ? `「${line.text}」` : line.text;
  return `
    <span class="hero-quote__tag">${tag}</span>
    <p class="hero-quote hero-quote--${line.script}">${body}</p>
  `;
}

function setPairContent(root, pair) {
  const orig = root.querySelector('[data-role="original"]');
  const en = root.querySelector('[data-role="en"]');
  if (!orig || !en) return;

  orig.innerHTML = lineHtml(pair.original, pair.original.label);

  if (pair.en && pair.original.lang !== 'en') {
    en.hidden = false;
    en.innerHTML = lineHtml(
      { text: pair.en, lang: 'en', script: 'latin' },
      'EN',
    );
  } else {
    en.hidden = true;
    en.innerHTML = '';
  }
}

function revealLines(root) {
  requestAnimationFrame(() => {
    root.querySelectorAll('.hero-quote').forEach((el) => {
      el.classList.remove('hero-quote--exit');
      el.classList.add('hero-quote--visible');
    });
  });
}

function hideLines(root) {
  root.querySelectorAll('.hero-quote').forEach((el) => {
    el.classList.remove('hero-quote--visible');
    el.classList.add('hero-quote--exit');
  });
}

function showPair(root, pair) {
  setPairContent(root, pair);
  revealLines(root);
}

function rotatePair(root) {
  hideLines(root);
  if (fadeTimer) clearTimeout(fadeTimer);
  fadeTimer = setTimeout(() => {
    showPair(root, nextPair());
    fadeTimer = null;
  }, FADE_MS);
}

export function stopHeroQuotes() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  if (fadeTimer) {
    clearTimeout(fadeTimer);
    fadeTimer = null;
  }
  poolIdx = 0;
}

export function clearHeroQuotes(root) {
  stopHeroQuotes();
  if (root) root.innerHTML = '';
}

export function startHeroQuotes(root) {
  stopHeroQuotes();
  if (!root) return;

  root.innerHTML = `
    <div class="hero-quote-slot" data-role="original"></div>
    <div class="hero-quote-slot hero-quote-slot--en" data-role="en"></div>
  `;

  pool = shuffle([...HERO_QUOTES]);
  poolIdx = 0;
  showPair(root, nextPair());

  timer = setInterval(() => rotatePair(root), ROTATE_MS);
}
