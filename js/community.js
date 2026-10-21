/**
 * Community feed — weekly top dishes, photo posts after cooking, likes.
 */

import { t, applyI18n } from './i18n.js';
import { SiteConfig } from './site-config.js';
import { fetchApi } from './api-fetch.js';
import { UserAuth, UserStore } from './user.js';
import { UserUI } from './user-ui.js';

const MAX_EDGE = 1280;
const JPEG_Q = 0.82;

let pending = { recipeId: '', recipeName: '', dataUrl: '' };

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

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function resolvePhotoUrl(url) {
  if (!url) return '';
  if (/^(https?:|data:)/i.test(url)) return url;
  const base = SiteConfig.apiBase || '';
  return base ? `${base}${url}` : url;
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return '';
  }
}

async function api(path, opts = {}) {
  const base = SiteConfig.apiBase;
  if (!base) {
    const err = new Error('api_disabled');
    err.code = 'api_disabled';
    throw err;
  }
  const headers = { ...(opts.headers || {}) };
  if (opts.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const token = UserAuth.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetchApi(`${base}${path}`, { ...opts, headers });
  } catch {
    const err = new Error('network_error');
    err.code = 'network_error';
    throw err;
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || `http_${res.status}`);
    err.status = res.status;
    err.code = body.error || `http_${res.status}`;
    throw err;
  }
  return body;
}

function compressImageElement(img) {
  let { width, height } = img;
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(img, 0, 0, width, height);
  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_Q);
  if (dataUrl.length > 2_000_000) {
    throw Object.assign(new Error('photo_too_large'), { code: 'photo_too_large' });
  }
  return dataUrl;
}

function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) {
      reject(Object.assign(new Error('invalid_photo'), { code: 'invalid_photo' }));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        resolve(compressImageElement(img));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(Object.assign(new Error('invalid_photo'), { code: 'invalid_photo' }));
    };
    img.src = url;
  });
}

let webcamStream = null;

function prefersNativeCameraCapture() {
  const ua = navigator.userAgent || '';
  if (/Android|iPhone|iPod/i.test(ua)) return true;
  if (/iPad/i.test(ua)) return true;
  if (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua)) return true;
  return false;
}

function stopWebcam() {
  if (webcamStream) {
    webcamStream.getTracks().forEach((track) => track.stop());
    webcamStream = null;
  }
  const video = document.getElementById('finish-webcam-video');
  if (video) video.srcObject = null;
  const box = document.getElementById('finish-webcam');
  if (box) box.hidden = true;
}

async function startWebcam() {
  const box = document.getElementById('finish-webcam');
  const video = document.getElementById('finish-webcam-video');
  const status = document.getElementById('finish-share-status');
  if (!box || !video || !navigator.mediaDevices?.getUserMedia) {
    document.getElementById('finish-photo-camera')?.click();
    return;
  }
  stopWebcam();
  try {
    webcamStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    video.srcObject = webcamStream;
    box.hidden = false;
    applyI18n(box);
    if (status) status.hidden = true;
  } catch {
    if (status) {
      status.hidden = false;
      status.textContent = t('community.cameraDenied');
    }
  }
}

async function captureWebcamFrame() {
  const video = document.getElementById('finish-webcam-video');
  if (!video?.videoWidth) return;
  try {
    const dataUrl = compressImageElement(video);
    stopWebcam();
    await onPickPhotoDataUrl(dataUrl);
  } catch {
    const status = document.getElementById('finish-share-status');
    if (status) {
      status.hidden = false;
      status.textContent = t('community.photoInvalid');
    }
  }
}

async function onPickPhotoDataUrl(dataUrl) {
  const status = document.getElementById('finish-share-status');
  const preview = document.getElementById('finish-photo-preview');
  const shareBtn = document.getElementById('btn-finish-share');
  pending.dataUrl = dataUrl;
  if (preview) {
    preview.src = dataUrl;
    preview.hidden = false;
  }
  if (shareBtn) shareBtn.disabled = !pending.recipeId;
  if (status) status.hidden = true;
}

function onTakePhotoClick() {
  if (prefersNativeCameraCapture()) {
    document.getElementById('finish-photo-camera')?.click();
    return;
  }
  startWebcam();
}

