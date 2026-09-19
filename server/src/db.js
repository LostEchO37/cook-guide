import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getPersistMode,
  restoreDbFromBlob,
  scheduleDbPersist,
  awaitPendingPersist,
} from './blob-persist.js';
import { loadCommunityMirror, syncCommunityMirror } from './community-mirror.js';

async function awaitPendingPersistWithMirror() {
  await awaitPendingPersist();
  if (mirrorPending) {
    try { await mirrorPending; } catch { /* logged */ }
  }
}
export { awaitPendingPersistWithMirror as awaitPendingPersist };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.VERCEL
  ? '/tmp/ember-analytics'
  : path.join(__dirname, '..', 'data');
const dbPath = process.env.DB_PATH || path.join(dataDir, 'analytics.sqlite');

let db = null;
let initPromise = null;
let insertStmt = null;
let insertAccountStmt = null;
let upsertUserDataStmt = null;

function checkpointDb() {
  if (!db) return;
  try {
    db.pragma('wal_checkpoint(TRUNCATE)');
  } catch {
    /* ignore */
  }
}

function touchPersist() {
  scheduleDbPersist(dbPath, { checkpoint: checkpointDb });
}

let mirrorPending = null;

function touchMirror() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  mirrorPending = syncCommunityMirror(snapshotCommunityMirror())
    .catch((e) => console.error('mirror sync failed:', e.message || e));
}

