/** Food map UI — globe, country maps, and regional dishes. */

import {
  COUNTRY_MAPS,
  FOOD_COUNTRIES,
  getCountry,
  getCountryRegions,
  getRegion,
  labelCountry,
  labelRegion,
  regionTagline,
} from './food-regions.js';
import { initGlobe, destroyGlobe, focusCountry, resizeGlobe, setGlobeLang } from './food-globe.js';
import { getLanguage, t } from './i18n.js';
import { getRecipeById } from './recipe-dictionary.js';
import { renderRecipeTagHtml } from './recipe-tags.js';
import { displayIngredient } from './ingredients.js';
import { estimateTotalTime, formatTime } from './recipes.js';

export class FoodMapController {
  constructor(root) {
    this.root = root;
    this.level = 'globe';
    this.countryId = null;
    this.regionId = null;
    this.onPickRecipe = null;
    this.onLevelChange = null;
    this.spicy = 'all';
    this.flavors = [];
    this.globeReady = false;

    this.breadcrumb = root.querySelector('#map-breadcrumb');
    this.globeWrap = root.querySelector('#map-globe-wrap');
    this.countryView = root.querySelector('#map-country-view');
    this.regionPanel = root.querySelector('#map-region-panel');
    this.regionGrid = root.querySelector('#map-region-grid');
    this.regionResults = root.querySelector('#map-region-results');
    this.regionHead = root.querySelector('#map-region-head');
    this.recipeGrid = root.querySelector('#map-recipe-grid');
    this.regionFloat = root.querySelector('#map-region-float');
    this.regionFloatHead = root.querySelector('#map-region-float-head');
    this.regionFloatGrid = root.querySelector('#map-region-float-grid');

    this.ensureChipBar();
    this.bindFloatPanel();
  }

  ensureChipBar() {
    if (this.root.querySelector('#map-country-chips')) return;
    const bar = document.createElement('div');
    bar.id = 'map-country-chips';
    bar.className = 'map-chips';
    bar.setAttribute('role', 'list');
    this.globeWrap?.parentElement?.insertBefore(bar, this.globeWrap.nextSibling);
    this.chipBar = bar;
  }

  bindFloatPanel() {
    const close = () => {
      if (this.level === 'region') this.goBack();
      else this.closeRegionFloat();
    };
    this.root.querySelector('#map-region-float-close')?.addEventListener('click', close);
  }

  notifyLevel() {
    if (this.onLevelChange) this.onLevelChange(this.level);
  }

  async showGlobe() {
    this.level = 'globe';
    this.countryId = null;
    this.regionId = null;
    this.closeRegionFloat();
    this.renderBreadcrumb();
    if (this.globeWrap) this.globeWrap.hidden = false;
    if (this.countryView) this.countryView.hidden = true;
    if (this.regionPanel) this.regionPanel.hidden = true;
    if (this.regionResults) this.regionResults.hidden = true;
    if (this.chipBar) this.chipBar.hidden = false;

    this.renderChips();

    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const lang = getLanguage();
    if (!this.globeReady) {
      await initGlobe(this.globeWrap, {
        onCountrySelect: (id) => this.openCountry(id),
        lang,
      });
      this.globeReady = true;
    } else {
      setGlobeLang(lang);
      resizeGlobe();
    }
    this.notifyLevel();
  }

  renderChips() {
    if (!this.chipBar) return;
    const lang = getLanguage();
    this.chipBar.innerHTML = FOOD_COUNTRIES.map((c) => `
      <button type="button" class="map-chip" data-country="${c.id}" role="listitem">
        <span class="map-chip__emoji">${c.emoji}</span>
        <span class="map-chip__label">${labelCountry(c, lang)}</span>
      </button>
    `).join('');
    this.chipBar.querySelectorAll('[data-country]').forEach((btn) => {
      btn.addEventListener('click', () => this.openCountry(btn.dataset.country));
    });
  }