function renderWeeklyTop(dishes) {
  const el = document.getElementById('community-weekly');
  if (!el) return;
  if (!dishes?.length) {
    el.innerHTML = `<p class="community__empty">${escapeHtml(t('community.weeklyEmpty'))}</p>`;
    return;
  }
  el.innerHTML = `<ol class="community__top">${dishes.map((d, i) => `
    <li class="community__top-item">
      <span class="community__rank">${i + 1}</span>
      <div class="community__top-meta">
        <strong>${escapeHtml(d.recipeName)}</strong>
        <span class="community__top-stats">${escapeHtml(t('community.weeklyStats', {
          cooks: d.cooks || 0,
          posts: d.posts || 0,
          likes: d.likes || 0,
        }))}</span>
      </div>
    </li>`).join('')}</ol>`;
}

function renderFeed(posts) {
  const el = document.getElementById('community-feed');
  if (!el) return;
  if (!posts?.length) {
    el.innerHTML = `<p class="community__empty">${escapeHtml(t('community.feedEmpty'))}</p>`;
    return;
  }

  el.innerHTML = posts.map((p) => `
    <article class="community-card" data-post-id="${escapeHtml(p.id)}">
      <img class="community-card__photo" src="${escapeHtml(resolvePhotoUrl(p.photoUrl))}" alt="" loading="lazy" />
      <div class="community-card__body">
        <div class="community-card__head">
          <strong class="community-card__dish">${escapeHtml(p.recipeName)}</strong>
          <button type="button" class="community-card__user" data-profile="${escapeHtml(p.username)}">@${escapeHtml(p.username)}</button>
        </div>
        ${p.caption ? `<p class="community-card__caption">${escapeHtml(p.caption)}</p>` : ''}
        <div class="community-card__foot">
          <button type="button"
            class="community-card__like${p.likedByMe ? ' community-card__like--on' : ''}"
            data-like="${escapeHtml(p.id)}"
            aria-pressed="${p.likedByMe ? 'true' : 'false'}">
            <span aria-hidden="true">${p.likedByMe ? '♥' : '♡'}</span>
            <span class="community-card__like-count">${p.likeCount || 0}</span>
          </button>
          <time class="community-card__time">${escapeHtml(formatTime(p.createdAt))}</time>
        </div>
      </div>
    </article>`).join('');

  el.querySelectorAll('[data-like]').forEach((btn) => {
    btn.addEventListener('click', () => toggleLike(btn.dataset.like, btn));
  });
  el.querySelectorAll('[data-profile]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal('community');
      UserUI.openProfile(btn.dataset.profile);
    });
  });
}

async function toggleLike(postId, btn) {
  if (!UserStore.isCloudUser()) {
    closeModal('community');
    UserUI.showAuth('login');
    return;
  }
  btn.disabled = true;
  try {
    const data = await api(`/api/community/posts/${encodeURIComponent(postId)}/like`, {
      method: 'POST',
      body: '{}',
    });
    const liked = !!data.liked;
    btn.classList.toggle('community-card__like--on', liked);
    btn.setAttribute('aria-pressed', liked ? 'true' : 'false');
    const icon = btn.querySelector('[aria-hidden]');
    if (icon) icon.textContent = liked ? '♥' : '♡';
    const count = btn.querySelector('.community-card__like-count');
    if (count) count.textContent = String(data.likeCount || 0);
  } catch (e) {
    if (e.status === 401) {
      closeModal('community');
      UserUI.showAuth('login');
    }
  } finally {
    btn.disabled = false;
  }
}

async function loadCommunity() {
  const weekly = document.getElementById('community-weekly');
  const feed = document.getElementById('community-feed');
  const loading = `<p class="community__loading">${escapeHtml(t('community.loading'))}</p>`;
  if (weekly) weekly.innerHTML = loading;
  if (feed) feed.innerHTML = loading;

  if (!SiteConfig.apiEnabled()) {
    const offline = `<p class="community__empty">${escapeHtml(t('community.offline'))}</p>`;
    if (weekly) weekly.innerHTML = offline;
    if (feed) feed.innerHTML = offline;
    return;
  }

  try {
    const [top, feedData] = await Promise.all([
      api('/api/community/weekly-top'),
      api('/api/community/posts?limit=40'),
    ]);
    renderWeeklyTop(top.dishes || []);
    renderFeed(feedData.posts || []);
  } catch {
    const err = `<p class="community__empty">${escapeHtml(t('community.error'))}</p>`;
    if (weekly) weekly.innerHTML = err;
    if (feed) feed.innerHTML = err;
  }
}

