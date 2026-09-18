import {
  findRecipes,
  formatTime,
  estimateTotalTime,
  scoreRecipeWithPantry,
} from './recipes.js';
import {
  searchDictionary,
  getRecipeById,
  getRecipeDisplayName,
  getDictionarySpicyFilters,
  getDictionaryFlavorFilters,
  getAllRecipes,
} from './recipe-dictionary.js';
import { FoodMapController } from './food-map.js';
import { renderRecipeTagHtml } from './recipe-tags.js';
import {
  getSuggestions,
  getQuickAdd,
  normalizeIngredient,
  displayIngredient,
  displayIngredientList,
} from './ingredients.js';
import {
  localizeRecipe,
  localizeImprovisedRecipe,
} from './recipe-i18n.js';
import { startHeroQuotes, stopHeroQuotes } from './hero-quotes.js';
import {
  CookingTimer,
  requestNotificationPermission,
  showNotification,
} from './timer.js';
import { loadSettings, saveSettings, applySettings, DEFAULTS } from './settings.js';
import { t, setLanguage, applyI18n, randomEncouragement, getLanguage } from './i18n.js';
import { CHANGELOG, APP_VERSION } from './changelog.js';
import { getRecipeRating, rateRecipe, formatStars } from './ratings.js';
import { initInstall } from './install.js';

const EMOJI = {
  chicken: '🍗', beef: '🥩', pork: '🥓', fish: '🐟', shrimp: '🦐', tofu: '🧈',
  eggs: '🥚', rice: '🍚', pasta: '🍝', noodles: '🍜', bread: '🍞', potato: '🥔',
  onion: '🧅', garlic: '🧄', tomato: '🍅', 'bell pepper': '🫑', carrot: '🥕',
  broccoli: '🥦', spinach: '🥬', mushroom: '🍄', cheese: '🧀', butter: '🧈',
  lemon: '🍋', ginger: '🫚', chili: '🌶️', bacon: '🥓', avocado: '🥑',
  corn: '🌽', beans: '🫘', miso: '🍲', gochujang: '🌶️', chickpeas: '🫘',
  yogurt: '🥛', lime: '🍋', cabbage: '🥬', honey: '🍯', oregano: '🌿',
  cumin: '🧂', paprika: '🌶️', mango: '🥭', 'sweet potato': '🍠',
  peanuts: '🥜', cilantro: '🌿', cream: '🥛',
  'coconut milk': '🥥', 'soy sauce': '🫗', 'olive oil': '🫒', sugar: '🍬',
  salad: '🥗', default: '🥗',
};

const RING = 2 * Math.PI * 34;
const ING_KEY = 'ember-ing';
const ING_KEY_LEGACY = ['simmr-ing', 'cook-guide-ing'];

const state = {
  ingredients: [],
  expectations: {
    meal: 'dinner',
    time: 'medium',
    difficulty: 'easy',
    servings: '2',
    diet: 'none',
    cuisine: 'any',
  },
  recipes: [],
  activeRecipe: null,
  stepIndex: 0,
  doneSteps: new Set(),
  alarmsOn: false,
  settings: { ...DEFAULTS },
  selectedRating: 0,
  dictionaryQuery: '',
  dictionaryMode: 'search',
  dictionarySpicy: 'all',
  dictionaryFlavors: [],
};

let timer;
let foodMap = null;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

function init() {
  state.settings = loadSettings();
  setLanguage(state.settings.language);
  applySettings(state.settings);
  applyI18n();
  syncSettingsForm();
  renderChangelog();
  $('#dictionary-sub').textContent = t('dictionary.sub', { n: getAllRecipes().length });

  spawnBokeh();
  fillSuggestions();
  renderQuick();
  loadIngredients();
  renderBowl();
  setupTimer();
  bind();
  showView('hero');
}

function syncSettingsForm() {
  const s = state.settings;
  $('#set-language').value = s.language;
  $('#set-theme').value = s.theme;
  $('#set-text-size').value = s.textSize;
  $('#set-alarm-display').value = s.alarmDisplay;
  $('#set-sound').value = String(s.sound);
  $('#settings-version').textContent = t('settings.version', { v: APP_VERSION });
}