  openCountry(countryId) {
    const country = getCountry(countryId);
    if (!country) return;
    this.level = 'country';
    this.countryId = countryId;
    this.regionId = null;
    this.closeRegionFloat();
    focusCountry(countryId);
    this.renderBreadcrumb();
    if (this.globeWrap) this.globeWrap.hidden = true;
    if (this.chipBar) this.chipBar.hidden = true;
    if (this.countryView) this.countryView.hidden = false;
    const dense = getCountryRegions(countryId).length >= 8;
    if (this.regionPanel) this.regionPanel.hidden = true;
    if (this.regionResults) this.regionResults.hidden = true;
    this.renderCountryMap();
    if (!dense) this.renderRegionCards();
    this.notifyLevel();
  }

  openRegion(regionId) {
    const region = getRegion(this.countryId, regionId);
    if (!region) return;
    this.level = 'region';
    this.regionId = regionId;
    this.renderBreadcrumb();
    if (this.countryView) this.countryView.hidden = false;
    if (this.regionPanel) this.regionPanel.hidden = true;
    if (this.regionResults) this.regionResults.hidden = true;
    this.highlightPin(regionId);
    this.focusMapOnRegion(region);
    this.renderRegionFloat(region);
    this.notifyLevel();
  }

  goBack() {
    if (this.level === 'region') {
      this.level = 'country';
      this.regionId = null;
      this.closeRegionFloat();
      this.resetMapFocus();
      this.renderBreadcrumb();
      const dense = getCountryRegions(this.countryId).length >= 8;
      if (this.regionPanel) this.regionPanel.hidden = true;
      if (this.regionResults) this.regionResults.hidden = true;
      if (!dense) this.renderRegionCards();
      this.notifyLevel();
      return;
    }
    if (this.level === 'country') {
      this.showGlobe();
    }
  }

  setTagFilters({ spicy, flavors }) {
    this.spicy = spicy || 'all';
    this.flavors = flavors || [];
    if (this.level === 'region') {
      const region = getRegion(this.countryId, this.regionId);
      if (region) this.renderRegionFloat(region);
    }
  }

