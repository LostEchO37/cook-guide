#!/usr/bin/env python3
"""Ember analytics — visit history & usage portal (view-only).

Run:
  cd server && cp .env.example .env
  python3 app.py

Portal:  http://localhost:8787/portal
Collect: POST http://localhost:8787/api/v1/collect
"""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import time
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent
SITE_ROOT = ROOT.parent
DATA_DIR = ROOT / "data"
DATA_DIR.mkdir(exist_ok=True)
DB_PATH = Path(os.environ.get("DB_PATH", DATA_DIR / "analytics.sqlite"))
ENV_PATH = ROOT / ".env"

STATIC_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".webmanifest": "application/manifest+json",
    ".apk": "application/vnd.android.package-archive",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".map": "application/json",
    ".txt": "text/plain; charset=utf-8",
    ".md": "text/plain; charset=utf-8",
}

ALLOWED_TYPES = {
    "visit",
    "view",
    "recipe_open",
    "cook_start",
    "cook_complete",
    "rate",
    "alarm_toggle",
    "dictionary_search",
    "install_click",
    "language",
    "heartbeat",
}

COOKIE_NAME = "ember_portal"
TOKEN_TTL = 7 * 24 * 60 * 60
SESSION_RE = re.compile(r"^[a-zA-Z0-9_-]{8,64}$")


def load_env() -> None:
    if not ENV_PATH.exists():
        return
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, val = line.split("=", 1)
        os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))


load_env()

