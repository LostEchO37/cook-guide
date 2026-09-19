/**
 * Auth + profile UI for Ember.
 */

import { t, applyI18n, getLanguage } from './i18n.js';
import { UserAuth, UserStore } from './user.js';
import { formatStars } from './ratings.js';
import {
  fetchPublicProfile,
  createCommunityRecipe,
  refreshCommunityRecipes,
} from './community-recipes.js';
import { SPICY_LEVELS, FLAVOR_KEYS, labelSpicy, labelFlavor } from './recipe-tags.js';
import { FOOD_COUNTRIES, FOOD_REGIONS, labelCountry, labelRegion } from './food-regions.js';

let authMode = 'login';
let profileTab = 'history';
let viewingUsername = null;
let recipeDraft = { spicy: 'none', flavors: [], regions: [], chinaRegions: [] };
let recipeFormFields = { title: '', ingredients: '', steps: '', description: '' };
let regionPickerOpen = false;
let profileRenderGen = 0;
let profileCache = { username: null, data: null, at: 0 };
const PROFILE_CACHE_MS = 20_000;

function $(sel, root = document) {
  return root.querySelector(sel);
}

function openModal(id) {
  const el = document.getElementById(`modal-${id}`);
  if (!el) return;
  el.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const el = document.getElementById(`modal-${id}`);
  if (!el) return;
  el.hidden = true;
  if (!document.querySelector('.modal:not([hidden])')) {
    document.body.style.overflow = '';
  }
}

function setAuthError(msg) {
  const el = $('#auth-error');
  if (!el) return;
  el.textContent = msg || '';
  el.hidden = !msg;
}


const SPICY_CHILI = { none: '○', mild: '🌶', medium: '🌶🌶', hot: '🌶🌶🌶' };

function resetRecipeDraft() {
  recipeDraft = { spicy: 'none', flavors: [], regions: [], chinaRegions: [] };
  recipeFormFields = { title: '', ingredients: '', steps: '', description: '' };
  regionPickerOpen = false;
}

function captureRecipeForm() {
  const title = $('#profile-recipe-title');
  if (!title) return;
  recipeFormFields = {
    title: title.value || '',
    ingredients: $('#profile-recipe-ings')?.value || '',
    steps: $('#profile-recipe-steps')?.value || '',
    description: $('#profile-recipe-desc')?.value || '',
  };
}

function restoreRecipeForm() {
  const title = $('#profile-recipe-title');
  if (!title) return;
  title.value = recipeFormFields.title;
  const ings = $('#profile-recipe-ings');
  if (ings) ings.value = recipeFormFields.ingredients;
  const steps = $('#profile-recipe-steps');
  if (steps) steps.value = recipeFormFields.steps;
  const desc = $('#profile-recipe-desc');
  if (desc) desc.value = recipeFormFields.description;
}

function buildTagList() {
  const tags = [];
  tags.push(`spicy:${recipeDraft.spicy || 'none'}`);
  recipeDraft.flavors.forEach((f) => tags.push(`flavor:${f}`));
  recipeDraft.regions.forEach((r) => tags.push(`region:${r}`));
  recipeDraft.chinaRegions.forEach((r) => tags.push(`region:china-${r}`));
  return tags;
}

function renderSpicyPicker() {
  return `<div class="chip-field">
    <div class="chip-field__label" data-i18n="profile.spicyLabel">辣度</div>
    <div class="chip-row" role="radiogroup" aria-label="spicy">
      ${SPICY_LEVELS.map((level) => `
        <button type="button" class="tag-chip tag-chip--spicy${recipeDraft.spicy === level ? ' tag-chip--on' : ''}"
          data-spicy="${level}" aria-pressed="${recipeDraft.spicy === level}">
          <span class="tag-chip__icon">${SPICY_CHILI[level] || ''}</span>
          <span>${escapeHtml(t(`tag.spicy.${level}`))}</span>
        </button>`).join('')}
    </div>
  </div>`;
}

