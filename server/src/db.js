import {
  ensureClient,
  getClient,
  getDatabaseLabel,
  getStorageMode,
  queryAll,
  queryGet,
  run,
  withTransaction,
} from './libsql-client.js';

let initPromise = null;

async function ensureColumn(table, column, type) {
  const cols = (await queryAll(`PRAGMA table_info(${table})`)).map((c) => c.name);
  if (!cols.includes(column)) {
    await run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}

async function runMigrationsAsync() {
  const client = getClient();
  await client.batch([
    `CREATE TABLE IF NOT EXISTS events (
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
    )`,
    'CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts)',
    'CREATE INDEX IF NOT EXISTS idx_events_type ON events(type)',
    'CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id)',
    'CREATE INDEX IF NOT EXISTS idx_events_username ON events(username)',
    `CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
    )`,
    `CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      recipe_id TEXT NOT NULL,
      recipe_name TEXT NOT NULL,
      caption TEXT,
      photo_url TEXT NOT NULL,
      like_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    )`,
    'CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_community_posts_recipe ON community_posts(recipe_id)',
    `CREATE TABLE IF NOT EXISTS community_likes (
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (post_id, user_id)
    )`,
    'CREATE INDEX IF NOT EXISTS idx_community_likes_user ON community_likes(user_id)',
    `CREATE TABLE IF NOT EXISTS user_records (
      user_id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
    )`,
    `CREATE TABLE IF NOT EXISTS user_recipes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
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
    )`,
    'CREATE INDEX IF NOT EXISTS idx_user_recipes_user ON user_recipes(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_recipes_published ON user_recipes(published, created_at)',
  ], 'write');

  await ensureColumn('events', 'ip', 'TEXT');
  await ensureColumn('events', 'username', 'TEXT');
  await run('CREATE INDEX IF NOT EXISTS idx_events_username ON events(username)');
}

/** No-op: Turso is authoritative; kept for route compatibility. */
export async function awaitPendingPersist() {}

export async function ensureDb() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    await ensureClient();
    await runMigrationsAsync();
    return getClient();
  })();
  return initPromise;
}

function sinceMs(days) {
  const d = Math.min(Math.max(Number(days) || 7, 1), 365);
  return { days: d, since: Date.now() - d * 24 * 60 * 60 * 1000 };
}