function updateSettings(partial) {
  state.settings = { ...state.settings, ...partial };
  saveSettings(state.settings);
  setLanguage(state.settings.language);
  applySettings(state.settings);
  applyI18n();
  syncSettingsForm();
  renderChangelog();
  if (timer) timer.soundEnabled = state.settings.sound;
  refreshDynamicText();
}

function refreshDynamicText() {
  if ($('#view-hero')?.classList.contains('view--active')) spawnHeroQuotes();
  fillSuggestions();
  renderQuick();
  renderChips();
  $('#dictionary-sub').textContent = t('dictionary.sub', { n: getAllRecipes().length });
  if ($('#view-browse').classList.contains('view--active')) renderDictionary();
  if (state.ingredients.length) {
    state.recipes = findRecipes(state.ingredients, { ...state.expectations }).map(localize);
    renderRecipes();
  }
  if (state.activeRecipe) {
    state.activeRecipe = localize(state.activeRecipe);
    renderCook();
    if ($('#view-finish').classList.contains('view--active')) {
      $('#finish-dish').textContent = state.activeRecipe.name;
    }
  }
  updateAlarmsLabel();
}

function renderChangelog() {
  const lang = state.settings.language;
  $('#changelog-body').innerHTML = CHANGELOG.map((entry) => {
    const notes = entry.notes[lang] || entry.notes.en;
    return `
      <article class="changelog__entry">
        <header class="changelog__head">
          <strong>v${entry.version}</strong>
          <time>${entry.date}</time>
        </header>
        <ul>${notes.map((n) => `<li>${n}</li>`).join('')}</ul>
      </article>
    `;
  }).join('');
}

function openModal(id) {
  $(`#modal-${id}`).hidden = false;
}

function closeModal(id) {
  $(`#modal-${id}`).hidden = true;
}

function closeAllModals() {
  closeModal('settings');
  closeModal('changelog');
  closeModal('creator');
  closeModal('install-ios');
}

function tDiff(d) {
  return t(`diff.${d}`) || d;
}

function lang() {
  return getLanguage();
}

function localize(r) {
  if (!r) return r;
  return r.improvised
    ? localizeImprovisedRecipe(r, lang())
    : localizeRecipe(r, lang());
}

function clearPantry() {
  state.ingredients = [];
  state.recipes = [];
  persist();
  renderChips();
  renderBowl();
}

function spawnHeroQuotes() {
  const root = $('#hero-quotes');
  if (!root || !$('#view-hero')?.classList.contains('view--active')) return;
  startHeroQuotes(root);
}

function spawnBokeh() {
  const root = $('#bokeh');
  const colors = [
    'rgba(255,107,53,0.55)',
    'rgba(255,180,80,0.4)',
    'rgba(93,190,122,0.35)',
    'rgba(255,255,255,0.18)',
  ];
  for (let i = 0; i < 30; i++) {
    const el = document.createElement('div');
    el.className = 'bokeh';
    const size = 4 + Math.random() * 14;
    el.style.cssText = `
      width:${size}px;height:${size}px;
      left:${Math.random() * 100}%;
      bottom:${-8 + Math.random() * 18}%;
      background:${colors[i % colors.length]};
      animation-duration:${14 + Math.random() * 22}s;
      animation-delay:${Math.random() * 16}s;
    `;
    root.appendChild(el);
  }
}