function renderFlavorPicker() {
  return `<div class="chip-field">
    <div class="chip-field__label" data-i18n="profile.flavorLabel">风味（可多选）</div>
    <div class="chip-row chip-row--wrap" role="group" aria-label="flavors">
      ${FLAVOR_KEYS.map((f) => `
        <button type="button" class="tag-chip tag-chip--flavor${recipeDraft.flavors.includes(f) ? ' tag-chip--on' : ''}"
          data-flavor="${f}" aria-pressed="${recipeDraft.flavors.includes(f)}">
          ${escapeHtml(labelFlavor(f))}
        </button>`).join('')}
    </div>
  </div>`;
}

function renderRegionSummary() {
  const lang = getLanguage();
  const labels = [];
  recipeDraft.regions.forEach((id) => {
    const c = FOOD_COUNTRIES.find((x) => x.id === id);
    if (c) labels.push(`${c.emoji} ${labelCountry(c, lang)}`);
  });
  recipeDraft.chinaRegions.forEach((id) => {
    const regions = FOOD_REGIONS.china || [];
    const r = regions.find((x) => x.id === id);
    if (r) labels.push(labelRegion(r, lang));
  });
  if (!labels.length) return `<span class="region-summary__empty" data-i18n="profile.regionNone">未选择地区</span>`;
  return labels.map((l) => `<span class="region-pill">${escapeHtml(l)}</span>`).join('');
}

function renderRegionPicker() {
  const lang = getLanguage();
  const chinaOpen = recipeDraft.regions.includes('china');
  const chinaRegions = FOOD_REGIONS.china || [];
  return `<div class="chip-field">
    <div class="chip-field__label" data-i18n="profile.regionLabel">地区</div>
    <div class="region-summary" id="profile-region-summary">${renderRegionSummary()}</div>
    <button type="button" class="btn btn--ghost btn--sm" id="profile-region-open" data-i18n="profile.regionPick">选择地区 / 旗帜</button>
    <div class="region-picker" id="profile-region-picker" ${regionPickerOpen ? '' : 'hidden'}>
      <div class="region-picker__head">
        <strong data-i18n="profile.regionPickTitle">点选国旗添加地区</strong>
        <button type="button" class="modal__close region-picker__close" id="profile-region-close" aria-label="Close">×</button>
      </div>
      <div class="region-flag-grid">
        ${FOOD_COUNTRIES.map((c) => `
          <button type="button" class="flag-chip${recipeDraft.regions.includes(c.id) ? ' flag-chip--on' : ''}"
            data-region="${c.id}" aria-pressed="${recipeDraft.regions.includes(c.id)}">
            <span class="flag-chip__emoji">${c.emoji}</span>
            <span class="flag-chip__name">${escapeHtml(labelCountry(c, lang))}</span>
          </button>`).join('')}
      </div>
      ${chinaOpen ? `
        <div class="region-china">
          <div class="chip-field__label" data-i18n="profile.chinaRegionLabel">中国菜系（可选）</div>
          <div class="chip-row chip-row--wrap">
            ${chinaRegions.slice(0, 16).map((r) => `
              <button type="button" class="tag-chip${recipeDraft.chinaRegions.includes(r.id) ? ' tag-chip--on' : ''}"
                data-china-region="${r.id}" aria-pressed="${recipeDraft.chinaRegions.includes(r.id)}">
                ${escapeHtml(labelRegion(r, lang))}
              </button>`).join('')}
          </div>
        </div>` : ''}
    </div>
  </div>`;
}

async function loadRemoteProfile(username, { force = false } = {}) {
  if (!username) return null;
  if (
    !force
    && profileCache.username === username
    && Date.now() - profileCache.at < PROFILE_CACHE_MS
  ) {
    return profileCache.data;
  }
  try {
    const data = await fetchPublicProfile(username);
    profileCache = { username, data, at: Date.now() };
    return data;
  } catch {
    return profileCache.username === username ? profileCache.data : null;
  }
}