PORT = int(os.environ.get("PORT", "8787"))
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "change-me-now")
SESSION_SECRET = os.environ.get("SESSION_SECRET", secrets.token_hex(32))
SITE_ID = os.environ.get("SITE_ID", "ember")
PUBLIC_SITE_URL = os.environ.get("PUBLIC_SITE_URL", "https://lostecho37.github.io/cook-guide/").rstrip("/") + "/"
CORS_ORIGIN = [
    o.strip()
    for o in os.environ.get(
        "CORS_ORIGIN",
        "http://localhost:8080,http://127.0.0.1:8080,http://localhost:5500,http://127.0.0.1:5500,http://localhost:8000,http://127.0.0.1:8000,http://localhost:8787,http://127.0.0.1:8787,https://lostecho37.github.io",
    ).split(",")
    if o.strip()
]


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS events (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              ts INTEGER NOT NULL,
              received_at INTEGER NOT NULL,
              site_id TEXT NOT NULL DEFAULT 'ember',
              session_id TEXT NOT NULL,
              type TEXT NOT NULL,
              path TEXT,
              view TEXT,
              recipe_id TEXT,
              recipe_name TEXT,
              lang TEXT,
              meta_json TEXT,
              ua_hash TEXT,
              ip_hash TEXT,
              referrer TEXT,
              ip TEXT,
              username TEXT,
              device TEXT,
              device_type TEXT,
              os_name TEXT,
              browser TEXT,
              user_agent TEXT
            )
            """
        )
        # Migrate older DBs that were created before these columns existed
        cols = {row[1] for row in conn.execute("PRAGMA table_info(events)").fetchall()}
        for col, typedef in (
            ("ip", "TEXT"),
            ("username", "TEXT"),
            ("device", "TEXT"),
            ("device_type", "TEXT"),
            ("os_name", "TEXT"),
            ("browser", "TEXT"),
            ("user_agent", "TEXT"),
        ):
            if col not in cols:
                conn.execute(f"ALTER TABLE events ADD COLUMN {col} {typedef}")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_events_type ON events(type)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_events_ip ON events(ip)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_events_username ON events(username)")


def sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def daily_ip_hash(ip: str) -> str:
    day = time.strftime("%Y-%m-%d", time.gmtime())
    return sha256(f"{SESSION_SECRET}:{day}:{ip or 'unknown'}")[:16]


def hash_ua(ua: str) -> str:
    return sha256(f"{SESSION_SECRET}:{ua or ''}")[:16]


def parse_device(ua: str, client_hint: dict | None = None) -> dict:
    """Best-effort device / OS / browser labels from UA (+ optional client hints)."""
    ua = ua or ""
    hint = client_hint if isinstance(client_hint, dict) else {}

    device_type = str(hint.get("deviceType") or "").strip().lower()
    if device_type not in {"mobile", "tablet", "desktop", "bot"}:
        if re.search(r"bot|crawl|spider|slurp", ua, re.I):
            device_type = "bot"
        elif re.search(r"iPad|Tablet|Kindle|Silk", ua, re.I):
            device_type = "tablet"
        elif re.search(r"Mobi|Android.*Mobile|iPhone|iPod", ua, re.I):
            device_type = "mobile"
        else:
            device_type = "desktop"

    os_name = str(hint.get("os") or "").strip()
    if not os_name:
        if "Windows NT" in ua:
            os_name = "Windows"
        elif "Android" in ua:
            os_name = "Android"
        elif "iPhone" in ua or "iPad" in ua or "iPod" in ua:
            os_name = "iOS"
        elif "Mac OS X" in ua or "Macintosh" in ua:
            os_name = "macOS"
        elif "CrOS" in ua:
            os_name = "ChromeOS"
        elif "Linux" in ua:
            os_name = "Linux"
        else:
            os_name = "Unknown"

    browser = str(hint.get("browser") or "").strip()
    if not browser:
        if "Edg/" in ua:
            browser = "Edge"
        elif "OPR/" in ua or "Opera" in ua:
            browser = "Opera"
        elif "Firefox/" in ua:
            browser = "Firefox"
        elif "Chrome/" in ua and "Chromium" not in ua:
            browser = "Chrome"
        elif "Safari/" in ua and "Chrome/" not in ua:
            browser = "Safari"
        elif "SamsungBrowser" in ua:
            browser = "Samsung Internet"
        else:
            browser = "Unknown"

    device = str(hint.get("device") or "").strip()
    if not device:
        device = f"{device_type} · {os_name} · {browser}"

    return {
        "device": device[:120],
        "device_type": device_type[:32],
        "os_name": os_name[:64],
        "browser": browser[:64],
        "user_agent": ua[:400] or None,
    }


def _b64(raw: bytes) -> str:
    import base64

    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def _unb64(text: str) -> bytes:
    import base64

    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def sign_token(payload: dict) -> str:
    body = json.dumps(payload, separators=(",", ":"), sort_keys=True)
    body_b64 = _b64(body.encode("utf-8"))
    sig = hmac.new(SESSION_SECRET.encode("utf-8"), body_b64.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{body_b64}.{sig}"


def verify_token(token: str | None) -> dict | None:
    if not token or "." not in token:
        return None
    body_b64, sig = token.rsplit(".", 1)
    expected = hmac.new(
        SESSION_SECRET.encode("utf-8"), body_b64.encode("utf-8"), hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(sig, expected):
        return None
    try:
        payload = json.loads(_unb64(body_b64))
    except Exception:
        return None
    if not payload.get("exp") or time.time() > float(payload["exp"]):
        return None
    return payload


def since_ms(days: int) -> tuple[int, int]:
    d = min(max(int(days or 7), 1), 365)
    return d, int(time.time() * 1000) - d * 24 * 60 * 60 * 1000


def overview(days: int = 7) -> dict:
    d, since = since_ms(days)
    with connect() as conn:

        def count(event_type: str) -> int:
            return conn.execute(
                "SELECT COUNT(*) FROM events WHERE type = ? AND ts >= ?",
                (event_type, since),
            ).fetchone()[0]

        last_ts = conn.execute("SELECT MAX(ts) FROM events").fetchone()[0]
        total_events = conn.execute("SELECT COUNT(*) FROM events").fetchone()[0]
        return {
            "days": d,
            "visits": count("visit"),
            "sessions": conn.execute(
                "SELECT COUNT(DISTINCT session_id) FROM events WHERE ts >= ?", (since,)
            ).fetchone()[0],
            "events": conn.execute(
                "SELECT COUNT(*) FROM events WHERE ts >= ?", (since,)
            ).fetchone()[0],
            "cooksStarted": count("cook_start"),
            "cooksFinished": count("cook_complete"),
            "ratings": count("rate"),
            "lastEventTs": last_ts,
            "totalEvents": total_events,
        }


def daily_visits(days: int = 7) -> list[dict]:
    _, since = since_ms(days)
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT date(ts / 1000, 'unixepoch', 'localtime') AS day,
                   COUNT(*) AS visits,
                   COUNT(DISTINCT session_id) AS sessions
            FROM events
            WHERE type = 'visit' AND ts >= ?
            GROUP BY day ORDER BY day ASC
            """,
            (since,),
        ).fetchall()
    return [dict(r) for r in rows]


