# Deploy Ember analytics · Vercel (free · no card)

Same pattern as **ielts-task1** (`https://ielts-task1.vercel.app`).

Render asks for a credit card; Vercel hobby tier does not.

## Steps

1. Open https://vercel.com/new — sign in with **GitHub** (same account as IELTS).
2. Import **`LostEchO37/cook-guide`**.
3. **Root Directory** → `server` (important).
4. Environment variables:

   | Key | Value |
   | --- | --- |
   | `ADMIN_PASSWORD` | your portal password |
   | `SESSION_SECRET` | long random string |
   | `CORS_ORIGIN` | `https://lostecho37.github.io,http://127.0.0.1:8787` |
   | `SITE_ID` | `ember` |
   | `PUBLIC_SITE_URL` | `https://lostecho37.github.io/cook-guide/` |

5. **Framework Preset** → **Express** (not “Other”). Root Directory → `server`.
6. Deploy → production URL: **`https://cook-guide-analytics.vercel.app`**
7. `index.html` already has:
   ```html
   <meta name="analytics-endpoint" content="https://cook-guide-analytics.vercel.app">
   ```

**Portal:** https://cook-guide-analytics.vercel.app/portal

**Cost:** Vercel **Hobby (free)** — no credit card. Same as your IELTS API.

## Zeabur (alternative, no card)

See your IELTS `SETUP-Zeabur.md` — same flow, repo `cook-guide`, root `server`, `zbpack.json` already in repo root.