function bindTagPickers(root, username) {
  const rerender = () => renderProfile(username, { soft: true });

  root.querySelectorAll('[data-spicy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      recipeDraft.spicy = btn.dataset.spicy;
      rerender();
    });
  });
  root.querySelectorAll('[data-flavor]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.flavor;
      if (recipeDraft.flavors.includes(f)) {
        recipeDraft.flavors = recipeDraft.flavors.filter((x) => x !== f);
      } else if (recipeDraft.flavors.length < 5) {
        recipeDraft.flavors = [...recipeDraft.flavors, f];
      }
      rerender();
    });
  });
  $('#profile-region-open')?.addEventListener('click', () => {
    regionPickerOpen = true;
    rerender();
  });
  $('#profile-region-close')?.addEventListener('click', () => {
    regionPickerOpen = false;
    rerender();
  });
  root.querySelectorAll('[data-region]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.region;
      if (recipeDraft.regions.includes(id)) {
        recipeDraft.regions = recipeDraft.regions.filter((x) => x !== id);
        if (id === 'china') recipeDraft.chinaRegions = [];
      } else if (recipeDraft.regions.length < 4) {
        recipeDraft.regions = [...recipeDraft.regions, id];
      }
      regionPickerOpen = true;
      rerender();
    });
  });
  root.querySelectorAll('[data-china-region]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.chinaRegion;
      if (recipeDraft.chinaRegions.includes(id)) {
        recipeDraft.chinaRegions = recipeDraft.chinaRegions.filter((x) => x !== id);
      } else if (recipeDraft.chinaRegions.length < 4) {
        recipeDraft.chinaRegions = [...recipeDraft.chinaRegions, id];
      }
      regionPickerOpen = true;
      rerender();
    });
  });
}

function renderStat(value, labelKey) {
  return `<div class="profile-stat">
    <strong class="profile-stat__value">${escapeHtml(String(value))}</strong>
    <span class="profile-stat__label" data-i18n="${labelKey}"></span>
  </div>`;
}