def top_views(days: int = 7, limit: int = 20) -> list[dict]:
    _, since = since_ms(days)
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT COALESCE(NULLIF(view, ''), NULLIF(path, ''), '(unknown)') AS name,
                   COUNT(*) AS c
            FROM events
            WHERE type IN ('view', 'visit') AND ts >= ?
            GROUP BY name ORDER BY c DESC LIMIT ?
            """,
            (since, limit),
        ).fetchall()
    return [dict(r) for r in rows]


def top_recipes(days: int = 7, limit: int = 20) -> list[dict]:
    _, since = since_ms(days)
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT COALESCE(NULLIF(recipe_name, ''), NULLIF(recipe_id, ''), '(unknown)') AS name,
                   recipe_id AS id,
                   COUNT(*) AS c
            FROM events
            WHERE type IN ('recipe_open', 'cook_start', 'cook_complete')
              AND ts >= ?
              AND (recipe_id IS NOT NULL OR recipe_name IS NOT NULL)
            GROUP BY name, id ORDER BY c DESC LIMIT ?
            """,
            (since, limit),
        ).fetchall()
    return [dict(r) for r in rows]


def event_breakdown(days: int = 7) -> list[dict]:
    _, since = since_ms(days)
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT type, COUNT(*) AS c FROM events
            WHERE ts >= ? GROUP BY type ORDER BY c DESC
            """,
            (since,),
        ).fetchall()
    return [dict(r) for r in rows]


def lang_breakdown(days: int = 7) -> list[dict]:
    _, since = since_ms(days)
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT COALESCE(lang, 'unknown') AS lang, COUNT(*) AS c
            FROM events WHERE type = 'visit' AND ts >= ?
            GROUP BY lang ORDER BY c DESC
            """,
            (since,),
        ).fetchall()
    return [dict(r) for r in rows]


def recent_events(limit: int = 100) -> list[dict]:
    n = min(max(int(limit or 100), 1), 500)
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT id, ts, type, view, path, recipe_id, recipe_name, lang, session_id,
                   meta_json, ip, username, device, device_type, os_name, browser
            FROM events ORDER BY id DESC LIMIT ?
            """,
            (n,),
        ).fetchall()
    return [dict(r) for r in rows]


def device_breakdown(days: int = 7) -> list[dict]:
    _, since = since_ms(days)
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT COALESCE(NULLIF(device, ''), '(unknown)') AS name, COUNT(*) AS c
            FROM events
            WHERE type = 'visit' AND ts >= ?
            GROUP BY name ORDER BY c DESC LIMIT 20
            """,
            (since,),
        ).fetchall()
    return [dict(r) for r in rows]


def insert_event(row: dict) -> None:
    with connect() as conn:
        conn.execute(
            """
            INSERT INTO events (
              ts, received_at, site_id, session_id, type, path, view,
              recipe_id, recipe_name, lang, meta_json, ua_hash, ip_hash, referrer,
              ip, username, device, device_type, os_name, browser, user_agent
            ) VALUES (
              :ts, :received_at, :site_id, :session_id, :type, :path, :view,
              :recipe_id, :recipe_name, :lang, :meta_json, :ua_hash, :ip_hash, :referrer,
              :ip, :username, :device, :device_type, :os_name, :browser, :user_agent
            )
            """,
            row,
        )


def login_page(error: bool = False) -> str:
    err = '<div class="err">Wrong password.</div>' if error else ""
    return f"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Ember analytics — login</title>
