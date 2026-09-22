/**
 * Upload community dish photos to Vercel Blob (private),
 * or to local disk when no blob token is configured.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { head, put } from '@vercel/blob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localUploadDir = path.join(__dirname, '..', 'data', 'uploads');

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 1.5 * 1024 * 1024;

function parseDataUrl(dataUrl) {
  const m = String(dataUrl || '').match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) return null;
  const mime = m[1];
  const buf = Buffer.from(m[2], 'base64');
  if (!ALLOWED_MIME.has(mime) || buf.length < 32 || buf.length > MAX_BYTES) return null;
  return { mime, buffer: buf };
}

function extForMime(mime) {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

export async function uploadCommunityPhoto(dataUrl) {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    const err = new Error('invalid_photo');
    err.code = 'invalid_photo';
    throw err;
  }

  const id = crypto.randomBytes(12).toString('hex');
  const ext = extForMime(parsed.mime);
  const key = `community/${id}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await put(key, parsed.buffer, {
        access: 'private',
        contentType: parsed.mime,
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    } catch (e) {
      console.error('blob photo put failed:', e.message || e);
      throw e;
    }
    return `/api/community/photo/${id}.${ext}`;
  }

  fs.mkdirSync(localUploadDir, { recursive: true });
  const filename = `${id}.${ext}`;
  fs.writeFileSync(path.join(localUploadDir, filename), parsed.buffer);
  return `/uploads/${filename}`;
}

export async function resolveCommunityPhotoUrl(relativePath) {
  const clean = String(relativePath || '').replace(/^\/+/, '');
  const m = clean.match(/^api\/community\/photo\/([a-f0-9]+\.(?:jpg|jpeg|png|webp))$/i);
  if (!m) return null;

  const key = `community/${m[1]}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const meta = await head(key, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return meta?.url || null;
  }

  const localPath = path.join(localUploadDir, m[1]);
  if (fs.existsSync(localPath)) return localPath;
  return null;
}

export function localUploadsDir() {
  return localUploadDir;
}