async function renderProfile(username = null, { soft = false } = {}) {
  const body = $('#profile-body');
  if (!body) return;

  const gen = ++profileRenderGen;
  captureRecipeForm();

  const me = UserStore.current();
  const isCloud = UserStore.isCloudUser();
  const isGuest = UserStore.isGuest();
  viewingUsername = username || (isCloud ? UserStore.displayName() : null);

  if (!me && !username) {
    body.innerHTML = `
      <div class="profile-hero profile-hero--empty">
        <div class="profile-hero__glow" aria-hidden="true"></div>
        <p class="profile__hint" data-i18n="profile.signInHint"></p>
        <div class="profile__actions">
          <button type="button" class="btn btn--primary" id="profile-btn-login" data-i18n="auth.login"></button>
          <button type="button" class="btn btn--ghost" id="profile-btn-guest" data-i18n="auth.continueGuest"></button>
        </div>
      </div>`;
    applyI18n(body);
    $('#profile-btn-login')?.addEventListener('click', () => {
      closeModal('profile');
      UserUI.showAuth('login');
    });
    $('#profile-btn-guest')?.addEventListener('click', () => {
      UserStore.continueAsGuest();
      UserUI.updateNav();
      renderProfile();
    });
    return;
  }

  if (!soft && (!body.dataset.loaded || body.dataset.user !== String(viewingUsername || '') || body.dataset.tab !== profileTab)) {
    body.innerHTML = `<p class="profile__empty">${escapeHtml(t('community.loading'))}</p>`;
  }

  const remote = viewingUsername
    ? await loadRemoteProfile(viewingUsername, { force: !soft })
    : null;
  if (gen !== profileRenderGen) return;

  const isOwn = !username || (isCloud && viewingUsername && viewingUsername === UserStore.displayName());
  const history = isOwn ? UserStore.getCookHistory() : (remote?.cookHistory || []);
  const posts = remote?.posts || [];
  const recipes = remote?.recipes || [];
  const display = remote?.username || UserStore.displayName() || t('profile.guest');
  const initial = escapeHtml((display || '?').slice(0, 1).toUpperCase());

  const historyHtml = history.length
    ? `<div class="profile-list">${history.map((item, idx) => {
      const date = new Date(item.ts).toLocaleDateString();
      const stars = item.stars ? formatStars(item.stars) : '';
      return `<article class="profile-card">
        <span class="profile-card__index">${idx + 1}</span>
        <div class="profile-card__body">
          <strong class="profile-card__title">${escapeHtml(item.recipeName || item.recipeId)}</strong>
          <span class="profile-card__meta">${escapeHtml(date)}${stars ? ` · ${stars}` : ''}</span>
        </div>
      </article>`;
    }).join('')}</div>`
    : `<p class="profile__empty" data-i18n="profile.noHistory"></p>`;

  const postsHtml = posts.length
    ? `<div class="profile__posts">${posts.map((p) => `
        <article class="profile-post">
          <img src="${escapeHtml(p.photoUrl)}" alt="" loading="lazy" />
          <div class="profile-post__meta">
            <strong>${escapeHtml(p.recipeName)}</strong>
            <span>${escapeHtml(String(p.likeCount || 0))} ♥</span>
          </div>
        </article>`).join('')}</div>`
    : `<p class="profile__empty" data-i18n="profile.noPosts"></p>`;

  const recipesHtml = recipes.length
    ? `<div class="profile-list">${recipes.map((r) => `
        <article class="profile-card profile-card--recipe">
          <div class="profile-card__body">
            <strong class="profile-card__title">${escapeHtml(r.title)}</strong>
            <span class="profile-card__meta">${escapeHtml((r.tags || []).map(prettyTag).join(' · '))}</span>
          </div>
        </article>`).join('')}</div>`
    : `<p class="profile__empty" data-i18n="profile.noRecipes"></p>`;

  const createHtml = (isOwn && isCloud) ? `
    <form class="profile-create" id="profile-recipe-form">
      <p class="profile-create__lead" data-i18n="profile.createLead">把你的拿手菜写成菜谱，分享给大家</p>
      <label class="field"><span data-i18n="profile.recipeTitle"></span>
        <input type="text" id="profile-recipe-title" maxlength="80" required /></label>
      <label class="field"><span data-i18n="profile.recipeIngredients"></span>
        <textarea id="profile-recipe-ings" rows="3" required></textarea></label>
      <label class="field"><span data-i18n="profile.recipeSteps"></span>
        <textarea id="profile-recipe-steps" rows="4" required></textarea></label>
      ${renderSpicyPicker()}
      ${renderFlavorPicker()}
      ${renderRegionPicker()}
      <label class="field"><span data-i18n="profile.recipeDesc"></span>
        <textarea id="profile-recipe-desc" rows="2" maxlength="500"></textarea></label>
      <p class="profile__create-status" id="profile-recipe-status" hidden></p>
      <button type="submit" class="btn btn--primary btn--block" data-i18n="profile.recipeSubmit"></button>
    </form>` : '';

  const badge = (isGuest && isOwn)
    ? `<span class="profile__badge profile__badge--guest" data-i18n="profile.guest"></span>`
    : `<span class="profile__badge profile__badge--member" data-i18n="profile.member"></span>`;

  body.dataset.loaded = '1';
  body.dataset.user = String(viewingUsername || '');
  body.dataset.tab = profileTab;

  body.innerHTML = `
    <div class="profile-hero">
      <div class="profile-hero__glow" aria-hidden="true"></div>
      <div class="profile-hero__row">
        <div class="profile-hero__avatar" aria-hidden="true">${isGuest && isOwn ? '🧳' : initial}</div>
        <div class="profile-hero__text">
          <h3 class="profile__name">${escapeHtml(display)}</h3>
          ${badge}
        </div>
      </div>
      <div class="profile-stats">
        ${renderStat(history.length, 'profile.statCooks')}
        ${renderStat(posts.length, 'profile.statPosts')}
        ${renderStat(recipes.length, 'profile.statRecipes')}
      </div>
    </div>
    <div class="profile__tabs" role="tablist">
      <button type="button" class="profile__tab${profileTab === 'history' ? ' profile__tab--on' : ''}" data-tab="history" data-i18n="profile.tabHistory"></button>
      <button type="button" class="profile__tab${profileTab === 'posts' ? ' profile__tab--on' : ''}" data-tab="posts" data-i18n="profile.tabPosts"></button>
      <button type="button" class="profile__tab${profileTab === 'recipes' ? ' profile__tab--on' : ''}" data-tab="recipes" data-i18n="profile.tabRecipes"></button>
      ${isOwn && isCloud ? `<button type="button" class="profile__tab${profileTab === 'create' ? ' profile__tab--on' : ''}" data-tab="create" data-i18n="profile.tabCreate"></button>` : ''}
    </div>
    <div class="profile__panel" data-panel="history" ${profileTab === 'history' ? '' : 'hidden'}>${historyHtml}</div>
    <div class="profile__panel" data-panel="posts" ${profileTab === 'posts' ? '' : 'hidden'}>${postsHtml}</div>
    <div class="profile__panel" data-panel="recipes" ${profileTab === 'recipes' ? '' : 'hidden'}>${recipesHtml}</div>
    ${isOwn && isCloud ? `<div class="profile__panel" data-panel="create" ${profileTab === 'create' ? '' : 'hidden'}>${createHtml}</div>` : ''}
    <div class="profile__actions">
      ${isOwn && isGuest ? `<p class="profile__guest-hint" data-i18n="profile.guestHint"></p>` : ''}
      ${isOwn
        ? (isCloud
          ? `<button type="button" class="btn btn--ghost" id="profile-btn-logout" data-i18n="auth.logout"></button>`
          : `<button type="button" class="btn btn--primary" id="profile-btn-upgrade" data-i18n="auth.createAccount"></button>`)
        : `<button type="button" class="btn btn--ghost" id="profile-btn-back" data-i18n="profile.backToMine"></button>`}
    </div>`;

  applyI18n(body);

  body.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      profileTab = btn.dataset.tab;
      renderProfile(username);
    });
  });

  $('#profile-btn-logout')?.addEventListener('click', () => {
    UserAuth.logout();
    UserUI.updateNav();
    viewingUsername = null;
    profileTab = 'history';
    resetRecipeDraft();
    renderProfile();
  });

  $('#profile-btn-upgrade')?.addEventListener('click', () => {
    closeModal('profile');
    UserUI.showAuth('register');
  });

  $('#profile-btn-back')?.addEventListener('click', () => {
    profileTab = 'history';
    renderProfile();
  });

  if (profileTab === 'create') {
    restoreRecipeForm();
    bindTagPickers(body, username);
    if (regionPickerOpen) {
      $('#profile-region-picker')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  $('#profile-recipe-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = $('#profile-recipe-status');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const title = $('#profile-recipe-title')?.value?.trim();
    const ingredients = ($('#profile-recipe-ings')?.value || '').split(/\n+/).map((s) => s.trim()).filter(Boolean);
    const steps = ($('#profile-recipe-steps')?.value || '').split(/\n+/).map((s) => s.trim()).filter(Boolean);
    const description = $('#profile-recipe-desc')?.value?.trim() || '';
    const tags = buildTagList();
    if (!title || ingredients.length < 1 || steps.length < 1) {
      if (status) {
        status.hidden = false;
        status.textContent = t('profile.recipeFailed');
      }
      return;
    }
    if (status) {
      status.hidden = false;
      status.textContent = t('profile.recipeUploading');
    }
    if (submitBtn) submitBtn.disabled = true;
    try {
      await createCommunityRecipe({
        title,
        ingredients,
        steps,
        tags,
        description,
        published: true,
        spicy: recipeDraft.spicy,
        flavors: recipeDraft.flavors,
        regions: [...recipeDraft.regions, ...recipeDraft.chinaRegions.map((id) => `china-${id}`)],
      });
      profileCache = { username: null, data: null, at: 0 };
      if (status) status.textContent = t('profile.recipeSuccess');
      resetRecipeDraft();
      profileTab = 'recipes';
      await refreshCommunityRecipes();
      renderProfile();
    } catch {
      if (status) status.textContent = t('profile.recipeFailed');
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function prettyTag(tag) {
  const lang = getLanguage();
  if (tag.startsWith('spicy:')) return labelSpicy(tag.slice(6), lang);
  if (tag.startsWith('flavor:')) return labelFlavor(tag.slice(7));
  if (tag.startsWith('region:')) {
    const id = tag.slice(7);
    if (id.startsWith('china-')) {
      const rid = id.slice(6);
      const r = (FOOD_REGIONS.china || []).find((x) => x.id === rid);
      return r ? labelRegion(r, lang) : id;
    }
    const c = FOOD_COUNTRIES.find((x) => x.id === id);
    return c ? `${c.emoji} ${labelCountry(c, lang)}` : id;
  }
  return tag;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function switchAuthTab(mode) {
  authMode = mode;
  $('#auth-tab-login')?.classList.toggle('auth-tab--active', mode === 'login');
  $('#auth-tab-register')?.classList.toggle('auth-tab--active', mode === 'register');
  const submit = $('#auth-submit');
  if (submit) submit.textContent = t(mode === 'login' ? 'auth.login' : 'auth.register');
  setAuthError('');
}

async function submitAuth() {
  const username = $('#auth-username')?.value?.trim();
  const password = $('#auth-password')?.value || '';
  const submit = $('#auth-submit');
  setAuthError('');

  if (submit) submit.disabled = true;
  try {
    if (authMode === 'login') {
      await UserAuth.login(username, password);
    } else {
      await UserAuth.register(username, password);
    }
    closeModal('auth');
    UserUI.updateNav();
    renderProfile();
    openModal('profile');
  } catch (e) {
    const map = {
      invalid_username: 'auth.errUsername',
      invalid_password: 'auth.errPassword',
      username_taken: 'auth.errTaken',
      invalid_credentials: 'auth.errCredentials',
      api_disabled: 'auth.errOffline',
      api_not_ready: 'auth.errNotReady',
      network_error: 'auth.errNetwork',
    };
    setAuthError(t(map[e.code] || 'auth.errGeneric'));
  } finally {
    if (submit) submit.disabled = false;
  }
}

export const UserUI = {
  init() {
    UserAuth.restoreSession().then(() => UserUI.updateNav());

    $('#btn-user')?.addEventListener('click', () => {
      UserUI.openProfile();
    });

    $('#auth-tab-login')?.addEventListener('click', () => switchAuthTab('login'));
    $('#auth-tab-register')?.addEventListener('click', () => switchAuthTab('register'));
    $('#auth-submit')?.addEventListener('click', submitAuth);
    $('#auth-guest')?.addEventListener('click', () => {
      UserStore.continueAsGuest();
      closeModal('auth');
      UserUI.updateNav();
    });

    const authForm = $('#auth-username')?.closest('.auth');
    authForm?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitAuth();
      }
    });

    $('#btn-auth-hero')?.addEventListener('click', () => {
      if (UserStore.current()) UserUI.openProfile();
      else UserUI.showAuth('login');
    });

    document.querySelectorAll('[data-close="auth"]').forEach((el) => {
      el.addEventListener('click', () => closeModal('auth'));
    });
    document.querySelectorAll('[data-close="profile"]').forEach((el) => {
      el.addEventListener('click', () => closeModal('profile'));
    });

    $('#btn-profile-close')?.addEventListener('click', () => closeModal('profile'));
    $('#btn-auth-close')?.addEventListener('click', () => closeModal('auth'));

    switchAuthTab('login');
    UserUI.updateNav();
  },

  showAuth(mode = 'login') {
    switchAuthTab(mode);
    $('#auth-username').value = '';
    $('#auth-password').value = '';
    setAuthError('');
    openModal('auth');
  },

  updateNav() {
    const btn = $('#btn-user');
    const label = $('#user-label');
    const heroBtn = $('#btn-auth-hero');
    const user = UserStore.current();

    if (btn && label) {
      if (!user) {
        label.textContent = t('auth.signIn');
        btn.dataset.mode = 'none';
      } else if (UserStore.isGuest()) {
        label.textContent = t('profile.guest');
        btn.dataset.mode = 'guest';
      } else {
        label.textContent = UserStore.displayName();
        btn.dataset.mode = 'member';
      }
    }

    if (!heroBtn) return;

    if (!user) {
      heroBtn.textContent = t('auth.signInHero');
      heroBtn.dataset.mode = 'none';
      heroBtn.classList.remove('hero-dock__btn--signed-in', 'hero-dock__btn--guest');
      return;
    }

    if (UserStore.isGuest()) {
      heroBtn.textContent = t('auth.heroGuest');
      heroBtn.dataset.mode = 'guest';
      heroBtn.classList.add('hero-dock__btn--guest');
      heroBtn.classList.remove('hero-dock__btn--signed-in');
      return;
    }

    heroBtn.textContent = t('auth.heroMember', { name: UserStore.displayName() });
    heroBtn.dataset.mode = 'member';
    heroBtn.classList.add('hero-dock__btn--signed-in');
    heroBtn.classList.remove('hero-dock__btn--guest');
  },

  openProfile(username = null) {
    profileTab = 'history';
    renderProfile(username);
    openModal('profile');
  },
};
