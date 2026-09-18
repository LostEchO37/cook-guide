/**
 * Persist analytics.sqlite to Vercel Blob (free tier) so accounts
 * and portal data survive redeploys. Local dev skips when no token.
 */

import fs from 'node:fs';
import { head, put } from '@vercel/blob';

const BLOB_KEY = 'ember-analytics.sqlite';
let saveTimer = null;
let lastPersistAt = 0;

export function getPersistMode() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return 'blob';
  if (process.env.VERCEL) return 'ephemeral';
  return 'local';
}

export async function restoreDbFromBlob(dbPath) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;

  try {
    const meta = await head(BLOB_KEY);
    const res = await fetch(meta.url);
    if (!res.ok) return false;
    fs.writeFileSync(dbPath, Buffer.from(await res.arrayBuffer()));
    return true;
  } catch (e) {
    const missing = e?.status === 404 || e?.statusCode === 404 || /not found/i.test(String(e?.message || ''));
    if (!missing) console.warn('blob restore failed:', e.message || e);
    return false;
  }
}

async function persistDbToBlob(dbPath) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;

  const body = fs.readFileSync(dbPath);
  await put(BLOB_KEY, body, {
    access: 'private',
    allowOverwrite: true,
    contentType: 'application/x-sqlite3',
    addRandomSuffix: false,
  });
  lastPersistAt = Date.now();
}

export function scheduleDbPersist(dbPath, { checkpoint } = {}) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;

  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      if (typeof checkpoint === 'function') checkpoint();
      await persistDbToBlob(dbPath);
    } catch (e) {
      console.error('blob persist failed:', e.message || e);
    }
  }, 1200);
}

export function getLastPersistAt() {
  return lastPersistAt;
}