function showView(name) {
  $$('.view').forEach((v) => {
    v.classList.toggle('view--active', v.dataset.view === name);
  });
  const onHero = name === 'hero';
  const heroQuotes = $('#hero-quotes');
  if (heroQuotes) {
    heroQuotes.classList.toggle('hero-quotes--on', onHero);
    heroQuotes.setAttribute('aria-hidden', onHero ? 'false' : 'true');
    if (onHero) requestAnimationFrame(() => spawnHeroQuotes());
    else {
      stopHeroQuotes();
      heroQuotes.innerHTML = '';
    }
  }
  $('#hero-dock')?.classList.toggle('hero-chrome--hidden', !onHero);
  $('#hero-install')?.classList.toggle('hero-chrome--hidden', !onHero);
  $('#nav').classList.toggle('nav--on', name !== 'hero' && name !== 'browse');

  const order = ['ingredients', 'expectations', 'recipes', 'cooking'];
  const navName = name === 'finish' ? 'cooking' : name;
  const idx = order.indexOf(navName);
  $$('#nav-dots span').forEach((dot) => {
    const i = order.indexOf(dot.dataset.dot);
    dot.classList.toggle('on', dot.dataset.dot === navName);
    dot.classList.toggle('done', i >= 0 && i < idx || (name === 'finish' && dot.dataset.dot === 'cooking'));
  });
}

function fillSuggestions() {
  $('#ingredient-list').innerHTML = getSuggestions(lang())
    .map(({ label }) => `<option value="${label}">`)
    .join('');
}

function renderQuick() {
  $('#quick').innerHTML = getQuickAdd(lang())
    .map(({ key, label }) => `<button type="button" data-ing="${key}">${label}</button>`)
    .join('');
}

function emoji(name) {
  return EMOJI[name] || EMOJI.default;
}

function renderBowl() {
  const container = $('#bowl-items');
  container.replaceChildren();
  if (!state.ingredients.length) return;

  state.ingredients.slice(-8).forEach((name, i, items) => {
    const n = Math.max(items.length, 1);
    const angle = (i / n) * Math.PI * 1.5 - 0.4;
    const x = 48 + Math.cos(angle) * 34;
    const y = 38 + Math.sin(angle) * 26 + (i % 2) * 5;
    const rot = ((i * 17) % 28) - 14;
    const el = document.createElement('span');
    el.className = 'bowl-item';
    el.textContent = emoji(name);
    el.style.cssText = `left:${x}%;top:${y}%;--rot:${rot}deg;animation-delay:${i * 0.05}s, ${0.25 + i * 0.15}s`;
    container.appendChild(el);
  });
}

function addIngredient(raw) {
  const name = normalizeIngredient(raw);
  if (!name || state.ingredients.includes(name)) return;
  state.ingredients.push(name);
  persist();
  renderChips();
  renderBowl();
  $('#ingredient-input').value = '';
  $('#ingredient-input').focus();
}

function removeIngredient(name) {
  state.ingredients = state.ingredients.filter((i) => i !== name);
  persist();
  renderChips();
  renderBowl();
}

function renderChips() {
  $('#chips').innerHTML = state.ingredients.map((i) => {
    const label = displayIngredient(i, lang());
    return `
    <span class="chip" role="listitem">${emoji(i)} ${label}
      <button type="button" aria-label="${t('ingredient.remove', { name: label })}" data-remove="${i}">×</button>
    </span>
  `;
  }).join('');
}

function persist() {
  try {
    localStorage.setItem(ING_KEY, JSON.stringify(state.ingredients));
  } catch { /* ignore */ }
}

function loadIngredients() {
  try {
    let saved = localStorage.getItem(ING_KEY);
    if (!saved) {
      for (const key of ING_KEY_LEGACY) {
        saved = localStorage.getItem(key);
        if (saved) break;
      }
    }
    if (saved) {
      state.ingredients = [...new Set(
        JSON.parse(saved).map(normalizeIngredient).filter(Boolean),
      )];
      renderChips();
    }
  } catch { /* ignore */ }
}

function selectGroup(groupEl, value, btn) {
  state.expectations[groupEl.dataset.group] = value;
  groupEl.querySelectorAll('button').forEach((b) => {
    b.classList.remove('pick--on', 'pill--on');
  });
  btn.classList.add(btn.classList.contains('pill') ? 'pill--on' : 'pick--on');
}

