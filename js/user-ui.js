/**
 * Auth + profile UI for Ember.
 */

import { t, applyI18n } from './i18n.js';
import { UserAuth, UserStore } from './user.js';
import { formatStars } from './ratings.js';
import {
  fetchPublicProfile,
  createCommunityRecipe,
  refreshCommunityRecipes,
} from './community-recipes.js';

let authMode = 'login';
let profileTab = 'history';
let viewingUsername = null;

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

async function renderProfile(username = null) {
  const body = $('#profile-body');
  if (!body) return;

  const me = UserStore.current();
  const isCloud = UserStore.isCloudUser();
  const isGuest = UserStore.isGuest();
  viewingUsername = username || (isCloud ? UserStore.displayName() : null);

  if (!me && !username) {
    body.innerHTML = `
      <p class="profile__hint" data-i18n="profile.signInHint"></p>
      <div class="profile__actions">
        <button type="button" class="btn btn--primary" id="profile-btn-login" data-i18n="auth.login"></button>
        <button type="button" class="btn btn--ghost" id="profile-btn-guest" data-i18n="auth.continueGuest"></button>
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

  body.innerHTML = `<p class="profile__empty">${escapeHtml(t('community.loading'))}</p>`;

  let remote = null;
  if (viewingUsername) {
    try {
      remote = await fetchPublicProfile(viewingUsername);
    } catch {
      remote = null;
    }
  }

  const isOwn = !username || (isCloud && viewingUsername && viewingUsername === UserStore.displayName());
  const history = isOwn ? UserStore.getCookHistory() : (remote?.cookHistory || []);
  const posts = remote?.posts || [];
  const recipes = remote?.recipes || [];
  const display = remote?.username || UserStore.displayName() || t('profile.guest');

  const historyHtml = history.length
    ? `<ul class="profile__history">${history.map((item) => {
      const date = new Date(item.ts).toLocaleDateString();
      const stars = item.stars ? formatStars(item.stars) : '';
      return `<li class="profile__item">
        <span class="profile__dish">${escapeHtml(item.recipeName || item.recipeId)}</span>
        <span class="profile__meta">${escapeHtml(date)}${stars ? ` · ${stars}` : ''}</span>
      </li>`;
    }).join('')}</ul>`
    : `<p class="profile__empty" data-i18n="profile.noHistory"></p>`;

  const postsHtml = posts.length
    ? `<div class="profile__posts">${posts.map((p) => `
        <article class="profile-post">
          <img src="${escapeHtml(p.photoUrl)}" alt="" loading="lazy" />
          <div>
            <strong>${escapeHtml(p.recipeName)}</strong>
            <span>${escapeHtml(String(p.likeCount || 0))} ♥</span>
          </div>
        </article>`).join('')}</div>`
    : `<p class="profile__empty" data-i18n="profile.noPosts"></p>`;

  const recipesHtml = recipes.length
    ? `<ul class="profile__recipes">${recipes.map((r) => `
        <li class="profile__item">
          <span class="profile__dish">${escapeHtml(r.title)}</span>
          <span class="profile__meta">${escapeHtml((r.tags || []).join(' · '))}</span>
        </li>`).join('')}</ul>`
    : `<p class="profile__empty" data-i18n="profile.noRecipes"></p>`;

  const createHtml = (isOwn && isCloud) ? `
    <form class="profile-create" id="profile-recipe-form">
      <label class="field"><span data-i18n="profile.recipeTitle"></span>
        <input type="text" id="profile-recipe-title" maxlength="80" required /></label>
      <label class="field"><span data-i18n="profile.recipeIngredients"></span>
        <textarea id="profile-recipe-ings" rows="3" required></textarea></label>
      <label class="field"><span data-i18n="profile.recipeSteps"></span>
        <textarea id="profile-recipe-steps" rows="4" required></textarea></label>
      <label class="field"><span data-i18n="profile.recipeTags"></span>
        <input type="text" id="profile-recipe-tags" /></label>
      <label class="field"><span data-i18n="profile.recipeDesc"></span>
        <textarea id="profile-recipe-desc" rows="2" maxlength="500"></textarea></label>
      <p class="profile__create-status" id="profile-recipe-status" hidden></p>
      <button type="submit" class="btn btn--primary" data-i18n="profile.recipeSubmit"></button>
    </form>` : '';

  const badge = (isGuest && isOwn)
    ? `<span class="profile__badge profile__badge--guest" data-i18n="profile.guest"></span>`
    : `<span class="profile__badge profile__badge--member" data-i18n="profile.member"></span>`;

  body.innerHTML = `
    <div class="profile__headline">
      <span class="profile__avatar" aria-hidden="true">${isGuest && isOwn ? '🧳' : '👤'}</span>
      <div>
        <h3 class="profile__name">${escapeHtml(display)}</h3>
        ${badge}
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

  $('#profile-recipe-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = $('#profile-recipe-status');
    const title = $('#profile-recipe-title')?.value?.trim();
    const ingredients = ($('#profile-recipe-ings')?.value || '').split(/\n+/).map((s) => s.trim()).filter(Boolean);
    const steps = ($('#profile-recipe-steps')?.value || '').split(/\n+/).map((s) => s.trim()).filter(Boolean);
    const tags = ($('#profile-recipe-tags')?.value || '').split(/[,，、\s]+/).map((s) => s.trim()).filter(Boolean);
    const description = $('#profile-recipe-desc')?.value?.trim() || '';
    if (status) {
      status.hidden = false;
      status.textContent = t('profile.recipeUploading');
    }
    try {
      await createCommunityRecipe({ title, ingredients, steps, tags, description, published: true });
      if (status) status.textContent = t('profile.recipeSuccess');
      profileTab = 'recipes';
      await refreshCommunityRecipes();
      renderProfile();
    } catch {
      if (status) status.textContent = t('profile.recipeFailed');
    }
  });
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