function snapshotCommunityMirror() {
  const database = getDb();
  const posts = {};
  for (const row of database.prepare('SELECT * FROM community_posts').all()) {
    posts[row.id] = {
      id: row.id,
      userId: row.user_id,
      username: row.username,
      recipeId: row.recipe_id,
      recipeName: row.recipe_name,
      caption: row.caption || '',
      photoUrl: row.photo_url,
      likeCount: row.like_count || 0,
      createdAt: row.created_at,
      updatedAt: row.created_at,
    };
  }
  const likes = {};
  for (const row of database.prepare('SELECT * FROM community_likes').all()) {
    const id = `${row.post_id}::${row.user_id}`;
    likes[id] = {
      id,
      postId: row.post_id,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.created_at,
    };
  }
  const cooks = {};
  for (const row of database.prepare(`
    SELECT id, ts, recipe_id, recipe_name, username, session_id
    FROM events WHERE type = 'cook_complete'
      AND (recipe_id IS NOT NULL OR recipe_name IS NOT NULL)
  `).all()) {
    const id = `cook_${row.id}`;
    cooks[id] = {
      id,
      ts: row.ts,
      recipeId: row.recipe_id || '',
      recipeName: row.recipe_name || '',
      username: row.username || '',
      sessionId: row.session_id || '',
      updatedAt: row.ts,
    };
  }
  const recipes = {};
  try {
    for (const row of database.prepare('SELECT * FROM user_recipes').all()) {
      recipes[row.id] = {
        id: row.id,
        userId: row.user_id,
        username: row.username,
        title: row.title,
        description: row.description || '',
        ingredients: JSON.parse(row.ingredients_json || '[]'),
        steps: JSON.parse(row.steps_json || '[]'),
        tags: JSON.parse(row.tags_json || '[]'),
        photoUrl: row.photo_url || '',
        published: !!row.published,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }
  } catch {
    /* ignore */
  }
  return { posts, likes, cooks, recipes };
}

function hydrateFromMirror(mirror) {
  if (!mirror) return;
  const database = getDb();
  const insertPost = database.prepare(`
    INSERT OR IGNORE INTO community_posts
      (id, user_id, username, recipe_id, recipe_name, caption, photo_url, like_count, created_at)
    VALUES (@id, @user_id, @username, @recipe_id, @recipe_name, @caption, @photo_url, @like_count, @created_at)
  `);
  const insertLike = database.prepare(`
    INSERT OR IGNORE INTO community_likes (post_id, user_id, created_at)
    VALUES (@post_id, @user_id, @created_at)
  `);
  const hasCook = database.prepare(`
    SELECT 1 AS ok FROM events
    WHERE type = 'cook_complete' AND ts = ? AND COALESCE(recipe_id,'') = ? AND COALESCE(session_id,'') = ?
    LIMIT 1
  `);
  const insertCook = database.prepare(`
    INSERT INTO events (
      ts, received_at, site_id, session_id, type, path, view,
      recipe_id, recipe_name, lang, meta_json, ua_hash, ip_hash, ip, username, referrer
    ) VALUES (
      @ts, @received_at, 'ember', @session_id, 'cook_complete', null, null,
      @recipe_id, @recipe_name, null, null, null, null, null, @username, null
    )
  `);
  const insertRecipe = database.prepare(`
    INSERT OR IGNORE INTO user_recipes (
      id, user_id, username, title, description, ingredients_json, steps_json, tags_json,
      photo_url, published, created_at, updated_at
    ) VALUES (
      @id, @user_id, @username, @title, @description, @ingredients_json, @steps_json, @tags_json,
      @photo_url, @published, @created_at, @updated_at
    )
  `);

  const tx = database.transaction(() => {
    for (const p of Object.values(mirror.posts || {})) {
      if (!p?.id || !p?.userId) continue;
      insertPost.run({
        id: p.id,
        user_id: p.userId,
        username: p.username || 'user',
        recipe_id: p.recipeId || '',
        recipe_name: p.recipeName || '',
        caption: p.caption || null,
        photo_url: p.photoUrl || '',
        like_count: p.likeCount || 0,
        created_at: p.createdAt || Date.now(),
      });
    }
    for (const l of Object.values(mirror.likes || {})) {
      if (!l?.postId || !l?.userId) continue;
      insertLike.run({
        post_id: l.postId,
        user_id: l.userId,
        created_at: l.createdAt || Date.now(),
      });
    }
    for (const c of Object.values(mirror.cooks || {})) {
      const rid = c.recipeId || '';
      const sid = c.sessionId || `mirror_${c.id}`;
      if (hasCook.get(c.ts || 0, rid, sid)) continue;
      insertCook.run({
        ts: c.ts || Date.now(),
        received_at: Date.now(),
        session_id: sid,
        recipe_id: rid || null,
        recipe_name: c.recipeName || null,
        username: c.username || null,
      });
    }
    for (const r of Object.values(mirror.recipes || {})) {
      if (!r?.id || !r?.userId) continue;
      insertRecipe.run({
        id: r.id,
        user_id: r.userId,
        username: r.username || 'user',
        title: r.title || 'Untitled',
        description: r.description || null,
        ingredients_json: JSON.stringify(r.ingredients || []),
        steps_json: JSON.stringify(r.steps || []),
        tags_json: JSON.stringify(r.tags || []),
        photo_url: r.photoUrl || null,
        published: r.published === false ? 0 : 1,
        created_at: r.createdAt || Date.now(),
        updated_at: r.updatedAt || Date.now(),
      });
    }
  });
  tx();
}


function runMigrations(database) {
  database.exec(`
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

    CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      recipe_id TEXT NOT NULL,
      recipe_name TEXT NOT NULL,
      caption TEXT,
      photo_url TEXT NOT NULL,
      like_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at);
    CREATE INDEX IF NOT EXISTS idx_community_posts_recipe ON community_posts(recipe_id);

    CREATE TABLE IF NOT EXISTS community_likes (
      post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (post_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS idx_community_likes_user ON community_likes(user_id);

    CREATE TABLE IF NOT EXISTS user_records (
      user_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
    );

    CREATE TABLE IF NOT EXISTS user_recipes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      ingredients_json TEXT NOT NULL,
      steps_json TEXT NOT NULL,
      tags_json TEXT NOT NULL DEFAULT '[]',
      photo_url TEXT,
      published INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_user_recipes_user ON user_recipes(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_recipes_published ON user_recipes(published, created_at);
  `);

  const ensureColumn = (table, column, type) => {
    const cols = database.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
    if (!cols.includes(column)) {
      database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    }
  };

  ensureColumn('events', 'ip', 'TEXT');
  ensureColumn('events', 'username', 'TEXT');
  database.exec('CREATE INDEX IF NOT EXISTS idx_events_username ON events(username)');
}

function prepareStatements() {
  insertStmt = db.prepare(`
    INSERT INTO events (
      ts, received_at, site_id, session_id, type, path, view,
      recipe_id, recipe_name, lang, meta_json, ua_hash, ip_hash, ip, username, referrer
    ) VALUES (
      @ts, @received_at, @site_id, @session_id, @type, @path, @view,
      @recipe_id, @recipe_name, @lang, @meta_json, @ua_hash, @ip_hash, @ip, @username, @referrer
    )
  `);

  insertAccountStmt = db.prepare(`
    INSERT INTO accounts (id, username, password_hash) VALUES (@id, @username, @password_hash)
  `);

  upsertUserDataStmt = db.prepare(`
    INSERT INTO user_records (user_id, data, updated_at)
    VALUES (@user_id, @data, @updated_at)
    ON CONFLICT(user_id) DO UPDATE SET
      data = excluded.data,
      updated_at = excluded.updated_at
  `);
}

export async function ensureDb() {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    fs.mkdirSync(dataDir, { recursive: true });

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      await restoreDbFromBlob(dbPath);
    }

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    runMigrations(db);
    prepareStatements();
    try {
      const mirror = await loadCommunityMirror();
      hydrateFromMirror(mirror);
    } catch (e) {
      console.warn('mirror hydrate failed:', e.message || e);
    }
    return db;
  })();

  return initPromise;
}