  renderBreadcrumb() {
    if (!this.breadcrumb) return;
    const lang = getLanguage();
    const parts = [{ label: t('map.world'), action: () => this.showGlobe() }];
    if (this.countryId) {
      parts.push({
        label: labelCountry(getCountry(this.countryId), lang),
        action: () => this.openCountry(this.countryId),
      });
    }
    if (this.regionId) {
      parts.push({
        label: labelRegion(getRegion(this.countryId, this.regionId), lang),
        action: null,
      });
    }
    this.breadcrumb.innerHTML = parts.map((p, i) => {
      const sep = i > 0 ? '<span class="map-crumb__sep">›</span>' : '';
      if (p.action && i < parts.length - 1) {
        return `${sep}<button type="button" class="map-crumb" data-crumb="${i}">${p.label}</button>`;
      }
      return `${sep}<span class="map-crumb map-crumb--current">${p.label}</span>`;
    }).join('');

    this.breadcrumb.querySelectorAll('[data-crumb]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.crumb);
        parts[idx]?.action?.();
      });
    });
  }

  renderCountryMap() {
    const lang = getLanguage();
    const country = getCountry(this.countryId);
    const mapDef = COUNTRY_MAPS[this.countryId];
    const regions = getCountryRegions(this.countryId);
    if (!this.countryView || !country || !mapDef) return;

    const dense = regions.length >= 8;
    const landPaths = mapDef.paths || [{ d: mapDef.outline }];
    const landD = landPaths.map((p) => p.d).join(' ');
    const focused = this.regionId;
    const focusRegion = focused ? getRegion(this.countryId, focused) : null;

    this.countryView.innerHTML = `
      <div class="map-country__intro">
        <span class="map-country__emoji">${country.emoji}</span>
        <div>
          <h3 class="map-country__name">${labelCountry(country, lang)}</h3>
          <p class="map-country__hint">${t('map.tapRegion')}</p>
        </div>
      </div>
      <div class="map-country__canvas${focused ? ' map-country__canvas--focused' : ''}"
        style="${focusRegion ? `--focus-x:${focusRegion.x}%;--focus-y:${focusRegion.y}%;` : ''}">
        <div class="map-country__zoom">
          <svg class="map-country__svg" viewBox="${mapDef.viewBox}" role="img" aria-label="${labelCountry(country, lang)}">
            <defs>
              <linearGradient id="mapFill-${this.countryId}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="rgba(255,107,53,0.16)"/>
                <stop offset="50%" stop-color="rgba(93,190,122,0.12)"/>
                <stop offset="100%" stop-color="rgba(80,140,200,0.1)"/>
              </linearGradient>
              <linearGradient id="mapCoast-${this.countryId}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="rgba(255,200,150,0.55)"/>
                <stop offset="100%" stop-color="rgba(255,140,80,0.25)"/>
              </linearGradient>
              <pattern id="mapGrid-${this.countryId}" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M8 0H0V8" fill="none" stroke="rgba(255,255,255,0.035)" stroke-width="0.35"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="rgba(0,0,0,0.2)" rx="2"/>
            ${landPaths.map((p, i) => `
              <path class="map-country__land${i > 0 ? ' map-country__land--island' : ''}" d="${p.d}"
                fill="url(#mapFill-${this.countryId})"
                stroke="url(#mapCoast-${this.countryId})" stroke-width="${i > 0 ? 0.9 : 1.1}"
                stroke-linejoin="round"/>
            `).join('')}
            <path d="${landD}" fill="url(#mapGrid-${this.countryId})" opacity="0.85" pointer-events="none"/>
          </svg>
          <div class="map-country__chips${dense ? ' map-country__chips--compact' : ''}">
            ${regions.map((r) => {
              const label = labelRegion(r, lang);
              return `
              <button type="button" class="map-region-chip${r.id === focused ? ' map-region-chip--active' : ''}" data-region="${r.id}"
                data-x="${r.x}" data-y="${r.y}"
                aria-label="${label}">${label}</button>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    requestAnimationFrame(() => this.layoutMapChips());

    this.countryView.querySelectorAll('[data-region]').forEach((el) => {
      el.addEventListener('click', () => this.openRegion(el.dataset.region));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openRegion(el.dataset.region);
        }
      });
    });
  }

  layoutMapChips() {
    const canvas = this.countryView?.querySelector('.map-country__canvas');
    const svg = canvas?.querySelector('.map-country__svg');
    const chipsEl = canvas?.querySelector('.map-country__chips');
    if (!svg || !chipsEl) return;

    const svgRect = svg.getBoundingClientRect();
    const chipsRect = chipsEl.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const scale = Math.min(svgRect.width / vb.width, svgRect.height / vb.height);
    const offsetX = svgRect.left + (svgRect.width - vb.width * scale) / 2 - chipsRect.left;
    const offsetY = svgRect.top + (svgRect.height - vb.height * scale) / 2 - chipsRect.top;

    chipsEl.querySelectorAll('.map-region-chip').forEach((btn) => {
      const x = Number(btn.dataset.x);
      const y = Number(btn.dataset.y);
      if (Number.isNaN(x) || Number.isNaN(y)) return;
      btn.style.left = `${offsetX + x * scale}px`;
      btn.style.top = `${offsetY + y * scale}px`;
    });
  }

  focusMapOnRegion(region) {
    const canvas = this.countryView?.querySelector('.map-country__canvas');
    if (!canvas || !region) return;
    canvas.classList.add('map-country__canvas--focused');
    canvas.style.setProperty('--focus-x', `${region.x}%`);
    canvas.style.setProperty('--focus-y', `${region.y}%`);
  }

  resetMapFocus() {
    const canvas = this.countryView?.querySelector('.map-country__canvas');
    canvas?.classList.remove('map-country__canvas--focused');
    this.highlightPin(null);
  }

  highlightPin(regionId) {
    this.countryView?.querySelectorAll('.map-region-chip').forEach((el) => {
      el.classList.toggle('map-region-chip--active', regionId != null && el.dataset.region === regionId);
    });
  }

  closeRegionFloat() {
    if (!this.regionFloat) return;
    this.regionFloat.classList.remove('map-dish-sheet--open');
    this.regionFloat.hidden = true;
    if (this.regionFloatHead) this.regionFloatHead.innerHTML = '';
    if (this.regionFloatGrid) this.regionFloatGrid.innerHTML = '';
  }

  renderRegionFloat(region) {
    if (!this.regionFloat || !this.regionFloatHead || !this.regionFloatGrid) return;
    const lang = getLanguage();
    const country = getCountry(this.countryId);

    this.regionFloatHead.innerHTML = `
      <div class="map-region-head map-region-head--float">
        <span class="map-region-head__emoji">${country?.emoji || '🍽️'}</span>
        <div>
          <h3 class="map-region-head__title">${labelRegion(region, lang)}</h3>
          <p class="map-region-head__sub">${regionTagline(region, lang)}</p>
          <p class="map-region-float__count">${t('map.dishCount', { n: region.recipes.length })}</p>
        </div>
      </div>
    `;

    let recipes = region.recipes.map((id) => getRecipeById(id)).filter(Boolean);
    if (this.spicy !== 'all') recipes = recipes.filter((r) => r.spicy === this.spicy);
    if (this.flavors.length) {
      recipes = recipes.filter((r) => this.flavors.some((f) => (r.flavors || []).includes(f)));
    }

    if (!recipes.length) {
      this.regionFloatGrid.innerHTML = `<p class="empty">${t('dictionary.empty')}</p>`;
    } else {
      this.regionFloatGrid.innerHTML = recipes.map((r, idx) => {
        const name = r.names?.[lang] || r.name;
        const mins = estimateTotalTime(r.steps);
        return `
          <button type="button" class="recipe-card recipe-card--dict recipe-card--float" data-dict-id="${r.id}">
            <div class="recipe-card__top">
              <span class="recipe-card__name">${name}</span>
            </div>
            <div class="recipe-card__meta">
              <span>⏱ ~${formatTime(mins, lang)}</span>
            </div>
            <div class="recipe-card__tags">${renderRecipeTagHtml(r, lang)}</div>
          </button>
        `;
      }).join('');

      this.regionFloatGrid.querySelectorAll('[data-dict-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (this.onPickRecipe) this.onPickRecipe(btn.dataset.dictId);
        });
      });
    }

    this.regionFloat.hidden = false;
    requestAnimationFrame(() => {
      this.regionFloat.classList.add('map-dish-sheet--open');
    });
  }

  renderRegionCards() {
    if (!this.regionGrid) return;
    const lang = getLanguage();
    const regions = getCountryRegions(this.countryId);
    this.regionGrid.innerHTML = regions.map((r) => `
      <button type="button" class="map-region-card${r.id === this.regionId ? ' map-region-card--active' : ''}" data-region="${r.id}">
        <span class="map-region-card__name">${labelRegion(r, lang)}</span>
        <span class="map-region-card__tagline">${regionTagline(r, lang)}</span>
        <span class="map-region-card__count">${t('map.dishCount', { n: r.recipes.length })}</span>
      </button>
    `).join('');

    this.regionGrid.querySelectorAll('[data-region]').forEach((btn) => {
      btn.addEventListener('click', () => this.openRegion(btn.dataset.region));
    });
  }

  renderRegionHead() {
    if (!this.regionHead) return;
    const lang = getLanguage();
    const region = getRegion(this.countryId, this.regionId);
    const country = getCountry(this.countryId);
    this.regionHead.innerHTML = `
      <div class="map-region-head">
        <span class="map-region-head__emoji">${country?.emoji || '🍽️'}</span>
        <div>
          <h3 class="map-region-head__title">${labelRegion(region, lang)}</h3>
          <p class="map-region-head__sub">${regionTagline(region, lang)}</p>
        </div>
      </div>
    `;
  }

  renderRegionRecipes() {
    if (!this.recipeGrid) return;
    const region = getRegion(this.countryId, this.regionId);
    if (region) this.renderRegionFloat(region);
  }

  refresh() {
    this.renderBreadcrumb();
    if (this.level === 'globe') {
      this.renderChips();
      setGlobeLang(getLanguage());
    } else if (this.level === 'country') {
      this.renderCountryMap();
      this.renderRegionCards();
    } else if (this.level === 'region') {
      this.renderCountryMap();
      this.highlightPin(this.regionId);
      const region = getRegion(this.countryId, this.regionId);
      if (region) this.renderRegionFloat(region);
    }
  }

  resize() {
    if (this.level === 'globe' && this.globeReady) resizeGlobe();
    if (this.level === 'country' || this.level === 'region') this.layoutMapChips();
  }

  destroy() {
    destroyGlobe();
    this.globeReady = false;
  }
}