<style>
:root{{color-scheme:dark;--bg:#120e0c;--card:#1c1612;--text:#f3e8df;--muted:#a89888;--accent:#e07a45;--err:#e85d5d}}
*{{box-sizing:border-box}}body{{margin:0;min-height:100vh;display:grid;place-items:center;font:15px/1.5 system-ui,sans-serif;
background:radial-gradient(ellipse at 30% 20%,#2a1a12,var(--bg));color:var(--text)}}
form{{width:min(360px,92vw);padding:2rem;background:var(--card);border:1px solid #3a2c24;border-radius:16px}}
h1{{margin:0 0 .35rem;font-size:1.35rem;font-weight:650}}p{{margin:0 0 1.25rem;color:var(--muted);font-size:.9rem}}
label{{display:block;margin-bottom:.4rem;color:var(--muted);font-size:.8rem}}
input{{width:100%;padding:.75rem .9rem;border-radius:10px;border:1px solid #4a3a30;background:#100c0a;color:var(--text);margin-bottom:1rem}}
button{{width:100%;padding:.8rem;border:0;border-radius:10px;background:var(--accent);color:#1a0f0a;font-weight:650;cursor:pointer}}
.err{{color:var(--err);margin-bottom:.75rem;font-size:.85rem}}
</style></head><body>
<form method="post" action="/portal/login">
<h1>Ember analytics</h1>
<p>View-only portal for visit history and usage.</p>
<p style="font-size:.82rem;color:var(--muted);line-height:1.45;margin-bottom:1rem">Family site: <strong style="color:var(--text)">https://lostecho37.github.io/cook-guide/</strong><br/>Analytics portal runs on this HTTPS server when deployed.</p>
{err}
<label for="password">Password</label>
<input id="password" name="password" type="password" autocomplete="current-password" required autofocus/>
<button type="submit">Enter</button>
</form></body></html>"""


def portal_page() -> str:
    return r"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Ember analytics portal</title>
<style>
:root{color-scheme:dark;--bg:#100c0a;--panel:#1a1410;--line:#3a2c24;--text:#f4ebe3;--muted:#a89888;--accent:#e07a45;--accent2:#c4a574}
*{box-sizing:border-box}body{margin:0;font:14px/1.45 system-ui,sans-serif;background:var(--bg);color:var(--text)}
header{display:flex;flex-wrap:wrap;gap:1rem;align-items:center;justify-content:space-between;padding:1rem 1.25rem;border-bottom:1px solid var(--line);background:#160f0c;position:sticky;top:0;z-index:2}
h1{margin:0;font-size:1.15rem;font-weight:650}.muted{color:var(--muted)}
.controls{display:flex;gap:.6rem;align-items:center;flex-wrap:wrap}
select,button{border-radius:8px;border:1px solid var(--line);background:#221914;color:var(--text);padding:.45rem .7rem;cursor:pointer}
button.primary{background:var(--accent);border-color:transparent;color:#1a0f0a;font-weight:650}
main{padding:1.25rem;max-width:1200px;margin:0 auto}
.grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-bottom:1.25rem}
.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:1rem 1.1rem}
.card .label{color:var(--muted);font-size:.75rem;text-transform:uppercase;letter-spacing:.06em}
.card .value{font-size:1.7rem;font-weight:700;margin-top:.25rem}
.panels{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
h2{margin:0 0 .75rem;font-size:.95rem;font-weight:650;color:var(--accent2)}
table{width:100%;border-collapse:collapse;font-size:.85rem}
th,td{text-align:left;padding:.45rem .35rem;border-bottom:1px solid #2a211c;vertical-align:top}
th{color:var(--muted);font-weight:500;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em}
.bar{height:6px;border-radius:99px;background:#2a211c;overflow:hidden;margin-top:.35rem}
.bar>span{display:block;height:100%;background:linear-gradient(90deg,var(--accent),#f0b27a)}
.chart{display:flex;align-items:flex-end;gap:6px;height:120px;margin-top:.5rem}
.chart .col{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px;min-width:0;height:100%}
.chart .col i{display:block;width:100%;border-radius:4px 4px 0 0;background:var(--accent);min-height:2px}
.chart .col em{font-style:normal;font-size:.65rem;color:var(--muted);max-width:100%;overflow:hidden;text-overflow:ellipsis}
.mono{font-family:ui-monospace,Menlo,monospace;font-size:.78rem}
.tag{display:inline-block;padding:.1rem .4rem;border-radius:6px;background:#2a211c;color:var(--accent2);font-size:.72rem}
footer{padding:1rem 1.25rem 2rem;color:var(--muted);font-size:.8rem;text-align:center}
</style></head><body>
<header>
  <div><h1>Ember · usage portal</h1><div class="muted" id="subtitle">View only · loading…</div><div class="muted" id="live" style="margin-top:.25rem;font-size:.78rem"></div></div>
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
    <div class="card"><h2>Devices</h2><div id="devices"></div></div>
    <div class="card" style="grid-column:1/-1"><h2>Recent activity</h2><div id="recent"></div></div>
  </section>
</main>
<footer>IP, device, and username (when signed in) are stored for your private portal. Keep the portal password private.</footer>
<script>
const $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat().format(n||0);
const when=ts=>new Date(ts).toLocaleString();
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function bars(rows,labelKey,valueKey){
  const max=Math.max(1,...rows.map(r=>r[valueKey]));
  return rows.map(r=>{
    const pct=Math.round((r[valueKey]/max)*100);
    return `<div style="margin-bottom:.65rem"><div style="display:flex;justify-content:space-between;gap:.5rem"><span>${escapeHtml(String(r[labelKey]))}</span><span class="muted">${fmt(r[valueKey])}</span></div><div class="bar"><span style="width:${pct}%"></span></div></div>`;
  }).join('')||'<p class="muted">No data yet.</p>';
}
async function load(){
  const days=$('days').value;
  const res=await fetch('/portal/api/stats?days='+days,{credentials:'same-origin'});
  if(res.status===401){location.href='/portal/login';return;}
  const data=await res.json();
  const o=data.overview;
  $('subtitle').textContent=`Last ${o.days} day(s) · view only · ${fmt(o.totalEvents||0)} total in DB`;
  if(o.lastEventTs){
    const ago=Math.max(0,Math.round((Date.now()-o.lastEventTs)/1000));
    $('live').textContent=`Last event ${ago<5?'just now':ago+'s ago'} · auto-refresh 3s`;
  } else {
    $('live').textContent='No events yet — open Ember at http://127.0.0.1:8787/ or deploy analytics for GitHub Pages';
  }
  $('kpis').innerHTML=[['Visits',o.visits],['Sessions',o.sessions],['Events',o.events],['Cooks started',o.cooksStarted],['Cooks finished',o.cooksFinished],['Ratings',o.ratings]]
    .map(([label,value])=>`<div class="card"><div class="label">${label}</div><div class="value">${fmt(value)}</div></div>`).join('');
  const daily=data.daily||[];
  const maxV=Math.max(1,...daily.map(d=>d.visits));
  $('daily').innerHTML=daily.length?daily.map(d=>{
    const h=Math.max(2,Math.round((d.visits/maxV)*100));
    return `<div class="col" title="${d.day}: ${d.visits} visits / ${d.sessions} sessions"><i style="height:${h}%"></i><em>${String(d.day).slice(5)}</em></div>`;
  }).join(''):'<p class="muted">No visits in this range.</p>';
  $('types').innerHTML=bars(data.types||[],'type','c');
  $('views').innerHTML=bars(data.views||[],'name','c');
  $('recipes').innerHTML=bars(data.recipes||[],'name','c');
  $('langs').innerHTML=bars(data.langs||[],'lang','c');
  $('devices').innerHTML=bars(data.devices||[],'name','c');
  const recent=data.recent||[];
  $('recent').innerHTML=recent.length?`<table><thead><tr><th>When</th><th>Type</th><th>User</th><th>IP</th><th>Device</th><th>View / recipe</th><th>Lang</th></tr></thead><tbody>${
    recent.map(e=>`<tr>
      <td class="mono">${when(e.ts)}</td>
      <td><span class="tag">${escapeHtml(e.type)}</span></td>
      <td>${escapeHtml(e.username||'guest')}</td>
      <td class="mono">${escapeHtml(e.ip||'—')}</td>
      <td>${escapeHtml(e.device||[e.device_type,e.os_name,e.browser].filter(Boolean).join(' · ')||'—')}</td>
      <td>${escapeHtml(e.recipe_name||e.view||e.path||'—')}</td>
      <td>${escapeHtml(e.lang||'—')}</td>
    </tr>`).join('')
  }</tbody></table>`:'<p class="muted">Waiting for the first events from the site.</p>';
}
$('refresh').addEventListener('click',load);
$('days').addEventListener('change',load);
load();
// Live refresh while the portal tab is open
setInterval(()=>{ if(!document.hidden) load(); },3000);
document.addEventListener('visibilitychange',()=>{ if(!document.hidden) load(); });
</script>
</body></html>"""


class Handler(BaseHTTPRequestHandler):
    server_version = "EmberAnalytics/1.0"

    def log_message(self, fmt: str, *args) -> None:
        print(f"[{self.log_date_time_string()}] {fmt % args}")

    def _cors(self) -> None:
        origin = self.headers.get("Origin", "")
        if not origin or "*" in CORS_ORIGIN or origin in CORS_ORIGIN:
            self.send_header("Access-Control-Allow-Origin", origin or "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Vary", "Origin")

    def _send(
        self,
        code: int,
        body: bytes | str,
        content_type: str = "text/plain; charset=utf-8",
        extra: dict | None = None,
    ) -> None:
        if isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self._cors()
        if extra:
            for key, val in extra.items():
                self.send_header(key, val)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def _json(self, code: int, payload: dict | list) -> None:
        self._send(code, json.dumps(payload), "application/json; charset=utf-8")

    def _html(self, code: int, html: str, extra: dict | None = None) -> None:
        self._send(code, html, "text/html; charset=utf-8", extra)

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > 32_000:
            return {}
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw.decode("utf-8"))
            return data if isinstance(data, dict) else {}
        except Exception:
            return {}

    def _read_form(self) -> dict:
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length > 0 else b""
        return {k: v[0] for k, v in parse_qs(raw.decode("utf-8", errors="ignore")).items()}

    def _cookie_token(self) -> str | None:
        cookie = SimpleCookie()
        cookie.load(self.headers.get("Cookie", ""))
        morsel = cookie.get(COOKIE_NAME)
        return morsel.value if morsel else None

    def _authed(self) -> bool:
        return verify_token(self._cookie_token()) is not None

    def _client_ip(self) -> str:
        forwarded = self.headers.get("X-Forwarded-For", "")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return self.client_address[0]

    def _safe_static(self, url_path: str) -> Path | None:
        """Resolve a URL path under SITE_ROOT; reject traversal."""
        rel = url_path.lstrip("/")
        if not rel or ".." in rel.split("/"):
            return None
        candidate = (SITE_ROOT / rel).resolve()
        try:
            candidate.relative_to(SITE_ROOT.resolve())
        except ValueError:
            return None
        if candidate.is_file():
            return candidate
        return None

    def _serve_static(self, url_path: str) -> bool:
        path = self._safe_static(url_path)
        if path is None and (url_path == "/" or url_path == ""):
            path = SITE_ROOT / "index.html"
            if not path.is_file():
                return False
        if path is None:
            return False
        ctype = STATIC_TYPES.get(path.suffix.lower(), "application/octet-stream")
        try:
            data = path.read_bytes()
        except OSError:
            return False
        self._send(200, data, ctype)
        return True

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        qs = parse_qs(parsed.query)

        if path == "/health":
            self._json(200, {"ok": True, "site": SITE_ID, "db": DB_PATH.name})
            return

        if path == "/api/v1/status":
            with connect() as conn:
                total = conn.execute("SELECT COUNT(*) FROM events").fetchone()[0]
                last_ts = conn.execute("SELECT MAX(ts) FROM events").fetchone()[0]
            self._json(200, {"ok": True, "events": total, "lastEventTs": last_ts})
            return

        if path == "/portal/login":
            if self._authed():
                self.send_response(302)
                self.send_header("Location", "/portal")
                self.end_headers()
                return
            self._html(200, login_page(error=qs.get("error", [""])[0] == "1"))
            return

        if path == "/portal/api/stats":
            if not self._authed():
                self._json(401, {"error": "unauthorized"})
                return
            days = int(qs.get("days", ["7"])[0] or 7)
            self._json(
                200,
                {
                    "overview": overview(days),
                    "daily": daily_visits(days),
                    "views": top_views(days),
                    "recipes": top_recipes(days),
                    "types": event_breakdown(days),
                    "langs": lang_breakdown(days),
                    "devices": device_breakdown(days),
                    "recent": recent_events(80),
                },
            )
            return

        if path == "/portal":
            if not self._authed():
                self.send_response(302)
                self.send_header("Location", "/portal/login")
                self.end_headers()
                return
            self._html(200, portal_page())
            return

        # Serve the Ember app from the repo root (same origin as analytics)
        static_path = parsed.path.split("?", 1)[0]
        if self._serve_static(static_path):
            return

        self._json(404, {"error": "not_found"})

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"

        if path == "/api/v1/collect":
            body = self._read_json()
            event_type = str(body.get("type") or "")[:40]
            if event_type not in ALLOWED_TYPES:
                self._json(400, {"error": "invalid_type"})
                return
            session_id = str(body.get("sessionId") or "")[:64]
            if not SESSION_RE.match(session_id):
                self._json(400, {"error": "invalid_session"})
                return
            now = int(time.time() * 1000)
            ts = int(body.get("ts") or now)
            ts = min(max(ts, now - 7 * 86400000), now + 60000)
            meta = body.get("meta") if isinstance(body.get("meta"), dict) else {}
            ua = self.headers.get("User-Agent", "")
            client_device = body.get("device") if isinstance(body.get("device"), dict) else {}
            parsed = parse_device(ua, client_device)
            ip = self._client_ip()
            username = str(body.get("username") or body.get("userName") or "").strip()[:64] or None
            try:
                insert_event(
                    {
                        "ts": ts,
                        "received_at": now,
                        "site_id": SITE_ID,
                        "session_id": session_id,
                        "type": event_type,
                        "path": str(body.get("path") or "")[:200] or None,
                        "view": str(body.get("view") or "")[:80] or None,
                        "recipe_id": str(body.get("recipeId") or "")[:80] or None,
                        "recipe_name": str(body.get("recipeName") or "")[:120] or None,
                        "lang": str(body.get("lang") or "")[:16] or None,
                        "meta_json": json.dumps(meta, ensure_ascii=False)[:1000],
                        "ua_hash": hash_ua(ua),
                        "ip_hash": daily_ip_hash(ip),
                        "referrer": str(body.get("referrer") or self.headers.get("Referer") or "")[:300]
                        or None,
                        "ip": ip[:64] if ip else None,
                        "username": username,
                        "device": parsed["device"],
                        "device_type": parsed["device_type"],
                        "os_name": parsed["os_name"],
                        "browser": parsed["browser"],
                        "user_agent": parsed["user_agent"],
                    }
                )
            except Exception as exc:  # noqa: BLE001
                print("collect failed", exc)
                self._json(500, {"error": "store_failed"})
                return
            self.send_response(204)
            self._cors()
            self.end_headers()
            return

        if path == "/portal/login":
            form = self._read_form()
            password = form.get("password", "")
            if not hmac.compare_digest(password, ADMIN_PASSWORD):
                self.send_response(302)
                self.send_header("Location", "/portal/login?error=1")
                self.end_headers()
                return
            token = sign_token({"exp": time.time() + TOKEN_TTL, "role": "viewer"})
            self.send_response(302)
            self.send_header("Location", "/portal")
            self.send_header(
                "Set-Cookie",
                f"{COOKIE_NAME}={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age={TOKEN_TTL}",
            )
            self.end_headers()
            return

        if path == "/portal/logout":
            self.send_response(302)
            self.send_header("Location", "/portal/login")
            self.send_header(
                "Set-Cookie",
                f"{COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
            )
            self.end_headers()
            return

        self._json(404, {"error": "not_found"})


def main() -> None:
    init_db()
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Ember 余温 (local)     → http://127.0.0.1:{PORT}/")
    print(f"Ember 余温 (public)    → {PUBLIC_SITE_URL}")
    print(f"Analytics portal       → http://127.0.0.1:{PORT}/portal")
    print(f"Collect endpoint     → POST http://localhost:{PORT}/api/v1/collect")
    if ADMIN_PASSWORD in {"change-me-now", "change-me"}:
        print("WARNING: set ADMIN_PASSWORD in server/.env before exposing publicly")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
