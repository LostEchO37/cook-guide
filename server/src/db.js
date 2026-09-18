import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.VERCEL
  ? '/tmp/ember-analytics'
  : path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.DB_PATH || path.join(dataDir, 'analytics.sqlite');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
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
    referrer TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);
  CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
  CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
`);

const insertStmt = db.prepare(`
  INSERT INTO events (
    ts, received_at, site_id, session_id, type, path, view,
    recipe_id, recipe_name, lang, meta_json, ua_hash, ip_hash, referrer
  ) VALUES (
    @ts, @received_at, @site_id, @session_id, @type, @path, @view,
    @recipe_id, @recipe_name, @lang, @meta_json, @ua_hash, @ip_hash, @referrer
  )
`);

export function insertEvent(row) {
  return insertStmt.run(row);
}

function sinceMs(days) {
  const d = Math.min(Math.max(Number(days) || 7, 1), 365);
  return { days: d, since: Date.now() - d * 24 * 60 * 60 * 1000 };
}

export function overview(days = 7) {
  const { since, days: d } = sinceMs(days);
  const count = (type) => db.prepare(
    'SELECT COUNT(*) AS c FROM events WHERE type = ? AND ts >= ?',
  ).get(type, since).c;

  return {
    days: d,
    visits: count('visit'),
    sessions: db.prepare('SELECT COUNT(DISTINCT session_id) AS c FROM events WHERE ts >= ?').get(since).c,
    events: db.prepare('SELECT COUNT(*) AS c FROM events WHERE ts >= ?').get(since).c,
    cooksStarted: count('cook_start'),
    cooksFinished: count('cook_complete'),
    ratings: count('rate'),
  };
}

export function dailyVisits(days = 7) {
  const { since } = sinceMs(days);
  return db.prepare(`
    SELECT date(ts / 1000, 'unixepoch', 'localtime') AS day,
           COUNT(*) AS visits,
           COUNT(DISTINCT session_id) AS sessions
    FROM events
    WHERE type = 'visit' AND ts >= ?
    GROUP BY day
    ORDER BY day ASC
  `).all(since);
}

export function topViews(days = 7, limit = 20) {
  const { since } = sinceMs(days);
  return db.prepare(`
    SELECT COALESCE(NULLIF(view, ''), NULLIF(path, ''), '(unknown)') AS name, COUNT(*) AS c
    FROM events
    WHERE type IN ('view', 'visit') AND ts >= ?
    GROUP BY name
    ORDER BY c DESC
    LIMIT ?
  `).all(since, limit);
}

export function topRecipes(days = 7, limit = 20) {
  const { since } = sinceMs(days);
  return db.prepare(`
    SELECT COALESCE(NULLIF(recipe_name, ''), NULLIF(recipe_id, ''), '(unknown)') AS name,
           recipe_id AS id,
           COUNT(*) AS c
    FROM events
    WHERE type IN ('recipe_open', 'cook_start', 'cook_complete')
      AND ts >= ?
      AND (recipe_id IS NOT NULL OR recipe_name IS NOT NULL)
    GROUP BY name, id
    ORDER BY c DESC
    LIMIT ?
  `).all(since, limit);
}

export function eventBreakdown(days = 7) {
  const { since } = sinceMs(days);
  return db.prepare(`
    SELECT type, COUNT(*) AS c
    FROM events WHERE ts >= ?
    GROUP BY type ORDER BY c DESC
  `).all(since);
}

export function langBreakdown(days = 7) {
  const { since } = sinceMs(days);
  return db.prepare(`
    SELECT COALESCE(lang, 'unknown') AS lang, COUNT(*) AS c
    FROM events WHERE type = 'visit' AND ts >= ?
    GROUP BY lang ORDER BY c DESC
  `).all(since);
}

export function recentEvents(limit = 100) {
  const n = Math.min(Math.max(Number(limit) || 100, 1), 500);
  return db.prepare(`
    SELECT id, ts, type, view, path, recipe_id, recipe_name, lang, session_id, meta_json
    FROM events ORDER BY id DESC LIMIT ?
  `).all(n);
}

export function getDbPath() {
  return dbPath;
}