function getDb() {
  if (!db) throw new Error('Database not ready — await ensureDb() first');
  return db;
}

export function insertEvent(row) {
  const result = insertStmt.run(row);
  touchPersist();
  if (row?.type === 'cook_complete') touchMirror();
  return result;
}

function sinceMs(days) {
  const d = Math.min(Math.max(Number(days) || 7, 1), 365);
  return { days: d, since: Date.now() - d * 24 * 60 * 60 * 1000 };
}

export function overview(days = 7) {
  const database = getDb();
  const { since, days: d } = sinceMs(days);
  const count = (type) => database.prepare(
    'SELECT COUNT(*) AS c FROM events WHERE type = ? AND ts >= ?',
  ).get(type, since).c;

  return {
    days: d,
    visits: count('visit'),
    sessions: database.prepare('SELECT COUNT(DISTINCT session_id) AS c FROM events WHERE ts >= ?').get(since).c,
    events: database.prepare('SELECT COUNT(*) AS c FROM events WHERE ts >= ?').get(since).c,
    cooksStarted: count('cook_start'),
    cooksFinished: count('cook_complete'),
    ratings: count('rate'),
    registeredUsers: database.prepare('SELECT COUNT(*) AS c FROM accounts').get().c,
  };
}

export function dailyVisits(days = 7) {
  const { since } = sinceMs(days);
  return getDb().prepare(`
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
  return getDb().prepare(`
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
  return getDb().prepare(`
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
  return getDb().prepare(`
    SELECT type, COUNT(*) AS c
    FROM events WHERE ts >= ?
    GROUP BY type ORDER BY c DESC
  `).all(since);
}

export function langBreakdown(days = 7) {
  const { since } = sinceMs(days);
  return getDb().prepare(`
    SELECT COALESCE(lang, 'unknown') AS lang, COUNT(*) AS c
    FROM events WHERE type = 'visit' AND ts >= ?
    GROUP BY lang ORDER BY c DESC
  `).all(since);
}

export function recentEvents(limit = 100) {
  const n = Math.min(Math.max(Number(limit) || 100, 1), 500);
  return getDb().prepare(`
    SELECT id, ts, type, view, path, recipe_id, recipe_name, lang,
           session_id, meta_json, ip, username
    FROM events ORDER BY id DESC LIMIT ?
  `).all(n);
}

export function listAccounts() {
  return getDb().prepare(`
    SELECT a.id, a.username, a.created_at, r.updated_at, r.data
    FROM accounts a
    LEFT JOIN user_records r ON r.user_id = a.id
    ORDER BY a.created_at DESC
  `).all().map((row) => {
    let cooks = 0;
    try {
      cooks = JSON.parse(row.data || '{}').cookHistory?.length || 0;
    } catch {
      cooks = 0;
    }
    return {
      id: row.id,
      username: row.username,
      createdAt: row.created_at,
      updatedAt: row.updated_at || null,
      cooks,
    };
  });
}

export function getDbPath() {
  return dbPath;
}

export function getStorageInfo() {
  return {
    path: path.basename(dbPath),
    mode: getPersistMode(),
  };
}

export function createAccount(id, username, passwordHash) {
  const result = insertAccountStmt.run({ id, username, password_hash: passwordHash });
  touchPersist();
  return result;
}

export function findAccountByUsername(username) {
  return getDb().prepare('SELECT * FROM accounts WHERE username = ? COLLATE NOCASE').get(username);
}

export function findAccountById(id) {
  return getDb().prepare('SELECT * FROM accounts WHERE id = ?').get(id);
}

export function getUserData(userId) {
  const row = getDb().prepare('SELECT data, updated_at FROM user_records WHERE user_id = ?').get(userId);
  if (!row) return null;
  try {
    return { data: JSON.parse(row.data), updated_at: row.updated_at };
  } catch {
    return { data: {}, updated_at: row.updated_at };
  }
}

export function setUserData(userId, data) {
  const result = upsertUserDataStmt.run({
    user_id: userId,
    data: JSON.stringify(data),
    updated_at: Date.now(),
  });
  touchPersist();
  return result;
}

export function createCommunityPost({ id, userId, username, recipeId, recipeName, caption, photoUrl }) {
  const result = getDb().prepare(`
    INSERT INTO community_posts (id, user_id, username, recipe_id, recipe_name, caption, photo_url, like_count, created_at)
    VALUES (@id, @user_id, @username, @recipe_id, @recipe_name, @caption, @photo_url, 0, @created_at)
  `).run({
    id,
    user_id: userId,
    username,
    recipe_id: recipeId,
    recipe_name: recipeName,
    caption: caption || null,
    photo_url: photoUrl,
    created_at: Date.now(),
  });
  touchPersist();
  touchMirror();
  return result;
}

export function listCommunityPosts({ limit = 30, viewerId = null } = {}) {
  const n = Math.min(Math.max(Number(limit) || 30, 1), 100);
  const rows = getDb().prepare(`
    SELECT p.id, p.user_id, p.username, p.recipe_id, p.recipe_name, p.caption,
           p.photo_url, p.like_count, p.created_at,
           CASE WHEN l.user_id IS NULL THEN 0 ELSE 1 END AS liked_by_me
    FROM community_posts p
    LEFT JOIN community_likes l
      ON l.post_id = p.id AND l.user_id = ?
    ORDER BY p.created_at DESC
    LIMIT ?
  `).all(viewerId || '', n);
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    username: r.username,
    recipeId: r.recipe_id,
    recipeName: r.recipe_name,
    caption: r.caption || '',
    photoUrl: r.photo_url,
    likeCount: r.like_count,
    createdAt: r.created_at,
    likedByMe: !!r.liked_by_me,
  }));
}

export function getCommunityPost(postId) {
  return getDb().prepare('SELECT * FROM community_posts WHERE id = ?').get(postId);
}

export function toggleCommunityLike(postId, userId) {
  const database = getDb();
  const existing = database.prepare(
    'SELECT 1 AS ok FROM community_likes WHERE post_id = ? AND user_id = ?',
  ).get(postId, userId);

  if (existing) {
    database.prepare('DELETE FROM community_likes WHERE post_id = ? AND user_id = ?').run(postId, userId);
    database.prepare(
      'UPDATE community_posts SET like_count = CASE WHEN like_count > 0 THEN like_count - 1 ELSE 0 END WHERE id = ?',
    ).run(postId);
    touchPersist();
    touchMirror();
    const row = database.prepare('SELECT like_count FROM community_posts WHERE id = ?').get(postId);
    return { liked: false, likeCount: row?.like_count || 0 };
  }

  database.prepare(
    'INSERT INTO community_likes (post_id, user_id, created_at) VALUES (?, ?, ?)',
  ).run(postId, userId, Date.now());
  database.prepare(
    'UPDATE community_posts SET like_count = like_count + 1 WHERE id = ?',
  ).run(postId);
  touchPersist();
    touchMirror();
  const row = database.prepare('SELECT like_count FROM community_posts WHERE id = ?').get(postId);
  return { liked: true, likeCount: row?.like_count || 0 };
}

/** Weekly top dishes: cook completions + community likes in the last 7 days. */
export function weeklyTopDishes(limit = 5) {
  const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const n = Math.min(Math.max(Number(limit) || 5, 1), 20);
  const cooks = getDb().prepare(`
    SELECT COALESCE(NULLIF(recipe_id, ''), '(unknown)') AS recipe_id,
           COALESCE(NULLIF(recipe_name, ''), recipe_id, '(unknown)') AS recipe_name,
           COUNT(*) AS cooks
    FROM events
    WHERE type = 'cook_complete' AND ts >= ?
      AND (recipe_id IS NOT NULL OR recipe_name IS NOT NULL)
    GROUP BY recipe_id, recipe_name
  `).all(since);

  const social = getDb().prepare(`
    SELECT recipe_id,
           recipe_name,
           COUNT(*) AS posts,
           COALESCE(SUM(like_count), 0) AS likes
    FROM community_posts
    WHERE created_at >= ?
    GROUP BY recipe_id, recipe_name
  `).all(since);

  const map = new Map();
  for (const row of cooks) {
    const key = row.recipe_id || row.recipe_name;
    map.set(key, {
      recipeId: row.recipe_id,
      recipeName: row.recipe_name,
      cooks: row.cooks,
      posts: 0,
      likes: 0,
      score: row.cooks,
    });
  }
  for (const row of social) {
    const key = row.recipe_id || row.recipe_name;
    const prev = map.get(key) || {
      recipeId: row.recipe_id,
      recipeName: row.recipe_name,
      cooks: 0,
      posts: 0,
      likes: 0,
      score: 0,
    };
    prev.posts = row.posts;
    prev.likes = row.likes;
    prev.score = prev.cooks + row.posts * 2 + row.likes * 3;
    if (!prev.recipeName) prev.recipeName = row.recipe_name;
    map.set(key, prev);
  }

  let rows = [...map.values()]
    .sort((a, b) => b.score - a.score || b.cooks - a.cooks)
    .slice(0, n);
  if (!rows.length) rows = allTimeTopDishes(n);
  return rows;
}

export function allTimeTopDishes(limit = 5) {
  const n = Math.min(Math.max(Number(limit) || 5, 1), 20);
  const cooks = getDb().prepare(`
    SELECT COALESCE(NULLIF(recipe_id, ''), '(unknown)') AS recipe_id,
           COALESCE(NULLIF(recipe_name, ''), recipe_id, '(unknown)') AS recipe_name,
           COUNT(*) AS cooks
    FROM events
    WHERE type = 'cook_complete'
      AND (recipe_id IS NOT NULL OR recipe_name IS NOT NULL)
    GROUP BY recipe_id, recipe_name
  `).all();

  const social = getDb().prepare(`
    SELECT recipe_id,
           recipe_name,
           COUNT(*) AS posts,
           COALESCE(SUM(like_count), 0) AS likes
    FROM community_posts
    GROUP BY recipe_id, recipe_name
  `).all();

  const map = new Map();
  for (const row of cooks) {
    const key = row.recipe_id || row.recipe_name;
    map.set(key, {
      recipeId: row.recipe_id,
      recipeName: row.recipe_name,
      cooks: row.cooks,
      posts: 0,
      likes: 0,
      score: row.cooks,
      window: 'all',
    });
  }
  for (const row of social) {
    const key = row.recipe_id || row.recipe_name;
    const prev = map.get(key) || {
      recipeId: row.recipe_id,
      recipeName: row.recipe_name,
      cooks: 0,
      posts: 0,
      likes: 0,
      score: 0,
      window: 'all',
    };
    prev.posts = row.posts;
    prev.likes = row.likes;
    prev.score = prev.cooks + row.posts * 2 + row.likes * 3;
    if (!prev.recipeName) prev.recipeName = row.recipe_name;
    map.set(key, prev);
  }
  return [...map.values()]
    .sort((a, b) => b.score - a.score || b.cooks - a.cooks)
    .slice(0, n);
}



export function listPostsByUser(username, { limit = 30, viewerId = null } = {}) {
  const n = Math.min(Math.max(Number(limit) || 30, 1), 100);
  const rows = getDb().prepare(`
    SELECT p.id, p.user_id, p.username, p.recipe_id, p.recipe_name, p.caption,
           p.photo_url, p.like_count, p.created_at,
           CASE WHEN l.user_id IS NULL THEN 0 ELSE 1 END AS liked_by_me
    FROM community_posts p
    LEFT JOIN community_likes l
      ON l.post_id = p.id AND l.user_id = ?
    WHERE p.username = ? COLLATE NOCASE
    ORDER BY p.created_at DESC
    LIMIT ?
  `).all(viewerId || '', username, n);
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    username: r.username,
    recipeId: r.recipe_id,
    recipeName: r.recipe_name,
    caption: r.caption || '',
    photoUrl: r.photo_url,
    likeCount: r.like_count,
    createdAt: r.created_at,
    likedByMe: !!r.liked_by_me,
  }));
}

export function getPublicProfile(username, viewerId = null) {
  const account = findAccountByUsername(username);
  if (!account) return null;
  const packed = getUserData(account.id);
  const history = Array.isArray(packed?.data?.cookHistory) ? packed.data.cookHistory.slice(0, 40) : [];
  const isOwner = viewerId && viewerId === account.id;
  return {
    id: account.id,
    username: account.username,
    createdAt: account.created_at,
    cookHistory: history,
    posts: listPostsByUser(account.username, { limit: 40, viewerId }),
    recipes: listUserRecipes({ userId: account.id, publishedOnly: !isOwner }),
  };
}

function mapUserRecipe(row) {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    title: row.title,
    description: row.description || '',
    ingredients: JSON.parse(row.ingredients_json || '[]'),
    steps: JSON.parse(row.steps_json || '[]'),
    tags: JSON.parse(row.tags_json || '[]'),
    photoUrl: row.photo_url || '',
    published: !!row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    source: 'community',
  };
}

export function listUserRecipes({ userId = null, publishedOnly = true, limit = 50 } = {}) {
  const n = Math.min(Math.max(Number(limit) || 50, 1), 200);
  let rows;
  if (userId) {
    rows = publishedOnly
      ? getDb().prepare(`
          SELECT * FROM user_recipes
          WHERE user_id = ? AND published = 1
          ORDER BY created_at DESC LIMIT ?
        `).all(userId, n)
      : getDb().prepare(`
          SELECT * FROM user_recipes
          WHERE user_id = ?
          ORDER BY created_at DESC LIMIT ?
        `).all(userId, n);
  } else {
    rows = getDb().prepare(`
      SELECT * FROM user_recipes
      WHERE published = 1
      ORDER BY created_at DESC LIMIT ?
    `).all(n);
  }
  return rows.map(mapUserRecipe);
}

export function getUserRecipe(id) {
  const row = getDb().prepare('SELECT * FROM user_recipes WHERE id = ?').get(id);
  return row ? mapUserRecipe(row) : null;
}

export function upsertUserRecipe(recipe) {
  const now = Date.now();
  getDb().prepare(`
    INSERT INTO user_recipes (
      id, user_id, username, title, description, ingredients_json, steps_json, tags_json,
      photo_url, published, created_at, updated_at
    ) VALUES (
      @id, @user_id, @username, @title, @description, @ingredients_json, @steps_json, @tags_json,
      @photo_url, @published, @created_at, @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      ingredients_json = excluded.ingredients_json,
      steps_json = excluded.steps_json,
      tags_json = excluded.tags_json,
      photo_url = excluded.photo_url,
      published = excluded.published,
      updated_at = excluded.updated_at
  `).run({
    id: recipe.id,
    user_id: recipe.userId,
    username: recipe.username,
    title: recipe.title,
    description: recipe.description || null,
    ingredients_json: JSON.stringify(recipe.ingredients || []),
    steps_json: JSON.stringify(recipe.steps || []),
    tags_json: JSON.stringify(recipe.tags || []),
    photo_url: recipe.photoUrl || null,
    published: recipe.published === false ? 0 : 1,
    created_at: recipe.createdAt || now,
    updated_at: now,
  });
  touchPersist();
  touchMirror();
  return getUserRecipe(recipe.id);
}

export function deleteUserRecipe(id, userId) {
  const result = getDb().prepare(
    'DELETE FROM user_recipes WHERE id = ? AND user_id = ?',
  ).run(id, userId);
  if (result.changes) {
    touchPersist();
    touchMirror();
  }
  return result.changes > 0;
}