function resetShare() {
  stopWebcam();
  pending = { recipeId: '', recipeName: '', dataUrl: '' };
  const preview = document.getElementById('finish-photo-preview');
  const status = document.getElementById('finish-share-status');
  const caption = document.getElementById('finish-share-caption');
  const shareBtn = document.getElementById('btn-finish-share');
  if (preview) {
    preview.hidden = true;
    preview.removeAttribute('src');
  }
  if (status) {
    status.hidden = true;
    status.textContent = '';
  }
  if (caption) caption.value = '';
  const albumInput = document.getElementById('finish-photo-album');
  const cameraInput = document.getElementById('finish-photo-camera');
  if (albumInput) albumInput.value = '';
  if (cameraInput) cameraInput.value = '';
  if (shareBtn) shareBtn.disabled = true;
}

async function onPickPhoto(file) {
  const status = document.getElementById('finish-share-status');
  const preview = document.getElementById('finish-photo-preview');
  const shareBtn = document.getElementById('btn-finish-share');
  try {
    const dataUrl = await compressImageFile(file);
    pending.dataUrl = dataUrl;
    if (preview) {
      preview.src = dataUrl;
      preview.hidden = false;
    }
    if (shareBtn) shareBtn.disabled = !pending.recipeId;
    if (status) status.hidden = true;
  } catch {
    if (status) {
      status.hidden = false;
      status.textContent = t('community.photoInvalid');
    }
    if (shareBtn) shareBtn.disabled = true;
  }
}

async function submitShare() {
  const status = document.getElementById('finish-share-status');
  const shareBtn = document.getElementById('btn-finish-share');
  if (!pending.dataUrl || !pending.recipeId) return;

  if (!UserStore.isCloudUser()) {
    if (status) {
      status.hidden = false;
      status.textContent = t('community.loginRequired');
    }
    UserUI.showAuth('login');
    return;
  }

  const caption = document.getElementById('finish-share-caption')?.value?.trim() || '';
  if (shareBtn) shareBtn.disabled = true;
  if (status) {
    status.hidden = false;
    status.textContent = t('community.uploading');
  }

  try {
    await api('/api/community/posts', {
      method: 'POST',
      body: JSON.stringify({
        recipeId: pending.recipeId,
        recipeName: pending.recipeName,
        caption,
        photo: pending.dataUrl,
      }),
    });
    if (status) status.textContent = t('community.shareSuccess');
    pending.dataUrl = '';
    const album = document.getElementById('finish-photo-album');
    const camera = document.getElementById('finish-photo-camera');
    if (album) album.value = '';
    if (camera) camera.value = '';
  } catch (e) {
    if (status) {
      status.textContent = e.code === 'invalid_photo'
        ? t('community.photoInvalid')
        : t('community.shareFailed');
    }
    if (shareBtn) shareBtn.disabled = false;
  }
}

export const CommunityUI = {
  init() {
    document.getElementById('btn-community')?.addEventListener('click', () => {
      openModal('community');
      applyI18n(document.getElementById('modal-community'));
      loadCommunity();
    });
    document.getElementById('btn-community-hero')?.addEventListener('click', () => {
      openModal('community');
      applyI18n(document.getElementById('modal-community'));
      loadCommunity();
    });
    document.querySelectorAll('[data-close="community"]').forEach((el) => {
      el.addEventListener('click', () => closeModal('community'));
    });
    document.getElementById('btn-community-refresh')?.addEventListener('click', () => loadCommunity());
    const onFileChange = (e) => {
      const file = e.target.files?.[0];
      if (file) onPickPhoto(file);
    };
    document.getElementById('finish-photo-album')?.addEventListener('change', onFileChange);
    document.getElementById('finish-photo-camera')?.addEventListener('change', onFileChange);
    document.getElementById('btn-finish-take-photo')?.addEventListener('click', () => onTakePhotoClick());
    document.getElementById('btn-webcam-capture')?.addEventListener('click', () => captureWebcamFrame());
    document.getElementById('btn-webcam-cancel')?.addEventListener('click', () => stopWebcam());
    document.getElementById('btn-finish-share')?.addEventListener('click', () => submitShare());
  },

  prepareShare(recipe) {
    resetShare();
    const box = document.getElementById('finish-share');
    if (!recipe || !box) return;
    pending.recipeId = recipe.id || '';
    pending.recipeName = recipe.name || '';
    box.hidden = false;
    applyI18n(box);
  },

  hideShare() {
    const box = document.getElementById('finish-share');
    if (box) box.hidden = true;
    resetShare();
  },
};
