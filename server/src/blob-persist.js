/**
 * Persist analytics.sqlite to Vercel Blob so data survives redeploys.
 * Chains uploads and refuses suspicious shrinks to reduce last-writer-wins wipeouts
 * across concurrent serverless instances.
 */

import fs from 'node:fs';
import path from 'node:path';
import { head, put } from '@vercel/blob';

const BLOB_KEY = 'ember-analytics.sqlite';

let lastPersistAt = 0;
let persistChain = Promise.resolve();
let pendingPersist = null;

/** Set after restore attempt so we never blindly overwrite a known remote DB. */
export const restoreState = {
  attempted: false,
  ok: false,
  remoteBytes: 0,
};

export function getPersistMode() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return 'blob';
  if (process.env.VERCEL) return 'ephemeral';
  return 'local';
}

export async function restoreDbFromBlob(dbPath) {
  restoreState.attempted = true;
  restoreState.ok = false;
  restoreState.remoteBytes = 0;

  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;

  try {
    const meta = await head(BLOB_KEY);
    const res = await fetch(meta.url);
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) return false;
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, buf);
    restoreState.ok = true;
    restoreState.remoteBytes = buf.length;
    return true;
  } catch (e) {
    const missing = e?.status === 404 || e?.statusCode === 404 || /not found/i.test(String(e?.message || ''));
    if (!missing) console.warn('blob restore failed:', e.message || e);
    return false;
  }
}

async function persistDbToBlob(dbPath) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  if (!fs.existsSync(dbPath)) return;

  const body = fs.readFileSync(dbPath);

  // Never upload a tiny/empty DB after a failed restore when a remote copy may exist.
  if (restoreState.attempted && !restoreState.ok && body.length < 4096) {
    console.warn('skip blob persist: restore failed and local db looks empty');
    return;
  }

  // Guard against a cold empty instance clobbering a larger remote DB.
  if (restoreState.remoteBytes > 50_000 && body.length < restoreState.remoteBytes * 0.35) {
    try {
      const meta = await head(BLOB_KEY);
      if (meta?.size && meta.size > body.length * 2) {
        console.warn(
          `skip blob persist: local ${body.length}b would shrink remote ${meta.size}b`,
        );
        return;
      }
    } catch {
      /* if head fails, still try to persist */
    }
  }

  await put(BLOB_KEY, body, {
    access: 'private',
    allowOverwrite: true,
    contentType: 'application/x-sqlite3',
    addRandomSuffix: false,
  });
  lastPersistAt = Date.now();
  restoreState.ok = true;
  restoreState.remoteBytes = body.length;
}

async function runPersist(dbPath, checkpoint) {
  try {
    if (typeof checkpoint === 'function') checkpoint();
    await persistDbToBlob(dbPath);
  } catch (e) {
    console.error('blob persist failed:', e.message || e);
  }
}

/** Wait for the full persist chain (required on Vercel before the response ends). */
export async function awaitPendingPersist() {
  if (!pendingPersist) return;
  const current = pendingPersist;
  await current;
  if (pendingPersist === current) pendingPersist = null;
}

export function scheduleDbPersist(dbPath, { checkpoint } = {}) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;

  const job = () => runPersist(dbPath, checkpoint);

  // Always chain — concurrent serverless writes must not replace an in-flight upload.
  persistChain = persistChain.then(job, job);
  pendingPersist = persistChain;
  return pendingPersist;
}

export function getLastPersistAt() {
  return lastPersistAt;
}
