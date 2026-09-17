# Ember 余温

A cooking assistant that matches recipes to your ingredients, respects your preferences, and walks you through each step with timers and alarms.

**Ember** — the warmth still on the stove. **余温** — that cozy heat after the flame, guiding you from fridge to plate.

## Features

- **Ingredient input** — type or quick-add what you have on hand (中文/English)
- **Recipe dictionary** — search 42+ dishes by name, flavor, or spice level
- **Expectations** — meal type, time, difficulty, servings, diet, cuisine
- **Recipe matching** — scores recipes by ingredient overlap; generates a custom recipe if nothing fits
- **Guided cooking** — step-by-step sidebar, progress bar, per-step timers
- **Alarms** — audio beeps + on-screen alert; optional browser notifications
- **Settings** — 简体中文 / 繁體中文 / English, dark/light theme, text size, alarm display style, sound
- **Ratings & finish page** — rate dishes after cooking; see ratings when choosing recipes
- **Update journal** — changelog on the home page; edit `js/changelog.js` each release

## Run locally

No build step required. Open `index.html` in a browser, or serve the folder:

```bash
# Python 3
python3 -m http.server 8080
# Then visit http://localhost:8080
```

## How it works

1. Add your ingredients (e.g. chicken, rice, garlic) — or browse the recipe dictionary.
2. Set your expectations (dinner, quick, easy, etc.).
3. Pick a matched recipe from the list.
4. Follow each step — start timers when prompted; you'll get an alarm when time's up.

Ingredients and settings are saved in your browser's local storage between visits.
