# Ember analytics portal

Password-protected **view-only** dashboard for visit history and website usage.

Python 3 stdlib only — no npm or pip install required.

## Public site (family)

**https://lostecho37.github.io/cook-guide/** — Ember 余温 on GitHub Pages.

## Run locally (app + live analytics)

```bash
cd server
cp .env.example .env
# edit ADMIN_PASSWORD, SESSION_SECRET, CORS_ORIGIN
python3 app.py
```

Open **http://127.0.0.1:8787/** (same process serves the site + analytics).

Portal: **http://127.0.0.1:8787/portal** (password = `ADMIN_PASSWORD`).

Counts refresh every 3 seconds while the portal tab is open.

Status (no login): `GET http://127.0.0.1:8787/api/v1/status`

## Analytics from GitHub Pages

Browsers block HTTPS Pages → local HTTP (mixed content). Two options:

1. **Local testing** — open the app at **http://127.0.0.1:8787/** (recommended for the portal).
2. **Production** — deploy this server to HTTPS (e.g. [Render](https://render.com) with `render.yaml` in the repo root), then in `index.html` set:
   ```html
   <meta name="analytics-endpoint" content="https://your-ember-analytics.onrender.com">
   ```
   Redeploy GitHub Pages. Family visits on `cook-guide` will then reach the portal.

One-click Render deploy: [Deploy to Render](https://render.com/deploy?repo=https://github.com/LostEchO37/cook-guide)

## What is recorded

| Field | Notes |
| --- | --- |
| Visits / views / cook / rate / … | Usage actions |
| **IP** | Client IP (request / `X-Forwarded-For`) |
| **Device** | Type · OS · browser |
| **Username** | When signed in; otherwise shown as `guest` |

Wire username when you add accounts:

```js
import { setAnalyticsUsername } from './analytics.js';
setAnalyticsUsername('alice'); // on login
setAnalyticsUsername(null);    // on logout
```

(Also mirrored in `localStorage['ember-username']`.)

## Deploy

1. Strong `ADMIN_PASSWORD` + `SESSION_SECRET`
2. `CORS_ORIGIN` = your GitHub Pages origin
3. Put the public HTTPS URL in the site meta tag and redeploy Pages
4. Data file: `server/data/analytics.sqlite`

## Routes

- `/portal/login` — password
- `/portal` — KPIs, charts, recent activity (read-only)
- `/health` — uptime
- `POST /api/v1/collect` — event intake
