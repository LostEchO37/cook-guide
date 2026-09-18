/** Add-to-home-screen (PWA) + APK download helpers for the hero page. */

import { track } from './analytics.js';

let deferredPrompt = null;

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function openModal(id) {
  document.getElementById(`modal-${id}`)?.removeAttribute('hidden');
}

function closeModal(id) {
  document.getElementById(`modal-${id}`)?.setAttribute('hidden', '');
}

export function initInstall({ t, onOpenModal }) {
  const addBtn = document.getElementById('btn-add-home');
  const apkBtn = document.getElementById('btn-download-apk');
  const installRoot = document.getElementById('hero-install');

  if (!addBtn || !installRoot) return;

  if (isStandalone()) {
    installRoot.hidden = true;
    return;
  }

  if (apkBtn) {
    apkBtn.hidden = isIOS();
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    addBtn.dataset.mode = 'pwa';
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=1.8.6').catch(() => {});
  }

  addBtn.addEventListener('click', async () => {
    track('install_click', { meta: { target: 'add-home' } });
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      return;
    }
    if (isIOS()) {
      if (onOpenModal) onOpenModal('install-ios');
      else openModal('install-ios');
      return;
    }
    if (onOpenModal) onOpenModal('install-ios');
    else openModal('install-ios');
  });

  if (apkBtn) {
    apkBtn.addEventListener('click', () => {
      track('install_click', { meta: { target: 'apk' } });
    });
  }

  document.getElementById('btn-install-ios-close')?.addEventListener('click', () => {
    closeModal('install-ios');
  });

  document.querySelectorAll('[data-close="install-ios"]').forEach((el) => {
    el.addEventListener('click', () => closeModal('install-ios'));
  });
}