function searchRecipes() {
  if (!state.ingredients.length) {
    showView('ingredients');
    const input = $('#ingredient-input');
    input.classList.add('shake');
    input.focus();
    setTimeout(() => input.classList.remove('shake'), 450);
    return;
  }

  state.recipes = findRecipes(state.ingredients, { ...state.expectations }).map(localize);
  renderRecipes();
  showView('recipes');
}

function renderDictionaryFilters() {
  const l = lang();
  $('#dictionary-spicy-filters').innerHTML = getDictionarySpicyFilters(l).map((f) => `
    <button type="button" class="browse__filter browse__filter--spicy ${state.dictionarySpicy === f.id ? 'browse__filter--on' : ''}" data-spicy="${f.id}">${f.label}</button>
  `).join('');
  $('#dictionary-flavor-filters').innerHTML = getDictionaryFlavorFilters(l).map((f) => `
    <button type="button" class="browse__filter browse__filter--flavor ${state.dictionaryFlavors.includes(f.id) ? 'browse__filter--on' : ''}" data-flavor="${f.id}">${f.label}</button>
  `).join('');
}

function syncMapTagFilters() {
  if (foodMap && state.dictionaryMode === 'map') {
    foodMap.setTagFilters({ spicy: state.dictionarySpicy, flavors: state.dictionaryFlavors });
  }
}

function updateMapBackButton(level) {
  const btn = $('#btn-map-back');
  if (!btn) return;
  btn.hidden = state.dictionaryMode !== 'map' || level === 'globe';
}

function initFoodMap() {
  if (foodMap) return;
  foodMap = new FoodMapController($('#browse-panel-map'));
  foodMap.onPickRecipe = pickFromDictionary;
  foodMap.onLevelChange = (level) => updateMapBackButton(level);
}

async function setDictionaryMode(mode) {
  state.dictionaryMode = mode;
  $('#dict-mode-search').classList.toggle('browse__mode--on', mode === 'search');
  $('#dict-mode-map').classList.toggle('browse__mode--on', mode === 'map');
  $('#dict-mode-search').setAttribute('aria-selected', mode === 'search');
  $('#dict-mode-map').setAttribute('aria-selected', mode === 'map');
  $('#browse-panel-search').hidden = mode !== 'search';
  $('#browse-panel-map').hidden = mode !== 'map';

  if (mode === 'map') {
    initFoodMap();
    syncMapTagFilters();
    await foodMap.showGlobe();
  } else {
    renderDictionarySearch();
    updateMapBackButton('globe');
  }
}

