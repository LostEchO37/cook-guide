import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import {
  insertEvent,
  overview,
  dailyVisits,
  topViews,
  topRecipes,
  eventBreakdown,
  langBreakdown,
  recentEvents,
  listAccounts,
  ensureDb,
  getStorageInfo,
  awaitPendingPersist,
} from './db.js';
import authRouter from './routes/auth.js';
import communityRouter from './routes/community.js';
import recipesRouter from './routes/recipes.js';
import { localUploadsDir } from './photo-upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"'))
      || (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvFile();

const PORT = Number(process.env.PORT) || 8787;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me-now';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const SITE_ID = process.env.SITE_ID || 'ember';
const CORS_ORIGIN = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (CORS_ORIGIN.includes('*') || CORS_ORIGIN.includes(origin)) return true;
  try {
    const { protocol, hostname } = new URL(origin);
    if (protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1')) {
      return true;
    }
    if (protocol === 'https:' && hostname.endsWith('.github.io')) {
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

const COOKIE = 'ember_portal';
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const ALLOWED_TYPES = new Set([
  'visit',
  'view',
  'recipe_open',
  'cook_start',
  'cook_complete',
  'rate',
  'alarm_toggle',
  'dictionary_search',
  'install_click',
  'language',
  'heartbeat',
]);

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/uploads', express.static(localUploadsDir()));
app.use(cors({
  origin(origin, cb) {
    cb(null, isAllowedOrigin(origin));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    console.error('database init failed:', err);
    res.status(503).json({ error: 'db_unavailable' });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/community', communityRouter);
app.use('/api/community', recipesRouter);

function sha256(input) {
  return crypto.createHash('sha256').update(String(input)).digest('hex');
}

function dailyIpHash(ip) {
  const day = new Date().toISOString().slice(0, 10);
  return sha256(`${SESSION_SECRET}:${day}:${ip || 'unknown'}`).slice(0, 16);
}

function uaHash(ua) {
  return sha256(`${SESSION_SECRET}:${ua || ''}`).slice(0, 16);
}

function clientIp(req) {
  const fwd = req.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim().slice(0, 45);
  const ip = req.ip || req.socket?.remoteAddress || '';
  return String(ip).replace(/^::ffff:/, '').slice(0, 45);
}

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload?.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  if (verifyToken(req.cookies?.[COOKIE])) {
    next();
    return;
  }
  if (req.path.includes('/api/')) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  res.redirect('/portal/login');
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (aa.length !== bb.length) {
    crypto.timingSafeEqual(aa, aa);
    return false;
  }
  return crypto.timingSafeEqual(aa, bb);
}

const collectLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/health', (_req, res) => {
  const storage = getStorageInfo();
  res.json({
    ok: true,
    site: SITE_ID,
    db: storage.path,
    persist: storage.mode,
    persistHint: storage.mode === 'ephemeral'
      ? 'Link Vercel Blob storage — see server/SETUP-Vercel.md'
      : undefined,
  });
});

app.post('/api/v1/collect', collectLimiter, async (req, res) => {
  const body = req.body || {};
  const type = String(body.type || '').slice(0, 40);
  if (!ALLOWED_TYPES.has(type)) {
    res.status(400).json({ error: 'invalid_type' });
    return;
  }

  const sessionId = String(body.sessionId || '').slice(0, 64);
  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(sessionId)) {
    res.status(400).json({ error: 'invalid_session' });
    return;
  }

  const ts = Number(body.ts) || Date.now();
  const meta = body.meta && typeof body.meta === 'object' ? { ...body.meta } : {};
  if (body.device && typeof body.device === 'object') {
    meta.device = body.device;
  }
  const ip = clientIp(req);
  const username = String(body.username || '').trim().slice(0, 64) || null;

  try {
    insertEvent({
      ts: Math.min(Math.max(ts, Date.now() - 7 * 86400000), Date.now() + 60000),
      received_at: Date.now(),
      site_id: SITE_ID,
      session_id: sessionId,
      type,
      path: body.path ? String(body.path).slice(0, 200) : null,
      view: body.view ? String(body.view).slice(0, 80) : null,
      recipe_id: body.recipeId ? String(body.recipeId).slice(0, 80) : null,
      recipe_name: body.recipeName ? String(body.recipeName).slice(0, 120) : null,
      lang: body.lang ? String(body.lang).slice(0, 16) : null,
      meta_json: JSON.stringify(meta).slice(0, 1000),
      ua_hash: uaHash(req.get('user-agent')),
      ip_hash: dailyIpHash(ip),
      ip,
      username,
      referrer: body.referrer ? String(body.referrer).slice(0, 300) : (req.get('referer') || null)?.slice?.(0, 300) || null,
    });
    await awaitPendingPersist();
    res.status(204).end();
  } catch (err) {
    console.error('collect failed', err);
    res.status(500).json({ error: 'store_failed' });
  }
});

app.get('/portal/login', (req, res) => {
  if (verifyToken(req.cookies?.[COOKIE])) {
    res.redirect('/portal');
    return;
  }
  res.type('html').send(loginPage(Boolean(req.query.error)));
});

app.post('/portal/login', loginLimiter, (req, res) => {
  const password = String(req.body?.password || '');
  if (!safeEqual(password, ADMIN_PASSWORD)) {
    res.redirect('/portal/login?error=1');
    return;
  }
  const token = signToken({ exp: Date.now() + TOKEN_TTL_MS, role: 'viewer' });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TOKEN_TTL_MS,
  });
  res.redirect('/portal');
});

app.post('/portal/logout', (_req, res) => {
  res.clearCookie(COOKIE);
  res.redirect('/portal/login');
});

app.get('/portal/api/stats', requireAuth, (req, res) => {
  const days = Number(req.query.days) || 7;
  res.json({
    overview: overview(days),
    daily: dailyVisits(days),
    views: topViews(days),
    recipes: topRecipes(days),
    types: eventBreakdown(days),
    langs: langBreakdown(days),
    users: listAccounts(),
    recent: recentEvents(80),
  });
});

app.get('/portal', requireAuth, (_req, res) => {
  res.type('html').send(portalPage());
});

app.get('/', (_req, res) => {
  res.redirect('/portal');
});

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Ember analytics portal → http://localhost:${PORT}/portal`);
    console.log(`Collect endpoint      → POST http://localhost:${PORT}/api/v1/collect`);
    if (ADMIN_PASSWORD === 'change-me-now') {
      console.warn('WARNING: set ADMIN_PASSWORD in server/.env before exposing publicly');
    }
  });
}

