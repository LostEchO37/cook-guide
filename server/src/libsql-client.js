import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDataDir = process.env.VERCEL
  ? '/tmp/ember-analytics'
  : path.join(__dirname, '..', 'data');
const defaultDbPath = process.env.DB_PATH || path.join(defaultDataDir, 'analytics.sqlite');

let client = null;

/** Vercel Turso marketplace may use a custom prefix (e.g. STORAGE_URL + STORAGE_AUTH_TOKEN). */
function resolveRemoteConfig() {
  const url = process.env.TURSO_DATABASE_URL
    || process.env.LIBSQL_URL
    || process.env.TURSO_URL
    || process.env.STORAGE_URL
    || '';
  const authToken = process.env.TURSO_AUTH_TOKEN
    || process.env.LIBSQL_AUTH_TOKEN
    || process.env.STORAGE_AUTH_TOKEN
    || process.env.STORAGE_TOKEN;
  return { url, authToken };
}

function isRemoteUrl(url) {
  return url.startsWith('libsql:') || url.startsWith('https:');
}

export function isRemoteDatabase() {
  const { url } = resolveRemoteConfig();
  return isRemoteUrl(url);
}

export function getStorageMode() {
  if (isRemoteDatabase()) return 'turso';
  if (process.env.VERCEL) return 'ephemeral';
  return 'local';
}

export function getDatabaseLabel() {
  if (isRemoteDatabase()) return 'turso';
  return path.basename(defaultDbPath);
}

export function getClient() {
  if (!client) throw new Error('Database not ready — await ensureClient() first');
  return client;
}

export async function ensureClient() {
  if (client) return client;

  const remote = resolveRemoteConfig();
  const url = remote.url || `file:${defaultDbPath}`;

  if (process.env.VERCEL && !isRemoteUrl(remote.url)) {
    throw new Error(
      'Vercel requires Turso env vars (TURSO_* or STORAGE_URL from marketplace). See server/SETUP-Turso.md',
    );
  }

  if (url.startsWith('file:')) {
    fs.mkdirSync(path.dirname(defaultDbPath), { recursive: true });
  }

  client = createClient({
    url,
    authToken: isRemoteUrl(remote.url) ? remote.authToken : undefined,
  });

  return client;
}

export async function queryAll(sql, args = []) {
  const result = await getClient().execute({ sql, args });
  return result.rows;
}

export async function queryGet(sql, args = []) {
  const rows = await queryAll(sql, args);
  return rows[0];
}

export async function run(sql, args = []) {
  return getClient().execute({ sql, args });
}

export async function withTransaction(fn) {
  const tx = await getClient().transaction('write');
  try {
    const result = await fn(tx);
    await tx.commit();
    return result;
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}