function renderDictionarySearch() {
  renderDictionaryFilters();
  const results = searchDictionary(state.dictionaryQuery, {
    lang: lang(),
    filter: 'all',
    spicy: state.dictionarySpicy,
    flavors: state.dictionaryFlavors,
  });
  const grid = $('#dictionary-grid');
  const empty = $('#dictionary-empty');
  const count = $('#dictionary-count');

  count.textContent = t('dictionary.count', { n: results.length });

  if (!results.length) {
    grid.innerHTML = '';
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  grid.innerHTML = results.map(({ recipe: r }, idx) => {
    const displayName = getRecipeDisplayName(r, lang());
    const mins = estimateTotalTime(r.steps);
    const pantry = state.ingredients.length
      ? scoreRecipeWithPantry(r, state.ingredients)
      : null;
    const matchPct = pantry ? Math.round(pantry.matchRatio * 100) : null;
    const tagHtml = renderRecipeTagHtml(r, lang());

    return `
      <button type="button" class="recipe-card recipe-card--dict" data-dict-id="${r.id}" role="listitem" style="animation-delay:${idx * 0.03}s">
        <div class="recipe-card__top">
          <span class="recipe-card__name">${displayName}</span>
          ${matchPct !== null ? `<span class="recipe-card__match ${matchPct >= 70 ? 'hi' : ''}">${t('recipes.matchPct', { n: matchPct })}</span>` : ''}
        </div>
        <div class="recipe-card__meta">
          <span>⏱ ~${formatTime(mins, lang())}</span>
          <span>📊 ${tDiff(r.difficulty)}</span>
        </div>
        <div class="recipe-card__tags">${tagHtml}</div>
        <div class="recipe-card__note">${r.ingredients.slice(0, 4).map((i) => displayIngredient(i, lang())).join(lang().startsWith('zh') ? '、' : ', ')}${r.ingredients.length > 4 ? '…' : ''}</div>
      </button>
    `;
  }).join('');
}

function renderDictionary() {
  renderDictionaryFilters();
  if (state.dictionaryMode === 'map' && foodMap) {
    syncMapTagFilters();
    foodMap.refresh();
  } else {
    renderDictionarySearch();
  }
}

function openDictionary() {
  state.dictionaryQuery = '';
  state.dictionaryMode = 'search';
  state.dictionarySpicy = 'all';
  state.dictionaryFlavors = [];
  $('#dictionary-search').value = '';
  setDictionaryMode('search');
  showView('browse');
}

function pickFromDictionary(id) {
  const raw = getRecipeById(id);
  if (!raw) return;

  let recipe = { ...raw };
  if (state.ingredients.length) {
    const scored = scoreRecipeWithPantry(raw, state.ingredients);
    recipe = { ...recipe, ...scored };
  } else {
    recipe = {
      ...recipe,
      matched: [],
      missing: raw.ingredients,
      matchRatio: 0,
      score: 0,
    };
  }

  recipe = localize(recipe);
  state.recipes = [recipe];
  startCooking(id);
}

function renderRecipes() {
  const grid = $('#recipe-grid');
  const empty = $('#recipe-empty');
  const sub = $('#recipe-subtitle');

  if (!state.recipes.length) {
    grid.innerHTML = '';
    empty.hidden = false;
    sub.textContent = t('recipes.noMatch');
    return;
  }

  empty.hidden = true;
  sub.textContent = t('recipes.matchCount', { n: state.recipes.length });

  grid.innerHTML = state.recipes.map((r, idx) => {
    const percent = Math.round((r.matchRatio || 0) * 100);
    const mins = estimateTotalTime(r.steps);
    const note = r.missing?.length
      ? t('recipes.missing', { list: displayIngredientList(r.missing, lang()) })
      : r.improvised
        ? t('recipes.improvised')
        : t('recipes.haveAll');
    const rating = getRecipeRating(r.id);
    const countLabel = rating.count
      ? ` · ${t('recipes.ratingCount', { n: rating.count })}`
      : '';
    const ratingHtml = `<span class="recipe-card__rating">${t('recipes.rating', { stars: formatStars(rating.avg), avg: rating.avg.toFixed(1) })}${countLabel}</span>`;

    return `
      <button type="button" class="recipe-card" data-id="${r.id}" role="listitem" style="animation-delay:${idx * 0.05}s">
        <div class="recipe-card__top">
          <span class="recipe-card__name">${getRecipeDisplayName(r, lang())}</span>
          <span class="recipe-card__match ${percent >= 70 ? 'hi' : ''}">${t('recipes.matchPct', { n: percent })}</span>
        </div>
        <div class="recipe-card__meta">
          <span>⏱ ~${formatTime(mins, lang())}</span>
          <span>📊 ${tDiff(r.difficulty)}</span>
          ${ratingHtml}
        </div>
        <div class="recipe-card__tags">${renderRecipeTagHtml(r, lang())}</div>
        <div class="recipe-card__note">${note}</div>
      </button>
    `;
  }).join('');
}

function startCooking(id) {
  const recipe = state.recipes.find((r) => r.id === id);
  if (!recipe) return;

  state.activeRecipe = localize(recipe);
  state.stepIndex = 0;
  state.doneSteps = new Set();

  const active = state.activeRecipe;
  const mins = estimateTotalTime(active.steps);
  $('#cook-num').textContent = String(state.recipes.indexOf(recipe) + 1).padStart(2, '0');
  $('#cook-title').textContent = active.name;
  $('#cook-meta').textContent = `${t('recipes.metaSteps', { n: active.steps.length })} · ~${formatTime(mins, lang())} · ${tDiff(active.difficulty)}`;

  renderCook();
  showView('cooking');
}

function renderCook() {
  const recipe = state.activeRecipe;
  if (!recipe) return;

  const steps = recipe.steps;
  const i = state.stepIndex;
  const step = steps[i];
  const last = i === steps.length - 1;

  $('#cook-rail').innerHTML = steps.map((s, idx) => {
    let cls = 'rail-step';
    if (idx === i) cls += ' rail-step--on';
    if (state.doneSteps.has(idx)) cls += ' rail-step--done';
    const n = state.doneSteps.has(idx) ? '✓' : idx + 1;
    const text = s.instruction.length > 50 ? `${s.instruction.slice(0, 50)}…` : s.instruction;
    return `
      <button type="button" class="${cls}" data-step="${idx}">
        <span class="rail-step__n">${n}</span>
        <span>${text}</span>
      </button>
    `;
  }).join('');

  const card = $('#cook-card');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = '';

  $('#cook-badge').textContent = t('cook.stepBadge', { cur: i + 1, total: steps.length });
  $('#cook-instruction').textContent = step.instruction;

  timer.stop();
  if (step.timer) {
    $('#cook-timer').hidden = false;
    timer.setDuration(step.timer);
    $('#btn-timer-start').disabled = false;
    $('#btn-timer-pause').disabled = true;
  } else {
    $('#cook-timer').hidden = true;
  }

  $('#btn-prev').disabled = i === 0;
  $('#btn-next').textContent = last ? t('cook.finish') : t('cook.next');

  const pct = Math.round((state.doneSteps.size / steps.length) * 100);
  $('#cook-pct').textContent = `${pct}%`;
  $('#cook-ring').style.strokeDashoffset = String(RING * (1 - pct / 100));
}

function showFinishPage() {
  state.doneSteps.add(state.stepIndex);
  state.selectedRating = 0;
  timer.stop();

  const recipe = state.activeRecipe;
  $('#finish-encourage').textContent = randomEncouragement();
  $('#finish-dish').textContent = recipe.name;
  $('#finish-feedback').hidden = true;
  $('#finish-feedback').textContent = '';
  $('#btn-finish-submit').disabled = true;
  $$('.finish__star').forEach((s) => s.classList.remove('finish__star--on', 'finish__star--hover'));

  showView('finish');
}

function setFinishRating(stars) {
  state.selectedRating = stars;
  $$('.finish__star').forEach((s) => {
    s.classList.toggle('finish__star--on', Number(s.dataset.star) <= stars);
  });
  $('#btn-finish-submit').disabled = false;
}

function submitFinishRating() {
  if (!state.selectedRating || !state.activeRecipe) return;
  const result = rateRecipe(state.activeRecipe.id, state.selectedRating);
  $('#finish-feedback').hidden = false;
  $('#finish-feedback').textContent = t('finish.newRating', {
    avg: result.avg.toFixed(1),
    n: result.count,
  });
  $('#btn-finish-submit').disabled = true;
  $$('#finish-stars button').forEach((b) => { b.disabled = true; });
}

function nextStep() {
  state.doneSteps.add(state.stepIndex);
  if (state.stepIndex < state.activeRecipe.steps.length - 1) {
    state.stepIndex += 1;
    renderCook();
  } else {
    showFinishPage();
  }
}

function prevStep() {
  if (state.stepIndex > 0) {
    state.stepIndex -= 1;
    renderCook();
  }
}

function resetCookingState() {
  state.activeRecipe = null;
  state.stepIndex = 0;
  state.doneSteps = new Set();
  state.selectedRating = 0;
  timer.stop();
  $$('#finish-stars button').forEach((b) => { b.disabled = false; });
  document.title = t('app.name');
}

function resetAll() {
  resetCookingState();
  clearPantry();
  showView('hero');
}

function startNewCooking() {
  resetCookingState();
  clearPantry();
  showView('ingredients');
}

function showAlarm(msg) {
  $('#alarm-msg').textContent = msg;
  $('#alarm').hidden = false;
}

function dismissAlarm() {
  $('#alarm').hidden = true;
  document.title = t('app.name');
}

function updateAlarmsLabel() {
  $('#alarms-label').textContent = state.alarmsOn ? t('nav.alarmsOn') : t('nav.alarms');
}

function setupTimer() {
  timer = new CookingTimer({
    soundEnabled: state.settings.sound,
    onTick: (left) => {
      $('#cook-timer-face').textContent = CookingTimer.format(left);
      $('#cook-timer-face').classList.toggle('warn', left > 0 && left <= 10);
      if (left > 0) {
        document.title = t('timer.tab', { time: CookingTimer.format(left) });
      }
    },
    onComplete: () => {
      document.title = t('timer.tabDone');
      const msg = state.activeRecipe?.steps[state.stepIndex]?.instruction?.slice(0, 90)
        || t('alarm.moveOn');
      if (state.alarmsOn) {
        showAlarm(msg);
        showNotification(t('alarm.timerTitle'), msg);
      }
    },
  });

  const ring = $('#cook-ring');
  ring.style.strokeDasharray = String(RING);
  ring.style.strokeDashoffset = String(RING);
}

function bind() {
  $('#btn-start').addEventListener('click', () => {
    clearPantry();
    showView('ingredients');
  });
  $('#btn-browse').addEventListener('click', openDictionary);
  $('#btn-browse-ing').addEventListener('click', openDictionary);
  $('#btn-back-from-browse').addEventListener('click', () => showView('hero'));

  $('#dict-mode-search').addEventListener('click', () => setDictionaryMode('search'));
  $('#dict-mode-map').addEventListener('click', () => setDictionaryMode('map'));
  $('#btn-map-back').addEventListener('click', () => foodMap?.goBack());
  window.addEventListener('resize', () => foodMap?.resize());

  $('#dictionary-search').addEventListener('input', (e) => {
    state.dictionaryQuery = e.target.value;
    renderDictionarySearch();
  });
  $('#dictionary-spicy-filters').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-spicy]');
    if (!btn) return;
    state.dictionarySpicy = btn.dataset.spicy;
    renderDictionary();
  });
  $('#dictionary-flavor-filters').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-flavor]');
    if (!btn) return;
    const f = btn.dataset.flavor;
    if (state.dictionaryFlavors.includes(f)) {
      state.dictionaryFlavors = state.dictionaryFlavors.filter((x) => x !== f);
    } else {
      state.dictionaryFlavors = [...state.dictionaryFlavors, f];
    }
    renderDictionary();
  });
  $('#dictionary-grid').addEventListener('click', (e) => {
    const card = e.target.closest('[data-dict-id]');
    if (card) pickFromDictionary(card.dataset.dictId);
  });
  $('#btn-home').addEventListener('click', resetAll);
  $('#btn-back-hero').addEventListener('click', () => showView('hero'));
  $('#btn-next-prefs').addEventListener('click', () => {
    if (!state.ingredients.length) {
      const input = $('#ingredient-input');
      input.classList.add('shake');
      input.focus();
      setTimeout(() => input.classList.remove('shake'), 450);
      return;
    }
    showView('expectations');
  });
  $('#btn-back-ingredients').addEventListener('click', () => showView('ingredients'));
  $('#btn-back-prefs').addEventListener('click', () => showView('expectations'));
  $('#btn-find').addEventListener('click', searchRecipes);

  $('#btn-add').addEventListener('click', () => addIngredient($('#ingredient-input').value));
  $('#ingredient-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient($('#ingredient-input').value);
    }
  });

  $('#chips').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove]');
    if (btn) removeIngredient(btn.dataset.remove);
  });

  $('#quick').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-ing]');
    if (btn) addIngredient(btn.dataset.ing);
  });

  $$('.picks, .pills').forEach((group) => {
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-value]');
      if (!btn) return;
      selectGroup(group, btn.dataset.value, btn);
    });
  });

  $('#recipe-grid').addEventListener('click', (e) => {
    const card = e.target.closest('[data-id]');
    if (card) startCooking(card.dataset.id);
  });

  $('#cook-rail').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-step]');
    if (!btn) return;
    state.stepIndex = Number(btn.dataset.step);
    renderCook();
  });

  $('#btn-timer-start').addEventListener('click', () => {
    timer.start();
    $('#btn-timer-start').disabled = true;
    $('#btn-timer-pause').disabled = false;
  });
  $('#btn-timer-pause').addEventListener('click', () => {
    timer.pause();
    $('#btn-timer-start').disabled = false;
    $('#btn-timer-pause').disabled = true;
  });
  $('#btn-timer-reset').addEventListener('click', () => {
    timer.reset();
    $('#btn-timer-start').disabled = false;
    $('#btn-timer-pause').disabled = true;
  });

  $('#btn-next').addEventListener('click', nextStep);
  $('#btn-prev').addEventListener('click', prevStep);
  $('#btn-alarm-ok').addEventListener('click', dismissAlarm);

  $('#finish-stars').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-star]');
    if (!btn || btn.disabled) return;
    setFinishRating(Number(btn.dataset.star));
  });
  $('#finish-stars').addEventListener('mouseover', (e) => {
    const btn = e.target.closest('[data-star]');
    if (!btn || btn.disabled) return;
    const hover = Number(btn.dataset.star);
    $$('.finish__star').forEach((s) => {
      s.classList.toggle('finish__star--hover', Number(s.dataset.star) <= hover);
    });
  });
  $('#finish-stars').addEventListener('mouseleave', () => {
    $$('.finish__star').forEach((s) => s.classList.remove('finish__star--hover'));
  });
  $('#btn-finish-submit').addEventListener('click', submitFinishRating);
  $('#btn-finish-skip').addEventListener('click', startNewCooking);
  $('#btn-finish-home').addEventListener('click', startNewCooking);

  $('#btn-alarms').addEventListener('click', async () => {
    // Toggle off if already on (browser permission cannot be revoked here)
    if (state.alarmsOn) {
      state.alarmsOn = false;
      $('#btn-alarms').classList.remove('on');
      updateAlarmsLabel();
      dismissAlarm();
      timer?.stopSound?.();
      return;
    }

    const result = await requestNotificationPermission();
    // Allow in-app alarms even if OS notifications are unavailable
    state.alarmsOn = result === 'granted' || result === 'unsupported';
    $('#btn-alarms').classList.toggle('on', state.alarmsOn);
    updateAlarmsLabel();
  });

  $('#btn-settings').addEventListener('click', () => openModal('settings'));
  $('#btn-settings-hero').addEventListener('click', () => openModal('settings'));
  $('#btn-settings-done').addEventListener('click', () => closeModal('settings'));
  $('#btn-changelog').addEventListener('click', () => openModal('changelog'));
  $('#btn-changelog-close').addEventListener('click', () => closeModal('changelog'));
  $('#btn-creator-words').addEventListener('click', () => openModal('creator'));
  $('#btn-creator-close').addEventListener('click', () => closeModal('creator'));
  initInstall({ onOpenModal: openModal });

  $$('[data-close]').forEach((el) => {
    el.addEventListener('click', () => closeModal(el.dataset.close));
  });

  $('#set-language').addEventListener('change', (e) => {
    updateSettings({ language: e.target.value });
  });
  $('#set-theme').addEventListener('change', (e) => {
    updateSettings({ theme: e.target.value });
  });
  $('#set-text-size').addEventListener('change', (e) => {
    updateSettings({ textSize: e.target.value });
  });
  $('#set-alarm-display').addEventListener('change', (e) => {
    updateSettings({ alarmDisplay: e.target.value });
  });
  $('#set-sound').addEventListener('change', (e) => {
    updateSettings({ sound: e.target.value === 'true' });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('#alarm').hidden) {
      dismissAlarm();
      return;
    }
    closeAllModals();
  });
}

init();
