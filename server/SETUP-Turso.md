# Turso database (free · required on Vercel)

Community accounts, posts, and analytics use **one remote SQLite (libSQL)** on [Turso](https://turso.tech).  
This replaces syncing `analytics.sqlite` through Vercel Blob across many serverless instances (the main source of API flakiness).

**Cost:** Turso **Starter (free)** — no card for hobby use. Vercel stays on **Hobby (free)**. Keep **Vercel Blob** only for dish photos (`BLOB_READ_WRITE_TOKEN`).

## Fastest: Vercel Marketplace (≈2 clicks)

1. Open **[Turso on Vercel Marketplace](https://vercel.com/marketplace/tursocloud/database)** → **Add Product**.
2. Free plan, database name **`ember-cook-guide`**, region **Singapore (`sin`)**, connect to **`cook-guide-analytics`** (Root Directory = `server`).
3. Vercel sets **`TURSO_DATABASE_URL`** + **`TURSO_AUTH_TOKEN`** for you.
4. Redeploy API → `/health` should show `"persist":"turso"`.

## 1. CLI: Create database

1. Install CLI: `brew install tursodatabase/tap/turso` (or see [docs](https://docs.turso.tech/cli)).
2. `turso auth login`
3. Create DB:
   ```bash
   turso db create ember-cook-guide --region sin
   ```
   (`sin` = Singapore; pick a region close to your users.)
4. Get URL and token:
   ```bash
   turso db show ember-cook-guide --url
   turso db tokens create ember-cook-guide
   ```

## 2. Vercel environment variables

Project → **Settings → Environment Variables** (Production + Preview):

| Key | Value |
| --- | --- |
| `TURSO_DATABASE_URL` | `libsql://…` from step 1 |
| `TURSO_AUTH_TOKEN` | token from step 1 |
| `ADMIN_PASSWORD` | portal password |
| `SESSION_SECRET` | long random string |
| `CORS_ORIGIN` | `https://lostecho37.github.io,http://127.0.0.1:8787` |
| `SITE_ID` | `ember` |
| `PUBLIC_SITE_URL` | `https://lostecho37.github.io/cook-guide/` |
| `BLOB_READ_WRITE_TOKEN` | from Vercel Blob store (photos only) |

Redeploy. Check:

```bash
curl -sS https://cook-guide-analytics.vercel.app/health
# expect: "persist":"turso"
```

## 3. Local dev

In `server/.env`:

```env
TURSO_DATABASE_URL=libsql://…
TURSO_AUTH_TOKEN=…
```

Or omit both to use `server/data/analytics.sqlite` on disk (`persist: local`).

## 4. Migrate old Blob SQLite (optional)

If you already had user/post data in Vercel Blob as `ember-analytics.sqlite`:

1. Vercel → Storage → Blob → download `ember-analytics.sqlite`, or run:
   ```bash
   cd server && node scripts/pull-blob-sqlite.mjs
   ```
2. Import into Turso:
   ```bash
   sqlite3 /path/to/analytics.sqlite .dump > ember.dump.sql
   turso db shell ember-cook-guide < ember.dump.sql
   ```
   If the dump fails on a statement, open `ember.dump.sql` and remove lines Turso rejects (usually rare for this schema).

After migration, redeploy once; `/health` should show `turso` and community data should match the old DB.

## 5. What changed

- **Removed:** whole-DB Blob sync + JSON community mirror on the hot path.
- **Kept:** Vercel Blob for community photo uploads only.
- **Result:** every API instance reads/writes the same Turso DB — no last-writer-wins between `/tmp` copies.
