/**
 * Auth + profile UI for Ember.
 */

import { t, applyI18n } from './i18n.js';
import { UserAuth, UserStore } from './user.js';
import { formatStars } from './ratings.js';

let authMode = 'login';

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

function renderProfile() {
  const body = $('#profile-body');
  if (!body) return;

  const user = UserStore.current();
  const isCloud = UserStore.isCloudUser();
  const isGuest = UserStore.isGuest();

  if (!user) {
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

  const history = UserStore.getCookHistory();
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

  const badge = isGuest
    ? `<span class="profile__badge profile__badge--guest" data-i18n="profile.guest"></span>`
    : `<span class="profile__badge profile__badge--member" data-i18n="profile.member"></span>`;

  body.innerHTML = `
    <div class="profile__headline">
      <span class="profile__avatar" aria-hidden="true">${isGuest ? '🧳' : '👤'}</span>
      <div>
        <h3 class="profile__name">${escapeHtml(UserStore.displayName() || t('profile.guest'))}</h3>
        ${badge}
      </div>
    </div>
    <h4 class="profile__section" data-i18n="profile.historyTitle"></h4>
    ${historyHtml}
    <div class="profile__actions">
      ${isCloud
    ? `<button type="button" class="btn btn--ghost" id="profile-btn-logout" data-i18n="auth.logout"></button>`
    : `<button type="button" class="btn btn--primary" id="profile-btn-upgrade" data-i18n="auth.createAccount"></button>`}
    </div>`;

  applyI18n(body);

  $('#profile-btn-logout')?.addEventListener('click', () => {
    UserAuth.logout();
    UserUI.updateNav();
    renderProfile();
  });

  $('#profile-btn-upgrade')?.addEventListener('click', () => {
    closeModal('profile');
    UserUI.showAuth('register');
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
      renderProfile();
      openModal('profile');
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

  openProfile() {
    renderProfile();
    openModal('profile');
  },
};