function loginPage(hasError) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Ember analytics — login</title>
  <style>
    :root { color-scheme: dark; --bg:#120e0c; --card:#1c1612; --text:#f3e8df; --muted:#a89888; --accent:#e07a45; --err:#e85d5d; }
    * { box-sizing: border-box; }
    body { margin:0; min-height:100vh; display:grid; place-items:center; font:15px/1.5 system-ui,sans-serif;
      background: radial-gradient(ellipse at 30% 20%, #2a1a12, var(--bg)); color:var(--text); }
    form { width:min(360px,92vw); padding:2rem; background:var(--card); border:1px solid #3a2c24; border-radius:16px; }
    h1 { margin:0 0 .35rem; font-size:1.35rem; font-weight:650; }
    p { margin:0 0 1.25rem; color:var(--muted); font-size:.9rem; }
    label { display:block; margin-bottom:.4rem; color:var(--muted); font-size:.8rem; }
    input { width:100%; padding:.75rem .9rem; border-radius:10px; border:1px solid #4a3a30; background:#100c0a; color:var(--text); margin-bottom:1rem; }
    button { width:100%; padding:.8rem; border:0; border-radius:10px; background:var(--accent); color:#1a0f0a; font-weight:650; cursor:pointer; }
    .err { color:var(--err); margin-bottom:.75rem; font-size:.85rem; }
  </style>
</head>
<body>
  <form method="post" action="/portal/login">
    <h1>Ember analytics</h1>
    <p>View-only portal for visit history and usage.</p>
    ${hasError ? '<div class="err">Wrong password.</div>' : ''}
    <label for="password">Password</label>
    <input id="password" name="password" type="password" autocomplete="current-password" required autofocus />
    <button type="submit">Enter</button>
  </form>
</body>
</html>`;
}

function portalPage() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Ember analytics portal</title>
  <style>
    :root {
      color-scheme: dark;
      --bg:#100c0a; --panel:#1a1410; --line:#3a2c24; --text:#f4ebe3; --muted:#a89888;
      --accent:#e07a45; --accent2:#c4a574;
    }
    * { box-sizing: border-box; }
    body { margin:0; font:14px/1.45 system-ui,sans-serif; background:var(--bg); color:var(--text); }
    header { display:flex; flex-wrap:wrap; gap:1rem; align-items:center; justify-content:space-between;
      padding:1rem 1.25rem; border-bottom:1px solid var(--line); background:#160f0c; position:sticky; top:0; z-index:2; }
    h1 { margin:0; font-size:1.15rem; font-weight:650; }
    .muted { color:var(--muted); }
    .controls { display:flex; gap:.6rem; align-items:center; flex-wrap:wrap; }
    select, button { border-radius:8px; border:1px solid var(--line); background:#221914; color:var(--text); padding:.45rem .7rem; }
    button { cursor:pointer; }
    button.primary { background:var(--accent); border-color:transparent; color:#1a0f0a; font-weight:650; }
    main { padding:1.25rem; max-width:1200px; margin:0 auto; }
    .grid { display:grid; gap:1rem; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); margin-bottom:1.25rem; }
    .card { background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:1rem 1.1rem; }
    .card .label { color:var(--muted); font-size:.75rem; text-transform:uppercase; letter-spacing:.06em; }
    .card .value { font-size:1.7rem; font-weight:700; margin-top:.25rem; }
    .panels { display:grid; gap:1rem; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
    h2 { margin:0 0 .75rem; font-size:.95rem; font-weight:650; color:var(--accent2); }
    table { width:100%; border-collapse:collapse; font-size:.85rem; }
    th, td { text-align:left; padding:.45rem .35rem; border-bottom:1px solid #2a211c; vertical-align:top; }
    th { color:var(--muted); font-weight:500; font-size:.72rem; text-transform:uppercase; letter-spacing:.04em; }
    .bar { height:6px; border-radius:99px; background:#2a211c; overflow:hidden; margin-top:.35rem; }
    .bar > span { display:block; height:100%; background:linear-gradient(90deg, var(--accent), #f0b27a); }
    .chart { display:flex; align-items:flex-end; gap:6px; height:120px; margin-top:.5rem; }
    .chart .col { flex:1; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; gap:4px; min-width:0; height:100%; }
    .chart .col i { display:block; width:100%; border-radius:4px 4px 0 0; background:var(--accent); min-height:2px; }
    .chart .col em { font-style:normal; font-size:.65rem; color:var(--muted); max-width:100%; overflow:hidden; text-overflow:ellipsis; }
    .mono { font-family: ui-monospace, Menlo, monospace; font-size:.78rem; }
    .tag { display:inline-block; padding:.1rem .4rem; border-radius:6px; background:#2a211c; color:var(--accent2); font-size:.72rem; }
    footer { padding:1rem 1.25rem 2rem; color:var(--muted); font-size:.8rem; text-align:center; }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Ember · usage portal</h1>
      <div class="muted" id="subtitle">View only · loading…</div>
    </div>
    <div class="controls">
      <label class="muted" for="days">Range</label>
      <select id="days">
        <option value="1">24h</option>
        <option value="7" selected>7 days</option>
        <option value="30">30 days</option>
        <option value="90">90 days</option>
      </select>
      <button type="button" class="primary" id="refresh">Refresh</button>
      <form method="post" action="/portal/logout" style="margin:0"><button type="submit">Log out</button></form>
    </div>
  </header>
  <main>
    <section class="grid" id="kpis"></section>
    <section class="panels">
      <div class="card"><h2>Daily visits</h2><div class="chart" id="daily"></div></div>
      <div class="card"><h2>Event types</h2><div id="types"></div></div>
      <div class="card"><h2>Top screens</h2><div id="views"></div></div>
      <div class="card"><h2>Top recipes</h2><div id="recipes"></div></div>
      <div class="card"><h2>Languages (visits)</h2><div id="langs"></div></div>
      <div class="card" style="grid-column:1/-1"><h2>Registered users</h2><div id="users"></div></div>
      <div class="card" style="grid-column:1/-1"><h2>Recent activity</h2><div id="recent"></div></div>
    </section>
  </main>
  <footer>IP and username (when signed in) are stored for this private portal. Keep the portal password private.</footer>
  <script>
    const $ = (id) => document.getElementById(id);
    const fmt = (n) => new Intl.NumberFormat().format(n || 0);
    const when = (ts) => new Date(ts).toLocaleString();
    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }
    function bars(rows, labelKey, valueKey) {
      const max = Math.max(1, ...rows.map((r) => r[valueKey]));
      return rows.map((r) => {
        const pct = Math.round((r[valueKey] / max) * 100);
        return '<div style="margin-bottom:.65rem"><div style="display:flex;justify-content:space-between;gap:.5rem"><span>'
          + escapeHtml(String(r[labelKey])) + '</span><span class="muted">' + fmt(r[valueKey])
          + '</span></div><div class="bar"><span style="width:' + pct + '%"></span></div></div>';
      }).join('') || '<p class="muted">No data yet.</p>';
    }
    async function load() {
      const days = $('days').value;
      const res = await fetch('/portal/api/stats?days=' + days, { credentials: 'same-origin' });
      if (res.status === 401) { location.href = '/portal/login'; return; }
      const data = await res.json();
      const o = data.overview;
      $('subtitle').textContent = 'Last ' + o.days + ' day(s) · view only';
      $('kpis').innerHTML = [
        ['Visits', o.visits],
        ['Sessions', o.sessions],
        ['Events', o.events],
        ['Cooks started', o.cooksStarted],
        ['Cooks finished', o.cooksFinished],
        ['Ratings', o.ratings],
        ['Registered users', o.registeredUsers],
      ].map(([label, value]) => '<div class="card"><div class="label">' + label + '</div><div class="value">' + fmt(value) + '</div></div>').join('');

      const daily = data.daily || [];
      const maxV = Math.max(1, ...daily.map((d) => d.visits));
      $('daily').innerHTML = daily.length
        ? daily.map((d) => {
            const h = Math.max(2, Math.round((d.visits / maxV) * 100));
            return '<div class="col" title="' + d.day + ': ' + d.visits + ' visits / ' + d.sessions + ' sessions"><i style="height:' + h + '%"></i><em>' + String(d.day).slice(5) + '</em></div>';
          }).join('')
        : '<p class="muted">No visits in this range.</p>';

      $('types').innerHTML = bars(data.types || [], 'type', 'c');
      $('views').innerHTML = bars(data.views || [], 'name', 'c');
      $('recipes').innerHTML = bars(data.recipes || [], 'name', 'c');
      $('langs').innerHTML = bars(data.langs || [], 'lang', 'c');

      const users = data.users || [];
      $('users').innerHTML = users.length
        ? '<table><thead><tr><th>Username</th><th>Joined</th><th>Last sync</th><th>Cooks saved</th></tr></thead><tbody>'
          + users.map((u) => '<tr><td><strong>' + escapeHtml(u.username) + '</strong></td><td class="mono">'
            + when(u.createdAt) + '</td><td class="mono muted">'
            + (u.updatedAt ? when(u.updatedAt) : '—') + '</td><td>'
            + fmt(u.cooks) + '</td></tr>').join('')
          + '</tbody></table>'
        : '<p class="muted">No registered users yet.</p>';

      const recent = data.recent || [];
      $('recent').innerHTML = recent.length
        ? '<table><thead><tr><th>When</th><th>Type</th><th>User</th><th>IP</th><th>View / recipe</th><th>Lang</th><th>Session</th></tr></thead><tbody>'
          + recent.map((e) => '<tr><td class="mono">' + when(e.ts) + '</td><td><span class="tag">'
            + escapeHtml(e.type) + '</span></td><td>'
            + escapeHtml(e.username || 'guest') + '</td><td class="mono">'
            + escapeHtml(e.ip || '—') + '</td><td>'
            + escapeHtml(e.recipe_name || e.view || e.path || '—') + '</td><td>'
            + escapeHtml(e.lang || '—') + '</td><td class="mono muted">'
            + escapeHtml(String(e.session_id || '').slice(0, 10)) + '…</td></tr>').join('')
          + '</tbody></table>'
        : '<p class="muted">Waiting for the first events from the site.</p>';
    }
    $('refresh').addEventListener('click', load);
    $('days').addEventListener('change', load);
    load();
    setInterval(load, 60000);
  </script>
</body>
</html>`;
}
