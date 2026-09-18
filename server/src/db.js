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
    ip TEXT,
    username TEXT,
    referrer TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);
  CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
  CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
  CREATE INDEX IF NOT EXISTS idx_events_username ON events(username);

  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS user_records (
    user_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
  );
`);

function ensureColumn(table, column, type) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!cols.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}

ensureColumn('events', 'ip', 'TEXT');
ensureColumn('events', 'username', 'TEXT');
db.exec('CREATE INDEX IF NOT EXISTS idx_events_username ON events(username)');

const insertStmt = db.prepare(`
  INSERT INTO events (
    ts, received_at, site_id, session_id, type, path, view,
    recipe_id, recipe_name, lang, meta_json, ua_hash, ip_hash, ip, username, referrer
  ) VALUES (
    @ts, @received_at, @site_id, @session_id, @type, @path, @view,
    @recipe_id, @recipe_name, @lang, @meta_json, @ua_hash, @ip_hash, @ip, @username, @referrer
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
    SELECT id, ts, type, view, path, recipe_id, recipe_name, lang,
           session_id, meta_json, ip, username
    FROM events ORDER BY id DESC LIMIT ?
  `).all(n);
}

export function getDbPath() {
  return dbPath;
}

const insertAccountStmt = db.prepare(`
  INSERT INTO accounts (id, username, password_hash) VALUES (@id, @username, @password_hash)
`);

export function createAccount(id, username, passwordHash) {
  return insertAccountStmt.run({ id, username, password_hash: passwordHash });
}

export function findAccountByUsername(username) {
  return db.prepare('SELECT * FROM accounts WHERE username = ? COLLATE NOCASE').get(username);
}

export function findAccountById(id) {
  return db.prepare('SELECT * FROM accounts WHERE id = ?').get(id);
}

export function getUserData(userId) {
  const row = db.prepare('SELECT data, updated_at FROM user_records WHERE user_id = ?').get(userId);
  if (!row) return null;
  try {
    return { data: JSON.parse(row.data), updated_at: row.updated_at };
  } catch {
    return { data: {}, updated_at: row.updated_at };
  }
}

const upsertUserDataStmt = db.prepare(`
  INSERT INTO user_records (user_id, data, updated_at)
  VALUES (@user_id, @data, @updated_at)
  ON CONFLICT(user_id) DO UPDATE SET
    data = excluded.data,
    updated_at = excluded.updated_at
`);

export function setUserData(userId, data) {
  return upsertUserDataStmt.run({
    user_id: userId,
    data: JSON.stringify(data),
    updated_at: Date.now(),
  });
}
