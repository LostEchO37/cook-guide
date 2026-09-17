/** User settings — persisted in localStorage. */

const STORAGE_KEY = 'ember-settings';
const LEGACY_KEY = 'simmr-settings';

export const DEFAULTS = {
  language: 'zh-CN',
  theme: 'dark',
  textSize: 'medium',
  alarmDisplay: 'full',
  sound: true,
};

export function loadSettings() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) raw = localStorage.getItem(LEGACY_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULTS };
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch { /* ignore */ }
}

export function applySettings(settings) {
  const root = document.documentElement;
  root.dataset.theme = settings.theme;
  root.dataset.textSize = settings.textSize;
  root.dataset.alarmDisplay = settings.alarmDisplay;
  root.lang = settings.language === 'zh-TW' ? 'zh-Hant' : settings.language === 'zh-CN' ? 'zh-Hans' : 'en';
}