export async function insertEvent(row) {
  return run(`
    INSERT INTO events (
      ts, received_at, site_id, session_id, type, path, view,
      recipe_id, recipe_name, lang, meta_json, ua_hash, ip_hash, ip, username, referrer
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    row.ts,
    row.received_at,
    row.site_id,
    row.session_id,
    row.type,
    row.path,
    row.view,
    row.recipe_id,
    row.recipe_name,
    row.lang,
    row.meta_json,
    row.ua_hash,
    row.ip_hash,
    row.ip,
    row.username,
    row.referrer,
  ]);
}

export async function overview(days = 7) {
  const { since, days: d } = sinceMs(days);
  const count = async (type) => {
    const row = await queryGet(
      'SELECT COUNT(*) AS c FROM events WHERE type = ? AND ts >= ?',
      [type, since],
    );
    return Number(row?.c || 0);
  };

  return {
    days: d,
    visits: await count('visit'),
    sessions: Number((await queryGet(
      'SELECT COUNT(DISTINCT session_id) AS c FROM events WHERE ts >= ?',
      [since],
    ))?.c || 0),
    events: Number((await queryGet(
      'SELECT COUNT(*) AS c FROM events WHERE ts >= ?',
      [since],
    ))?.c || 0),
    cooksStarted: await count('cook_start'),
    cooksFinished: await count('cook_complete'),
    ratings: await count('rate'),
    registeredUsers: Number((await queryGet('SELECT COUNT(*) AS c FROM accounts'))?.c || 0),
  };
}

export async function dailyVisits(days = 7) {
  const { since } = sinceMs(days);
  return queryAll(`
    SELECT date(ts / 1000, 'unixepoch', 'localtime') AS day,
           COUNT(*) AS visits,
           COUNT(DISTINCT session_id) AS sessions
    FROM events
    WHERE type = 'visit' AND ts >= ?
    GROUP BY day
    ORDER BY day ASC
  `, [since]);
}

export async function topViews(days = 7, limit = 20) {
  const { since } = sinceMs(days);
  return queryAll(`
    SELECT COALESCE(NULLIF(view, ''), NULLIF(path, ''), '(unknown)') AS name, COUNT(*) AS c
    FROM events
    WHERE type IN ('view', 'visit') AND ts >= ?
    GROUP BY name
    ORDER BY c DESC
    LIMIT ?
  `, [since, limit]);
}

export async function topRecipes(days = 7, limit = 20) {
  const { since } = sinceMs(days);
  return queryAll(`
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
  `, [since, limit]);
}

export async function eventBreakdown(days = 7) {
  const { since } = sinceMs(days);
  return queryAll(`
    SELECT type, COUNT(*) AS c
    FROM events WHERE ts >= ?
    GROUP BY type ORDER BY c DESC
  `, [since]);
}

export async function langBreakdown(days = 7) {
  const { since } = sinceMs(days);
  return queryAll(`
    SELECT COALESCE(lang, 'unknown') AS lang, COUNT(*) AS c
    FROM events WHERE type = 'visit' AND ts >= ?
    GROUP BY lang ORDER BY c DESC
  `, [since]);
}

export async function recentEvents(limit = 100) {
  const n = Math.min(Math.max(Number(limit) || 100, 1), 500);
  return queryAll(`
    SELECT id, ts, type, view, path, recipe_id, recipe_name, lang,
           session_id, meta_json, ip, username
    FROM events ORDER BY id DESC LIMIT ?
  `, [n]);
}

export async function listAccounts() {
  const rows = await queryAll(`
    SELECT a.id, a.username, a.created_at, r.updated_at, r.data
    FROM accounts a
    LEFT JOIN user_records r ON r.user_id = a.id
    ORDER BY a.created_at DESC
  `);
  return rows.map((row) => {
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

export function getStorageInfo() {
  const mode = getStorageMode();
  return {
    path: getDatabaseLabel(),
    mode,
    persistHint: mode === 'ephemeral'
      ? 'Set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN — see server/SETUP-Turso.md'
      : undefined,
  };
}

export async function createAccount(id, username, passwordHash) {
  return run(
    'INSERT INTO accounts (id, username, password_hash) VALUES (?, ?, ?)',
    [id, username, passwordHash],
  );
}

export async function findAccountByUsername(username) {
  return queryGet('SELECT * FROM accounts WHERE username = ? COLLATE NOCASE', [username]);
}

export async function findAccountById(id) {
  return queryGet('SELECT * FROM accounts WHERE id = ?', [id]);
}

export async function getUserData(userId) {
  const row = await queryGet('SELECT data, updated_at FROM user_records WHERE user_id = ?', [userId]);
  if (!row) return null;
  try {
    return { data: JSON.parse(row.data), updated_at: row.updated_at };
  } catch {
    return { data: {}, updated_at: row.updated_at };
  }
}

export async function setUserData(userId, data) {
  return run(`
    INSERT INTO user_records (user_id, data, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      data = excluded.data,
      updated_at = excluded.updated_at
  `, [userId, JSON.stringify(data), Date.now()]);
}

export async function createCommunityPost({
  id, userId, username, recipeId, recipeName, caption, photoUrl,
}) {
  return run(`
    INSERT INTO community_posts (id, user_id, username, recipe_id, recipe_name, caption, photo_url, like_count, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
  `, [id, userId, username, recipeId, recipeName, caption || null, photoUrl, Date.now()]);
}

export async function listCommunityPosts({ limit = 30, viewerId = null } = {}) {
  const n = Math.min(Math.max(Number(limit) || 30, 1), 100);
  const rows = await queryAll(`
    SELECT p.id, p.user_id, p.username, p.recipe_id, p.recipe_name, p.caption,
           p.photo_url, p.like_count, p.created_at,
           CASE WHEN l.user_id IS NULL THEN 0 ELSE 1 END AS liked_by_me
    FROM community_posts p
    LEFT JOIN community_likes l
      ON l.post_id = p.id AND l.user_id = ?
    ORDER BY p.created_at DESC
    LIMIT ?
  `, [viewerId || '', n]);
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

export async function getCommunityPost(postId) {
  return queryGet('SELECT * FROM community_posts WHERE id = ?', [postId]);
}

export async function toggleCommunityLike(postId, userId) {
  return withTransaction(async (tx) => {
    const existing = await tx.execute({
      sql: 'SELECT 1 AS ok FROM community_likes WHERE post_id = ? AND user_id = ?',
      args: [postId, userId],
    });

    if (existing.rows.length) {
      await tx.execute({
        sql: 'DELETE FROM community_likes WHERE post_id = ? AND user_id = ?',
        args: [postId, userId],
      });
      await tx.execute({
        sql: 'UPDATE community_posts SET like_count = CASE WHEN like_count > 0 THEN like_count - 1 ELSE 0 END WHERE id = ?',
        args: [postId],
      });
      const row = await tx.execute({
        sql: 'SELECT like_count FROM community_posts WHERE id = ?',
        args: [postId],
      });
      return { liked: false, likeCount: Number(row.rows[0]?.like_count || 0) };
    }

    await tx.execute({
      sql: 'INSERT INTO community_likes (post_id, user_id, created_at) VALUES (?, ?, ?)',
      args: [postId, userId, Date.now()],
    });
    await tx.execute({
      sql: 'UPDATE community_posts SET like_count = like_count + 1 WHERE id = ?',
      args: [postId],
    });
    const row = await tx.execute({
      sql: 'SELECT like_count FROM community_posts WHERE id = ?',
      args: [postId],
    });
    return { liked: true, likeCount: Number(row.rows[0]?.like_count || 0) };
  });
}

export async function weeklyTopDishes(limit = 5) {
  const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const n = Math.min(Math.max(Number(limit) || 5, 1), 20);
  const cooks = await queryAll(`
    SELECT COALESCE(NULLIF(recipe_id, ''), '(unknown)') AS recipe_id,
           COALESCE(NULLIF(recipe_name, ''), recipe_id, '(unknown)') AS recipe_name,
           COUNT(*) AS cooks
    FROM events
    WHERE type = 'cook_complete' AND ts >= ?
      AND (recipe_id IS NOT NULL OR recipe_name IS NOT NULL)
    GROUP BY recipe_id, recipe_name
  `, [since]);

  const social = await queryAll(`
    SELECT recipe_id,
           recipe_name,
           COUNT(*) AS posts,
           COALESCE(SUM(like_count), 0) AS likes
    FROM community_posts
    WHERE created_at >= ?
    GROUP BY recipe_id, recipe_name
  `, [since]);

  const map = new Map();
  for (const row of cooks) {
    const key = row.recipe_id || row.recipe_name;
    map.set(key, {
      recipeId: row.recipe_id,
      recipeName: row.recipe_name,
      cooks: Number(row.cooks),
      posts: 0,
      likes: 0,
      score: Number(row.cooks),
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
    prev.posts = Number(row.posts);
    prev.likes = Number(row.likes);
    prev.score = prev.cooks + Number(row.posts) * 2 + Number(row.likes) * 3;
    if (!prev.recipeName) prev.recipeName = row.recipe_name;
    map.set(key, prev);
  }

  let rows = [...map.values()]
    .sort((a, b) => b.score - a.score || b.cooks - a.cooks)
    .slice(0, n);
  if (!rows.length) rows = await allTimeTopDishes(n);
  return rows;
}

export async function allTimeTopDishes(limit = 5) {
  const n = Math.min(Math.max(Number(limit) || 5, 1), 20);
  const cooks = await queryAll(`
    SELECT COALESCE(NULLIF(recipe_id, ''), '(unknown)') AS recipe_id,
           COALESCE(NULLIF(recipe_name, ''), recipe_id, '(unknown)') AS recipe_name,
           COUNT(*) AS cooks
    FROM events
    WHERE type = 'cook_complete'
      AND (recipe_id IS NOT NULL OR recipe_name IS NOT NULL)
    GROUP BY recipe_id, recipe_name
  `);

  const social = await queryAll(`
    SELECT recipe_id,
           recipe_name,
           COUNT(*) AS posts,
           COALESCE(SUM(like_count), 0) AS likes
    FROM community_posts
    GROUP BY recipe_id, recipe_name
  `);

  const map = new Map();
  for (const row of cooks) {
    const key = row.recipe_id || row.recipe_name;
    map.set(key, {
      recipeId: row.recipe_id,
      recipeName: row.recipe_name,
      cooks: Number(row.cooks),
      posts: 0,
      likes: 0,
      score: Number(row.cooks),
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
    prev.posts = Number(row.posts);
    prev.likes = Number(row.likes);
    prev.score = prev.cooks + Number(row.posts) * 2 + Number(row.likes) * 3;
    if (!prev.recipeName) prev.recipeName = row.recipe_name;
    map.set(key, prev);
  }
  return [...map.values()]
    .sort((a, b) => b.score - a.score || b.cooks - a.cooks)
    .slice(0, n);
}

export async function listPostsByUser(username, { limit = 30, viewerId = null } = {}) {
  const n = Math.min(Math.max(Number(limit) || 30, 1), 100);
  const rows = await queryAll(`
    SELECT p.id, p.user_id, p.username, p.recipe_id, p.recipe_name, p.caption,
           p.photo_url, p.like_count, p.created_at,
           CASE WHEN l.user_id IS NULL THEN 0 ELSE 1 END AS liked_by_me
    FROM community_posts p
    LEFT JOIN community_likes l
      ON l.post_id = p.id AND l.user_id = ?
    WHERE p.username = ? COLLATE NOCASE
    ORDER BY p.created_at DESC
    LIMIT ?
  `, [viewerId || '', username, n]);
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

export async function getPublicProfile(username, viewerId = null) {
  const account = await findAccountByUsername(username);
  if (!account) return null;
  const packed = await getUserData(account.id);
  const history = Array.isArray(packed?.data?.cookHistory) ? packed.data.cookHistory.slice(0, 40) : [];
  const isOwner = viewerId && viewerId === account.id;
  return {
    id: account.id,
    username: account.username,
    createdAt: account.created_at,
    cookHistory: history,
    posts: await listPostsByUser(account.username, { limit: 40, viewerId }),
    recipes: await listUserRecipes({ userId: account.id, publishedOnly: !isOwner }),
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

export async function listUserRecipes({ userId = null, publishedOnly = true, limit = 50 } = {}) {
  const n = Math.min(Math.max(Number(limit) || 50, 1), 200);
  let rows;
  if (userId) {
    rows = publishedOnly
      ? await queryAll(`
          SELECT * FROM user_recipes
          WHERE user_id = ? AND published = 1
          ORDER BY created_at DESC LIMIT ?
        `, [userId, n])
      : await queryAll(`
          SELECT * FROM user_recipes
          WHERE user_id = ?
          ORDER BY created_at DESC LIMIT ?
        `, [userId, n]);
  } else {
    rows = await queryAll(`
      SELECT * FROM user_recipes
      WHERE published = 1
      ORDER BY created_at DESC LIMIT ?
    `, [n]);
  }
  return rows.map(mapUserRecipe);
}

export async function getUserRecipe(id) {
  const row = await queryGet('SELECT * FROM user_recipes WHERE id = ?', [id]);
  return row ? mapUserRecipe(row) : null;
}

export async function upsertUserRecipe(recipe) {
  const now = Date.now();
  await run(`
    INSERT INTO user_recipes (
      id, user_id, username, title, description, ingredients_json, steps_json, tags_json,
      photo_url, published, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      ingredients_json = excluded.ingredients_json,
      steps_json = excluded.steps_json,
      tags_json = excluded.tags_json,
      photo_url = excluded.photo_url,
      published = excluded.published,
      updated_at = excluded.updated_at
  `, [
    recipe.id,
    recipe.userId,
    recipe.username,
    recipe.title,
    recipe.description || null,
    JSON.stringify(recipe.ingredients || []),
    JSON.stringify(recipe.steps || []),
    JSON.stringify(recipe.tags || []),
    recipe.photoUrl || null,
    recipe.published === false ? 0 : 1,
    recipe.createdAt || now,
    now,
  ]);
  return getUserRecipe(recipe.id);
}

export async function deleteUserRecipe(id, userId) {
  const result = await run(
    'DELETE FROM user_recipes WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  return Number(result.rowsAffected || 0) > 0;
}
