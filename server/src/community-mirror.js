/**
 * Durable JSON mirror for community data in Vercel Blob.
 * Survives SQLite last-writer-wins wipeouts by merge-on-write.
 */

import { head, put } from '@vercel/blob';

const MIRROR_KEY = 'ember-community-mirror.json';

const emptyMirror = () => ({
  version: 1,
  updatedAt: 0,
  posts: {},
  likes: {},
  cooks: {},
  recipes: {},
});

async function downloadMirror() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return emptyMirror();
  try {
    const meta = await head(MIRROR_KEY);
    const res = await fetch(meta.url);
    if (!res.ok) return emptyMirror();
    const data = await res.json();
    return {
      ...emptyMirror(),
      ...data,
      posts: data.posts || {},
      likes: data.likes || {},
      cooks: data.cooks || {},
      recipes: data.recipes || {},
    };
  } catch (e) {
    const missing = e?.status === 404 || e?.statusCode === 404 || /not found/i.test(String(e?.message || ''));
    if (!missing) console.warn('community mirror download failed:', e.message || e);
    return emptyMirror();
  }
}

async function uploadMirror(mirror) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  mirror.updatedAt = Date.now();
  await put(MIRROR_KEY, JSON.stringify(mirror), {
    access: 'private',
    allowOverwrite: true,
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

function mergeById(base, incoming) {
  const out = { ...base };
  for (const [id, row] of Object.entries(incoming || {})) {
    const prev = out[id];
    if (!prev) {
      out[id] = row;
      continue;
    }
    const prevTs = Number(prev.updatedAt || prev.createdAt || prev.ts || 0);
    const nextTs = Number(row.updatedAt || row.createdAt || row.ts || 0);
    if (nextTs >= prevTs) out[id] = { ...prev, ...row };
  }
  return out;
}

/** Merge local snapshot into remote mirror and upload. */
export async function syncCommunityMirror(local = {}) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return emptyMirror();
  try {
    const remote = await downloadMirror();
    const merged = {
      version: 1,
      updatedAt: Date.now(),
      posts: mergeById(remote.posts, local.posts),
      likes: mergeById(remote.likes, local.likes),
      cooks: mergeById(remote.cooks, local.cooks),
      recipes: mergeById(remote.recipes, local.recipes),
    };
    await uploadMirror(merged);
    return merged;
  } catch (e) {
    console.error('community mirror sync failed:', e.message || e);
    return emptyMirror();
  }
}

export async function loadCommunityMirror() {
  return downloadMirror();
}
