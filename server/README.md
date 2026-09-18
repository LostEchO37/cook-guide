# Ember analytics portal

Password-protected **view-only** dashboard for visit history and website usage.

Python 3 stdlib only — no npm or pip install required.

## Run

```bash
cd server
cp .env.example .env
# edit ADMIN_PASSWORD, SESSION_SECRET, CORS_ORIGIN
python3 app.py
```

Open the app at http://localhost:8787/ (same process serves the site + analytics).

Portal: http://localhost:8787/portal (password = `ADMIN_PASSWORD`).

When the app is opened from that same origin, analytics posts automatically (no meta tag needed).

For a separate static server on port 8080, leave the meta empty — the client targets `http://127.0.0.1:8787` over plain HTTP.

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
